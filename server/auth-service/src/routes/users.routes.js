
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'uploads/avatars/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for Avatar upload (JPG only, < 10MB)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, req.user.id + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
            cb(null, true);
        } else {
            cb(new Error('Only JPG format is allowed.'));
        }
    }
});

/**
 * --- USER PROFILE ROUTES ---
 * All routes here require a valid JWT (checked by 'auth' middleware)
 * and operate specifically on the data of the logged-in user.
 */

// GET /api/users/me - Get current user profile
router.get('/me', auth, usersController.getProfile);

// PUT /api/users/profile - Update personal info
router.put('/profile', auth, usersController.updateProfile);

// POST /api/users/send-change-otp - Send OTP for password change verification
router.post('/send-change-otp', auth, usersController.sendChangePasswordOtp);

// PUT /api/users/change-password - Update password (requires OTP)
router.put('/change-password', auth, usersController.changePassword);

// POST /api/users/avatar - Upload avatar image
router.post('/avatar', auth, upload.single('avatar'), usersController.uploadAvatar);

module.exports = router;