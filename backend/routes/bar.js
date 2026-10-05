import express from 'express';
import path from 'path';
import fs from 'fs';

export default function createBarRouter(pool, upload) {
  const router = express.Router();

  const ensureTable = async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bar_items (
        item_id INT AUTO_INCREMENT PRIMARY KEY,
        item_name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL DEFAULT 'Soft Drink',
        size INT NOT NULL DEFAULT 330,
        in_stock INT NOT NULL DEFAULT 0,
        unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        image_path VARCHAR(255) NULL,
        last_updated_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  };

  const handleCreateBarItem = async (req, res) => {
    try {
      await ensureTable();
      const { item_name, category, size, in_stock, unit_price } = req.body;
      const image_path = req.file ? req.file.path : null;

      if (!item_name?.trim()) {
        return res.status(400).json({ error: 'Item name is required.' });
      }

      const [result] = await pool.query(
        'INSERT INTO bar_items (item_name, category, size, in_stock, unit_price, image_path) VALUES (?, ?, ?, ?, ?, ?)',
        [item_name.trim(), category || 'Soft Drink', Number(size) || 330, Number(in_stock) || 0, Number(unit_price) || 0, image_path]
      );

      res.status(201).json({ message: 'Bar item created successfully', item_id: result.insertId });
    } catch (error) {
      console.error('Create bar item error:', error);
      res.status(500).json({ error: 'Failed to add bar item.' });
    }
  };

  // GET /api/bar/items
  router.get('/items', async (req, res) => {
    try {
      await ensureTable();
      const [rows] = await pool.query('SELECT * FROM bar_items ORDER BY item_id DESC');
      res.json(rows);
    } catch (error) {
      console.error('Fetch bar items error:', error);
      res.status(500).json({ error: 'Failed to fetch bar items.' });
    }
  });

  // GET /api/bar/items/:id/image
  router.get('/items/:id/image', async (req, res) => {
    try {
      await ensureTable();
      const [rows] = await pool.query('SELECT image_path FROM bar_items WHERE item_id = ? LIMIT 1', [req.params.id]);
      if (rows.length > 0 && rows[0].image_path && fs.existsSync(rows[0].image_path)) {
        return res.sendFile(path.resolve(rows[0].image_path));
      }
      res.status(404).send('Image not found');
    } catch (error) {
      console.error('Fetch bar item image error:', error);
      res.status(500).json({ error: 'Failed to fetch item image.' });
    }
  });

  // PATCH /api/bar/items/:id/stock
  router.patch('/items/:id/stock', async (req, res) => {
    try {
      await ensureTable();
      const { added_stock, staff_id } = req.body;
      const itemId = req.params.id;

      const [result] = await pool.query(
        'UPDATE bar_items SET in_stock = GREATEST(0, in_stock + ?), last_updated_by = ? WHERE item_id = ?',
        [Number(added_stock) || 0, staff_id || null, itemId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Bar item not found.' });
      }
      res.json({ message: 'Stock updated successfully.' });
    } catch (error) {
      console.error('Update bar stock error:', error);
      res.status(500).json({ error: 'Failed to update stock.' });
    }
  });

  const handleUpdateBarItem = async (req, res) => {
    try {
      await ensureTable();
      const itemId = req.params.id;
      const { item_name, category, size, in_stock, unit_price } = req.body;

      if (!item_name?.trim()) {
        return res.status(400).json({ error: 'Item name is required.' });
      }

      let query = 'UPDATE bar_items SET item_name = ?, category = ?, size = ?, in_stock = ?, unit_price = ?';
      const values = [item_name.trim(), category || 'Soft Drink', Number(size) || 330, Number(in_stock) || 0, Number(unit_price) || 0];

      if (req.file) {
        query += ', image_path = ?';
        values.push(req.file.path);
      }

      query += ' WHERE item_id = ?';
      values.push(itemId);

      const [result] = await pool.query(query, values);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Bar item not found.' });
      }

      res.json({ message: 'Bar item updated successfully.' });
    } catch (error) {
      console.error('Update bar item error:', error);
      res.status(500).json({ error: 'Failed to update bar item.' });
    }
  };

  const handleDeleteBarItem = async (req, res) => {
    try {
      await ensureTable();
      const [result] = await pool.query('DELETE FROM bar_items WHERE item_id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Bar item not found.' });
      }
      res.json({ message: 'Bar item deleted successfully.' });
    } catch (error) {
      console.error('Delete bar item error:', error);
      res.status(500).json({ error: 'Failed to delete bar item.' });
    }
  };

  // POST endpoints for creating bar items
  router.post('/items', upload.single('image'), handleCreateBarItem);
  router.post('/admin/items', upload.single('image'), handleCreateBarItem);

  // PUT endpoints for updating bar items
  router.put('/items/:id', upload.single('image'), handleUpdateBarItem);
  router.put('/admin/items/:id', upload.single('image'), handleUpdateBarItem);

  // DELETE endpoints for removing bar items
  router.delete('/items/:id', handleDeleteBarItem);
  router.delete('/admin/items/:id', handleDeleteBarItem);

  return router;
}
