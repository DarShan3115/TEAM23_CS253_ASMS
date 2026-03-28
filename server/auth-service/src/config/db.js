const { Pool } = require('pg');

// Connect to the shared PostgreSQL database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@db:5432/asms_db'
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL (Auth Service)');
});

module.exports = pool;