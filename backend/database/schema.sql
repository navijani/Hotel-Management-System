CREATE TABLE `guest` (
  `guest_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `identity_number` varchar(20) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`guest_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Room` (
  `room_id` int NOT NULL AUTO_INCREMENT,
  `branch_id` int NOT NULL,
  `room_type_id` int NOT NULL,
  `room_number` varchar(10) NOT NULL,
  `current_status` enum('Available','Occupied','Under Maintenance') DEFAULT 'Available',
  `description` text DEFAULT NULL,
  `bed_type` varchar(50) DEFAULT NULL,
  `room_size` varchar(20) DEFAULT NULL,
  `amenities` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`room_id`),
  KEY `fk_1` (`branch_id`),
  KEY `fk_2` (`room_type_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`branch_id`) REFERENCES `Branch` (`branch_id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`room_type_id`) REFERENCES `RoomType` (`room_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `Booking` (
  `booking_id` int NOT NULL AUTO_INCREMENT,
  `guest_id` int DEFAULT NULL,
  `room_id` int DEFAULT NULL,
  `check_in_date` datetime DEFAULT NULL,
  `check_out_date` datetime DEFAULT NULL,
  `actual_check_in` datetime DEFAULT NULL,
  `actual_check_out` datetime DEFAULT NULL,
  `booking_status` enum('Booked','Checked-In','Checked-Out','Cancelled') DEFAULT 'Booked',
  `preferred_payment_method` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`booking_id`),
  KEY `fk_1` (`guest_id`),
  KEY `fk_2` (`room_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`guest_id`) REFERENCES `Guest` (`guest_id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`room_id`) REFERENCES `Room` (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
