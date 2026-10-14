import express from 'express';
import { ensureAdminAccount, createAdminRouter } from './adminAccount.js';
import { removeLegacySettings } from './database/removeLegacySettings.js';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'url';

import createAuthRouter, { normalizeRole } from './routes/auth.js';
import createRoomsRouter from './routes/rooms.js';
import createBookingsRouter from './routes/bookings.js';
import createBarRouter from './routes/bar.js';
import createOffersRouter from './routes/offers.js';
import createReceptionRouter from './routes/reception.js';
import createReportsRouter from './routes/reports.js';
import createBranchRouter from './branchRoutes.js';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env') });

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is missing in .env');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '10m';

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

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

const defaultSystemSettings = {
  hotel_name: 'HRGSMS Grand Hotel',
  contact_email: 'admin@hrgsms.com',
  phone_number: '+94 11 234 5678',
  address: '123 Ocean Drive, Colombo',
};

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

const ensureStaffPlatformSchema = async () => {
  const [[mobileColumn]] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Staff' AND COLUMN_NAME = 'mobile_number'`
  );
  if (!Number(mobileColumn.count)) {
    await pool.query('ALTER TABLE Staff ADD COLUMN mobile_number VARCHAR(30) NULL');
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS staff_attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id INT NOT NULL,
      attendance_date DATE NOT NULL,
      check_in_time TIME NOT NULL,
      check_out_time TIME NULL,
      check_in_location VARCHAR(255) NOT NULL,
      check_out_location VARCHAR(255) NULL,
      is_busy BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (staff_id) REFERENCES Staff(id) ON DELETE CASCADE,
      UNIQUE (staff_id, attendance_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS staff_salary (
      id INT AUTO_INCREMENT PRIMARY KEY,
      staff_id INT NOT NULL,
      role VARCHAR(100) NOT NULL,
      rate DECIMAL(10, 2) DEFAULT 7.00,
      salary_amount DECIMAL(10, 2) DEFAULT 7.00,
      FOREIGN KEY (staff_id) REFERENCES Staff(id) ON DELETE CASCADE,
      UNIQUE (staff_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
};

// Admin credentials are persisted as hashes in the database.
app.use('/api/admin', createAdminRouter(pool, authRateLimit));

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

    const token = generateToken({
      id: result.insertId,
      guest_id: result.insertId,
      email: email.trim(),
      role: 'Guest',
    });

    res.status(201).json({
      message: 'Guest account created successfully.',
      guest_id: result.insertId,
      token,
    });
  } catch {
    res.status(500).json({ error: 'Unable to create guest account.' });
  }
});

