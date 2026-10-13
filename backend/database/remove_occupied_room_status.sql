-- Room condition is managed separately from a guest's check-in state.
-- Checked-in guests remain recorded in Booking; do not delete bookings.
UPDATE Room SET status = 'Available' WHERE status = 'Occupied' OR status IS NULL;
UPDATE Room SET current_status = 'Available' WHERE current_status = 'Occupied';
UPDATE Room SET current_status = 'Under Maintenance' WHERE status = 'Maintenance';

ALTER TABLE Room MODIFY COLUMN status ENUM('Available','Maintenance') NOT NULL DEFAULT 'Available';
ALTER TABLE Room MODIFY COLUMN current_status ENUM('Available','Under Maintenance') NULL DEFAULT 'Available';
