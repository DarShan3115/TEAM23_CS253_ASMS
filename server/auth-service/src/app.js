require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');

const app = express();
const PORT = process.env.PORT || 5001;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

// ── Health Check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() });
});

// ── Error Handler ─────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong.' });
});

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Auth Service running on http://localhost:${PORT}`);
});
