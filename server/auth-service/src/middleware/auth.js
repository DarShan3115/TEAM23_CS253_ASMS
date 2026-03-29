const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * * Intercepts requests to protected routes, verifies the JWT provided 
 * in the 'x-auth-token' header, and attaches the decoded user data 
 * (id and role) to the request object.
 */
module.exports = function(req, res, next) {
    // 1. Extract the token from the custom header
    const token = req.header('x-auth-token');

    // 2. Check if the token exists
    if (!token) {
        return res.status(401).json({ message: 'No authorization token found. Access denied.' });
    }

    try {
        // 3. Verify the token using the secret key
        // The payload in your auth.routes.js is { id, role }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        
        // 4. Attach the decoded payload to the request object
        req.user = decoded; 
        
        // 5. Move to the next middleware or controller
        next();
    } catch (err) {
        // Handle invalid or expired tokens
        res.status(401).json({ message: 'Token is invalid or has expired.' });
    }
};