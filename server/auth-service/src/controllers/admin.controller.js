const { query } = require('../config/db');
const bcrypt = require('bcryptjs');
const { otpStore } = require('../config/otpStore');
const { sendEmail, welcomeEmailHtml } = require('../config/messaging');

// --- List all users (with optional role filter) ---
exports.listUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        let sql = 'SELECT id, email, first_name, last_name, role, phone, avatar_url, created_at, locked_until FROM users WHERE 1=1';
        const params = [];
        if (role) { sql += ` AND role = $${params.length + 1}`; params.push(role); }
        if (search) {
            const idx = params.length + 1;
            sql += ` AND (first_name ILIKE $${idx} OR last_name ILIKE $${idx + 1} OR email ILIKE $${idx + 2})`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        sql += ' ORDER BY created_at DESC';
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users.' });
    }
};

// --- Get a single user by ID ---
exports.getUserById = async (req, res) => {
    try {
        const result = await query('SELECT id, email, first_name, last_name, role, phone, avatar_url, created_at, locked_until FROM users WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found.' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching user.' });
    }
};

// --- Create a new user (admin-seeded account) ---
exports.createUser = async (req, res) => {
    const { email, first_name, last_name, role, phone, password } = req.body;
    if (!email || !role || !password) {
        return res.status(400).json({ message: 'Email, role, and password are required.' });
    }
    try {
        const exists = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (exists.rows.length > 0) return res.status(409).json({ message: 'A user with this email already exists.' });

        const password_hash = await bcrypt.hash(password, 10);
        const result = await query(
            'INSERT INTO users (email, password_hash, first_name, last_name, role, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name, role, created_at',
            [email, password_hash, first_name || '', last_name || '', role, phone || null]
        );

        // Send welcome email with credentials
        await sendEmail(
            email,
            'Welcome to ASMS — Your Account is Ready',
            `Hello ${first_name || email},\n\nYour ASMS account has been created.\nEmail: ${email}\nTemporary Password: ${password}\n\nPlease log in and change your password immediately.`,
            welcomeEmailHtml(first_name || 'User', email, password)
        );

        res.status(201).json({ message: 'Account created successfully.', user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: `Error creating user: ${err.message}` });
    }
};

// --- Edit user details (name, email, role) ---
exports.editUser = async (req, res) => {
    const { first_name, last_name, email, role, phone } = req.body;
    try {
        const result = await query(
            'UPDATE users SET first_name = $1, last_name = $2, email = $3, role = $4, phone = $5 WHERE id = $6 RETURNING id, email, first_name, last_name, role',
            [first_name, last_name, email, role, phone, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found.' });
        res.json({ message: 'User updated.', user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: `Error updating user: ${err.message}` });
    }
};

// --- Suspend / Unsuspend user (lock their account) ---
exports.suspendUser = async (req, res) => {
    try {
        const userResult = await query('SELECT locked_until FROM users WHERE id = $1', [req.params.id]);
        if (userResult.rows.length === 0) return res.status(404).json({ message: 'User not found.' });

        const isSuspended = userResult.rows[0].locked_until && new Date(userResult.rows[0].locked_until) > new Date();
        const newLock = isSuspended ? null : new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000); // 100 years = permanent

        await query('UPDATE users SET locked_until = $1 WHERE id = $2', [newLock, req.params.id]);
        res.json({ message: isSuspended ? 'User account reactivated.' : 'User account suspended.' });
    } catch (err) {
        res.status(500).json({ message: 'Error suspending user.' });
    }
};

// --- Delete user permanently ---
exports.deleteUser = async (req, res) => {
    try {
        // Prevent self-deletion
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own account via admin panel.' });
        }
        const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found.' });
        res.json({ message: 'User account permanently deleted.' });
    } catch (err) {
        res.status(500).json({ message: `Error deleting user: ${err.message}` });
    }
};

// --- Unlock an account locked by brute-force ---
exports.unlockUser = async (req, res) => {
    try {
        await query('UPDATE users SET locked_until = NULL, failed_login_attempts = 0 WHERE id = $1', [req.params.id]);
        res.json({ message: 'Account lock cleared.' });
    } catch (err) {
        res.status(500).json({ message: 'Error unlocking account.' });
    }
};

// --- Get platform-level stats ---
exports.getPlatformStats = async (req, res) => {
    try {
        const [userCount, roleBreakdown] = await Promise.all([
            query('SELECT COUNT(*) FROM users'),
            query("SELECT role, COUNT(*) as count FROM users GROUP BY role")
        ]);
        const roleMap = {};
        roleBreakdown.rows.forEach(r => { roleMap[r.role] = parseInt(r.count); });
        res.json({
            totalUsers: parseInt(userCount.rows[0].count),
            students:   roleMap.student || 0,
            faculty:    roleMap.faculty || 0,
            admins:     roleMap.admin   || 0,
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stats.' });
    }
};

// --- Reset a user's password (admin override, no OTP needed) ---
exports.adminResetPassword = async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    }
    try {
        const hash = await bcrypt.hash(newPassword, 10);
        await query('UPDATE users SET password_hash = $1, locked_until = NULL, failed_login_attempts = 0 WHERE id = $2', [hash, req.params.id]);
        res.json({ message: 'Password reset successfully by admin.' });
    } catch (err) {
        res.status(500).json({ message: 'Error resetting password.' });
    }
};