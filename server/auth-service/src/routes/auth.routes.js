const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');

// Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected Identity Route (Verify Token)
router.get('/me', authMiddleware, (req, res) => {
    res.json(req.user);
});

module.exports = router;