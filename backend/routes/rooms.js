import express from 'express';
const router = express.Router();

export default function(pool, upload) {
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

  // PUT /api/rooms/:id
  router.put('/:id', upload.single('image'), async (req, res) => {
    try {
      const { room_number, type, capacity, price_per_night, status, description, bed_type, room_size, amenities } = req.body;
      const roomId = req.params.id;
      let query = 'UPDATE Room SET room_number = ?, type = ?, capacity = ?, price_per_night = ?, status = ?, description = ?, bed_type = ?, room_size = ?, amenities = ?';
      const values = [room_number, type, capacity, price_per_night, status, description, bed_type, room_size, amenities];

      if (req.file) {
        query += ', image = ?';
        values.push(`http://localhost:5000/uploads/${req.file.filename}`);
      } else if (req.body.image_url) {
        query += ', image = ?';
        values.push(req.body.image_url);
      }

      query += ' WHERE room_id = ?';
      values.push(roomId);

      await pool.query(query, values);
      res.json({ message: 'Room updated successfully' });
    } catch (error) {
      console.error('Update room error:', error);
      res.status(500).json({ error: 'Failed to update room' });
    }
  });

  // DELETE /api/rooms/:id
  router.delete('/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM Room WHERE room_id = ?', [req.params.id]);
      res.json({ message: 'Room deleted successfully' });
    } catch (error) {
      console.error('Delete room error:', error);
      res.status(500).json({ error: 'Failed to delete room' });
    }
  });

  return router;
}
