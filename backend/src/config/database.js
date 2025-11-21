const { Pool } = require('pg');
const logger = require('./logger');

// Database connection pool with improved configuration
const pool = new Pool({
    user: process.env.DB_USER || 'admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'petstoredb',
    password: process.env.DB_PASSWORD || 'changeMe1234!',
    port: process.env.DB_PORT || 5432,
    // Connection pool settings
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection fails
});

// Connection event handlers
pool.on('connect', (client) => {
    logger.info('New database connection established');
});

pool.on('acquire', (client) => {
    logger.debug('Client acquired from pool');
});

pool.on('remove', (client) => {
    logger.info('Client removed from pool');
});

pool.on('error', (err, client) => {
    logger.error('Unexpected database error on idle client', { error: err.message });
    process.exit(-1); // Exit process on database error
});

// Helper function to execute queries with retry logic
const queryWithRetry = async (text, params, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const result = await pool.query(text, params);
            return result;
        } catch (error) {
            logger.warn(`Query attempt ${i + 1} failed`, { error: error.message });

            // Only retry on connection errors
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                if (i < retries - 1) {
                    // Wait before retrying (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                    continue;
                }
            }

            throw error;
        }
    }
};

// Graceful shutdown
const closePool = async () => {
    logger.info('Closing database pool');
    await pool.end();
    logger.info('Database pool closed');
};

process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);

module.exports = { pool, queryWithRetry, closePool };
