import express from 'express';
import fs from 'fs';

export default function createOffersRouter(pool, upload) {
  const router = express.Router();

  // Helper to synchronize discount column in Room table with active exclusive offers
  const syncRoomDiscounts = async () => {
    try {
      await pool.query('UPDATE Room SET discount = 0');
      const [rows] = await pool.query(
        'SELECT room_id, MAX(discount) AS max_discount FROM exclusive_offers WHERE active = 1 AND room_id IS NOT NULL GROUP BY room_id'
      );
      for (const row of rows) {
        if (row.room_id && row.max_discount > 0) {
          await pool.query('UPDATE Room SET discount = ? WHERE room_id = ?', [row.max_discount, row.room_id]);
        }
      }
    } catch (e) {
      console.error('syncRoomDiscounts error:', e.message);
    }
  };

  // Helper to ensure schema has necessary columns and table exists
  let schemaEnsured = false;
  const ensureSchema = async () => {
    if (schemaEnsured) return;
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS exclusive_offers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          popup VARCHAR(100) DEFAULT '',
          topic VARCHAR(255) NOT NULL,
          details TEXT,
          more_details TEXT,
          image LONGBLOB,
          active TINYINT(1) DEFAULT 1,
          room_id INT DEFAULT NULL,
          branch_id INT DEFAULT NULL,
          discount INT DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
    } catch (e) {
      console.error('Create table exclusive_offers check:', e.message);
    }

    try { await pool.query('ALTER TABLE exclusive_offers MODIFY details TEXT'); } catch (e) { }
    try { await pool.query('ALTER TABLE exclusive_offers MODIFY more_details TEXT'); } catch (e) { }
    try { await pool.query('ALTER TABLE exclusive_offers MODIFY image LONGBLOB'); } catch (e) { }
    try { await pool.query('ALTER TABLE exclusive_offers ADD COLUMN room_id INT DEFAULT NULL'); } catch (e) { }
    try { await pool.query('ALTER TABLE exclusive_offers ADD COLUMN branch_id INT DEFAULT NULL'); } catch (e) { }
    try { await pool.query('ALTER TABLE exclusive_offers ADD COLUMN discount INT DEFAULT 0'); } catch (e) { }
    try { await pool.query('ALTER TABLE Room ADD COLUMN discount INT DEFAULT 0'); } catch (e) { }
    schemaEnsured = true;
  };

  // Middleware to ensure schema
  router.use(async (req, res, next) => {
    try {
      await ensureSchema();
    } catch (err) {
      console.error('Schema initialization error:', err);
    }
    next();
  });

  const parseNumOrNull = (val) => {
    if (val === undefined || val === null || val === '' || val === 'null' || val === 'undefined') return null;
    const n = Number(val);
    return (!isNaN(n) && n > 0) ? n : null;
  };

  const parseDiscount = (val) => {
    if (val === undefined || val === null || val === '' || val === 'null' || val === 'undefined') return 0;
    const n = Number(val);
    return (!isNaN(n) && n >= 0) ? Math.min(100, Math.floor(n)) : 0;
  };

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
      popup: row.popup || '',
      topic: row.topic || '',
      details: row.details || '',
      more_details: row.more_details || '',
      image: imageBase64,
      active: Boolean(row.active),
      room_id: parseNumOrNull(row.room_id),
      branch_id: parseNumOrNull(row.branch_id),
      discount: parseDiscount(row.discount)
    };
  };

  // GET /api/offers - Fetch all exclusive offers (or filtered by active)
  router.get('/', async (req, res) => {
    try {
      const activeOnly = req.query.active_only === 'true';
      let sql = 'SELECT id, popup, topic, details, more_details, image, active, room_id, branch_id, discount FROM exclusive_offers';
      if (activeOnly) {
        sql += ' WHERE active = 1';
      }
      sql += ' ORDER BY id DESC';

      const [rows] = await pool.query(sql);
      const offers = rows.map(formatOffer);
      res.json(offers);
    } catch (error) {
      console.error('Fetch exclusive offers error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch exclusive offers.' });
    }
  });

  // GET /api/offers/:id - Fetch single offer
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await pool.query(
        'SELECT id, popup, topic, details, more_details, image, active, room_id, branch_id, discount FROM exclusive_offers WHERE id = ?',
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Offer not found.' });
      }
      res.json(formatOffer(rows[0]));
    } catch (error) {
      console.error('Fetch offer detail error:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch offer.' });
    }
  });

  // POST /api/offers - Create new offer
  router.post('/', upload.single('image'), async (req, res) => {
    try {
      const { popup, topic, details, more_details, active, room_id, branch_id, discount } = req.body;
      let imageBuffer = null;

      if (req.file && req.file.path) {
        if (fs.existsSync(req.file.path)) {
          imageBuffer = fs.readFileSync(req.file.path);
          try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
      } else if (req.body.image_base64 && typeof req.body.image_base64 === 'string' && req.body.image_base64.trim()) {
        const base64Data = req.body.image_base64.replace(/^data:image\/\w+;base64,/, '').trim();
        if (base64Data) {
          imageBuffer = Buffer.from(base64Data, 'base64');
        }
      }

      const activeVal = active !== undefined ? (active === 'true' || active === true || active === 1 ? 1 : 0) : 1;
      const roomIdVal = parseNumOrNull(room_id);
      const branchIdVal = parseNumOrNull(branch_id);
      const discountVal = parseDiscount(discount);

      const [result] = await pool.query(
        'INSERT INTO exclusive_offers (popup, topic, details, more_details, image, active, room_id, branch_id, discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [popup || '', topic || '', details || '', more_details || '', imageBuffer, activeVal, roomIdVal, branchIdVal, discountVal]
      );

      // Sync room table discounts automatically
      await syncRoomDiscounts();

      res.status(201).json({ message: 'Exclusive offer created successfully', id: result.insertId });
    } catch (error) {
      console.error('Create offer error:', error);
      res.status(500).json({ error: error.message || 'Failed to create offer.' });
    }
  });

  // PUT /api/offers/:id - Update offer
  router.put('/:id', upload.single('image'), async (req, res) => {
    try {
      const { popup, topic, details, more_details, active, room_id, branch_id, discount } = req.body;
      const offerId = req.params.id;

      let imageBuffer = null;
      let updateImage = false;

      if (req.file && req.file.path) {
        if (fs.existsSync(req.file.path)) {
          imageBuffer = fs.readFileSync(req.file.path);
          updateImage = true;
          try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
      } else if (req.body.image_base64 && typeof req.body.image_base64 === 'string' && req.body.image_base64.trim()) {
        const base64Data = req.body.image_base64.replace(/^data:image\/\w+;base64,/, '').trim();
        if (base64Data) {
          imageBuffer = Buffer.from(base64Data, 'base64');
          updateImage = true;
        }
      }

      const activeVal = active !== undefined ? (active === 'true' || active === true || active === 1 ? 1 : 0) : 1;
      const roomIdVal = parseNumOrNull(room_id);
      const branchIdVal = parseNumOrNull(branch_id);
      const discountVal = parseDiscount(discount);

      if (updateImage) {
        await pool.query(
          'UPDATE exclusive_offers SET popup = ?, topic = ?, details = ?, more_details = ?, image = ?, active = ?, room_id = ?, branch_id = ?, discount = ? WHERE id = ?',
          [popup || '', topic || '', details || '', more_details || '', imageBuffer, activeVal, roomIdVal, branchIdVal, discountVal, offerId]
        );
      } else {
        await pool.query(
          'UPDATE exclusive_offers SET popup = ?, topic = ?, details = ?, more_details = ?, active = ?, room_id = ?, branch_id = ?, discount = ? WHERE id = ?',
          [popup || '', topic || '', details || '', more_details || '', activeVal, roomIdVal, branchIdVal, discountVal, offerId]
        );
      }

      // Sync room table discounts automatically
      await syncRoomDiscounts();

      res.json({ message: 'Exclusive offer updated successfully.' });
    } catch (error) {
      console.error('Update offer error:', error);
      res.status(500).json({ error: error.message || 'Failed to update offer.' });
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

      await syncRoomDiscounts();

      res.json({ message: 'Offer status updated.' });
    } catch (error) {
      console.error('Toggle offer status error:', error);
      res.status(500).json({ error: error.message || 'Failed to update offer status.' });
    }
  });

  // DELETE /api/offers/:id - Delete offer
  router.delete('/:id', async (req, res) => {
    try {
      const [result] = await pool.query('DELETE FROM exclusive_offers WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Offer not found.' });
      }

      await syncRoomDiscounts();

      res.json({ message: 'Exclusive offer deleted successfully.' });
    } catch (error) {
      console.error('Delete offer error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete offer.' });
    }
  });

  return router;
}

