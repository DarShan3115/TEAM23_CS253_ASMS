const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@db:5432/asms_db';

console.log("Auth Service attempting to connect to:", connectionString);

const pool = new Pool({
    connectionString: connectionString
});

// Test the connection immediately
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('CRITICAL: Auth Service could not connect to DB!', err.stack);
    } else {
        console.log('PostgreSQL Connection Verified (Auth Service)');
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params)
};