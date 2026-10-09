import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'url';

import createAuthRouter, { normalizeRole } from './routes/auth.js';
import createRoomsRouter from './routes/rooms.js';
import createBookingsRouter from './routes/bookings.js';
import createBarRouter from './routes/bar.js';
import createOffersRouter from './routes/offers.js';
import createReceptionRouter from './routes/reception.js';
import createReportsRouter from './routes/reports.js';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env') });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again later.' },
});

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

const bookingRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many booking attempts. Please try again later.' },
});

app.use('/api/', globalRateLimit);

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads', { recursive: true });
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024, fieldSize: 50 * 1024 * 1024 },
});

const publicDistPath = path.join(process.cwd(), 'public');
const relativeDistPath = path.join(process.cwd(), '../frontend/dist');
const staticPath = fs.existsSync(publicDistPath) ? publicDistPath : (fs.existsSync(relativeDistPath) ? relativeDistPath : null);

app.use('/uploads', express.static('uploads'));

const pool = mysql.createPool({
  host: (process.env.DB_HOST || 'localhost').trim(),
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 4000,
  user: (process.env.DB_USER || 'root').trim(),
  password: process.env.DB_PASSWORD || '',
  database: (process.env.DB_NAME || 'hotel_db').trim(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 20,
  ssl: process.env.DB_SSL === 'false' ? false : {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' || fs.existsSync('ca.pem'),
    ca: fs.existsSync('ca.pem') ? fs.readFileSync('ca.pem') : undefined,
  },
});

// Admin Authentication
app.post('/api/admin/signin', authRateLimit, (req, res) => {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (req.body.username?.trim() !== username || req.body.password !== password) {
    return res.status(401).json({ error: 'Invalid administrator credentials.' });
  }

  const token = Buffer.from(JSON.stringify({ username, role: 'Admin' })).toString('base64');
  res.json({ message: 'Administrator login successful.', token, role: 'Admin' });
});

// Guest Endpoints
app.get('/api/guest/check-id', async (req, res) => {
  try {
    const { identity_number } = req.query;
    if (!identity_number?.trim()) return res.status(400).json({ error: 'Identity number is required.' });
    const [rows] = await pool.query('SELECT guest_id FROM guest WHERE identity_number = ? LIMIT 1', [identity_number.trim()]);
    res.json({ available: rows.length === 0 });
  } catch {
    res.status(500).json({ error: 'Unable to verify ID number.' });
  }
});

app.post('/api/guest/signup', authRateLimit, async (req, res) => {
  try {
    const { first_name, last_name, email, phone_number, identity_number, password } = req.body;
    const required = [first_name, last_name, email, phone_number, identity_number, password];
    if (required.some((f) => !f?.trim())) return res.status(400).json({ error: 'All guest registration fields are required.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters long.' });

    const [existing] = await pool.query('SELECT guest_id FROM guest WHERE email = ? OR identity_number = ? LIMIT 1', [email.trim(), identity_number.trim()]);
    if (existing.length > 0) return res.status(409).json({ error: 'Account already exists with that email or ID number.' });

    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO guest (first_name, last_name, email, phone_number, identity_number, password) VALUES (?, ?, ?, ?, ?, ?)',
      [first_name.trim(), last_name.trim(), email.trim(), phone_number.trim(), identity_number.trim(), hash]
    );
    res.status(201).json({ message: 'Guest account created successfully.', guest_id: result.insertId });
  } catch {
    res.status(500).json({ error: 'Unable to create guest account.' });
  }
});

app.post('/api/guest/signin', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM guest WHERE email = ? LIMIT 1', [email?.trim()]);
    const guest = rows[0];

    if (!guest || !(await bcrypt.compare(password || '', guest.password))) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    res.json({
      guest_id: guest.guest_id,
      first_name: guest.first_name,
      last_name: guest.last_name,
      email: guest.email,
      phone_number: guest.phone_number,
      identity_number: guest.identity_number,
    });
  } catch {
    res.status(500).json({ error: 'Unable to sign in.' });
  }
});

app.patch('/api/guest/:id/profile', async (req, res) => {
  try {
    const guestId = Number(req.params.id);
    const { phone_number, first_name, last_name } = req.body;
    await pool.query('UPDATE guest SET phone_number = ?, first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name) WHERE guest_id = ?', [
      phone_number?.trim(),
      first_name?.trim() || null,
      last_name?.trim() || null,
      guestId,
    ]);
    const [rows] = await pool.query('SELECT guest_id, first_name, last_name, email, phone_number, identity_number FROM guest WHERE guest_id = ?', [guestId]);
    res.json({ message: 'Profile updated successfully.', guest: rows[0] });
  } catch {
    res.status(500).json({ error: 'Unable to update profile.' });
  }
});

