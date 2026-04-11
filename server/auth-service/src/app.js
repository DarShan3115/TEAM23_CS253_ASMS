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

// Middleware
// Dynamic CORS configuration to support local dev and Codespaces
app.use(cors({
  origin: true, // Reflects the request origin back, allowing any site to access (safe behind proxy)
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rate Limiters
// Rate Limiters - increased for development flexibility
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Allow 1000 requests to avoid "unreachable" errors during testing
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', generalLimiter);

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