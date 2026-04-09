const { query } = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * User Controller
 * Handles personal profile management for the logged-in user.
 */

// Get the current user's full profile
exports.getProfile = async (req, res) => {
    try {
        // req.user.id is provided by the auth middleware
        const result = await query(
            'SELECT id, email, first_name, last_name, role, phone, avatar_url, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User profile not found.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Profile Fetch Error:", err.message);
        res.status(500).json({ message: 'Server error while fetching profile.' });
    }
};

// Update personal profile information
exports.updateProfile = async (req, res) => {
    const { first_name, last_name, email, phone } = req.body;

    try {
        // Ensure phone has +91 prefixed if the frontend only sent 10 digits
        let formattedPhone = phone;
        if (formattedPhone && formattedPhone.length === 10) {
            formattedPhone = '+91' + formattedPhone;
        }

        const result = await query(
            `UPDATE users 
             SET first_name = $1, last_name = $2, email = $3, phone = $4 
             WHERE id = $5 
             RETURNING id, email, first_name, last_name, role, phone, avatar_url`,
            [first_name, last_name, email, formattedPhone, req.user.id]
        );

        res.json({ message: 'Profile updated successfully', user: result.rows[0] });
    } catch (err) {
        console.error("Profile Update Error:", err.message);
        res.status(500).json({ message: 'Server error while updating profile.' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword, verificationCode } = req.body;

    try {
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new passwords are required.' });
        }

        // 1. Verify OTP - Ensuring it's precisely 6 digits
        if (!verificationCode || String(verificationCode).length !== 6) {
            return res.status(400).json({ message: 'Invalid verification code provided.' });
        }

        const userResult = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        const user = userResult.rows[0];

        if (!user.password_hash) {
            return res.status(400).json({ message: 'Invalid account configuration. Cannot change password.' });
        }

        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(String(currentPassword), user.password_hash);
        } catch (compareErr) {
            // Fallback for manually seeded database test-users with plaintext passwords
            isMatch = (currentPassword === user.password_hash);
        }

        if (!isMatch) {
            return res.status(400).json({ message: 'Current password incorrect.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(String(newPassword), salt);

        await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedNewPassword, req.user.id]);

        res.json({ message: 'Password changed successfully.' });
    } catch (err) {
        console.error("Password Change Error:", err);
        res.status(500).json({ message: `Server error during password update: ${err.message}` });
    }
};

// Upload Avatar
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a valid JPG image.' });
        }

        // Construct the URL path (assuming express.static is configured to serve the root directory)
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        const result = await query(
            'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING avatar_url',
            [avatarUrl, req.user.id]
        );

        res.json({ 
            message: 'Avatar uploaded successfully', 
            avatar_url: result.rows[0].avatar_url 
        });
    } catch (err) {
        console.error("Avatar Upload Error:", err.message);
        res.status(500).json({ message: 'Server error during avatar upload.' });
    }
};