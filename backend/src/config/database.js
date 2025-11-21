const { Pool } = require('pg');

// Database connection pool
const pool = new Pool({
    user: process.env.DB_USER || 'admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'petstoredb',
    password: process.env.DB_PASSWORD || 'changeMe1234!',
    port: process.env.DB_PORT || 5432,
});

// Test connection
pool.on('connect', () => {
    console.log('Database connected successfully');
});

pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
});

module.exports = pool;
