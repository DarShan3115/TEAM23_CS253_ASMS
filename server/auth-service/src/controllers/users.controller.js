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
            'SELECT id, email, first_name, last_name, role, phone, created_at FROM users WHERE id = $1',
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
    const { first_name, last_name, phone } = req.body;

    try {
        const result = await query(
            `UPDATE users 
             SET first_name = $1, last_name = $2, phone = $3 
             WHERE id = $4 
             RETURNING id, email, first_name, last_name, role, phone`,
            [first_name, last_name, phone, req.user.id]
        );

        res.json({ message: 'Profile updated successfully', user: result.rows[0] });
    } catch (err) {
        console.error("Profile Update Error:", err.message);
        res.status(500).json({ message: 'Server error while updating profile.' });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    const { old_password, new_password } = req.body;

    try {
        const userResult = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(old_password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password incorrect.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(new_password, salt);

        await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedNewPassword, req.user.id]);

        res.json({ message: 'Password changed successfully.' });
    } catch (err) {
        console.error("Password Change Error:", err.message);
        res.status(500).json({ message: 'Server error during password update.' });
    }
};