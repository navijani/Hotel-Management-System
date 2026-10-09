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
  router.post('/payhere-hash', (req, res) => {
    try {
      const { order_id, amount, currency } = req.body;
      const merchant_id = String(process.env.PAYHERE_MERCHANT_ID || '').trim();
      const merchant_key = String(process.env.PAYHERE_MERCHANT_KEY || '').trim();
      const isSandbox = process.env.PAYHERE_SANDBOX ? process.env.PAYHERE_SANDBOX !== 'false' : true;

      if (!merchant_id || !merchant_key) {
        return res.status(500).json({ error: 'PayHere credentials missing in environment variables (PAYHERE_MERCHANT_ID / PAYHERE_MERCHANT_KEY).' });
      }

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
      const paymentMethod = String(req.body.paymentMethod || req.body.payment_method || 'Online').trim();

      if ([firstName, lastName, email, phone, identificationNo, checkInDate, checkOutDate].some((value) => !value)) {
        return res.status(400).json({ error: 'All booking fields are required.' });
      }

      await connection.beginTransaction();

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
           FROM room r
           INNER JOIN room_type rt ON rt.room_type_id = r.room_type_id
           WHERE rt.type_name = ?
             AND r.status = 'Available'
             AND NOT EXISTS (
               SELECT 1 FROM booking b
               WHERE b.room_id = r.room_id
                 AND b.status IN ('Booked', 'Checked-In')
                 AND (b.check_in_date < ? AND b.check_out_date > ?)
             )
           ORDER BY r.room_id
           LIMIT 1`,
          [roomType, checkOutDate, checkInDate]
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
         FROM booking
         WHERE room_id = ?
           AND status IN ('Booked', 'Checked-In')
           AND (check_in_date < ? AND check_out_date > ?)
         LIMIT 1`,
        [assignedRoomId, checkOutDate, checkInDate]
      );

      if (overlapRows.length > 0) {
        throw new Error('This room is already booked for the selected dates.');
      }

      const [bookingResult] = await connection.query('CALL sp_create_booking(?, ?, ?, ?, ?, @p_booking_id)', [
        guestId,
        assignedRoomId,
        checkInDate,
        checkOutDate,
        paymentMethod,
      ]);

      const [[bookingIdRow]] = await connection.query('SELECT @p_booking_id AS booking_id');
      await connection.commit();

      res.status(201).json({
        message: 'Booking successful',
        bookingId: bookingIdRow.booking_id,
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

  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM v_guest_billing_detail ORDER BY booking_id DESC`
      );

      res.json(rows.map(formatBillingRow));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

  router.put('/:id/status', async (req, res) => {
    try {
      const bookingId = Number(req.params.id);
      const status = String(req.body.status || '').trim();

      if (!['Booked', 'Checked-In', 'Checked-Out', 'Cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid booking status.' });
      }

      if (status === 'Checked-In') {
        await pool.query('CALL sp_check_in(?)', [bookingId]);
      } else if (status === 'Checked-Out') {
        await pool.query('CALL sp_check_out(?)', [bookingId]);
      } else {
        await pool.query('UPDATE booking SET status = ? WHERE booking_id = ?', [status, bookingId]);
      }

      res.json({ message: 'Booking status updated successfully' });
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(400).json({ error: error.message || 'Failed to update status' });
    }
  });

  router.post('/:id/check-in', async (req, res) => {
    try {
      await pool.query('CALL sp_check_in(?)', [Number(req.params.id)]);
      res.json({ message: 'Guest checked in successfully.' });
    } catch (error) {
      console.error('Check-in error:', error);
      res.status(400).json({ error: error.message || 'Failed to check in guest.' });
    }
  });

  router.post('/:id/check-out', async (req, res) => {
    try {
      const [rows] = await pool.query('CALL sp_check_out(?)', [Number(req.params.id)]);
      const finalRecord = Array.isArray(rows) && rows[0] ? rows[0].map(formatBillingRow)[0] : null;
      res.json({ message: 'Guest checked out successfully.', billing: finalRecord });
    } catch (error) {
      console.error('Check-out error:', error);
      res.status(400).json({ error: error.message || 'Failed to check out guest.' });
    }
  });

  router.get('/room/:id/dates', async (req, res) => {
    try {
      const roomId = Number(req.params.id);
      const [bookings] = await pool.query(
        `SELECT check_in_date, check_out_date
         FROM booking
         WHERE room_id = ? AND status IN ('Booked', 'Checked-In')
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
