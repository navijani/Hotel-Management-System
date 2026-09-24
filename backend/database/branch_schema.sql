USE hotelmanegmentsystem;
-- Create the Branch table with strictly defined data types
CREATE TABLE Branch (
    branch_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    contact_number VARCHAR(50) NOT NULL
);

-- There is no foreign keys in this table
-- This acts as parent table
