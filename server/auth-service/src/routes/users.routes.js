const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const auth = require('../middleware/auth');

/**
 * --- USER PROFILE ROUTES ---
 * All routes here require a valid JWT (checked by 'auth' middleware)
 * and operate specifically on the data of the logged-in user.
 */

// GET /api/users/me - Get current user profile
router.get('/me', auth, usersController.getProfile);

// PUT /api/users/profile - Update personal info
router.put('/profile', auth, usersController.updateProfile);

// PUT /api/users/change-password - Update password
router.put('/change-password', auth, usersController.changePassword);

module.exports = router;