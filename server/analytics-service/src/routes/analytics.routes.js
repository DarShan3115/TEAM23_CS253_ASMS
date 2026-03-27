const express = require('express');
const router = express.Router();

router.get('/summary', (_req, res) => {
  res.json({
    total_students: 0,
    total_courses: 0,
    avg_attendance: 0.0,
    message: 'Connect to your database for real data',
  });
});

module.exports = router;
