import express from 'express';
import { requireStaffAuth, requireStaffRoles } from './auth.js';

const num = (value) => Number(value || 0);
const isoDate = (date) => date.toISOString().slice(0, 10);
const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) && !Number.isNaN(Date.parse(value));

export default function createReportsRouter(pool) {
  const router = express.Router();
  router.use(requireStaffAuth, requireStaffRoles('Admin'));

  router.get('/summary', async (req, res) => {
    try {
      const today = new Date();
      const monthAgo = new Date(today.getTime() - 29 * 86400000);
      const from = validDate(req.query.from) ? String(req.query.from) : isoDate(monthAgo);
      const to = validDate(req.query.to) ? String(req.query.to) : isoDate(today);
      const branchId = req.query.branch_id === undefined ? null : Number(req.query.branch_id);

      if (from > to) return res.status(400).json({ error: 'The start date must be on or before the end date.' });
      if (branchId !== null && (!Number.isInteger(branchId) || branchId < 1)) {
        return res.status(400).json({ error: 'A valid branch_id is required.' });
      }

      const [[totals]] = await pool.query(
        `SELECT COUNT(*) AS bookings,
                COALESCE(SUM(room_charges), 0) AS room_revenue,
                COALESCE(SUM(service_charges), 0) AS service_revenue,
                COALESCE(SUM(total_bill), 0) AS billed,
                COALESCE(SUM(CASE WHEN balance > 0 THEN balance ELSE 0 END), 0) AS outstanding,
                COALESCE(AVG(DATEDIFF(detail.check_out_date, detail.check_in_date)), 0) AS avg_nights
         FROM v_guest_billing_detail detail
         INNER JOIN Booking booking ON booking.booking_id = detail.booking_id
         INNER JOIN Room room ON room.room_id = booking.room_id
         WHERE detail.booking_status <> 'Cancelled' AND detail.check_in_date BETWEEN ? AND ?
           AND (? IS NULL OR room.branch_id = ?)`,
        [from, to, branchId, branchId]
      );
      const [[collected]] = await pool.query(
        `SELECT COALESCE(SUM(payment.amount_paid), 0) AS collected
         FROM Payment payment
         INNER JOIN Booking booking ON booking.booking_id = payment.booking_id
         INNER JOIN Room room ON room.room_id = booking.room_id
         WHERE payment.payment_date >= ? AND payment.payment_date < DATE_ADD(?, INTERVAL 1 DAY)
           AND (? IS NULL OR room.branch_id = ?)`,
        [from, to, branchId, branchId]
      );
      const [byBranch] = await pool.query(
        `SELECT detail.branch_name AS branch, COUNT(*) AS bookings,
                COALESCE(SUM(detail.room_charges), 0) AS room_charges,
                COALESCE(SUM(detail.service_charges), 0) AS service_charges,
                COALESCE(SUM(detail.total_paid), 0) AS collected,
                COALESCE(SUM(CASE WHEN detail.balance > 0 THEN detail.balance ELSE 0 END), 0) AS outstanding
         FROM v_guest_billing_detail detail
         INNER JOIN Booking booking ON booking.booking_id = detail.booking_id
         INNER JOIN Room room ON room.room_id = booking.room_id
         WHERE detail.booking_status <> 'Cancelled' AND detail.check_in_date BETWEEN ? AND ?
           AND (? IS NULL OR room.branch_id = ?)
         GROUP BY detail.branch_name ORDER BY collected DESC`,
        [from, to, branchId, branchId]
      );
      const [daily] = await pool.query(
        `SELECT DATE_FORMAT(payment.payment_date, '%Y-%m-%d') AS day, SUM(payment.amount_paid) AS total
         FROM Payment payment
         INNER JOIN Booking booking ON booking.booking_id = payment.booking_id
         INNER JOIN Room room ON room.room_id = booking.room_id
         WHERE payment.payment_date >= ? AND payment.payment_date < DATE_ADD(?, INTERVAL 1 DAY)
           AND (? IS NULL OR room.branch_id = ?)
         GROUP BY day ORDER BY day`,
        [from, to, branchId, branchId]
      );
      const [methods] = await pool.query(
        `SELECT payment.payment_method AS method, COUNT(*) AS payments, SUM(payment.amount_paid) AS total
         FROM Payment payment
         INNER JOIN Booking booking ON booking.booking_id = payment.booking_id
         INNER JOIN Room room ON room.room_id = booking.room_id
         WHERE payment.payment_date >= ? AND payment.payment_date < DATE_ADD(?, INTERVAL 1 DAY)
           AND (? IS NULL OR room.branch_id = ?)
         GROUP BY method ORDER BY total DESC`,
        [from, to, branchId, branchId]
      );
      const [statuses] = await pool.query(
        `SELECT detail.booking_status AS status, COUNT(*) AS count
         FROM v_guest_billing_detail detail
         INNER JOIN Booking booking ON booking.booking_id = detail.booking_id
         INNER JOIN Room room ON room.room_id = booking.room_id
         WHERE detail.check_in_date BETWEEN ? AND ? AND (? IS NULL OR room.branch_id = ?)
         GROUP BY detail.booking_status`,
        [from, to, branchId, branchId]
      );
      const [services] = await pool.query(
        `SELECT sc.service_name, sc.category, SUM(su.quantity) AS quantity, SUM(su.quantity * su.unit_price_at_usage) AS revenue
         FROM ServiceUsage su INNER JOIN Service sc ON sc.service_id = su.service_id
         INNER JOIN Booking booking ON booking.booking_id = su.booking_id
         INNER JOIN Room room ON room.room_id = booking.room_id
         WHERE su.usage_date BETWEEN ? AND ? AND (? IS NULL OR room.branch_id = ?)
         GROUP BY sc.service_id, sc.service_name, sc.category ORDER BY revenue DESC LIMIT 8`,
        [from, to, branchId, branchId]
      );
      const [rooms] = await pool.query(
        `SELECT current_status AS status, COUNT(*) AS count FROM Room
         WHERE (? IS NULL OR branch_id = ?) GROUP BY current_status`,
        [branchId, branchId]
      );
      const [dues] = await pool.query(
        `SELECT detail.booking_id, detail.guest_name, detail.room_number,
                detail.branch_name AS branch, detail.total_bill, detail.total_paid, detail.balance
         FROM v_guest_billing_detail detail
         INNER JOIN Booking booking ON booking.booking_id = detail.booking_id
         INNER JOIN Room room ON room.room_id = booking.room_id
         WHERE detail.booking_status <> 'Cancelled' AND detail.balance > 0
           AND (? IS NULL OR room.branch_id = ?)
         ORDER BY detail.balance DESC LIMIT 10`,
        [branchId, branchId]
      );

      const totalRooms = rooms.reduce((sum, row) => sum + num(row.count), 0);
      const occupied = rooms.filter((row) => row.status === 'Occupied').reduce((sum, row) => sum + num(row.count), 0);

      res.json({
        range: { from, to },
        kpis: {
          collected: num(collected.collected),
          billed: num(totals.billed),
          room_revenue: num(totals.room_revenue),
          service_revenue: num(totals.service_revenue),
          outstanding: num(totals.outstanding),
          bookings: num(totals.bookings),
          avg_nights: Number(num(totals.avg_nights).toFixed(1)),
          occupancy_percent: totalRooms ? Math.round((occupied / totalRooms) * 100) : 0,
          total_rooms: totalRooms,
        },
        by_branch: byBranch.map((row) => ({
          branch: row.branch || 'Unassigned',
          bookings: num(row.bookings),
          room_charges: num(row.room_charges),
          service_charges: num(row.service_charges),
          collected: num(row.collected),
          outstanding: num(row.outstanding),
        })),
        daily_collections: daily.map((row) => ({ day: row.day, total: num(row.total) })),
        payment_methods: methods.map((row) => ({ method: row.method, payments: num(row.payments), total: num(row.total) })),
        booking_statuses: statuses.map((row) => ({ status: row.status, count: num(row.count) })),
        top_services: services.map((row) => ({ service_name: row.service_name, category: row.category, quantity: num(row.quantity), revenue: num(row.revenue) })),
        room_status: rooms.map((row) => ({ status: row.status, count: num(row.count) })),
        outstanding_bookings: dues.map((row) => ({
          booking_id: row.booking_id,
          guest_name: row.guest_name,
          room_number: row.room_number,
          branch: row.branch,
          net_total: num(row.total_bill),
          total_paid: num(row.total_paid),
          outstanding_balance: num(row.balance),
        })),
      });
    } catch (error) {
      console.error('Reports summary error:', error);
      res.status(500).json({ error: 'Failed to build report.' });
    }
  });

  return router;
}