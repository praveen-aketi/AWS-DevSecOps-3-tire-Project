const logger = require('../config/logger');

// Global error handler
const errorHandler = (err, req, res, next) => {
    const requestLogger = req.logger || logger;

    // Set default values
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error
    if (err.statusCode >= 500) {
        requestLogger.error({
            message: err.message,
            stack: err.stack,
            isOperational: err.isOperational,
        });
    } else {
        requestLogger.warn({
            message: err.message,
            statusCode: err.statusCode,
        });
    }

    // Send error response
    const errorResponse = {
        status: err.status,
        message: err.message,
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }

    // Include validation errors if present
    if (err.errors) {
        errorResponse.errors = err.errors;
    }

    res.status(err.statusCode).json(errorResponse);
};

// 404 handler
const notFoundHandler = (req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    error.status = 'fail';
    next(error);
};

// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
};
