const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

// Add correlation ID to each request
const correlationIdMiddleware = (req, res, next) => {
    req.correlationId = req.headers['x-correlation-id'] || uuidv4();
    res.setHeader('x-correlation-id', req.correlationId);
    req.logger = logger.createChildLogger(req.correlationId);
    next();
};

// Log all requests
const requestLoggerMiddleware = (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        req.logger.info({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        });
    });

    next();
};

module.exports = {
    correlationIdMiddleware,
    requestLoggerMiddleware,
};
