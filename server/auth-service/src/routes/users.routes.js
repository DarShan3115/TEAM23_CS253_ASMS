const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/users  (admin only) ──────────────────────────────────────────
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, email, first_name, last_name, role, is_active, created_at FROM users';
    const params = [];

    if (role) {
      query += ' WHERE role = $1';
      params.push(role);
    }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ users: result.rows, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Users list error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
