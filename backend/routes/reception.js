import express from 'express';
import { requireStaffAuth, requireStaffRoles } from './auth.js';

const PAYMENT_METHODS = ['Cash', 'Card', 'Online'];
const num = (value) => Number(value || 0);

const mapBooking = (row) => ({
  booking_id: row.booking_id,
  booking_status: row.booking_status,
  guest_name: row.guest_name,
  identification_no: row.id_number,
  room_number: row.room_number,
  room_type: row.room_type_name,
  branch: row.branch_name,
  check_in_date: row.check_in_date,
  check_out_date: row.check_out_date,
  nights: Math.max(1, Math.ceil((new Date(row.check_out_date).getTime() - new Date(row.check_in_date).getTime()) / 86400000)),
  room_daily_rate: num(row.daily_rate),
  room_total: num(row.room_charges),
  service_total: num(row.service_charges),
  tax_amount: Number((num(row.total_bill) - num(row.room_charges) - num(row.service_charges)).toFixed(2)),
  net_total: num(row.total_bill),
  total_paid: num(row.total_paid),
  outstanding_balance: num(row.balance),
});

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export default function createReceptionRouter(pool) {
  const router = express.Router();
  router.use(requireStaffAuth, requireStaffRoles('Admin', 'Receptionist'));

  const loadBooking = async (bookingId) => {
    const [rows] = await pool.query('SELECT * FROM v_guest_billing_detail WHERE booking_id = ? LIMIT 1', [bookingId]);
    return rows[0] ? mapBooking(rows[0]) : null;
  };

  // GET /api/reception/overview
  router.get('/overview', async (req, res) => {
    try {
      const [arrivals] = await pool.query(
        `SELECT * FROM v_guest_billing_detail
         WHERE booking_status = 'Booked' AND check_in_date <= CURDATE()
         ORDER BY check_in_date, booking_id LIMIT 25`
      );
      const [departures] = await pool.query(
        `SELECT * FROM v_guest_billing_detail
         WHERE booking_status = 'Checked-In' AND check_out_date <= CURDATE()
         ORDER BY check_out_date, booking_id LIMIT 25`
      );
      const [[counts]] = await pool.query(
        `SELECT
           COALESCE(SUM(booking_status = 'Booked' AND check_in_date <= CURDATE()), 0) AS arrivals_due,
           COALESCE(SUM(booking_status = 'Checked-In'), 0) AS in_house,
           COALESCE(SUM(booking_status = 'Checked-In' AND check_out_date <= CURDATE()), 0) AS departures_due,
           COALESCE(SUM(CASE WHEN booking_status <> 'Cancelled' AND balance > 0 THEN balance ELSE 0 END), 0) AS outstanding
         FROM v_guest_billing_detail`
      );
      const [roomStatus] = await pool.query('SELECT status, COUNT(*) AS count FROM Room GROUP BY status');

      res.json({
        counts: {
          arrivals_due: num(counts.arrivals_due),
          in_house: num(counts.in_house),
          departures_due: num(counts.departures_due),
          outstanding: num(counts.outstanding),
        },
        arrivals: arrivals.map(mapBooking),
        departures: departures.map(mapBooking),
        room_status: roomStatus.map((row) => ({ status: row.status, count: num(row.count) })),
      });
    } catch (error) {
      console.error('Overview error:', error);
      res.status(500).json({ error: 'Failed to load front desk overview.' });
    }
  });

  // GET /api/reception/bookings
  router.get('/bookings', async (req, res) => {
    try {
      const status = String(req.query.status || '').trim();
      const search = String(req.query.q || '').trim();
      const where = [];
      const params = [];

      if (status) {
        where.push('booking_status = ?');
        params.push(status);
      }
      if (search) {
        const like = `%${search}%`;
        where.push('(guest_name LIKE ? OR id_number LIKE ? OR room_number LIKE ? OR CAST(booking_id AS CHAR) = ?)');
        params.push(like, like, like, search.replace(/^#/, ''));
      }

      const [rows] = await pool.query(
        `SELECT * FROM v_guest_billing_detail ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY booking_id DESC LIMIT 200`,
        params
      );
      res.json(rows.map(mapBooking));
    } catch (error) {
      console.error('Bookings error:', error);
      res.status(500).json({ error: 'Failed to load bookings.' });
    }
  });

  // GET /api/reception/bookings/:id
  router.get('/bookings/:id', async (req, res) => {
    try {
      const bookingId = parseId(req.params.id);
      if (!bookingId) return res.status(400).json({ error: 'A valid booking id is required.' });

      const booking = await loadBooking(bookingId);
      if (!booking) return res.status(404).json({ error: 'Booking not found.' });

      const [services] = await pool.query(
        `SELECT su.usage_id, su.service_id, sc.service_name, sc.category, su.usage_date, su.quantity,
                su.unit_price_at_usage AS unit_price, su.total_price
         FROM ServiceUsage su
         INNER JOIN Service sc ON sc.service_id = su.service_id
         WHERE su.booking_id = ?
         ORDER BY su.usage_date DESC, su.usage_id DESC`,
        [bookingId]
      );
      const [payments] = await pool.query(
        `SELECT payment_id, booking_id, payment_date, amount_paid, payment_method
         FROM Payment WHERE booking_id = ? ORDER BY payment_date DESC, payment_id DESC`,
        [bookingId]
      );

      res.json({
        booking,
        services: services.map((row) => ({ ...row, unit_price: num(row.unit_price), total_price: num(row.total_price) })),
        payments: payments.map((row) => ({ ...row, amount_paid: num(row.amount_paid) })),
      });
    } catch (error) {
      console.error('Booking detail error:', error);
      res.status(500).json({ error: 'Failed to load booking.' });
    }
  });

  // GET /api/reception/services
  router.get('/services', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM Service ORDER BY category, service_name');
      res.json(
        rows.map((row) => ({
          service_id: row.service_id,
          service_name: row.service_name,
          category: row.category,
          unit_price: num(row.current_unit_price ?? row.unit_price ?? row.price ?? 0),
        }))
      );
    } catch (error) {
      console.error('Services error:', error);
      res.status(500).json({ error: 'Failed to load services.' });
    }
  });

  // POST /api/reception/bookings/:id/check-in
  router.post('/bookings/:id/check-in', async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const bookingId = parseId(req.params.id);
      if (!bookingId) return res.status(400).json({ error: 'Valid booking id required.' });

      await connection.beginTransaction();
      await connection.query(`UPDATE Booking SET booking_status = 'Checked-In', actual_check_in = NOW() WHERE booking_id = ?`, [bookingId]);
      await connection.query(`UPDATE Room SET status = 'Occupied', current_status = 'Occupied' WHERE room_id = (SELECT room_id FROM Booking WHERE booking_id = ?)`, [bookingId]);
      await connection.commit();

      res.json({ message: `Booking #${bookingId} checked in.`, booking: await loadBooking(bookingId) });
    } catch (error) {
      await connection.rollback();
      console.error('Check-in error:', error);
      res.status(400).json({ error: 'Failed to check in guest.' });
    } finally {
      connection.release();
    }
  });

  // POST /api/reception/bookings/:id/services (Omit generated column total_price)
  router.post('/bookings/:id/services', async (req, res) => {
    try {
      const bookingId = parseId(req.params.id);
      const serviceId = parseId(req.body.service_id);
      const quantity = Number(req.body.quantity || 1);
      const usageDate = /^\d{4}-\d{2}-\d{2}$/.test(String(req.body.usage_date || ''))
        ? String(req.body.usage_date)
        : new Date().toISOString().slice(0, 10);

      if (!bookingId || !serviceId || !Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ error: 'Valid booking, service, and positive quantity are required.' });
      }

      const booking = await loadBooking(bookingId);
      if (!booking) return res.status(404).json({ error: `Booking #${bookingId} not found.` });

      if (['Checked-Out', 'Cancelled'].includes(booking.booking_status)) {
        return res.status(400).json({ error: `Service charges cannot be added to a ${booking.booking_status} booking.` });
      }

      // Fetch service details
      const [serviceRows] = await pool.query('SELECT * FROM Service WHERE service_id = ? LIMIT 1', [serviceId]);
      if (serviceRows.length === 0) return res.status(404).json({ error: 'Selected service was not found.' });

      const service = serviceRows[0];
      const unitPrice = num(service.current_unit_price ?? service.unit_price ?? service.price ?? 0);

      // total_price is omitted because it is a GENERATED STORED column in MySQL/TiDB
      await pool.query(
        'INSERT INTO ServiceUsage (booking_id, service_id, usage_date, quantity, unit_price_at_usage) VALUES (?, ?, ?, ?, ?)',
        [bookingId, serviceId, usageDate, quantity, unitPrice]
      );

      const updatedBooking = await loadBooking(bookingId);
      res.status(201).json({ message: 'Service charge added successfully.', booking: updatedBooking });
    } catch (error) {
      console.error('Service charge error:', error);
      res.status(500).json({ error: error.message || 'Failed to add service charge.' });
    }
  });

  // POST /api/reception/bookings/:id/payments
  router.post('/bookings/:id/payments', async (req, res) => {
    try {
      const bookingId = parseId(req.params.id);
      const amount = Number(req.body.amount_paid ?? req.body.amount ?? 0);
      const method = String(req.body.payment_method || req.body.method || 'Cash');

      if (!bookingId || !Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Valid booking and payment amount are required.' });
      }
      if (!PAYMENT_METHODS.includes(method)) {
        return res.status(400).json({ error: `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}.` });
      }

      const booking = await loadBooking(bookingId);
      if (!booking) return res.status(404).json({ error: 'Booking not found.' });
      if (booking.booking_status === 'Cancelled') {
        return res.status(400).json({ error: 'Cannot record payments on cancelled bookings.' });
      }
      if (amount - booking.outstanding_balance > 0.005) {
        return res.status(400).json({ error: 'Payment amount exceeds the outstanding balance.' });
      }

      await pool.query(
        'INSERT INTO Payment (booking_id, payment_date, amount_paid, payment_method) VALUES (?, NOW(), ?, ?)',
        [bookingId, amount, method]
      );

      res.status(201).json({ message: 'Payment recorded.', booking: await loadBooking(bookingId) });
    } catch (error) {
      console.error('Payment error:', error);
      res.status(500).json({ error: 'Failed to record payment.' });
    }
  });

  // POST /api/reception/bookings/:id/checkout
  router.post('/bookings/:id/checkout', async (req, res) => {
    const connection = await pool.getConnection();
    try {
      const bookingId = parseId(req.params.id);
      if (!bookingId) return res.status(400).json({ error: 'Valid booking id required.' });

      const before = await loadBooking(bookingId);
      if (!before) return res.status(404).json({ error: 'Booking not found.' });
      if (before.booking_status !== 'Checked-In') {
        return res.status(400).json({ error: 'Only checked-in guests can be checked out.' });
      }
      if (before.outstanding_balance > 0.005) {
        return res.status(400).json({ error: 'The outstanding balance must be paid before checkout.' });
      }

      await connection.beginTransaction();
      await connection.query(`UPDATE Booking SET booking_status = 'Checked-Out', actual_check_out = NOW() WHERE booking_id = ?`, [bookingId]);
      await connection.query(`UPDATE Room SET status = 'Available', current_status = 'Available' WHERE room_id = (SELECT room_id FROM Booking WHERE booking_id = ?)`, [bookingId]);
      await connection.commit();

      res.json({ message: `Booking #${bookingId} checked out.`, booking: await loadBooking(bookingId) });
    } catch (error) {
      await connection.rollback();
      console.error('Checkout error:', error);
      res.status(400).json({ error: error.message || 'Failed to check out guest.' });
    } finally {
      connection.release();
    }
  });

  return router;
}