// Staff Listing (Supports both /api/staff and /api/auth/staff without 401 errors)
app.get(['/api/staff', '/api/auth/staff'], async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, role, active, created_at FROM Staff ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Staff list error:', error);
    res.status(500).json({ error: 'Unable to load staff accounts.' });
  }
});

// Staff Creation
app.post(['/api/staff', '/api/auth/staff'], authRateLimit, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username?.trim() || !password || !role) {
      return res.status(400).json({ error: 'Username, password, and role are required.' });
    }
    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query('INSERT INTO Staff (username, password, role, active) VALUES (?, ?, ?, TRUE)', [username.trim(), hash, role]);
    res.status(201).json({ message: 'User added successfully.', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username already in use.' });
    res.status(500).json({ error: 'Unable to create staff member.' });
  }
});

// Staff Deletion (Supports both paths)
app.delete(['/api/staff/:id', '/api/auth/staff/:id'], async (req, res) => {
  try {
    const staffId = Number(req.params.id);
    const [result] = await pool.query('DELETE FROM Staff WHERE id = ?', [staffId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Staff member not found.' });
    res.json({ message: 'Staff member removed successfully.' });
  } catch (error) {
    console.error('Staff delete error:', error);
    res.status(500).json({ error: 'Unable to remove staff member.' });
  }
});

// Staff Signin
app.post('/api/staff/signin', authRateLimit, async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM Staff WHERE username = ? LIMIT 1', [username?.trim()]);
    const staff = rows[0];

    if (!staff || !(await bcrypt.compare(password || '', staff.password))) {
      return res.status(401).json({ error: 'Invalid staff credentials.' });
    }
    if (!staff.active) return res.status(403).json({ error: 'Account deactivated.' });

    const normalized = normalizeRole(staff.role);
    const token = Buffer.from(JSON.stringify({ id: staff.id, username: staff.username, role: normalized })).toString('base64');
    res.json({ id: staff.id, staff_id: staff.id, username: staff.username, role: normalized, token });
  } catch {
    res.status(500).json({ error: 'Unable to sign in.' });
  }
});

app.get('/api/staff/:id/workspace', async (req, res) => {
  try {
    const staffId = Number(req.params.id);
    const [staffRows] = await pool.query('SELECT id, username, role, active, mobile_number FROM Staff WHERE id = ?', [staffId]);
    if (!staffRows[0]) return res.status(404).json({ error: 'Staff member not found.' });

    const [attendance] = await pool.query(
      "SELECT id, DATE_FORMAT(attendance_date, '%Y-%m-%d') AS attendance_date, check_in_time, check_out_time, check_in_location, check_out_location, is_busy FROM staff_attendance WHERE staff_id = ? ORDER BY attendance_date DESC LIMIT 14",
      [staffId]
    );
    const [salaryRows] = await pool.query('SELECT role, rate, salary_amount FROM staff_salary WHERE staff_id = ? LIMIT 1', [staffId]);
    res.json({ staff: staffRows[0], attendance, salary: salaryRows[0] || { role: staffRows[0].role, rate: 7, salary_amount: 0 } });
  } catch {
    res.status(500).json({ error: 'Unable to load workspace.' });
  }
});

app.post('/api/staff/:id/attendance/:action', async (req, res) => {
  const { id, action } = req.params;
  const location = String(req.body.location || req.body.check_in_location || req.body.check_out_location || '').trim();

  if (action === 'check-in') {
    await pool.query('INSERT INTO staff_attendance (staff_id, attendance_date, check_in_time, check_in_location) VALUES (?, CURDATE(), CURTIME(), ?)', [id, location]);
    res.json({ message: 'Checked in successfully.' });
  } else {
    await pool.query('UPDATE staff_attendance SET check_out_time = CURTIME(), check_out_location = ? WHERE staff_id = ? AND attendance_date = CURDATE() AND check_out_time IS NULL', [location, id]);
    res.json({ message: 'Checked out successfully.' });
  }
});

// Mounted Routers
app.use('/api/rooms', createRoomsRouter(pool, upload));
app.use('/api/bookings', createBookingsRouter(pool, bookingRateLimit));
app.use('/api/bar', createBarRouter(pool, upload));
app.use('/api/admin/bar', createBarRouter(pool, upload));
app.use('/api/offers', createOffersRouter(pool, upload));
app.use('/api/exclusive-offers', createOffersRouter(pool, upload));
app.use('/api/auth', createAuthRouter(pool, authRateLimit));
app.use('/api/reception', createReceptionRouter(pool));
app.use('/api/reports', createReportsRouter(pool));

// Static files in production
if (staticPath) {
  app.use(express.static(staticPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Connection test on server boot
pool.query('SELECT 1 + 1 AS solution')
  .then(() => console.log('✅ Successfully connected to TiDB Cloud database!'))
  .catch((err) => console.error('❌ Failed to connect to TiDB Cloud database:', err.message));

app.listen(port, () => console.log(`Server running on port ${port}`));