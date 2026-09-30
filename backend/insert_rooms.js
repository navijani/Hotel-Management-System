import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST.trim(),
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER.trim(),
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME.trim(),
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
    ca: fs.existsSync('ca.pem') ? fs.readFileSync('ca.pem') : undefined
  }
});

const mockRooms = [
  {
    RoomNumber: '104',
    RoomTypeID: 'Executive Suite',
    Status: 'Available',
    Price: 550,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop',
    Description: 'Luxurious suite featuring panoramic city views and private dining area.',
    BedType: 'King Bed',
    RoomSize: '750 sqft',
    Amenities: 'Free WiFi, Mini Bar, Lounge Access'
  },
  {
    RoomNumber: '105',
    RoomTypeID: 'Family Room',
    Status: 'Available',
    Price: 200,
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000&auto=format&fit=crop',
    Description: 'Spacious accommodation perfect for family getaways with interconnected rooms.',
    BedType: '2 Queen Beds',
    RoomSize: '500 sqft',
    Amenities: 'Free WiFi, TV, Kitchenette'
  },
  {
    RoomNumber: '106',
    RoomTypeID: 'Presidential Suite',
    Status: 'Occupied',
    Price: 1200,
    image: 'https://images.unsplash.com/photo-1631049552057-403fb4f2553f?q=80&w=1000&auto=format&fit=crop',
    Description: 'The ultimate luxury experience with a private terrace and personal butler service.',
    BedType: 'King Bed',
    RoomSize: '1200 sqft',
    Amenities: 'Free WiFi, Private Pool, Butler'
  },
  {
    RoomNumber: '107',
    RoomTypeID: 'Standard City View',
    Status: 'Available',
    Price: 130,
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1000&auto=format&fit=crop',
    Description: 'Comfortable room overlooking the vibrant city skyline.',
    BedType: 'Queen Bed',
    RoomSize: '300 sqft',
    Amenities: 'Free WiFi'
  },
  {
    RoomNumber: '108',
    RoomTypeID: 'Deluxe Twin',
    Status: 'Available',
    Price: 180,
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1000&auto=format&fit=crop',
    Description: 'Elegant twin room ideal for friends or colleagues traveling together.',
    BedType: '2 Twin Beds',
    RoomSize: '400 sqft',
    Amenities: 'Free WiFi, Balcony'
  },
  {
    RoomNumber: '109',
    RoomTypeID: 'Penthouse Suite',
    Status: 'Available',
    Price: 850,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000&auto=format&fit=crop',
    Description: 'Top-floor suite offering spectacular 360-degree views and luxury furnishings.',
    BedType: 'King Bed',
    RoomSize: '900 sqft',
    Amenities: 'Free WiFi, Jacuzzi, Lounge Access'
  },
  {
    RoomNumber: '110',
    RoomTypeID: 'Cozy Single',
    Status: 'Occupied',
    Price: 90,
    image: 'https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=1000&auto=format&fit=crop',
    Description: 'A snug and comfortable space tailored for solo travelers.',
    BedType: 'Single Bed',
    RoomSize: '200 sqft',
    Amenities: 'Free WiFi'
  },
  {
    RoomNumber: '201',
    RoomTypeID: 'Oceanfront Villa',
    Status: 'Available',
    Price: 650,
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1000&auto=format&fit=crop',
    Description: 'Private villa steps away from the beach with your own plunge pool.',
    BedType: 'King Bed',
    RoomSize: '800 sqft',
    Amenities: 'Free WiFi, Plunge Pool, Beach Access'
  },
  {
    RoomNumber: '202',
    RoomTypeID: 'Honeymoon Suite',
    Status: 'Available',
    Price: 500,
    image: 'https://images.unsplash.com/photo-1618221381711-42ca8ab6e90f?q=80&w=1000&auto=format&fit=crop',
    Description: 'Romantic suite designed for couples, featuring a spa bath and ocean views.',
    BedType: 'King Bed',
    RoomSize: '550 sqft',
    Amenities: 'Free WiFi, Spa Bath, Balcony'
  },
  {
    RoomNumber: '203',
    RoomTypeID: 'Business Studio',
    Status: 'Occupied',
    Price: 220,
    image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1000&auto=format&fit=crop',
    Description: 'Modern studio equipped with a spacious work desk and high-speed internet.',
    BedType: 'Queen Bed',
    RoomSize: '450 sqft',
    Amenities: 'High-speed WiFi, Work Desk'
  }
];

async function insertRooms() {
  for (const r of mockRooms) {
    try {
      await pool.query(
        'INSERT INTO Room (room_number, type, capacity, price_per_night, status, image, description, bed_type, room_size, amenities, branch_id, room_type_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)',
        [r.RoomNumber, r.RoomTypeID, 4, r.Price, r.Status, r.image, r.Description, r.BedType, r.RoomSize, r.Amenities]
      );
      console.log('Inserted room ' + r.RoomNumber);
    } catch (err) {
      console.error('Error inserting room ' + r.RoomNumber + ':', err.message);
    }
  }
  process.exit(0);
}

insertRooms();
