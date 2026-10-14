import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ensureAdminAccount } from '../adminAccount.js';
import { removeLegacySettings } from './removeLegacySettings.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });
const caPath = fileURLToPath(new URL('../ca.pem', import.meta.url));
const pool = mysql.createPool({
  host: (process.env.DB_HOST || 'localhost').trim(),
  port: Number(process.env.DB_PORT || 4000),
  user: (process.env.DB_USER || 'root').trim(),
  password: process.env.DB_PASSWORD || '',
  database: (process.env.DB_NAME || 'hotel_db').trim(),
  ssl: process.env.DB_SSL === 'false' ? false : {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' || fs.existsSync(caPath),
    ca: fs.existsSync(caPath) ? fs.readFileSync(caPath) : undefined,
  },
});
try {
  await ensureAdminAccount(pool);
  await removeLegacySettings(pool);
  console.log('Admin account initialized; retired settings columns removed.');
} finally {
  await pool.end();
}
