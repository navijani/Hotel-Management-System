import express from 'express';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { getUsdLkrRate, quoteRoomCharge } from '../exchangeRate.js';

const router = express.Router();
const bookingWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 write requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

const stayNights = (checkInDate, checkOutDate) => {
  const valid = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  if (!valid(checkInDate) || !valid(checkOutDate)) throw new Error('Valid check-in and check-out dates are required.');
  const nights = (Date.parse(checkOutDate) - Date.parse(checkInDate)) / 86400000;
  if (!Number.isInteger(nights) || nights < 1) throw new Error('Check-out must be after check-in.');
  return nights;
};

const readQuoteToken = (token) => {
  try {
    const quote = jwt.verify(String(token || ''), process.env.JWT_SECRET, { algorithms: ['HS256'] });
    if (quote.kind !== 'room-quote' || quote.currency !== 'LKR' || !Number.isInteger(quote.roomId) || !Number.isFinite(quote.amountLkr) || quote.amountLkr <= 0) throw new Error();
    return quote;
  } catch {
    throw new Error('Price quote expired or invalid. Please refresh the booking price.');
  }
};

const formatBillingRow = (row) => ({
  booking_id: row.booking_id,
  guest_id: row.guest_id || null,
  booking_status: row.booking_status,
  guest_name: row.guest_name,
  email: row.email || '',
  phone_number: row.phone_number || '',
  identification_no: row.id_number,
  room_number: row.room_number,
  room_type: row.room_type_name,
  branch: row.branch_name,
  check_in_at: row.check_in_date,
  check_out_at: row.check_out_date,
  nights: Math.max(1, Math.ceil((new Date(row.check_out_date).getTime() - new Date(row.check_in_date).getTime()) / 86400000)),
  room_daily_rate: Number(row.daily_rate || 0),
  room_total: Number(row.room_charges || 0),
  service_total: Number(row.service_charges || 0),
  tax_amount: Number((Number(row.total_bill || 0) - (Number(row.room_charges || 0) + Number(row.service_charges || 0))).toFixed(2)),
  discount_amount: 0,
  net_total: Number(row.total_bill || 0),
  total_paid: Number(row.total_paid || 0),
  outstanding_balance: Number(row.balance || 0),
  invoice_status: row.due_flag === 'CLEARED' ? 'Paid' : Number(row.total_paid || 0) > 0 ? 'Partial' : 'Unpaid',
});

