const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// GET /api/courses
router.get('/', async (req, res) => {
  try {
    const query = `SELECT id, code, title, description, credits, department_id, instructor_id, semester, max_enrollment, is_active, created_at FROM courses WHERE is_active = TRUE ORDER BY created_at DESC`;
    const result = await pool.query(query);
    res.json({ courses: result.rows });
  } catch (err) {
    console.error('Courses list error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/courses/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found.' });
    res.json({ course: result.rows[0] });
  } catch (err) {
    console.error('Course detail error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
