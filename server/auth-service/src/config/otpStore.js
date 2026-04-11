/**
 * Shared OTP Store
 * Centralized in-memory map to avoid circular imports between controllers.
 * Keys: email address | Values: { otp, expiresAt }
 */
const otpStore = new Map();

module.exports = { otpStore };
