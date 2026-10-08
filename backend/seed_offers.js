import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: './.env' });

async function seedOffers() {
  try {
    const pool = mysql.createPool({
      host: (process.env.DB_HOST || 'localhost').trim(),
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 4000,
      user: (process.env.DB_USER || 'root').trim(),
      password: process.env.DB_PASSWORD || '',
      database: (process.env.DB_NAME || 'hotelmanegmentsystem').trim(),
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
        ca: fs.existsSync('ca.pem') ? fs.readFileSync('ca.pem') : undefined
      }
    });

    const [existing] = await pool.query('SELECT COUNT(*) AS count FROM exclusive_offers');
    if (existing[0].count > 0) {
      console.log('exclusive_offers table already has data. Skipping seed.');
      await pool.end();
      return;
    }

    console.log('Seeding initial exclusive offers...');

    // Load romantic.jpg and business.jpg from frontend public images directory if available
    const romanticPath = path.resolve('../frontend/public/images/romantic.jpg');
    const businessPath = path.resolve('../frontend/public/images/business.jpg');

    let romanticBlob = fs.existsSync(romanticPath) ? fs.readFileSync(romanticPath) : null;
    let businessBlob = fs.existsSync(businessPath) ? fs.readFileSync(businessPath) : null;

    const initialOffers = [
      {
        popup: '15% Off',
        topic: 'Romantic Getaway',
        details: 'Enjoy a romantic weekend with complimentary champagne and late checkout.',
        more_details: 'Package includes luxury suite stay, complimentary bottle of premium champagne upon arrival, candlelit dinner voucher, 20% discount on spa services, and late checkout until 3 PM.',
        image: romanticBlob,
        active: 1
      },
      {
        popup: 'Free Upgrades',
        topic: 'Business Retreat',
        details: 'Seamlessly blend work and relaxation with premium Wi-Fi and lounge access.',
        more_details: 'Includes Executive Room upgrade, complimentary high-speed 5G Wi-Fi, executive lounge access with complimentary snacks & beverages, meeting room booking for 2 hours, and express laundry service.',
        image: businessBlob,
        active: 1
      }
    ];

    for (const offer of initialOffers) {
      await pool.query(
        'INSERT INTO exclusive_offers (popup, topic, details, more_details, image, active) VALUES (?, ?, ?, ?, ?, ?)',
        [offer.popup, offer.topic, offer.details, offer.more_details, offer.image, offer.active]
      );
    }

    console.log('Seeded initial offers successfully.');
    await pool.end();
  } catch (error) {
    console.error('Error seeding offers:', error);
  }
}

seedOffers();
