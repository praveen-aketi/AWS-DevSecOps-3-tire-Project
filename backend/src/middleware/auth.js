const authService = require('../services/authService');
const { UnauthorizedError } = require('../utils/errors');
const { asyncHandler } = require('./errorHandler');

// Protect routes - require authentication
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new UnauthorizedError('Please log in to access this resource');
    }

    // Verify token
    const decoded = authService.verifyToken(token);

    // Get user from token
    const user = await authService.getUserById(decoded.userId);
    req.user = user;

    next();
});

// Optional authentication - add user if token is valid, but don't require it
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            const decoded = authService.verifyToken(token);
            const user = await authService.getUserById(decoded.userId);
            req.user = user;
        }
    } catch (error) {
        // Silently fail - authentication is optional
    }

    next();
};

module.exports = { protect, optionalAuth };
