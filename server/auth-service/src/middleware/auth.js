const jwt = require('jsonwebtoken');

// Fail fast if JWT_SECRET is absent — tokens cannot be verified safely.
if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET must be set in the environment.');
    process.exit(1);
}

/**
 * Authentication Middleware
 * Verifies the JWT provided in the 'x-auth-token' header and attaches
 * the decoded user payload (id, role) to req.user.
 */
module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ message: 'No authorization token found. Access denied.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is invalid or has expired.' });
    }
};