export default function createBookingsRouter(pool, bookingRateLimit) {
  router.get('/quote', async (req, res) => {
    try {
      const roomId = Number(req.query.roomId);
      const checkInDate = String(req.query.checkInDate || '');
      const checkOutDate = String(req.query.checkOutDate || '');
      const nights = stayNights(checkInDate, checkOutDate);
      if (!Number.isInteger(roomId) || roomId < 1) return res.status(400).json({ error: 'Select a room first.' });

      const [[room]] = await pool.query('SELECT room_id, price_per_night, discount, status FROM Room WHERE room_id = ? LIMIT 1', [roomId]);
      if (!room || room.status !== 'Available') return res.status(400).json({ error: 'This room is not available.' });

      const [overlaps] = await pool.query(
        `SELECT 1 FROM Booking WHERE room_id = ? AND booking_status IN ('Booked', 'Checked-In') AND check_in_date < ? AND check_out_date > ? LIMIT 1`,
        [roomId, checkOutDate, checkInDate]
      );
      if (overlaps.length) return res.status(409).json({ error: 'This room is already booked for the selected dates.' });

      const fx = await getUsdLkrRate();
      const charge = quoteRoomCharge(room.price_per_night, room.discount, nights, fx.rate);
      const quote = { kind: 'room-quote', roomId, checkInDate, checkOutDate, nights, nightlyUsd: charge.nightlyUsd, subtotalUsd: charge.subtotalUsd, amountLkr: charge.amountLkr, fxRate: fx.rate, rateDate: fx.date, currency: 'LKR' };
      const quoteToken = jwt.sign(quote, process.env.JWT_SECRET, { expiresIn: '30m' });
      res.json({ ...quote, quoteToken, source: fx.source });
    } catch (error) {
      console.error('Booking quote error:', error);
      res.status(error.message?.includes('Exchange-rate') || error.message?.includes('fetch') ? 503 : 400).json({ error: error.message || 'Unable to quote room price.' });
    }
  });

  // PayHere hash generator
  router.post('/payhere-hash', (req, res) => {
    try {
      const { order_id, quoteToken } = req.body;
      const quote = readQuoteToken(quoteToken);
      const merchant_id = String(process.env.PAYHERE_MERCHANT_ID || '').trim();
      const merchant_key = String(process.env.PAYHERE_MERCHANT_KEY || '').trim();
      const isSandbox = process.env.PAYHERE_SANDBOX ? process.env.PAYHERE_SANDBOX !== 'false' : true;

      const orderIdStr = String(order_id || `RESORT_${Date.now()}`);
      const currStr = 'LKR';
      const amountFormatted = quote.amountLkr.toFixed(2);

      const hashedKey = crypto.createHash('md5').update(merchant_key).digest('hex').toUpperCase();
      const hashData = merchant_id + orderIdStr + amountFormatted + currStr + hashedKey;
      const hash = crypto.createHash('md5').update(hashData).digest('hex').toUpperCase();

      res.json({
        merchant_id,
        hash,
        amount: amountFormatted,
        currency: currStr,
        order_id: orderIdStr,
        sandbox: isSandbox,
      });
    } catch (error) {
      console.error('PayHere hash error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate PayHere hash.' });
    }
  });

  // POST /api/bookings (Replaces sp_create_booking natively in backend)
  router.post('/', bookingRateLimit, async (req, res) => {
    const connection = await pool.getConnection();

    try {
      const firstName = String(req.body.firstName || '').trim();
      const lastName = String(req.body.lastName || '').trim();
      const email = String(req.body.email || '').trim().toLowerCase();
      const phone = String(req.body.phone || '').trim();
      const identificationNo = String(req.body.identificationNo || '').trim();
      const checkInDate = String(req.body.checkInDate || '').trim();
      const checkOutDate = String(req.body.checkOutDate || '').trim();
      const roomId = req.body.roomId ? Number(req.body.roomId) : null;
      const roomType = String(req.body.roomType || '').trim();
      const quote = readQuoteToken(req.body.quoteToken);
      
      // Read payment attributes sent from frontend
      const paymentStatus = String(req.body.paymentStatus || 'PAID').trim().toUpperCase();
      const rawMethod = String(req.body.paymentMethod || req.body.payment_method || 'Cash').trim();

      if ([firstName, lastName, email, phone, identificationNo, checkInDate, checkOutDate].some((value) => !value)) {
        return res.status(400).json({ error: 'All booking fields are required.' });
      }
      if (quote.checkInDate !== checkInDate || quote.checkOutDate !== checkOutDate || quote.nights !== stayNights(checkInDate, checkOutDate)) {
        return res.status(400).json({ error: 'Booking dates changed. Please refresh the price quote.' });
      }

      await connection.beginTransaction();

      // Check or create guest
      const [guestRows] = await connection.query('SELECT guest_id FROM guest WHERE email = ? OR identity_number = ? LIMIT 1', [email, identificationNo]);
      let guestId = guestRows[0]?.guest_id;

      if (!guestId) {
        const [guestResult] = await connection.query(
          'INSERT INTO guest (first_name, last_name, email, phone_number, identity_number) VALUES (?, ?, ?, ?, ?)',
          [firstName, lastName, email, phone, identificationNo]
        );
        guestId = guestResult.insertId;
      }

      let assignedRoomId = roomId;

      if (!assignedRoomId && roomType) {
        const [availableRooms] = await connection.query(
          `SELECT r.room_id
           FROM Room r
           LEFT JOIN RoomType rt ON rt.room_type_id = r.room_type_id
           WHERE (rt.type_name = ? OR r.type = ?)
             AND r.status = 'Available'
             AND NOT EXISTS (
               SELECT 1 FROM Booking b
               WHERE b.room_id = r.room_id
                 AND b.booking_status IN ('Booked', 'Checked-In')
                 AND (b.check_in_date < ? AND b.check_out_date > ?)
             )
           ORDER BY r.room_id LIMIT 1`,
          [roomType, roomType, checkOutDate, checkInDate]
        );

        if (availableRooms.length === 0) {
          throw new Error('No room is available for the selected dates.');
        }

        assignedRoomId = availableRooms[0].room_id;
      }

      if (!assignedRoomId) {
        throw new Error('roomType or roomId must be provided.');
      }
      if (assignedRoomId !== quote.roomId) throw new Error('Selected room changed. Please refresh the price quote.');

      const [[selectedRoom]] = await connection.query('SELECT status FROM Room WHERE room_id = ? LIMIT 1', [assignedRoomId]);
      if (!selectedRoom || selectedRoom.status !== 'Available') throw new Error('This room is not available.');

      const [overlapRows] = await connection.query(
        `SELECT 1
         FROM Booking
         WHERE room_id = ?
           AND booking_status IN ('Booked', 'Checked-In')
           AND (check_in_date < ? AND check_out_date > ?)
         LIMIT 1`,
        [assignedRoomId, checkOutDate, checkInDate]
      );

      if (overlapRows.length > 0) {
        throw new Error('This room is already booked for the selected dates.');
      }

      // Map raw method name to standard database payment values
      const normalizedMethod = rawMethod.toUpperCase() === 'CARD' ? 'Card' : (rawMethod.toUpperCase() === 'CASH' ? 'Cash' : 'Online');

      // Create Booking record
      const [bookingResult] = await connection.query(
        `INSERT INTO Booking (guest_id, room_id, check_in_date, check_out_date, booking_status, preferred_payment_method, usd_nightly_rate, usd_lkr_rate, room_charge_lkr)
         VALUES (?, ?, ?, ?, 'Booked', ?, ?, ?, ?)`,
        [guestId, assignedRoomId, checkInDate, checkOutDate, normalizedMethod, quote.nightlyUsd, quote.fxRate, quote.amountLkr]
      );

      const bookingId = bookingResult.insertId;

      // Automatically insert a Payment record if paid directly at Reception (Cash/Card/Verified Online)
      if (paymentStatus === 'PAID') {
        await connection.query(
          'INSERT INTO Payment (booking_id, payment_date, amount_paid, payment_method) VALUES (?, NOW(), ?, ?)',
          [bookingId, quote.amountLkr, normalizedMethod]
        );
      }

      await connection.commit();

      res.status(201).json({
        message: 'Booking successful',
        bookingId: bookingId,
        roomId: assignedRoomId,
      });
    } catch (error) {
      await connection.rollback();
      console.error('Booking error:', error);
      res.status(400).json({ error: error.message || 'Failed to create booking' });
    } finally {
      connection.release();
    }
  });

  // GET /api/bookings (All bookings)
  router.get('/', async (req, res) => {
    try {
      // The billing view intentionally contains billing fields only. Join the
      // guest table here so the admin booking details dialog can show the
      // contact information belonging to each reservation.
      const [rows] = await pool.query(`
        SELECT billing.*, b.guest_id, COALESCE(g.email, '') AS email, COALESCE(g.phone_number, '') AS phone_number
        FROM v_guest_billing_detail billing
        LEFT JOIN Booking b ON b.booking_id = billing.booking_id
        LEFT JOIN guest g ON g.guest_id = b.guest_id
        ORDER BY billing.booking_id DESC
      `);
      res.json(rows.map(formatBillingRow));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

  // GET /api/bookings/guest/:guestId (Required for guest profile)
  router.get('/guest/:guestId', async (req, res) => {
    try {
      const guestId = Number(req.params.guestId || 0);
      const identityNo = String(req.query.identity_number || '').trim();
      const email = String(req.query.email || '').trim();

      if (!guestId && !identityNo && !email) {
        return res.status(400).json({ error: 'A guest account identifier is required.' });
      }

      const [bookings] = await pool.query(
        `SELECT b.booking_id, b.check_in_date, b.check_out_date, b.booking_status, b.created_at,
                r.room_number, r.type AS room_type, r.price_per_night, r.image AS room_image,
                b.room_charge_lkr, b.usd_nightly_rate, b.usd_lkr_rate
         FROM Booking b
         LEFT JOIN Room r ON b.room_id = r.room_id
         LEFT JOIN guest g ON b.guest_id = g.guest_id
         WHERE (? > 0 AND b.guest_id = ?)
            OR (g.identity_number IS NOT NULL AND g.identity_number = ?)
            OR (g.email IS NOT NULL AND LOWER(g.email) = LOWER(?))
         ORDER BY b.booking_id DESC`,
        [guestId, guestId, identityNo, email]
      );
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching guest bookings:', error);
      res.status(500).json({ error: 'Failed to fetch reservations' });
    }
  });

  // Check-In helper replacing sp_check_in
  const performCheckIn = async (connection, bookingId) => {
    await connection.query(
      `UPDATE Booking SET booking_status = 'Checked-In', actual_check_in = NOW() WHERE booking_id = ?`,
      [bookingId]
    );
  };

  // Check-Out helper replacing sp_check_out
  const performCheckOut = async (connection, bookingId) => {
    const [balanceRows] = await connection.query(
      `SELECT balance FROM v_guest_billing_detail WHERE booking_id = ? LIMIT 1`,
      [bookingId]
    );

    if (balanceRows.length > 0 && Number(balanceRows[0].balance) > 0.01) {
      throw new Error('Cannot check out guest with outstanding balance.');
    }

    await connection.query(
      `UPDATE Booking SET booking_status = 'Checked-Out', actual_check_out = NOW() WHERE booking_id = ?`,
      [bookingId]
    );
  };

  // PUT /api/bookings/:id/status
  router.put('/:id/status', bookingWriteLimiter, async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const bookingId = Number(req.params.id);
      const status = String(req.body.status || '').trim();

      if (!['Booked', 'Checked-In', 'Checked-Out', 'Cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid booking status.' });
      }

      await connection.beginTransaction();

      if (status === 'Checked-In') {
        await performCheckIn(connection, bookingId);
      } else if (status === 'Checked-Out') {
        await performCheckOut(connection, bookingId);
      } else {
        await connection.query('UPDATE Booking SET booking_status = ? WHERE booking_id = ?', [status, bookingId]);
      }

      await connection.commit();
      res.json({ message: 'Booking status updated successfully' });
    } catch (error) {
      await connection.rollback();
      console.error('Error updating status:', error);
      res.status(400).json({ error: error.message || 'Failed to update status' });
    } finally {
      connection.release();
    }
  });

  // POST /api/bookings/:id/check-in
  router.post('/:id/check-in', bookingWriteLimiter, async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await performCheckIn(connection, Number(req.params.id));
      await connection.commit();
      res.json({ message: 'Guest checked in successfully.' });
    } catch (error) {
      await connection.rollback();
      res.status(400).json({ error: error.message || 'Failed to check in guest.' });
    } finally {
      connection.release();
    }
  });

  // POST /api/bookings/:id/check-out
  router.post('/:id/check-out', bookingWriteLimiter, async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await performCheckOut(connection, Number(req.params.id));
      await connection.commit();

      const [rows] = await pool.query('SELECT * FROM v_guest_billing_detail WHERE booking_id = ?', [Number(req.params.id)]);
      res.json({ message: 'Guest checked out successfully.', billing: rows[0] ? formatBillingRow(rows[0]) : null });
    } catch (error) {
      await connection.rollback();
      res.status(400).json({ error: error.message || 'Failed to check out guest.' });
    } finally {
      connection.release();
    }
  });

  // GET /api/bookings/room/:id/dates
  router.get('/room/:id/dates', async (req, res) => {
    try {
      const roomId = Number(req.params.id);
      const [bookings] = await pool.query(
        `SELECT check_in_date, check_out_date
         FROM Booking
         WHERE room_id = ? AND booking_status IN ('Booked', 'Checked-In')
         ORDER BY check_in_date`,
        [roomId]
      );
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching booked dates:', error);
      res.status(500).json({ error: 'Failed to fetch booked dates' });
    }
  });

  return router;
}
