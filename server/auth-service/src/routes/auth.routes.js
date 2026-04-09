const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');
const { query } = require('../config/db');

// Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected Identity Route (Verify Token)
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const result = await query(
            'SELECT id, email, first_name, last_name, role, phone, avatar_url, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;