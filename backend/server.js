import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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
  queueLimit: 0,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to the MySQL database.');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err.message);
  });

// Root route so the backend shows a useful response in the browser
app.get('/', (req, res) => {
  res.status(200).send('Hotel Management backend is running. Use /api/test or open the frontend app on port 5173.');
});

// Basic route
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

// Staff authentication and approval workflow
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

    res.json({ id: staff.id, username: staff.username, role: staff.role });
  } catch (error) {
    console.error('Staff signin error:', error);
    res.status(500).json({ error: 'Unable to sign in.' });
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

// Fetch Rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Room');
    res.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Create Room
app.post('/api/rooms', upload.single('image'), async (req, res) => {
  try {
    const { room_number, type, capacity, price_per_night, status } = req.body;
    let image_url = '';
    
    if (req.file) {
      // Construct a URL to access the uploaded file
      image_url = `http://localhost:5000/uploads/${req.file.filename}`;
    } else if (req.body.image_url) {
      // Fallback if they passed a URL instead
      image_url = req.body.image_url;
    }
    
    // In a real system, you would first resolve 'type' to a room_type_id 
    // from ROOM_TYPE table, and branch_id from a BRANCH table.
    // Assuming branch_id = 1 and resolving type manually or assuming the DB schema allows these directly.
    const [result] = await pool.query(
      'INSERT INTO Room (room_number, type, capacity, price_per_night, status, image) VALUES (?, ?, ?, ?, ?, ?)',
      [room_number, type, capacity, price_per_night, status || 'Available', image_url]
    );

    res.status(201).json({ message: 'Room created successfully', roomId: result.insertId, room: req.body });
  } catch (error) {
    console.error('Create room error:', error);
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes('Table')) {
      return res.status(201).json({ message: 'Room created (Mock)', roomId: Math.floor(Math.random() * 1000), room: req.body });
    }
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Create Booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, identificationNo, checkInDate, checkOutDate, roomType } = req.body;
    
    // We assume the DB is running and has GUEST, ROOM, BOOKING tables.
    // However, if the DB is not fully seeded or available, we might want to return a successful mock response.
    // For a real implementation, we'd use a transaction:
    
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Check or insert guest
      let guestId;
      const [existingGuest] = await connection.query(
        'SELECT guest_id FROM GUEST WHERE identification_no = ?',
        [identificationNo]
      );

      if (existingGuest.length > 0) {
        guestId = existingGuest[0].guest_id;
      } else {
        const [guestResult] = await connection.query(
          'INSERT INTO GUEST (first_name, last_name, email, phone_number, identification_no) VALUES (?, ?, ?, ?, ?)',
          [firstName, lastName, email, phone, identificationNo]
        );
        guestId = guestResult.insertId;
      }

      // 2. Find an available room (Mocking room_id = 1 for simplicity if not found)
      let roomId = 1; 
      // Example real query: 
      // const [rooms] = await connection.query('SELECT room_id FROM ROOM WHERE current_status = "Available" LIMIT 1');
      // if (rooms.length > 0) roomId = rooms[0].room_id;

      // 3. Create booking
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
    // If DB isn't fully set up yet, fallback to a mock success for the frontend
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes('Table')) {
      console.log('Mocking successful booking due to missing tables.');
      return res.status(201).json({ message: 'Booking successful (Mock)', bookingId: Math.floor(Math.random() * 1000) });
    }
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
