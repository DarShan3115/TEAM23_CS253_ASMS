const { query } = require('../config/db');
const bcrypt = require('bcryptjs');
const { otpStore } = require('../config/otpStore');
const { sendEmail, otpEmailHtml } = require('../config/messaging');

// Get the current user's full profile
exports.getProfile = async (req, res) => {
    try {
        const result = await query(
            'SELECT id, email, first_name, last_name, role, phone, avatar_url, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'User profile not found.' });
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
        let formattedPhone = phone;
        if (formattedPhone && formattedPhone.length === 10) {
            formattedPhone = '+91' + formattedPhone;
        }
        const result = await query(
            `UPDATE users SET first_name = $1, last_name = $2, phone = $3 WHERE id = $4
             RETURNING id, email, first_name, last_name, role, phone, avatar_url`,
            [first_name, last_name, formattedPhone, req.user.id]
        );
        res.json({ message: 'Profile updated successfully', user: result.rows[0] });
    } catch (err) {
        console.error("Profile Update Error:", err.message);
        res.status(500).json({ message: 'Server error while updating profile.' });
    }
};

// Send OTP for password change verification
exports.sendChangePasswordOtp = async (req, res) => {
    try {
        const userResult = await query('SELECT email FROM users WHERE id = $1', [req.user.id]);
        if (userResult.rows.length === 0) return res.status(404).json({ message: 'User not found.' });

        const email = userResult.rows[0].email;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Key: user's email, Value: {otp, expiresAt}
        otpStore.set(`pwd_change:${email}`, { otp, expiresAt });

        await sendEmail(
            email,
            'ASMS — Password Change Verification',
            `Your password change OTP is: ${otp}. Valid for 5 minutes.`,
            otpEmailHtml(otp, 'Password Change')
        );
        res.json({ message: `OTP sent to your registered email (${email}).` });
    } catch (err) {
        console.error("Send OTP Error:", err.message);
        res.status(500).json({ message: 'Server error while sending OTP.' });
    }
};

// Change password with enforced rules
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword, verificationCode } = req.body;
    try {
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'All password fields are required.' });
        }

        // --- Rule 1: new password cannot match current ---
        if (currentPassword === newPassword) {
            return res.status(400).json({ message: 'New password cannot be the same as your current password.' });
        }

        // --- Rule 2: new passwords must match ---
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'New passwords do not match.' });
        }

        // --- Rule 3: password strength ---
        const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!pwdRegex.test(newPassword)) {
            return res.status(400).json({ message: 'Password must be 8+ chars with uppercase, lowercase, number, and special character.' });
        }

        // --- Rule 4: OTP verification ---
        const userResult = await query('SELECT email, password_hash FROM users WHERE id = $1', [req.user.id]);
        if (userResult.rows.length === 0) return res.status(404).json({ message: 'User not found.' });

        const { email, password_hash } = userResult.rows[0];
        const otpKey = `pwd_change:${email}`;
        const storedOtp = otpStore.get(otpKey);

        if (!storedOtp) {
            return res.status(400).json({ message: 'No OTP found. Please request a new code.' });
        }
        if (Date.now() > storedOtp.expiresAt) {
            otpStore.delete(otpKey);
            return res.status(400).json({ message: 'OTP has expired. Please request a new code.' });
        }
        if (storedOtp.otp !== String(verificationCode)) {
            return res.status(400).json({ message: 'Invalid verification code.' });
        }

        // --- Rule 5: verify current password actually matches DB ---
        const isMatch = await bcrypt.compare(String(currentPassword), password_hash).catch(() => false);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        const hashedNew = await bcrypt.hash(String(newPassword), 10);
        await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedNew, req.user.id]);

        // Consume OTP
        otpStore.delete(otpKey);

        res.json({ message: 'Password changed successfully.' });
    } catch (err) {
        console.error("Password Change Error:", err.message);
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
};

// Upload Avatar
exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Please upload a valid JPG image.' });
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        const result = await query(
            'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING avatar_url',
            [avatarUrl, req.user.id]
        );
        res.json({ message: 'Avatar uploaded successfully', avatar_url: result.rows[0].avatar_url });
    } catch (err) {
        console.error("Avatar Upload Error:", err.message);
        res.status(500).json({ message: 'Server error during avatar upload.' });
    }
};