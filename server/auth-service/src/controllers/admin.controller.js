const { query } = require('../config/db');

/**
 * Admin Controller
 * * Handles administrative operations including user management 
 * and system-wide data updates.
 */

// Fetch all registered users for the Admin Directory
exports.getAllUsers = async (req, res) => {
    try {
        const result = await query(
            `SELECT id, email, first_name, last_name, role, is_active, created_at 
             FROM users 
             ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Admin Fetch Error:", err.message);
        res.status(500).json({ message: 'Database error while fetching user directory.' });
    }
};

// Update a user's role or account status (Active/Suspended)
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { role, is_active } = req.body;

    try {
        // Update the user record and return the updated data
        const result = await query(
            `UPDATE users 
             SET role = $1, is_active = $2 
             WHERE id = $3 
             RETURNING id, email, first_name, last_name, role, is_active`,
            [role, is_active, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found in the database.' });
        }

        res.json({ 
            message: 'User profile updated successfully.', 
            user: result.rows[0] 
        });
    } catch (err) {
        console.error("Admin Update Error:", err.message);
        res.status(500).json({ message: 'Database error while updating user profile.' });
    }
};

// Permanently delete a user account
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({ message: 'User account has been permanently deleted.' });
    } catch (err) {
        console.error("Admin Delete Error:", err.message);
        res.status(500).json({ message: 'Database error while deleting user account.' });
    }
};