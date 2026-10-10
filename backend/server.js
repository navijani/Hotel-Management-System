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
<<<<<<< HEAD
import createRoomsRouter from './routes/rooms.js';
import createBookingsRouter from './routes/bookings.js';
import createBarRouter from './routes/bar.js';
import createOffersRouter from './routes/offers.js';
import createBillingRouter from './routes/billing.js';

=======

import createAuthRouter, { normalizeRole } from './routes/auth.js';
import createRoomsRouter from './routes/rooms.js';
import createBookingsRouter from './routes/bookings.js';
import createBarRouter from './routes/bar.js';
import createOffersRouter from './routes/offers.js';
import createReceptionRouter from './routes/reception.js';
import createReportsRouter from './routes/reports.js';

>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env') });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// Global API Rate Limiter
const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300, // 300 requests per 15 min
=======
const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please try again later.' },
});

<<<<<<< HEAD
// Authentication & Account Creation Rate Limiter (Brute-force protection)
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 15, // 15 login/signup attempts per 15 min
=======
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

<<<<<<< HEAD
// Booking Rate Limiter
=======
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
const bookingRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many booking attempts. Please try again later.' },
});

<<<<<<< HEAD
// Apply global rate limiting to all API endpoints
app.use('/api/', globalRateLimit);

// Ensure uploads directory exists
=======
app.use('/api/', globalRateLimit);

>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

<<<<<<< HEAD
// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads', { recursive: true });
    }
=======
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads', { recursive: true });
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
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
<<<<<<< HEAD
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024,  // 50MB max file size
    fieldSize: 50 * 1024 * 1024  // 50MB max text field size (for base64 image strings)
  }
});

// Detect static frontend build path (public/ in production Docker or ../frontend/dist in local)
const publicDistPath = path.join(process.cwd(), 'public');
const relativeDistPath = path.join(process.cwd(), '../frontend/dist');
const staticPath = fs.existsSync(publicDistPath) ? publicDistPath : (fs.existsSync(relativeDistPath) ? relativeDistPath : null);
=======
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028

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
<<<<<<< HEAD
    ca: fs.existsSync('ca.pem') ? fs.readFileSync('ca.pem') : undefined
  }
});

app.get('/', (req, res, next) => {
  if (staticPath) {
    return next();
  }
  res.status(200).send('Hotel Management backend is running. Use /api/test or open the frontend app on port 5173.');
});

app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({ message: 'Database connection successful!', data: rows[0] });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

=======
    ca: fs.existsSync('ca.pem') ? fs.readFileSync('ca.pem') : undefined,
  },
});

// Admin Authentication
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
app.post('/api/admin/signin', authRateLimit, (req, res) => {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (req.body.username?.trim() !== username || req.body.password !== password) {
    return res.status(401).json({ error: 'Invalid administrator credentials.' });
  }

  const token = Buffer.from(JSON.stringify({ username, role: 'Admin' })).toString('base64');
  res.json({ message: 'Administrator login successful.', token, role: 'Admin' });
});

