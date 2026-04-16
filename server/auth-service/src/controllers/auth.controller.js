const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomInt } = require('crypto');
const { query } = require('../config/db');
const { otpStore } = require('../config/otpStore');
const { sendEmail, sendSMS, otpEmailHtml } = require('../config/messaging');

// Separate store for password-reset OTPs (forgot password flow)
const resetOtpStore = new Map();

// ── Helpers ───────────────────────────────────────────────────────────────────

const IITK_DOMAIN = 'iitk.ac.in';

/** Enforce institutional email — accepts any subdomain of iitk.ac.in */
const isIITKEmail = (email) => typeof email === 'string' && email.toLowerCase().endsWith(IITK_DOMAIN);

/** Generate a cryptographically secure 6-digit OTP string */
const genOTP = () => randomInt(100000, 1000000).toString();

/** Issue both JWTs; stores refresh token in HttpOnly cookie */
function issueTokens(user, res) {
    const payload = { id: user.id, role: user.role };
    
    // Dynamic Expiry: Admins get 15m strictly, Students/Faculty get 1h
    const tokenLife = user.role === 'admin' ? '15m' : '1h';
    
    const accessToken  = jwt.sign(payload, process.env.JWT_SECRET        || 'secret',         { expiresIn: tokenLife });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: '7d'  });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge:   7 * 24 * 60 * 60 * 1000,
    });
    return accessToken;
}

// ── CHECK IF USER EXISTS (FOR REAL-TIME UI VALIDATION) ────────────────────────
exports.checkExists = async (req, res) => {
    let { email, phone } = req.query;
    
    try {
        if (!email && !phone) return res.json({ exists: false });

        const params = [];
        const conditions = [];

        if (email) {
            params.push(email.trim().toLowerCase());
            conditions.push(`email ILIKE $${params.length}`);
        }
        if (phone) {
            params.push(phone.trim());
            conditions.push(`phone = $${params.length}`);
        }

        const exists = await query(`SELECT id FROM users WHERE ${conditions.join(' OR ')}`, params);
        if (exists.rows.length > 0) {
            return res.json({ exists: true, message: 'An account with this email or phone number already exists.' });
        }
        res.json({ exists: false });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to check availability.' });
    }
};

// ── SEND REGISTRATION OTP ─────────────────────────────────────────────────────
exports.sendOtp = async (req, res) => {
    let { email, phone } = req.body;
    try {
        if (!email || !phone) {
            return res.status(400).json({ error: 'Email and phone are required.' });
        }

        email = email.trim().toLowerCase();
        phone = phone.trim();

        // ── Enforce iitk.ac.in domain ──
        if (!isIITKEmail(email)) {
            return res.status(400).json({ error: 'Only iitk.ac.in email addresses are permitted.' });
        }

        // ── Early Duplicate Check ──
        const exists = await query('SELECT id FROM users WHERE email ILIKE $1 OR phone = $2', [email, phone]);
        if (exists.rows.length > 0) {
            return res.status(400).json({ error: 'An account with this email or phone number already exists.' });
        }

        const emailOtp = genOTP();
        const phoneOtp = genOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        otpStore.set(email, { otp: emailOtp, expiresAt });
        otpStore.set(phone, { otp: phoneOtp, expiresAt });

        // ── Send via messaging service (real or mock) ──
        await Promise.all([
            sendEmail(
                email,
                'ASMS Registration — Email Verification',
                `Your email verification OTP is: ${emailOtp}. Valid for 5 minutes.`,
                otpEmailHtml(emailOtp, 'Email Verification')
            ),
            sendSMS(phone, `ASMS IIT Kanpur: Your phone verification OTP is ${phoneOtp}. Valid for 5 minutes. Do not share.`),
        ]);

        res.json({ message: 'Verification codes sent to your email and phone.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: `Failed to send OTPs: ${err.message}` });
    }
};

// ── USER REGISTRATION ─────────────────────────────────────────────────────────
exports.register = async (req, res) => {
    let { first_name, last_name, email, password, role, phone, emailOtp, phoneOtp } = req.body;

    try {
        email = email.trim().toLowerCase();
        phone = phone.trim();

        // ── Enforce iitk.ac.in domain (server-side) ──
        if (!isIITKEmail(email)) {
            return res.status(400).json({ error: 'Only iitk.ac.in email addresses are permitted.' });
        }

        // ── Block faculty/admin self-registration ──
        if (role && (role === 'faculty' || role === 'admin')) {
            return res.status(403).json({ error: 'Faculty and admin accounts must be created by a system administrator.' });
        }

        // ── Verify OTPs ──
        const storedEmail = otpStore.get(email);
        const storedPhone = otpStore.get(phone);

        if (!storedEmail || storedEmail.expiresAt < Date.now() || storedEmail.otp !== emailOtp) {
            return res.status(400).json({ error: 'Invalid or expired email OTP.' });
        }
        if (!storedPhone || storedPhone.expiresAt < Date.now() || storedPhone.otp !== phoneOtp) {
            return res.status(400).json({ error: 'Invalid or expired phone OTP.' });
        }

        // ── Duplicate check ──
        const exists = await query('SELECT id FROM users WHERE email ILIKE $1 OR phone = $2', [email, phone]);
        if (exists.rows.length > 0) {
            return res.status(400).json({ error: 'An account with this email or phone number already exists.' });
        }

        // ── Create user — always 'student' on public registration ──
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await query(
            `INSERT INTO users (first_name, last_name, email, password_hash, role, phone)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, email, first_name, last_name, role, phone, avatar_url, created_at`,
            [first_name, last_name, email, hashedPassword, 'student', phone]
        );

        otpStore.delete(email);
        otpStore.delete(phone);

        const token = issueTokens(newUser.rows[0], res);
        res.json({ token, user: newUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: `Registration failed: ${err.message}` });
    }
};

// ── USER LOGIN ────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
    let { email, password } = req.body;

    try {
        email = email.trim().toLowerCase();

        // ── Enforce @iitk.ac.in at login too ──
        if (!isIITKEmail(email)) {
            return res.status(400).json({ error: 'Only @iitk.ac.in email addresses are permitted.' });
        }

        const userResult = await query('SELECT * FROM users WHERE email ILIKE $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials.' });
        }

        const user = userResult.rows[0];

        // ── Lockout check ──
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            return res.status(403).json({ error: 'Account locked. Please contact the admin or try again later.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            const attempts = (user.failed_login_attempts || 0) + 1;
            if (attempts >= 5) {
                await query(
                    "UPDATE users SET failed_login_attempts = $1, locked_until = NOW() + INTERVAL '15 minutes' WHERE id = $2",
                    [attempts, user.id]
                );
                return res.status(403).json({ error: 'Account locked after 5 failed attempts. Try again in 15 minutes.' });
            }
            await query('UPDATE users SET failed_login_attempts = $1 WHERE id = $2', [attempts, user.id]);
            return res.status(400).json({ error: `Invalid credentials. ${5 - attempts} attempt(s) remaining.` });
        }

        // ── Reset counters on success ──
        if (user.failed_login_attempts > 0 || user.locked_until) {
            await query('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1', [user.id]);
        }

        const token = issueTokens(user, res);
        res.json({
            token,
            user: {
                id:         user.id,
                email:      user.email,
                first_name: user.first_name,
                last_name:  user.last_name,
                role:       user.role,
                phone:      user.phone,
                avatar_url: user.avatar_url,
            },
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: `Login failed: ${err.message}` });
    }
};

