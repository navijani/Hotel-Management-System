import express from 'express';

export default function createRoomsRouter(pool, upload) {
  const router = express.Router();

  // GET /api/rooms
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM Room');
      res.json(rows);
    } catch (error) {
      console.error('Database query error:', error);
      res.status(500).json({ error: 'Failed to fetch rooms' });
    }
  });

  // POST /api/rooms
  router.post('/', upload.single('image'), async (req, res) => {
    try {
      const { room_number, type, capacity, price_per_night, status, description, bed_type, room_size, amenities } = req.body;
      let image_url = '';

      if (req.file) {
        image_url = `http://localhost:5000/uploads/${req.file.filename}`;
      } else if (req.body.image_url) {
        image_url = req.body.image_url;
      }

      const [result] = await pool.query(
        'INSERT INTO Room (room_number, type, capacity, price_per_night, status, image, description, bed_type, room_size, amenities) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [room_number, type, capacity, price_per_night, status || 'Available', image_url, description, bed_type, room_size, amenities]
      );

      res.status(201).json({ message: 'Room created successfully', roomId: result.insertId, room: req.body });
    } catch (error) {
      console.error('Create room error:', error);
      res.status(500).json({ error: 'Failed to create room' });
    }
  });

  return router;
}
