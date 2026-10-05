import express from 'express';
import fs from 'fs';

export default function createOffersRouter(pool, upload) {
  const router = express.Router();

  // Helper to format offer row with base64 image data URL
  const formatOffer = (row) => {
    let imageBase64 = null;
    if (row.image) {
      if (Buffer.isBuffer(row.image)) {
        imageBase64 = `data:image/jpeg;base64,${row.image.toString('base64')}`;
      } else if (typeof row.image === 'string') {
        imageBase64 = row.image.startsWith('data:') ? row.image : `data:image/jpeg;base64,${row.image}`;
      }
    }
    return {
      id: row.id,
      popup: row.popup,
      topic: row.topic,
      details: row.details,
      more_details: row.more_details,
      image: imageBase64,
      active: Boolean(row.active)
    };
  };

  // GET /api/offers - Fetch all exclusive offers (or filtered by active)
  router.get('/', async (req, res) => {
    try {
      const activeOnly = req.query.active_only === 'true';
      let sql = 'SELECT id, popup, topic, details, more_details, image, active FROM exclusive_offers';
      if (activeOnly) {
        sql += ' WHERE active = 1';
      }
      sql += ' ORDER BY id DESC';

      const [rows] = await pool.query(sql);
      const offers = rows.map(formatOffer);
      res.json(offers);
    } catch (error) {
      console.error('Fetch exclusive offers error:', error);
      res.status(500).json({ error: 'Failed to fetch exclusive offers.' });
    }
  });

  // GET /api/offers/:id - Fetch single offer
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT id, popup, topic, details, more_details, image, active FROM exclusive_offers WHERE id = ?',
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Offer not found.' });
      }
      res.json(formatOffer(rows[0]));
    } catch (error) {
      console.error('Fetch offer detail error:', error);
      res.status(500).json({ error: 'Failed to fetch offer.' });
    }
  });

  // POST /api/offers - Create new offer
  router.post('/', upload.single('image'), async (req, res) => {
    try {
      const { popup, topic, details, more_details, active } = req.body;
      let imageBuffer = null;

      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        imageBuffer = fs.readFileSync(req.file.path);
        // Clean up temp file
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      } else if (req.body.image_base64) {
        const base64Data = req.body.image_base64.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
      }

      const activeVal = active !== undefined ? (active === 'true' || active === true || active === 1 ? 1 : 0) : 1;

      const [result] = await pool.query(
        'INSERT INTO exclusive_offers (popup, topic, details, more_details, image, active) VALUES (?, ?, ?, ?, ?, ?)',
        [popup || '', topic || '', details || '', more_details || '', imageBuffer, activeVal]
      );

      res.status(201).json({ message: 'Exclusive offer created successfully', id: result.insertId });
    } catch (error) {
      console.error('Create offer error:', error);
      res.status(500).json({ error: 'Failed to create offer.' });
    }
  });

  // PUT /api/offers/:id - Update offer
  router.put('/:id', upload.single('image'), async (req, res) => {
    try {
      const { popup, topic, details, more_details, active } = req.body;
      const offerId = req.params.id;

      let imageBuffer = null;
      let updateImage = false;

      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        imageBuffer = fs.readFileSync(req.file.path);
        updateImage = true;
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      } else if (req.body.image_base64) {
        const base64Data = req.body.image_base64.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
        updateImage = true;
      }

      const activeVal = active !== undefined ? (active === 'true' || active === true || active === 1 ? 1 : 0) : 1;

      if (updateImage) {
        await pool.query(
          'UPDATE exclusive_offers SET popup = ?, topic = ?, details = ?, more_details = ?, image = ?, active = ? WHERE id = ?',
          [popup || '', topic || '', details || '', more_details || '', imageBuffer, activeVal, offerId]
        );
      } else {
        await pool.query(
          'UPDATE exclusive_offers SET popup = ?, topic = ?, details = ?, more_details = ?, active = ? WHERE id = ?',
          [popup || '', topic || '', details || '', more_details || '', activeVal, offerId]
        );
      }

      res.json({ message: 'Exclusive offer updated successfully.' });
    } catch (error) {
      console.error('Update offer error:', error);
      res.status(500).json({ error: 'Failed to update offer.' });
    }
  });

  // PATCH /api/offers/:id/status - Toggle active state
  router.patch('/:id/status', async (req, res) => {
    try {
      const { active } = req.body;
      const activeVal = active === true || active === 1 || active === 'true' ? 1 : 0;
      const [result] = await pool.query('UPDATE exclusive_offers SET active = ? WHERE id = ?', [activeVal, req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Offer not found.' });
      }
      res.json({ message: 'Offer status updated.' });
    } catch (error) {
      console.error('Toggle offer status error:', error);
      res.status(500).json({ error: 'Failed to update offer status.' });
    }
  });

  // DELETE /api/offers/:id - Delete offer
  router.delete('/:id', async (req, res) => {
    try {
      const [result] = await pool.query('DELETE FROM exclusive_offers WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Offer not found.' });
      }
      res.json({ message: 'Exclusive offer deleted successfully.' });
    } catch (error) {
      console.error('Delete offer error:', error);
      res.status(500).json({ error: 'Failed to delete offer.' });
    }
  });

  return router;
}
