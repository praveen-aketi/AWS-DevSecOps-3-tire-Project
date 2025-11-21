const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ValidationError, UnauthorizedError } = require('../utils/errors');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

class AuthService {
    // Register new user
    async register(userData) {
        const { username, email, password } = userData;

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            throw new ValidationError('Email or username already exists');
        }

        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Create user
        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, username, email, created_at`,
            [username, email, password_hash]
        );

        const user = result.rows[0];

        // Generate JWT token
        const token = this.generateToken(user.id);

        return { user, token };
    }

    // Login user
    async login(credentials) {
        const { email, password } = credentials;

        // Find user by email
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const user = result.rows[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // Generate JWT token
        const token = this.generateToken(user.id);

        // Remove password from response
        delete user.password_hash;

        return { user, token };
    }

    // Generate JWT token
    generateToken(userId) {
        return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }

    // Verify JWT token
    verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            throw new UnauthorizedError('Invalid or expired token');
        }
    }

    // Get user by ID
    async getUserById(userId) {
        const result = await pool.query(
            'SELECT id, username, email, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            throw new UnauthorizedError('User not found');
        }

        return result.rows[0];
    }
}

module.exports = new AuthService();
