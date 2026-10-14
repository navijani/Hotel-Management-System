import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import express from 'express';

export async function ensureAdminAccount(pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS admin_account (
    username VARCHAR(160) NOT NULL PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    token_version INT NOT NULL DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  const username = process.env.ADMIN_USERNAME?.trim();
  if (!username) throw new Error('ADMIN_USERNAME is missing.');
  const [rows] = await pool.query('SELECT username FROM admin_account WHERE username = ?', [username]);
  if (!rows.length) {
    if (!process.env.ADMIN_PASSWORD) throw new Error('ADMIN_PASSWORD is required to initialize the admin account.');
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await pool.query('INSERT IGNORE INTO admin_account (username, password_hash) VALUES (?, ?)', [username, hash]);
  }
}

export function createAdminRouter(pool, rateLimit) {
  const router = express.Router();
  const tokenFor = (account) => jwt.sign(
    { username: account.username, role: 'Admin', account_type: 'system-admin', token_version: account.token_version },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '10m' }
  );

  router.post('/signin', rateLimit, async (req, res) => {
    try {
      const { username, password } = req.body || {};
      if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: 'Username and password are required.' });
      }
      const [rows] = await pool.query('SELECT * FROM admin_account WHERE username = ?', [username.trim()]);
      const account = rows[0];
      if (!account || !(await bcrypt.compare(password, account.password_hash))) {
        return res.status(401).json({ error: 'Invalid administrator credentials.' });
      }
      res.json({ message: 'Administrator login successful.', token: tokenFor(account), role: 'Admin' });
    } catch {
      res.status(500).json({ error: 'Unable to sign in.' });
    }
  });

  router.post('/change-password', rateLimit, async (req, res) => {
    let session;
    try {
      const header = req.headers.authorization || '';
      session = jwt.verify(header.startsWith('Bearer ') ? header.slice(7) : '', process.env.JWT_SECRET);
      if (session.role !== 'Admin' || session.account_type !== 'system-admin') throw new Error('Invalid account');
    } catch {
      return res.status(401).json({ error: 'Please sign in as administrator again.' });
    }
    const { currentPassword, newPassword } = req.body || {};
    if (typeof currentPassword !== 'string' || !currentPassword || typeof newPassword !== 'string' ||
        newPassword.length < 8 || Buffer.byteLength(newPassword, 'utf8') > 72) {
      return res.status(400).json({ error: 'Enter your current password and a new password of at least 8 characters (maximum 72 UTF-8 bytes).' });
    }
    if (currentPassword === newPassword) return res.status(400).json({ error: 'Choose a different new password.' });
    try {
      const [rows] = await pool.query('SELECT * FROM admin_account WHERE username = ?', [session.username]);
      const account = rows[0];
      if (!account || account.token_version !== session.token_version) {
        return res.status(401).json({ error: 'Please sign in as administrator again.' });
      }
      if (!(await bcrypt.compare(currentPassword, account.password_hash))) {
        return res.status(400).json({ error: 'Current password is incorrect.' });
      }
      const hash = await bcrypt.hash(newPassword, 12);
      const [result] = await pool.query(
        'UPDATE admin_account SET password_hash = ?, token_version = token_version + 1 WHERE username = ? AND token_version = ?',
        [hash, account.username, account.token_version]
      );
      if (result.affectedRows !== 1) return res.status(409).json({ error: 'Account changed. Please sign in again.' });
      res.json({ message: 'Password changed successfully.', token: tokenFor({ ...account, token_version: account.token_version + 1 }) });
    } catch {
      res.status(500).json({ error: 'Unable to change password. Please try again.' });
    }
  });
  return router;
}
