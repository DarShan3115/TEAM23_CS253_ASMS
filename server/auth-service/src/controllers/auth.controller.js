const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// --- USER REGISTRATION ---
exports.register = async (req, res) => {
    const { first_name, last_name, email, password, role } = req.body;

    try {
        // Check if user exists
        let userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user into PostgreSQL
        const newUser = await pool.query(
            'INSERT INTO users (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, role',
            [first_name, last_name, email, hashedPassword, role || 'student']
        );

        // Create JWT with Role
        const payload = { user: { id: newUser.rows[0].id, role: newUser.rows[0].role } };
        
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: newUser.rows[0] });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Registration failed');
    }
};

// --- USER LOGIN ---
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid Credentials" });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid Credentials" });
        }

        // Issue JWT containing the User ID and Role
        const payload = { user: { id: user.id, role: user.role } };

        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' }, (err, token) => {
            if (err) throw err;
            res.json({ 
                token, 
                user: { id: user.id, first_name: user.first_name, role: user.role } 
            });
        });
    } catch (err) {
        res.status(500).send('Login failed');
    }
};