app.post('/api/guest/signin', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = String(email || '').trim();
    const cleanPass = String(password || '');

    // Guest accounts authenticate with their own stored password.
    const [rows] = await pool.query('SELECT * FROM guest WHERE LOWER(email) = ? LIMIT 1', [cleanEmail.toLowerCase()]);
    let guest = rows[0];

    if (guest && (await bcrypt.compare(cleanPass, guest.password))) {
      const token = generateToken({
        id: guest.guest_id,
        guest_id: guest.guest_id,
        email: guest.email,
        role: 'Guest',
      });
      return res.json({
        guest_id: guest.guest_id,
        first_name: guest.first_name,
        last_name: guest.last_name,
        email: guest.email,
        phone_number: guest.phone_number,
        identity_number: guest.identity_number,
        token,
      });
    }

    // 3. Fallback: check Staff table so staff members can also test guest booking
    const [staffRows] = await pool.query('SELECT * FROM Staff WHERE LOWER(username) = ? LIMIT 1', [cleanEmail.toLowerCase()]);
    const staffMember = staffRows[0];
    if (staffMember && (await bcrypt.compare(cleanPass, staffMember.password))) {
      let [staffAsGuest] = await pool.query('SELECT * FROM guest WHERE LOWER(email) = ? LIMIT 1', [cleanEmail.toLowerCase()]);
      if (staffAsGuest.length === 0) {
        const hash = staffMember.password;
        const [insStaff] = await pool.query(
          'INSERT INTO guest (first_name, last_name, email, phone_number, identity_number, password) VALUES (?, ?, ?, ?, ?, ?)',
          [staffMember.username.split('@')[0], 'Staff', cleanEmail, staffMember.mobile_number || '0713892928', '199012345678', hash]
        );
        const token = generateToken({
          id: insStaff.insertId,
          guest_id: insStaff.insertId,
          email: cleanEmail,
          role: 'Guest',
        });
        return res.json({
          guest_id: insStaff.insertId,
          first_name: staffMember.username.split('@')[0],
          last_name: 'Staff',
          email: cleanEmail,
          phone_number: staffMember.mobile_number || '0713892928',
          identity_number: '199012345678',
          token,
        });
      }
      const sg = staffAsGuest[0];
      const token = generateToken({
        id: sg.guest_id,
        guest_id: sg.guest_id,
        email: sg.email || cleanEmail,
        role: 'Guest',
      });
      return res.json({
        guest_id: sg.guest_id,
        first_name: sg.first_name || staffMember.username.split('@')[0],
        last_name: sg.last_name || 'Staff',
        email: sg.email || cleanEmail,
        phone_number: sg.phone_number || staffMember.mobile_number || '0713892928',
        identity_number: sg.identity_number || '199012345678',
        token,
      });
    }

    return res.status(401).json({ error: 'Invalid credentials.' });
  } catch (err) {
    console.error('Guest signin error:', err);
    res.status(500).json({ error: 'Unable to sign in.' });
  }
});

