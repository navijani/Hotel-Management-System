import express from 'express';
import crypto from 'crypto';

const router = express.Router();

const formatBillingRow = (row) => ({
  booking_id: row.booking_id,
  booking_status: row.booking_status,
  guest_name: row.guest_name,
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
  // PayHere hash generator
  router.post('/payhere-hash', (req, res) => {
    try {
      const { order_id, amount, currency } = req.body;
      const merchant_id = String(process.env.PAYHERE_MERCHANT_ID || '').trim();
      const merchant_key = String(process.env.PAYHERE_MERCHANT_KEY || '').trim();
      const isSandbox = process.env.PAYHERE_SANDBOX ? process.env.PAYHERE_SANDBOX !== 'false' : true;

      const orderIdStr = String(order_id || `RESORT_${Date.now()}`);
      const currStr = String(currency || 'LKR').trim();
      const amountFormatted = Number(amount || 0).toFixed(2);

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
      
      // Read payment attributes sent from frontend
      const paymentStatus = String(req.body.paymentStatus || 'PAID').trim().toUpperCase();
      const rawMethod = String(req.body.paymentMethod || req.body.payment_method || 'Cash').trim();

      if ([firstName, lastName, email, phone, identificationNo, checkInDate, checkOutDate].some((value) => !value)) {
        return res.status(400).json({ error: 'All booking fields are required.' });
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
             AND (r.status = 'Available' OR r.current_status = 'Available')
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
        `INSERT INTO Booking (guest_id, room_id, check_in_date, check_out_date, booking_status, preferred_payment_method)
         VALUES (?, ?, ?, ?, 'Booked', ?)`,
        [guestId, assignedRoomId, checkInDate, checkOutDate, normalizedMethod]
      );

      const bookingId = bookingResult.insertId;

      // Automatically insert a Payment record if paid directly at Reception (Cash/Card/Verified Online)
      if (paymentStatus === 'PAID') {
        const [roomData] = await connection.query('SELECT price_per_night, discount FROM Room WHERE room_id = ? LIMIT 1', [assignedRoomId]);
        
        if (roomData.length > 0) {
          const pricePerNight = Number(roomData[0].price_per_night || 0);
          const discount = Number(roomData[0].discount || 0);
          const effectivePrice = Math.round(pricePerNight * (100 - discount) / 100);
          
          const nights = Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / 86400000));
          const totalPaid = nights * effectivePrice;

          if (totalPaid > 0) {
            await connection.query(
              'INSERT INTO Payment (booking_id, payment_date, amount_paid, payment_method) VALUES (?, NOW(), ?, ?)',
              [bookingId, totalPaid, normalizedMethod]
            );
          }
        }
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
      const [rows] = await pool.query(`SELECT * FROM v_guest_billing_detail ORDER BY booking_id DESC`);
      res.json(rows.map(formatBillingRow));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

  // GET /api/bookings/guest/:guestId (Required for guest profile)
  router.get('/guest/:guestId', async (req, res) => {
    try {
      const guestId = req.params.guestId;
      const identityNo = String(req.query.identity_number || '').trim();
      const email = String(req.query.email || '').trim();

      const [bookings] = await pool.query(
        `SELECT b.booking_id, b.check_in_date, b.check_out_date, b.booking_status, b.created_at,
                r.room_number, r.type AS room_type, r.price_per_night, r.image AS room_image
         FROM Booking b
         LEFT JOIN Room r ON b.room_id = r.room_id
         LEFT JOIN guest g ON b.guest_id = g.guest_id
         WHERE b.guest_id = ? OR (g.identity_number IS NOT NULL AND g.identity_number = ?) OR (g.email IS NOT NULL AND g.email = ?)
         ORDER BY b.booking_id DESC`,
        [guestId, identityNo, email]
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
    await connection.query(
      `UPDATE Room SET status = 'Occupied', current_status = 'Occupied'
       WHERE room_id = (SELECT room_id FROM Booking WHERE booking_id = ?)`,
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
    await connection.query(
      `UPDATE Room SET status = 'Available', current_status = 'Available'
       WHERE room_id = (SELECT room_id FROM Booking WHERE booking_id = ?)`,
      [bookingId]
    );
  };

  // PUT /api/bookings/:id/status
  router.put('/:id/status', async (req, res) => {
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
  router.post('/:id/check-in', async (req, res) => {
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
  router.post('/:id/check-out', async (req, res) => {
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