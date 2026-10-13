CREATE TABLE IF NOT EXISTS Branch (
  branch_id INT AUTO_INCREMENT PRIMARY KEY,
  branch_name VARCHAR(50) NOT NULL,
  city VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  contact_number VARCHAR(50) NOT NULL
);

ALTER TABLE Staff ADD COLUMN branch_id INT NULL;
ALTER TABLE Staff
  ADD CONSTRAINT fk_staff_branch
  FOREIGN KEY (branch_id) REFERENCES Branch(branch_id)
  ON DELETE SET NULL;

INSERT INTO Branch (branch_name, city, address, contact_number)
SELECT locations.branch_name, locations.city, 'To be updated', 'To be updated'
FROM (
  SELECT 'Galle Hotel' AS branch_name, 'Galle' AS city
  UNION ALL SELECT 'Colombo Hotel', 'Colombo'
  UNION ALL SELECT 'Kandy Hotel', 'Kandy'
) AS locations
WHERE NOT EXISTS (
  SELECT 1 FROM Branch existing WHERE LOWER(existing.city) = LOWER(locations.city)
);
