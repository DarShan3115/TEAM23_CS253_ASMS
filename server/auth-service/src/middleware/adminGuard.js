/**
 * Admin Security Guard
 * Ensures that any request to an admin route has the 'admin' role
 * as verified in the signed JWT. This is the sole authorization check — 
 * the JWT signature guarantees the role cannot be forged.
 */
module.exports = function(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access Denied: Admin privileges required." });
    }
    next();
};
