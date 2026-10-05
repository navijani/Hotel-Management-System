import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: './.env' });

async function alterTable() {
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

    await pool.query('ALTER TABLE exclusive_offers MODIFY details VARCHAR(255), MODIFY more_details TEXT');
    console.log('ALTER TABLE SUCCESSFUL');
    await pool.end();
  } catch (err) {
    console.error('ALTER TABLE ERROR:', err);
  }
}

alterTable();
