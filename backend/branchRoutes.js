import express from 'express';

export default function createBranchRouter(pool) {
    const router = express.Router();

    // CREATE: Add a new branch
    router.post('/', async (req, res) => {
        try {
            const { branch_name, city, address, contact_number } = req.body;
            
            // --- BASIC INPUT VALIDATION ---
            if (!branch_name?.trim() || !city?.trim() || !address?.trim() || !contact_number?.trim()) {
                return res.status(400).json({ 
                    error: "Validation failed: branch_name, city, address, and contact_number are required fields." 
                });
            }
            // ------------------------------

            const sql = `INSERT INTO Branch (branch_name, city, address, contact_number) VALUES (?, ?, ?, ?)`;
            const [result] = await pool.execute(sql, [
                branch_name.trim(), 
                city.trim(), 
                address.trim(), 
                contact_number.trim()
            ]);
            
            res.status(201).json({ 
                message: "Branch created successfully", 
                branch_id: result.insertId 
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // READ ALL: Fetch all branches (with optional city filtering)
    router.get('/', async (req, res) => {
        try {
            const { city } = req.query;
            let sql = `SELECT * FROM Branch`;
            let params = [];

            if (city?.trim()) {
                sql += ` WHERE city = ?`;
                params.push(city.trim());
            }

            const [rows] = await pool.execute(sql, params);
            res.status(200).json(rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // READ ONE: Fetch a specific branch by ID
    router.get('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            
            if (isNaN(Number(id))) {
                 return res.status(400).json({ error: "Invalid branch ID format." });
            }

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
    router.put('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { branch_name, city, address, contact_number } = req.body;
            
            // --- BASIC INPUT VALIDATION ---
            if (isNaN(Number(id))) {
                return res.status(400).json({ error: "Invalid branch ID format." });
            }
            
            if (!branch_name?.trim() || !city?.trim() || !address?.trim() || !contact_number?.trim()) {
                return res.status(400).json({ 
                    error: "Validation failed: branch_name, city, address, and contact_number are required fields." 
                });
            }
            // ------------------------------
            
            const sql = `UPDATE Branch SET branch_name = ?, city = ?, address = ?, contact_number = ? WHERE branch_id = ?`;
            const [result] = await pool.execute(sql, [
                branch_name.trim(), 
                city.trim(), 
                address.trim(), 
                contact_number.trim(), 
                id
            ]);
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Branch not found" });
            }
            
            res.status(200).json({ message: "Branch updated successfully" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // DELETE: Remove a branch
    router.delete('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            
            if (isNaN(Number(id))) {
                 return res.status(400).json({ error: "Invalid branch ID format." });
            }

            const sql = `DELETE FROM Branch WHERE branch_id = ?`;
            const [result] = await pool.execute(sql, [id]);
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Branch not found" });
            }
            
            res.status(200).json({ message: "Branch deleted successfully" });
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
                return res.status(409).json({ error: "Cannot delete this branch because it is actively linked to other records (e.g., rooms, staff, or bookings)." });
            }
            res.status(500).json({ error: error.message });
        }
    });

    // JOIN: Fetch all AVAILABLE rooms at a specific branch
    router.get('/:id/rooms', async (req, res) => {
        try {
            const { id } = req.params;
            
            if (isNaN(Number(id))) {
                 return res.status(400).json({ error: "Invalid branch ID format." });
            }

            const sql = `
                SELECT r.room_number, r.status, rt.type_name, rt.capacity, rt.daily_rate
                FROM Branch b
                JOIN Room r ON b.branch_id = r.branch_id
                JOIN RoomType rt ON r.room_type_id = rt.room_type_id
                WHERE b.branch_id = ? AND r.status = 'Available'
            `;
            const [rows] = await pool.execute(sql, [id]);
            res.status(200).json(rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
}