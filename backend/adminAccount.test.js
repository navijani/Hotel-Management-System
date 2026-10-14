import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createAdminRouter, ensureAdminAccount } from './adminAccount.js';
import { removeLegacySettings } from './database/removeLegacySettings.js';

test('admin password changes require a valid session and current password, and persist across initialization', async () => {
  process.env.JWT_SECRET = 'test-only-admin-secret';
  process.env.ADMIN_USERNAME = 'test-admin';
  process.env.ADMIN_PASSWORD = 'original-password';
  const account = { username: 'test-admin', password_hash: await bcrypt.hash('original-password', 4), token_version: 0 };
  const pool = {
    async query(sql, params) {
      if (sql.startsWith('CREATE TABLE')) return [{}];
      if (sql.startsWith('SELECT')) return [params[0] === account.username ? [{ ...account }] : []];
      if (sql.startsWith('UPDATE') && params[2] === account.token_version) {
        account.password_hash = params[0];
        account.token_version += 1;
        return [{ affectedRows: 1 }];
      }
      throw new Error('Unexpected database operation');
    },
  };
  const app = express();
  app.use(express.json());
  app.use('/api/admin', createAdminRouter(pool, (_req, _res, next) => next()));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const request = async (path, body, token) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/admin/${path}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    return { status: response.status, data: await response.json() };
  };
  try {
    const login = await request('signin', { username: 'test-admin', password: 'original-password' });
    assert.equal(login.status, 200);
    const change = { currentPassword: 'original-password', newPassword: 'updated-password' };
    assert.equal((await request('change-password', change)).status, 401);
    assert.equal((await request('change-password', change, Buffer.from('{"role":"Admin"}').toString('base64'))).status, 401);
    const staffToken = jwt.sign({ role: 'Admin', username: 'test-admin' }, process.env.JWT_SECRET);
    assert.equal((await request('change-password', change, staffToken)).status, 401);
    const expired = jwt.sign({ role: 'Admin', account_type: 'system-admin' }, process.env.JWT_SECRET, { expiresIn: -1 });
    assert.equal((await request('change-password', change, expired)).status, 401);
    assert.equal((await request('change-password', { ...change, currentPassword: 'incorrect' }, login.data.token)).status, 400);
    for (const newPassword of ['short', 'original-password', 'é'.repeat(37)]) {
      assert.equal((await request('change-password', { ...change, newPassword }, login.data.token)).status, 400);
    }
    const changed = await request('change-password', change, login.data.token);
    assert.equal(changed.status, 200);
    assert.notEqual(account.password_hash, change.newPassword);
    assert.equal(await bcrypt.compare(change.newPassword, account.password_hash), true);
    assert.equal((await request('change-password', change, login.data.token)).status, 401);
    await ensureAdminAccount(pool);
    assert.equal((await request('signin', { username: 'test-admin', password: 'original-password' })).status, 401);
    assert.equal((await request('signin', { username: 'test-admin', password: 'updated-password' })).status, 200);
    assert.equal((await request('change-password', { currentPassword: 'updated-password', newPassword: 'third-password' }, changed.data.token)).status, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('retired settings migration only drops requested columns and can be rerun', async () => {
  const columns = new Set(['hotel_name', 'online_bookings_enabled', 'email_notifications_enabled', 'maintenance_mode']);
  const pool = { async query(sql) {
    if (sql.startsWith('SELECT')) return [[...columns].map((COLUMN_NAME) => ({ COLUMN_NAME }))];
    const name = sql.match(/DROP COLUMN `([^`]+)`/)[1];
    assert.ok(columns.delete(name));
    return [{}];
  } };
  await removeLegacySettings(pool);
  await removeLegacySettings(pool);
  assert.deepEqual([...columns], ['hotel_name']);
});
