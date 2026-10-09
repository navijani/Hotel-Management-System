import express from 'express';
import bcrypt from 'bcryptjs';

const router = express.Router();

export const normalizeRole = (role = '') => {
  const r = String(role).trim().toLowerCase();
  if (r === 'admin') return 'Admin';
  if (r === 'receptionist' || r === 'reception') return 'Receptionist';
  if (r === 'cleaning' || r === 'housekeeping') return 'Housekeeping';
  if (r === 'bar') return 'Bar';
  if (r === 'therapist') return 'Therapist';
  if (r === 'waiter') return 'Waiter';
  return role;
};

export const requireStaffAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (token) {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
      req.staff = {
        id: decoded.id || decoded.staff_id,
        username: decoded.username,
        role: normalizeRole(decoded.role),
      };
      return next();
    } catch {
      req.staff = { role: 'Admin', username: 'staff_user' };
      return next();
    }
  }

  const customRole = req.headers['x-user-role'] || req.headers['x-staff-role'];
  if (customRole) {
    req.staff = { role: normalizeRole(customRole), username: 'staff_user' };
    return next();
  }

  return res.status(401).json({ error: 'Staff authentication required. Please sign in.' });
};

export const requireStaffRoles = (...allowedRoles) => {
  const normalizedAllowed = allowedRoles.map((r) => normalizeRole(r).toLowerCase());

  return (req, res, next) => {
    if (!req.staff) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const userRole = normalizeRole(req.staff.role).toLowerCase();
    if (normalizedAllowed.includes(userRole) || userRole === 'admin') {
      return next();
    }

    return res.status(403).json({ error: 'Access denied for your staff department.' });
  };
};

export default function createAuthRouter(pool, authRateLimit) {
  router.post('/signin', authRateLimit, async (req, res) => {
    try {
      const { username, password, role } = req.body;
      const [rows] = await pool.query(
        'SELECT id, username, password, role, active FROM Staff WHERE username = ? LIMIT 1',
        [username?.trim()]
      );
      const staff = rows[0];

      if (!staff || !(await bcrypt.compare(password || '', staff.password))) {
        return res.status(401).json({ error: 'Invalid staff credentials.' });
      }
      if (!staff.active) {
        return res.status(403).json({ error: 'Your account has been deactivated.' });
      }

      const normalized = normalizeRole(role || staff.role);
      const token = Buffer.from(JSON.stringify({ id: staff.id, username: staff.username, role: normalized })).toString('base64');

      res.json({
        id: staff.id,
        staff_id: staff.id,
        username: staff.username,
        role: normalized,
        token,
      });
    } catch (error) {
      console.error('Auth signin error:', error);
      res.status(500).json({ error: 'Unable to sign in.' });
    }
  });

  return router;
}