<<<<<<< HEAD
app.get('/api/guest/check-id', async (req, res) => {
  try {
    const { identity_number } = req.query;
    if (!identity_number || typeof identity_number !== 'string' || !identity_number.trim()) {
      return res.status(400).json({ error: 'Identity number is required.' });
    }

    const [rows] = await pool.query(
      'SELECT guest_id FROM GUEST WHERE identity_number = ? LIMIT 1',
      [identity_number.trim()]
    );

    if (rows.length > 0) {
      return res.json({ available: false, error: 'ID number already in use. Please choose a different ID.' });
    }

    res.json({ available: true });
  } catch (error) {
    console.error('Check ID error:', error);
=======
// Guest Endpoints
app.get('/api/guest/check-id', async (req, res) => {
  try {
    const { identity_number } = req.query;
    if (!identity_number?.trim()) return res.status(400).json({ error: 'Identity number is required.' });
    const [rows] = await pool.query('SELECT guest_id FROM guest WHERE identity_number = ? LIMIT 1', [identity_number.trim()]);
    res.json({ available: rows.length === 0 });
  } catch {
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
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

<<<<<<< HEAD
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const [existingEmail] = await pool.query('SELECT guest_id FROM GUEST WHERE email = ? LIMIT 1', [email.trim()]);
    if (existingEmail.length > 0) {
      return res.status(409).json({ error: 'An account with that email address already exists.' });
    }

    const [existingId] = await pool.query('SELECT guest_id FROM GUEST WHERE identity_number = ? LIMIT 1', [identity_number.trim()]);
    if (existingId.length > 0) {
      return res.status(409).json({ error: 'ID number already in use. Please choose a different ID.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
=======
    const hash = await bcrypt.hash(password, 12);
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
    const [result] = await pool.query(
      'INSERT INTO guest (first_name, last_name, email, phone_number, identity_number, password) VALUES (?, ?, ?, ?, ?, ?)',
      [first_name.trim(), last_name.trim(), email.trim(), phone_number.trim(), identity_number.trim(), hash]
    );
<<<<<<< HEAD

    res.status(201).json({
      message: 'Guest account created successfully.',
      guest_id: result.insertId,
    });
  } catch (error) {
    console.error('Guest signup error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'ID number or email already in use. Please choose a different ID.' });
    }
=======
    res.status(201).json({ message: 'Guest account created successfully.', guest_id: result.insertId });
  } catch {
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
    res.status(500).json({ error: 'Unable to create guest account.' });
  }
});

app.post('/api/guest/signin', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
<<<<<<< HEAD

    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [rows] = await pool.query(
      'SELECT guest_id, first_name, last_name, email, phone_number, identity_number, password FROM GUEST WHERE email = ? LIMIT 1',
      [email.trim()]
    );
    const guest = rows[0];

    if (!guest || !(await bcrypt.compare(password, guest.password))) {
      return res.status(401).json({ error: 'Account not found or password incorrect. Please check your credentials.' });
=======
    const [rows] = await pool.query('SELECT * FROM guest WHERE email = ? LIMIT 1', [email?.trim()]);
    const guest = rows[0];

    if (!guest || !(await bcrypt.compare(password || '', guest.password))) {
      return res.status(401).json({ error: 'Invalid credentials.' });
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
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
<<<<<<< HEAD
  try {
    const guestId = Number(req.params.id);
    const { phone_number, first_name, last_name } = req.body;

    if (!phone_number || typeof phone_number !== 'string' || !phone_number.trim()) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    const values = [phone_number.trim()];
    let query = 'UPDATE GUEST SET phone_number = ?';

    if (first_name && typeof first_name === 'string' && first_name.trim()) {
      query += ', first_name = ?';
      values.push(first_name.trim());
    }

    if (last_name && typeof last_name === 'string' && last_name.trim()) {
      query += ', last_name = ?';
      values.push(last_name.trim());
    }

    query += ' WHERE guest_id = ?';
    values.push(guestId);

    const [result] = await pool.query(query, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Guest account not found.' });
    }

    const [updatedRows] = await pool.query(
      'SELECT guest_id, first_name, last_name, email, phone_number, identity_number FROM GUEST WHERE guest_id = ? LIMIT 1',
      [guestId]
    );

    res.json({ message: 'Profile updated successfully.', guest: updatedRows[0] });
  } catch (error) {
    console.error('Guest profile update error:', error);
    res.status(500).json({ error: 'Unable to update profile.' });
  }
});

app.post('/api/staff', authRateLimit, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const allowedRoles = ['cleaning', 'bar', 'therapist', 'waiter', 'admin'];

    if (!username?.trim() || !password || !role || !allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Username, password, and a valid role are required.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.query('INSERT INTO Staff (username, password, role, active) VALUES (?, ?, ?, TRUE)', [username.trim(), passwordHash, role]);
    res.status(201).json({ message: 'User added successfully.', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'That username is already registered.' });
    }
    console.error('Staff creation error:', error);
    res.status(500).json({ error: 'Unable to create staff account.' });
  }
});

// Alias for backwards compatibility
app.post('/api/staff/signup', authRateLimit, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const allowedRoles = ['cleaning', 'bar', 'therapist', 'waiter', 'admin'];

    if (!username?.trim() || !password || !role || !allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Username, password, and a valid role are required.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.query('INSERT INTO Staff (username, password, role, active) VALUES (?, ?, ?, TRUE)', [username.trim(), passwordHash, role]);
    res.status(201).json({ message: 'Staff account created successfully.', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'That username is already registered.' });
    }
    console.error('Staff creation error:', error);
    res.status(500).json({ error: 'Unable to create staff account.' });
  }
});

app.post('/api/staff/signin', authRateLimit, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const [rows] = await pool.query('SELECT id, username, password, role, active FROM Staff WHERE username = ? AND role = ? LIMIT 1', [username?.trim(), role]);
    const staff = rows[0];

    if (!staff || !(await bcrypt.compare(password || '', staff.password))) {
      return res.status(401).json({ error: 'Invalid staff credentials.' });
    }
    if (!staff.active) {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact an administrator.' });
    }

    res.json({ id: staff.id, staff_id: staff.id, username: staff.username, role: staff.role });
  } catch (error) {
    console.error('Staff signin error:', error);
    res.status(500).json({ error: 'Unable to sign in.' });
  }
});

app.get('/api/staff/:id/workspace', async (req, res) => {
  try {
    const staffId = Number(req.params.id);
    const [staffRows] = await pool.query('SELECT id, username, role, active, mobile_number FROM Staff WHERE id = ? LIMIT 1', [staffId]);
    if (!staffRows[0]) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }

    const [attendance] = await pool.query(
      "SELECT id, DATE_FORMAT(attendance_date, '%Y-%m-%d') AS attendance_date, check_in_time, check_out_time, check_in_location, check_out_location, is_busy FROM staff_attendance WHERE staff_id = ? ORDER BY attendance_date DESC LIMIT 14",
      [staffId]
    );
    const [salaryRows] = await pool.query('SELECT role, rate, salary_amount FROM staff_salary WHERE staff_id = ? LIMIT 1', [staffId]);
    res.json({ staff: staffRows[0], attendance, salary: salaryRows[0] || { role: staffRows[0].role, rate: 7, salary_amount: 0 } });
  } catch (error) {
    console.error('Staff workspace error:', error);
    res.status(500).json({ error: 'Unable to load staff workspace.' });
  }
});

