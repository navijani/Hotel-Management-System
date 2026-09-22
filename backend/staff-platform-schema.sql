USE hotelmanegmentsystem;

-- Run this once before using staff account settings and attendance.
ALTER TABLE Staff ADD COLUMN mobile_number VARCHAR(30) NULL;

CREATE TABLE IF NOT EXISTS staff_attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT NOT NULL,
  attendance_date DATE NOT NULL,
  check_in_time TIME NOT NULL,
  check_out_time TIME NULL,
  check_in_location VARCHAR(255) NOT NULL,
  check_out_location VARCHAR(255) NULL,
  is_busy BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (staff_id) REFERENCES Staff(id) ON DELETE CASCADE,
  UNIQUE (staff_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS staff_salary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT NOT NULL,
  role VARCHAR(100) NOT NULL,
  rate DECIMAL(10, 2) DEFAULT 7.00,
  salary_amount DECIMAL(10, 2) DEFAULT 7.00,
  FOREIGN KEY (staff_id) REFERENCES Staff(id) ON DELETE CASCADE,
  UNIQUE (staff_id)
);