app.get('/api/guest/:id/profile', async (req, res) => {
  try {
    const guestId = Number(req.params.id);
    const [rows] = await pool.query('SELECT guest_id, first_name, last_name, email, phone_number, identity_number FROM guest WHERE guest_id = ?', [guestId]);
    if (!rows[0]) return res.status(404).json({ error: 'Guest not found.' });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Unable to load profile.' });
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

// System settings are stored as one editable hotel configuration record.
const ensureSystemSettings = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS system_settings (
      settings_id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
      hotel_name VARCHAR(120) NOT NULL,
      contact_email VARCHAR(160) NOT NULL,
      phone_number VARCHAR(50) NOT NULL,
      address VARCHAR(255) NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await pool.query(
    `INSERT IGNORE INTO system_settings
      (settings_id, hotel_name, contact_email, phone_number, address)
     VALUES (1, ?, ?, ?, ?)`,
    [
      defaultSystemSettings.hotel_name,
      defaultSystemSettings.contact_email,
      defaultSystemSettings.phone_number,
      defaultSystemSettings.address,
    ]
  );
};

app.get('/api/system-settings', async (req, res) => {
  try {
    await ensureSystemSettings();
    const [rows] = await pool.query('SELECT * FROM system_settings WHERE settings_id = 1 LIMIT 1');
    res.json(rows[0]);
  } catch (error) {
    console.error('System settings load error:', error);
    res.status(500).json({ error: 'Unable to load system settings.' });
  }
});

app.put('/api/system-settings', async (req, res) => {
  try {
    const hotelName = String(req.body.hotel_name || '').trim();
    const contactEmail = String(req.body.contact_email || '').trim();
    const phoneNumber = String(req.body.phone_number || '').trim();
    const address = String(req.body.address || '').trim();

    if (!hotelName || !contactEmail || !phoneNumber || !address) {
      return res.status(400).json({ error: 'Hotel name, email, phone number, and address are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return res.status(400).json({ error: 'Enter a valid contact email address.' });
    }

    await ensureSystemSettings();
    await pool.query(
      `UPDATE system_settings
       SET hotel_name = ?, contact_email = ?, phone_number = ?, address = ?
       WHERE settings_id = 1`,
      [
        hotelName,
        contactEmail,
        phoneNumber,
        address,
      ]
    );
    const [rows] = await pool.query('SELECT * FROM system_settings WHERE settings_id = 1 LIMIT 1');
    res.json({ message: 'System settings saved successfully.', settings: rows[0] });
  } catch (error) {
    console.error('System settings save error:', error);
    res.status(500).json({ error: 'Unable to save system settings.' });
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
    const token = generateToken({ id: staff.id, staff_id: staff.id, username: staff.username, role: normalized });
    res.json({ id: staff.id, staff_id: staff.id, username: staff.username, role: normalized, token });
  } catch {
    res.status(500).json({ error: 'Unable to sign in.' });
  }
});

app.get('/api/staff/:id/workspace', async (req, res) => {
  try {
    await ensureStaffPlatformSchema();
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
  await ensureStaffPlatformSchema();
  const { id, action } = req.params;
  const staffId = Number(id);
  const attendanceDate = String(req.body.attendance_date || '').trim();
  const attendanceTime = String(req.body.attendance_time || '').trim();
  const location = String(req.body.location || req.body.check_in_location || req.body.check_out_location || '').trim();

  if (!Number.isInteger(staffId) || staffId < 1) return res.status(400).json({ error: 'Invalid staff member.' });
  if (!['check-in', 'check-out'].includes(action)) return res.status(400).json({ error: 'Invalid attendance action.' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(attendanceDate)) return res.status(400).json({ error: 'A valid attendance date is required.' });
  if (!/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(attendanceTime)) return res.status(400).json({ error: 'A valid local attendance time is required.' });
  if (!location) return res.status(400).json({ error: 'Location is required to record attendance.' });

  if (action === 'check-in') {
    try {
      await pool.query('INSERT INTO staff_attendance (staff_id, attendance_date, check_in_time, check_in_location) VALUES (?, ?, ?, ?)', [staffId, attendanceDate, attendanceTime, location]);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'You have already checked in for this date.' });
      throw error;
    }
    res.json({ message: 'Checked in successfully.' });
  } else {
    const [result] = await pool.query('UPDATE staff_attendance SET check_out_time = ?, check_out_location = ? WHERE staff_id = ? AND attendance_date = ? AND check_out_time IS NULL', [attendanceTime, location, staffId, attendanceDate]);
    if (!result.affectedRows) return res.status(409).json({ error: 'No open check-in was found for this date.' });
    res.json({ message: 'Checked out successfully.' });
  }
});

app.patch('/api/staff/:id/attendance/busy', async (req, res) => {
  try {
    await ensureStaffPlatformSchema();
    const staffId = Number(req.params.id);
    const attendanceDate = String(req.body.attendance_date || '').trim();
    const isBusy = req.body.is_busy ? 1 : 0;
    if (!Number.isInteger(staffId) || staffId < 1 || !/^\d{4}-\d{2}-\d{2}$/.test(attendanceDate)) {
      return res.status(400).json({ error: 'A valid staff member and attendance date are required.' });
    }
    const [result] = await pool.query(
      'UPDATE staff_attendance SET is_busy = ? WHERE staff_id = ? AND attendance_date = ? AND check_in_time IS NOT NULL AND check_out_time IS NULL',
      [isBusy, staffId, attendanceDate]
    );
    if (!result.affectedRows) return res.status(409).json({ error: 'An open attendance record is required.' });
    res.json({ message: `Staff marked ${isBusy ? 'busy' : 'available'}.` });
  } catch (error) {
    console.error('Attendance busy status error:', error);
    res.status(500).json({ error: 'Unable to update busy status.' });
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
app.use('/api/branches', createBranchRouter(pool));

// Static files in production
if (staticPath) {
  app.use(express.static(staticPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Finish schema changes before accepting requests.
try {
  await ensureSystemSettings();
  await removeLegacySettings(pool);
  await ensureAdminAccount(pool);
  app.listen(port, () => console.log(`Server running on port ${port}`));
} catch (error) {
  console.error('Database initialization failed:', error.message);
  await pool.end();
  process.exitCode = 1;
}
