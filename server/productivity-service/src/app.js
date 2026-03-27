require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'productivity-service', timestamp: new Date().toISOString() });
});

app.get('/api/tasks', (_req, res) => {
  res.json({
    tasks: [],
    message: 'Connect to your database for real data',
  });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Productivity Service running on http://0.0.0.0:${PORT}`);
});
