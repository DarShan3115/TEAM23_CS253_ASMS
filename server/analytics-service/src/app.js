require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const analyticsRoutes = require('./routes/analytics.routes');

const app = express();
const PORT = process.env.PORT || 8001;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'analytics-service', timestamp: new Date().toISOString() });
});

app.use('/api/analytics', analyticsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Analytics Service running on http://0.0.0.0:${PORT}`);
});
