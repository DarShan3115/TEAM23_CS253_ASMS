const { query } = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { otpStore } = require('../config/otpStore');
const { sendEmail, welcomeEmailHtml } = require('../config/messaging');

function generateUniquePassword(existingSet, length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let password;
    do {
        password = Array.from(crypto.randomFillSync(new Uint32Array(length)))
            .map((x) => chars[x % chars.length])
            .join('');
    } while (existingSet.has(password));
    existingSet.add(password);
    return password;
}

exports.bulkGenerateUsers = async (req, res) => {
    const { users } = req.body;
    if (!users || !Array.isArray(users)) return res.status(400).json({ message: 'List of users is required.' });

    try {
        const generated = [];
        const existingPasswords = new Set();
        
        for (const u of users) {
            const exists = await query('SELECT id FROM users WHERE email = $1', [u.email]);
            if (exists.rows.length > 0) continue;

            const pwd = generateUniquePassword(existingPasswords, 16);
            const password_hash = await bcrypt.hash(pwd, 10);
            
            const result = await query(
                'INSERT INTO users (email, password_hash, first_name, last_name, role, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name, role',
                [u.email, password_hash, u.first_name, u.last_name, u.role || 'student', u.phone || null]
            );
            
            generated.push({ ...result.rows[0], plain_password: pwd });
        }
        res.json({ message: `Successfully generated ${generated.length} accounts.`, accounts: generated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error generating accounts.' });
    }
};

exports.broadcastAnnouncement = async (req, res) => {
    const { title, body, targetType, targets } = req.body;
    // targetType: 'all', 'manual_list', 'course', 'individual'
    
    if (!title || !body) return res.status(400).json({ message: 'Title and body required.' });

    try {
        let recipientEmails = new Set();
        
        if (targetType === 'all') {
            const users = await query("SELECT email FROM users WHERE is_active = true");
            users.rows.forEach(u => recipientEmails.add(u.email));
        } else if (targetType === 'manual_list' || targetType === 'individual') {
            (targets || []).forEach(e => recipientEmails.add(e.trim().toLowerCase()));
        } else if (targetType === 'course') {
            for (const code of targets) {
                const enrolls = await query(`
                    SELECT u.email FROM enrollments e
                    JOIN courses c ON e.course_id = c.id
                    JOIN users u ON e.student_id = u.id
                    WHERE c.code ILIKE $1
                `, [code]);
                enrolls.rows.forEach(u => recipientEmails.add(u.email));
            }
        }

        // Send actual broadcast emails
        if (recipientEmails.size > 0) {
            // Note: In production you would chunk these or use a background worker
            const emailList = Array.from(recipientEmails).join(',');
            await sendEmail(emailList, `Announcement: ${title}`, body, `<h3>${title}</h3><p>${body}</p>`);
        }

        // Also save to generic notices table for dashboard persistence
        await query(`INSERT INTO notices (title, body, author_id, target_role) VALUES ($1, $2, $3, $4)`, 
                    [title, body, req.user.id, targetType === 'all' ? 'all' : 'specific']);

        res.json({ message: `Announcement broadcast deployed to ${recipientEmails.size} recipients.` });
    } catch (err) {
        console.error('Broadcast Error:', err);
        res.status(500).json({ message: 'Failed to deploy announcement broadcast.' });
    }
};

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
    if (!newPassword) {
        return res.status(400).json({ message: 'New password is required.' });
    }
    // Enforce the same strength policy as user-initiated password changes
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pwdRegex.test(newPassword)) {
        return res.status(400).json({ message: 'Password must be 8+ characters with uppercase, lowercase, number, and special character.' });
    }
    try {
        const hash = await bcrypt.hash(newPassword, 10);
        await query('UPDATE users SET password_hash = $1, locked_until = NULL, failed_login_attempts = 0 WHERE id = $2', [hash, req.params.id]);
        res.json({ message: 'Password reset successfully by admin.' });
    } catch (err) {
        res.status(500).json({ message: 'Error resetting password.' });
    }
};