const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorHandler');

class AuthController {
    // POST /api/v1/auth/register
    register = asyncHandler(async (req, res) => {
        req.logger.info('User registration attempt', { email: req.body.email });

        const { user, token } = await authService.register(req.body);

        res.status(201).json({
            status: 'success',
            data: { user, token },
        });
    });

    // POST /api/v1/auth/login
    login = asyncHandler(async (req, res) => {
        req.logger.info('User login attempt', { email: req.body.email });

        const { user, token } = await authService.login(req.body);

        res.status(200).json({
            status: 'success',
            data: { user, token },
        });
    });

    // GET /api/v1/auth/me
    getMe = asyncHandler(async (req, res) => {
        res.status(200).json({
            status: 'success',
            data: { user: req.user },
        });
    });
}

module.exports = new AuthController();
