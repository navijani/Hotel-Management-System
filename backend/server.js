import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { rateLimit } from 'express-rate-limit';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const bookingRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many booking attempts. Please try again later.' },
});

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Serve uploads directory statically
app.use('/uploads', express.static('uploads'));

// Database connection pool
const pool = mysql.createPool({
  host: (process.env.DB_HOST || 'localhost').trim(),
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 4000,
  user: (process.env.DB_USER || 'root').trim(),
  password: process.env.DB_PASSWORD || '',
  database: (process.env.DB_NAME || 'hotel_db').trim(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 20,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
    ca: fs.existsSync('ca.pem') ? fs.readFileSync('ca.pem') : undefined
  }
});

app.get('/', (req, res) => {
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

app.post('/api/admin/signin', (req, res) => {
  const username = process.env.ADMIN_USERNAME ;
  const password = process.env.ADMIN_PASSWORD;

  if (req.body.username?.trim() !== username || req.body.password !== password) {
    return res.status(401).json({ error: 'Invalid administrator credentials.' });
  }

  res.json({ message: 'Administrator login successful.' });
});

app.post('/api/guest/signup', async (req, res) => {
  try {
    const { first_name, last_name, email, phone_number, identity_number, password } = req.body;
    const requiredFields = [first_name, last_name, email, phone_number, identity_number, password];

    if (requiredFields.some((field) => typeof field !== 'string' || !field.trim())) {
      return res.status(400).json({ error: 'All guest registration fields are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const [existingGuests] = await pool.query(
      'SELECT guest_id FROM GUEST WHERE email = ? OR identity_number = ? LIMIT 1',
      [email.trim(), identity_number.trim()]
    );

    if (existingGuests.length > 0) {
      return res.status(409).json({ error: 'An account with that email or identity number already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO GUEST (first_name, last_name, email, phone_number, identity_number, password) VALUES (?, ?, ?, ?, ?, ?)',
      [first_name.trim(), last_name.trim(), email.trim(), phone_number.trim(), identity_number.trim(), passwordHash]
    );

    res.status(201).json({
      message: 'Guest account created successfully.',
      guest_id: result.insertId,
    });
  } catch (error) {
    console.error('Guest signup error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'An account with those details already exists.' });
    }
    res.status(500).json({ error: 'Unable to create guest account.' });
  }
});

app.post('/api/guest/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [rows] = await pool.query(
      'SELECT guest_id, first_name, last_name, email, password FROM GUEST WHERE email = ? LIMIT 1',
      [email.trim()]
    );
    const guest = rows[0];

    if (!guest || !(await bcrypt.compare(password, guest.password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json({
      guest_id: guest.guest_id,
      first_name: guest.first_name,
      last_name: guest.last_name,
      email: guest.email,
    });
  } catch (error) {
    console.error('Guest signin error:', error);
    res.status(500).json({ error: 'Unable to sign in.' });
  }
});

app.post('/api/staff/signup', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const allowedRoles = ['cleaning', 'bar', 'therapist', 'waiter'];

    if (!username || !password || !allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Username, password, and a valid role are required.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query('INSERT INTO Staff (username, password, role, active) VALUES (?, ?, ?, FALSE)', [username.trim(), passwordHash, role]);
    res.status(201).json({ message: 'Registration submitted. An administrator must approve your account before you can sign in.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'That username is already registered.' });
    }
    console.error('Staff signup error:', error);
    res.status(500).json({ error: 'Unable to create staff account.' });
  }
});

app.post('/api/staff/signin', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const [rows] = await pool.query('SELECT id, username, password, role, active FROM Staff WHERE username = ? AND role = ? LIMIT 1', [username?.trim(), role]);
    const staff = rows[0];

    if (!staff || !(await bcrypt.compare(password || '', staff.password))) {
      return res.status(401).json({ error: 'Invalid staff credentials.' });
    }
    if (!staff.active) {
      return res.status(403).json({ error: 'Your account is waiting for administrator approval.' });
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
  try {
    const [rows] = await pool.query('SELECT id, username, role, active, created_at FROM Staff ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Staff list error:', error);
    res.status(500).json({ error: 'Unable to load staff accounts.' });
  }
});

app.patch('/api/staff/:id/status', async (req, res) => {
  try {
    const active = Boolean(req.body.active);
    const [result] = await pool.query('UPDATE Staff SET active = ? WHERE id = ?', [active, req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }
    res.json({ message: active ? 'Staff member approved.' : 'Staff member deactivated.' });
  } catch (error) {
    console.error('Staff status update error:', error);
    res.status(500).json({ error: 'Unable to update staff status.' });
  }
});

// (Replaced by roomsRouter)

const roomsRouter = require('./routes/rooms')(pool, upload);
app.use('/api/rooms', roomsRouter);

const bookingsRouter = require('./routes/bookings')(pool, bookingRateLimit);
app.use('/api/bookings', bookingsRouter);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
