const express = require('express');
const router = express.Router();
const pool = require('./db');

// CREATE: Add a new branch
router.post('/branches', async (req, res) => {
    try {
        const { branch_name, city, address, contact_number } = req.body;
        const sql = `INSERT INTO Branch (branch_name, city, address, contact_number) VALUES (?, ?, ?, ?)`;
        const [result] = await pool.execute(sql, [branch_name, city, address, contact_number]);
        
        res.status(201).json({ 
            message: "Branch created successfully", 
            branch_id: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// READ ALL: Fetch all branches (with optional city filtering)
router.get('/branches', async (req, res) => {
    try {
        const { city } = req.query;
        let sql = `SELECT * FROM Branch`;
        let params = [];

        if (city) {
            sql += ` WHERE city = ?`;
            params.push(city);
        }

        const [rows] = await pool.execute(sql, params);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// READ ONE: Fetch a specific branch by ID
router.get('/branches/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `SELECT * FROM Branch WHERE branch_id = ?`;
        const [rows] = await pool.execute(sql, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Branch not found" });
        }
        
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE: Modify an existing branch
router.put('/branches/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { branch_name, city, address, contact_number } = req.body;
        
        const sql = `UPDATE Branch SET branch_name = ?, city = ?, address = ?, contact_number = ? WHERE branch_id = ?`;
        const [result] = await pool.execute(sql, [branch_name, city, address, contact_number, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Branch not found" });
        }
        
        res.status(200).json({ message: "Branch updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Remove a branch
router.delete('/branches/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `DELETE FROM Branch WHERE branch_id = ?`;
        const [result] = await pool.execute(sql, [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Branch not found" });
        }
        
        res.status(200).json({ message: "Branch deleted successfully" });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({ error: "Cannot delete branch. It has active rooms or staff." });
        }
        res.status(500).json({ error: error.message });
    }
});

// JOIN: Fetch all rooms available at a specific branch
router.get('/branches/:id/rooms', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT r.room_number, r.current_status, rt.type_name, rt.capacity, rt.daily_rate
            FROM Branch b
            JOIN Room r ON b.branch_id = r.branch_id
            JOIN RoomType rt ON r.room_type_id = rt.room_type_id
            WHERE b.branch_id = ?
        `;
        const [rows] = await pool.execute(sql, [id]);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;