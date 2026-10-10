-- 1. Compatibility View: Maps Service table to service_catalogue
CREATE OR REPLACE VIEW service_catalogue AS
SELECT 
  service_id,
  service_name,
  category,
  current_unit_price AS unit_price,
  1 AS branch_id
FROM Service;

-- 2. Core Billing View: Consolidates booking, room, services, payments & balances
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
  COALESCE(rt.daily_rate, r.price_per_night, 0) AS daily_rate,
  GREATEST(1, DATEDIFF(b.check_out_date, b.check_in_date)) * COALESCE(rt.daily_rate, r.price_per_night, 0) AS room_charges,
  COALESCE((
    SELECT SUM(su.quantity * su.unit_price_at_usage)
    FROM ServiceUsage su WHERE su.booking_id = b.booking_id
  ), 0) AS service_charges,
  (
    (GREATEST(1, DATEDIFF(b.check_out_date, b.check_in_date)) * COALESCE(rt.daily_rate, r.price_per_night, 0)) +
    COALESCE((SELECT SUM(su.quantity * su.unit_price_at_usage) FROM ServiceUsage su WHERE su.booking_id = b.booking_id), 0)
  ) AS total_bill,
  COALESCE((
    SELECT SUM(p.amount_paid) FROM Payment p WHERE p.booking_id = b.booking_id
  ), 0) AS total_paid,
  GREATEST(0, (
    (GREATEST(1, DATEDIFF(b.check_out_date, b.check_in_date)) * COALESCE(rt.daily_rate, r.price_per_night, 0)) +
    COALESCE((SELECT SUM(su.quantity * su.unit_price_at_usage) FROM ServiceUsage su WHERE su.booking_id = b.booking_id), 0)
  ) - COALESCE((SELECT SUM(p.amount_paid) FROM Payment p WHERE p.booking_id = b.booking_id), 0)) AS balance,
  CASE
    WHEN COALESCE((SELECT SUM(p.amount_paid) FROM Payment p WHERE p.booking_id = b.booking_id), 0) >= (
      (GREATEST(1, DATEDIFF(b.check_out_date, b.check_in_date)) * COALESCE(rt.daily_rate, r.price_per_night, 0)) +
      COALESCE((SELECT SUM(su.quantity * su.unit_price_at_usage) FROM ServiceUsage su WHERE su.booking_id = b.booking_id), 0)
    ) THEN 'CLEARED'
    ELSE 'PENDING'
  END AS due_flag
FROM Booking b
LEFT JOIN guest g ON g.guest_id = b.guest_id
LEFT JOIN Room r ON r.room_id = b.room_id
LEFT JOIN RoomType rt ON rt.room_type_id = r.room_type_id
LEFT JOIN Branch br ON br.branch_id = r.branch_id;

-- 3. Stored Procedure: sp_create_booking
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_create_booking(
  IN p_guest_id INT,
  IN p_room_id INT,
  IN p_check_in DATETIME,
  IN p_check_out DATETIME,
  IN p_method VARCHAR(50),
  OUT p_booking_id INT
)
BEGIN
  INSERT INTO Booking (guest_id, room_id, check_in_date, check_out_date, booking_status, preferred_payment_method)
  VALUES (p_guest_id, p_room_id, p_check_in, p_check_out, 'Booked', p_method);
  
  SET p_booking_id = LAST_INSERT_ID();
END //
DELIMITER ;

-- 4. Stored Procedure: sp_check_in
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_check_in(IN p_booking_id INT)
BEGIN
  UPDATE Booking 
  SET booking_status = 'Checked-In', actual_check_in = NOW() 
  WHERE booking_id = p_booking_id;
  
  UPDATE Room 
  SET status = 'Occupied', current_status = 'Occupied' 
  WHERE room_id = (SELECT room_id FROM Booking WHERE booking_id = p_booking_id);
END //
DELIMITER ;

-- 5. Stored Procedure: sp_check_out (Blocks checkout if balance > 0)
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_check_out(IN p_booking_id INT)
BEGIN
  DECLARE v_balance DECIMAL(10,2);
  
  SELECT balance INTO v_balance 
  FROM v_guest_billing_detail 
  WHERE booking_id = p_booking_id;

  IF v_balance > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot check out guest with outstanding balance.';
  END IF;

  UPDATE Booking 
  SET booking_status = 'Checked-Out', actual_check_out = NOW() 
  WHERE booking_id = p_booking_id;

  UPDATE Room 
  SET status = 'Available', current_status = 'Available' 
  WHERE room_id = (SELECT room_id FROM Booking WHERE booking_id = p_booking_id);
END //
DELIMITER ;

-- 6. Stored Procedure: sp_add_service
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_add_service(
  IN p_booking_id INT,
  IN p_service_id INT,
  IN p_quantity INT,
  IN p_usage_date DATETIME
)
BEGIN
  DECLARE v_price DECIMAL(10,2);
  
  SELECT current_unit_price INTO v_price 
  FROM Service 
  WHERE service_id = p_service_id;

  INSERT INTO ServiceUsage (booking_id, service_id, usage_date, quantity, unit_price_at_usage, total_price)
  VALUES (p_booking_id, p_service_id, p_usage_date, p_quantity, v_price, (v_price * p_quantity));
END //
DELIMITER ;

-- 7. Stored Procedure: sp_add_payment
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_add_payment(
  IN p_booking_id INT,
  IN p_amount DECIMAL(10,2),
  IN p_method VARCHAR(50)
)
BEGIN
  INSERT INTO Payment (booking_id, payment_date, amount_paid, payment_method)
  VALUES (p_booking_id, NOW(), p_amount, p_method);
END //
DELIMITER ;