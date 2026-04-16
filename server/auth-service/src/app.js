require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const adminRoutes = require('./routes/admin.routes');
require('./config/db'); // Initialize DB connection

const app = express();

// Explicit CORS allowlist — never reflect arbitrary origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  ...(process.env.CODESPACE_NAME
    ? [`https://${process.env.CODESPACE_NAME}-3000.app.github.dev`]
    : []),
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, Postman) or known origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// General API rate limiter — reasonable production limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Strict limiter for auth endpoints (login, OTP) — brute-force protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again in 15 minutes.' },
});

app.use('/api', generalLimiter);
app.use('/api/auth/send-otp', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/users/send-change-otp', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Basic Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'auth-service' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});

module.exports = app;