// ── FORGOT PASSWORD REQUEST ───────────────────────────────────────────────────
exports.forgotPasswordRequest = async (req, res) => {
    let { email } = req.body;
    try {
        if (!email) return res.status(400).json({ error: 'Email is required.' });
        email = email.trim().toLowerCase();
        if (!isIITKEmail(email)) {
            return res.status(400).json({ error: 'Only @iitk.ac.in email addresses are permitted.' });
        }

        const userCheck = await query('SELECT id FROM users WHERE email ILIKE $1', [email]);
        // Respond 200 even if user not found — prevents email enumeration
        if (userCheck.rows.length === 0) {
            return res.json({ message: 'If this email is registered, a reset OTP has been sent.' });
        }

        const otp = genOTP();
        resetOtpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

        await sendEmail(
            email,
            'ASMS — Password Reset OTP',
            `Your password reset OTP is: ${otp}. Valid for 5 minutes.`,
            otpEmailHtml(otp, 'Password Reset')
        );

        res.json({ message: 'If this email is registered, a reset OTP has been sent.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: `Password reset request failed: ${err.message}` });
    }
};

// ── RESET PASSWORD ────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
    let { email, otp, newPassword } = req.body;
    try {
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: 'Email, OTP and new password are required.' });
        }
        email = email.trim().toLowerCase();

        const storedData = resetOtpStore.get(email);
        if (!storedData || storedData.expiresAt < Date.now() || storedData.otp !== otp) {
            return res.status(400).json({ error: 'Invalid or expired OTP.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email ILIKE $2', [hashedPassword, email]);
        resetOtpStore.delete(email);

        res.json({ message: 'Password reset successfully. You can now log in.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: `Password reset failed: ${err.message}` });
    }
};

// ── REFRESH TOKEN ─────────────────────────────────────────────────────────────
exports.refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'No refresh token provided.' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
        const userResult = await query('SELECT * FROM users WHERE id = $1', [decoded.id]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'User no longer exists.' });
        }
        const newAccessToken = issueTokens(userResult.rows[0], res);
        res.json({ token: newAccessToken });
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired refresh token.' });
    }
};

// ── LOGOUT ────────────────────────────────────────────────────────────────────
exports.logout = (req, res) => {
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully.' });
};
// -- ADMIN: CREATE FACULTY / ADMIN ACCOUNT -------------------------------------
// Called only by authenticated admins. Bypasses OTP � admin vouches for the user.
exports.adminCreateUser = async (req, res) => {
    let { first_name, last_name, email, password, role, phone } = req.body;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ error: 'first_name, last_name, email and password are required.' });
    }

    email = email.trim().toLowerCase();

    if (!isIITKEmail(email)) {
        return res.status(400).json({ error: 'Only iitk.ac.in email addresses are permitted.' });
    }

    const allowedRoles = ['faculty', 'admin', 'student'];
    const assignedRole = allowedRoles.includes(role) ? role : 'faculty';

    try {
        const exists = await query('SELECT id FROM users WHERE email ILIKE $1', [email]);
        if (exists.rows.length > 0) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await query(
            `INSERT INTO users (first_name, last_name, email, password_hash, role, phone)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, email, first_name, last_name, role, created_at`,
            [first_name, last_name, email, hashedPassword, assignedRole, phone || null]
        );

        res.status(201).json({
            message: `${assignedRole} account created successfully.`,
            user: result.rows[0],
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: `Failed to create account: ${err.message}` });
    }
};
