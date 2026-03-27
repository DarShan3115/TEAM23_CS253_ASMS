const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'password'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'asms_db'}`;

const pool = new Pool({ connectionString });

pool.on('connect', () => console.log('Academic service connected to PostgreSQL'));
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
