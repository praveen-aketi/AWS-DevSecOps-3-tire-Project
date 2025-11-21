const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { swaggerUi, swaggerDocs } = require('./src/config/swagger');
const { correlationIdMiddleware, requestLoggerMiddleware } = require('./src/middleware/logging');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const securityMiddleware = require('./src/middleware/security');
const logger = require('./src/config/logger');

// Import routes
const petRoutes = require('./src/routes/petRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();

// Security middleware (helmet, sanitization, etc.)
securityMiddleware(app);

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use(correlationIdMiddleware);
app.use(requestLoggerMiddleware);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Health checks
app.get('/', (req, res) => {
    res.send('Welcome to SecurePetStore Backend API!');
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

app.get('/health/ready', async (req, res) => {
    // Check database connection
    const { pool } = require('./src/config/database');
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ status: 'ready', database: 'connected' });
    } catch (error) {
        req.logger.error('Health check failed', { error: error.message });
        res.status(503).json({ status: 'not ready', database: 'disconnected' });
    }
});

app.get('/health/live', (req, res) => {
    res.status(200).json({ status: 'alive' });
});

// API Routes v1
app.use('/api/v1/pets', petRoutes);
app.use('/api/v1/auth', authRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

module.exports = app;
