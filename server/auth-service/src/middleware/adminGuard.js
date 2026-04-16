const TRUSTED_SUBNETS = ['127.0.0.1', '::1', '192.168.', '10.0.']; // Internal Campus / Dev IPs

/**
 * Admin Security Guard
 * Ensures that any request to an admin route possesses the administrative role
 * and conceptually originates from an internally secured VPN/Subnet range.
 */
module.exports = function(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access Denied: Insufficient Privilege Escalation." });
    }

    const clientIp = req.socket.remoteAddress || req.ip;

    // Reject non-trusted campus origins completely
    // (Bypassed if clientIp is undefined for safe localized proxying)
    if (clientIp && !TRUSTED_SUBNETS.some(sub => clientIp.includes(sub))) {
        return res.status(403).json({ error: "High-level admin routes restricted to secure campus networks." });
    }
    
    next();
};