app.patch('/api/staff/:id/profile', async (req, res) => {
  try {
    const staffId = Number(req.params.id);
    const { username, mobile_number, password } = req.body;
    if (!username?.trim() || !mobile_number?.trim()) {
      return res.status(400).json({ error: 'Username and mobile number are required.' });
    }

    const values = [username.trim(), mobile_number.trim()];
    let query = 'UPDATE Staff SET username = ?, mobile_number = ?';
    if (password) {
      query += ', password = ?';
      values.push(await bcrypt.hash(password, 12));
    }
    query += ' WHERE id = ?';
    values.push(staffId);
    await pool.query(query, values);
    res.json({ message: 'Account settings updated.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'That username is already in use.' });
    }
    console.error('Staff profile update error:', error);
    res.status(500).json({ error: 'Unable to update account settings.' });
  }
});

app.post('/api/staff/:id/attendance/check-in', async (req, res) => {
  try {
    const staffId = Number(req.params.id);
    const checkInLocation = String(req.body.check_in_location || req.body.location || '').trim();
    if (!checkInLocation) {
      return res.status(400).json({ error: 'Location is required for check-in.' });
    }
    const [existingAttendance] = await pool.query(
      'SELECT id, check_out_time FROM staff_attendance WHERE staff_id = ? AND attendance_date = CURDATE() LIMIT 1',
      [staffId]
    );
    if (existingAttendance.length > 0) {
      return res.json({ message: existingAttendance[0].check_out_time ? 'Today\'s attendance is already completed.' : 'You are already checked in today.', alreadyRecorded: true });
    }
    await pool.query(
      'INSERT INTO staff_attendance (staff_id, attendance_date, check_in_time, check_in_location, is_busy) VALUES (?, CURDATE(), CURTIME(), ?, FALSE)',
      [staffId, checkInLocation]
    );
    const [savedAttendance] = await pool.query(
      'SELECT id, DATE_FORMAT(attendance_date, \'%Y-%m-%d\') AS attendance_date, check_in_time, check_in_location, is_busy FROM staff_attendance WHERE staff_id = ? AND attendance_date = CURDATE() LIMIT 1',
      [staffId]
    );
    res.status(201).json({ message: 'Checked in successfully.', attendance: savedAttendance[0] });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.json({ message: 'You are already checked in today.', alreadyRecorded: true });
    }
    console.error('Staff check-in error:', error);
    res.status(500).json({ error: 'Unable to record check-in.' });
  }
});

