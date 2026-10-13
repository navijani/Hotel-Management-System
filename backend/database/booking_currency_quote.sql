-- Prices shown on the website are USD; PayHere and billing use LKR.
-- Existing bookings retain their previous calculation through the view fallback.
ALTER TABLE Booking ADD COLUMN usd_nightly_rate DECIMAL(10,2) NULL;
ALTER TABLE Booking ADD COLUMN usd_lkr_rate DECIMAL(12,6) NULL;
ALTER TABLE Booking ADD COLUMN room_charge_lkr DECIMAL(12,2) NULL;
-- Preserve legacy payment values and accept the methods used by checkout.
ALTER TABLE Payment MODIFY COLUMN payment_method ENUM('Cash','Credit Card','Debit Card','Bank Transfer','Card','Online') NOT NULL;

CREATE OR REPLACE VIEW v_guest_billing_detail AS
SELECT
  b.booking_id,
  b.booking_status,
  CONCAT(COALESCE(g.first_name, ''), ' ', COALESCE(g.last_name, '')) AS guest_name,
  COALESCE(g.identity_number, '') AS id_number,
  COALESCE(r.room_number, 'TBD') AS room_number,
  COALESCE(rt.type_name, r.type, 'Standard') AS room_type_name,
  COALESCE(br.branch_name, r.branch, 'Colombo') AS branch_name,
  b.check_in_date,
  b.check_out_date,
  COALESCE(b.room_charge_lkr / GREATEST(1, DATEDIFF(b.check_out_date, b.check_in_date)), rt.daily_rate, r.price_per_night, 0) AS daily_rate,
  COALESCE(b.room_charge_lkr, GREATEST(1, DATEDIFF(b.check_out_date, b.check_in_date)) * COALESCE(rt.daily_rate, r.price_per_night, 0)) AS room_charges,
  COALESCE((SELECT SUM(su.quantity * su.unit_price_at_usage) FROM ServiceUsage su WHERE su.booking_id = b.booking_id), 0) AS service_charges,
  (
    COALESCE(b.room_charge_lkr, GREATEST(1, DATEDIFF(b.check_out_date, b.check_in_date)) * COALESCE(rt.daily_rate, r.price_per_night, 0)) +
    COALESCE((SELECT SUM(su.quantity * su.unit_price_at_usage) FROM ServiceUsage su WHERE su.booking_id = b.booking_id), 0)
  ) AS total_bill,
  COALESCE((SELECT SUM(p.amount_paid) FROM Payment p WHERE p.booking_id = b.booking_id), 0) AS total_paid,
  GREATEST(0, (
    COALESCE(b.room_charge_lkr, GREATEST(1, DATEDIFF(b.check_out_date, b.check_in_date)) * COALESCE(rt.daily_rate, r.price_per_night, 0)) +
    COALESCE((SELECT SUM(su.quantity * su.unit_price_at_usage) FROM ServiceUsage su WHERE su.booking_id = b.booking_id), 0)
  ) - COALESCE((SELECT SUM(p.amount_paid) FROM Payment p WHERE p.booking_id = b.booking_id), 0)) AS balance,
  CASE
    WHEN COALESCE((SELECT SUM(p.amount_paid) FROM Payment p WHERE p.booking_id = b.booking_id), 0) >= (
      COALESCE(b.room_charge_lkr, GREATEST(1, DATEDIFF(b.check_out_date, b.check_in_date)) * COALESCE(rt.daily_rate, r.price_per_night, 0)) +
      COALESCE((SELECT SUM(su.quantity * su.unit_price_at_usage) FROM ServiceUsage su WHERE su.booking_id = b.booking_id), 0)
    ) THEN 'CLEARED'
    ELSE 'PENDING'
  END AS due_flag
FROM Booking b
LEFT JOIN guest g ON g.guest_id = b.guest_id
LEFT JOIN Room r ON r.room_id = b.room_id
LEFT JOIN RoomType rt ON rt.room_type_id = r.room_type_id
LEFT JOIN Branch br ON br.branch_id = r.branch_id;
