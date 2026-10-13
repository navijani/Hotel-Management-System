import express from 'express';
import bcrypt from 'bcryptjs';

const roles = new Set(['receptionist', 'cleaning', 'bar', 'therapist', 'waiter', 'admin']);

export default function createStaffManagementRouter(pool, authRateLimit) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const branchId = req.query.branch_id === undefined ? null : Number(req.query.branch_id);
    if (branchId !== null && (!Number.isInteger(branchId) || branchId < 1)) {
      return res.status(400).json({ error: 'A valid branch_id is required.' });
    }

    try {
      const [rows] = await pool.query(
        `SELECT s.id, s.username, s.role, s.active, s.created_at, s.branch_id,
                b.city AS branch_city, b.branch_name
         FROM Staff s
         LEFT JOIN Branch b ON b.branch_id = s.branch_id
         WHERE (? IS NULL OR s.branch_id = ?)
         ORDER BY s.created_at DESC`,
        [branchId, branchId]
      );
      res.json(rows);
    } catch (error) {
      console.error('Staff list error:', error);
      res.status(500).json({ error: 'Unable to load staff accounts.' });
    }
  });

  router.post('/', authRateLimit, async (req, res) => {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    const role = String(req.body.role || '');
    const branchId = Number(req.body.branch_id);

    if (!username || !password || !roles.has(role) || !Number.isInteger(branchId) || branchId < 1) {
      return res.status(400).json({ error: 'Username, password, valid role, and branch are required.' });
    }

    try {
      const [branches] = await pool.query('SELECT branch_id FROM Branch WHERE branch_id = ? LIMIT 1', [branchId]);
      if (branches.length === 0) {
        return res.status(400).json({ error: 'The selected branch does not exist.' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const [result] = await pool.query(
        'INSERT INTO Staff (username, password, role, active, branch_id) VALUES (?, ?, ?, TRUE, ?)',
        [username, passwordHash, role, branchId]
      );
      res.status(201).json({ message: 'Staff member added successfully.', id: result.insertId });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'That username is already registered.' });
      }
      console.error('Staff creation error:', error);
      res.status(500).json({ error: 'Unable to create staff account.' });
    }
  });

  router.delete('/:id', async (req, res) => {
    const staffId = Number(req.params.id);
    if (!Number.isInteger(staffId) || staffId < 1) {
      return res.status(400).json({ error: 'A valid staff id is required.' });
    }

    try {
      const [result] = await pool.query('DELETE FROM Staff WHERE id = ?', [staffId]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Staff member not found.' });
      }
      res.json({ message: 'Staff member removed successfully.' });
    } catch (error) {
      console.error('Staff deletion error:', error);
      res.status(500).json({ error: 'Unable to remove staff member.' });
    }
  });

  return router;
}