app.post('/api/staff/:id/attendance/check-out', async (req, res) => {
  try {
    const staffId = Number(req.params.id);
    const checkOutLocation = String(req.body.check_out_location || req.body.location || '').trim();
    if (!checkOutLocation) {
      return res.status(400).json({ error: 'Location is required for check-out.' });
    }
    const [result] = await pool.query(
      'UPDATE staff_attendance SET check_out_time = CURTIME(), check_out_location = ? WHERE staff_id = ? AND attendance_date = CURDATE() AND check_out_time IS NULL',
      [checkOutLocation, staffId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No open attendance record found for today.' });
    }
    const [savedAttendance] = await pool.query(
      "SELECT id, DATE_FORMAT(attendance_date, '%Y-%m-%d') AS attendance_date, check_in_time, check_out_time, check_in_location, check_out_location, is_busy FROM staff_attendance WHERE staff_id = ? AND attendance_date = CURDATE() LIMIT 1",
      [staffId]
    );
    res.json({ message: 'Checked out successfully.', attendance: savedAttendance[0] });
  } catch (error) {
    console.error('Staff check-out error:', error);
    res.status(500).json({ error: 'Unable to record check-out.' });
  }
});

app.patch('/api/staff/:id/attendance/busy', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE staff_attendance SET is_busy = ? WHERE staff_id = ? AND attendance_date = CURDATE()',
      [Boolean(req.body.is_busy), Number(req.params.id)]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Check in before changing busy status.' });
    }
    res.json({ message: 'Busy status updated.' });
  } catch (error) {
    console.error('Staff busy status error:', error);
    res.status(500).json({ error: 'Unable to update busy status.' });
  }
});

app.get('/api/staff', async (req, res) => {
=======
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
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
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

<<<<<<< HEAD
// (Replaced by roomsRouter)

const roomsRouter = createRoomsRouter(pool, upload);
app.use('/api/rooms', roomsRouter);

const bookingsRouter = createBookingsRouter(pool, bookingRateLimit);
app.use('/api/bookings', bookingsRouter);

const barRouter = createBarRouter(pool, upload);
app.use('/api/bar', barRouter);
app.use('/api/admin/bar', barRouter);

const offersRouter = createOffersRouter(pool, upload);
app.use('/api/offers', offersRouter);
app.use('/api/exclusive-offers', offersRouter);

const billingRouter = createBillingRouter(pool);
app.use('/api/billing', billingRouter);

// Serve static frontend files in production (from public/ or ../frontend/dist)
if (staticPath) {
  app.use(express.static(staticPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Global Error Handler (Catches Multer, JSON parsing, and general server errors)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    error: err.message || 'An unexpected server error occurred.'
  });
});

// ==========================================
// NEW BRANCH MODULE ENDPOINTS
// ==========================================


// CREATE: Add a new branch
app.post('/api/branches', async (req, res) => {
    try {
        const { branch_name, city, address, contact_number } = req.body;
        const sql = `INSERT INTO Branch (branch_name, city, address, contact_number) VALUES (?, ?, ?, ?)`;
        const [result] = await pool.query(sql, [branch_name, city, address, contact_number]);
        
        res.status(201).json({ 
            message: "Branch created successfully", 
            branch_id: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// READ ALL: Fetch all branches (with optional city filtering)
app.get('/api/branches', async (req, res) => {
    try {
        const { city } = req.query;
        let sql = `SELECT * FROM Branch`;
        let params = [];

        if (city) {
            sql += ` WHERE city = ?`;
            params.push(city);
        }

        const [rows] = await pool.query(sql, params);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// READ ONE: Fetch a specific branch by ID
app.get('/api/branches/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `SELECT * FROM Branch WHERE branch_id = ?`;
        const [rows] = await pool.query(sql, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Branch not found" });
        }
        
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE: Modify an existing branch
app.put('/api/branches/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { branch_name, city, address, contact_number } = req.body;
        
        const sql = `UPDATE Branch SET branch_name = ?, city = ?, address = ?, contact_number = ? WHERE branch_id = ?`;
        const [result] = await pool.query(sql, [branch_name, city, address, contact_number, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Branch not found" });
        }
        
        res.status(200).json({ message: "Branch updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Remove a branch
app.delete('/api/branches/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `DELETE FROM Branch WHERE branch_id = ?`;
        const [result] = await pool.query(sql, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Branch not found" });
        }
        
        res.status(200).json({ message: "Branch deleted successfully" });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ error: "Cannot delete branch. It has active rooms or staff." });
        }
        res.status(500).json({ error: error.message });
    }
});

// JOIN: Fetch all rooms available at a specific branch
app.get('/api/branches/:id/rooms', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT r.room_number, r.status AS current_status, rt.type_name, rt.capacity, rt.daily_rate
            FROM Branch b
            JOIN Room r ON b.branch_id = r.branch_id
            JOIN RoomType rt ON r.room_type_id = rt.room_type_id
            WHERE b.branch_id = ?
        `;
        const [rows] = await pool.query(sql, [id]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//=====================================================

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
=======
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
>>>>>>> d17e6599bd50ba6d5893d0baf57fb5700d660028
