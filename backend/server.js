import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcryptjs';
import { rateLimit } from 'express-rate-limit';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const bookingLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many booking attempts. Please try again later.' },
}); 
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

app.use('/api/admin/signin', authLimiter);
app.use('/api/guest/signin', authLimiter);
app.use('/api/guest/signup', authLimiter);
app.use('/api/staff/signin', authLimiter);
app.use('/api/staff/signup', authLimiter);
app.use('/api/bookings', bookingLimiter);

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
    rejectUnauthorized: true
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
    const [rows] = await pool.query(
      'SELECT id, username, password, role, active, failed_login_attempts FROM Staff WHERE username = ? AND role = ? LIMIT 1',
      [username?.trim(), role]
    );
    const staff = rows[0];

    if (staff && !staff.active && staff.failed_login_attempts >= 5) {
      return res.status(403).json({
        error: 'Your account is under investigation. Please contact hms@gmail.com for reactivation.',
      });
    }

    if (staff && !staff.active) {
      return res.status(403).json({ error: 'Your account is waiting for administrator approval.' });
    }

    if (!staff || !(await bcrypt.compare(password || '', staff.password))) {
      if (staff) {
        const nextAttemptCount = staff.failed_login_attempts + 1;
        await pool.query(
          'UPDATE Staff SET failed_login_attempts = ?, active = CASE WHEN ? >= 5 THEN FALSE ELSE active END WHERE id = ?',
          [nextAttemptCount, nextAttemptCount, staff.id]
        );

        if (nextAttemptCount >= 5) {
          return res.status(403).json({
            error: 'Your account is under investigation. Please contact hms@gmail.com for reactivation.',
          });
        }
      }

      return res.status(401).json({ error: 'Invalid staff credentials.' });
    }

    await pool.query('UPDATE Staff SET failed_login_attempts = 0 WHERE id = ?', [staff.id]);
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
    const [result] = await pool.query(
      'UPDATE Staff SET active = ?, failed_login_attempts = CASE WHEN ? THEN 0 ELSE failed_login_attempts END WHERE id = ?',
      [active, active, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }
    res.json({ message: active ? 'Staff member approved.' : 'Staff member deactivated.' });
  } catch (error) {
    console.error('Staff status update error:', error);
    res.status(500).json({ error: 'Unable to update staff status.' });
  }
});

app.get('/api/rooms', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Room');
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

app.post('/api/rooms', upload.single('image'), async (req, res) => {
  try {
    const { room_number, type, capacity, price_per_night, status } = req.body;
    let image_url = '';

    if (req.file) {
      image_url = `http://localhost:5000/uploads/${req.file.filename}`;
    } else if (req.body.image_url) {
      image_url = req.body.image_url;
    }

    const [result] = await pool.query(
      'INSERT INTO Room (room_number, type, capacity, price_per_night, status, image) VALUES (?, ?, ?, ?, ?, ?)',
      [room_number, type, capacity, price_per_night, status || 'Available', image_url]
    );

    res.status(201).json({ message: 'Room created successfully', roomId: result.insertId, room: req.body });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, identificationNo, checkInDate, checkOutDate, roomType } = req.body;

    if ([firstName, lastName, email, phone, identificationNo, checkInDate, checkOutDate, roomType].some((value) => typeof value !== 'string' || !value.trim())) {
      return res.status(400).json({ error: 'All booking fields are required.' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      let guestId;
      const [existingGuest] = await connection.query(
        'SELECT guest_id FROM GUEST WHERE identity_number = ?',
        [identificationNo]
      );

      if (existingGuest.length > 0) {
        guestId = existingGuest[0].guest_id;
      } else {
        const [guestResult] = await connection.query(
          'INSERT INTO GUEST (first_name, last_name, email, phone_number, identity_number) VALUES (?, ?, ?, ?, ?)',
          [firstName, lastName, email, phone, identificationNo]
        );
        guestId = guestResult.insertId;
      }

      const [availableRooms] = await connection.query(
        'SELECT room_id FROM Room WHERE type = ? AND status = ? LIMIT 1',
        [roomType, 'Available']
      );
      if (availableRooms.length === 0) {
        const noRoomError = new Error('No room is available for the selected type.');
        noRoomError.statusCode = 409;
        throw noRoomError;
      }
      const roomId = availableRooms[0].room_id;

      const [bookingResult] = await connection.query(
        'INSERT INTO BOOKING (guest_id, room_id, check_in_date, check_out_date, booking_status) VALUES (?, ?, ?, ?, ?)',
        [guestId, roomId, checkInDate, checkOutDate, 'Booked']
      );

      await connection.commit();
      res.status(201).json({ message: 'Booking successful', bookingId: bookingResult.insertId });
    } catch (dbError) {
      await connection.rollback();
      throw dbError;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Booking error:', error);
    res.status(error.statusCode || 500).json({ error: error.statusCode ? error.message : 'Failed to create booking' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
