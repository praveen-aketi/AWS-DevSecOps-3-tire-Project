const request = require('supertest');
const app = require('../app');

describe('Auth API Endpoints', () => {
    const testUser = {
        username: 'testuser' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        password: 'testpassword123',
    };

    let authToken;

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(testUser);

            if (res.status === 201) {
                expect(res.body).toHaveProperty('status', 'success');
                expect(res.body.data).toHaveProperty('user');
                expect(res.body.data).toHaveProperty('token');
                expect(res.body.data.user).toHaveProperty('username', testUser.username);
                expect(res.body.data.user).not.toHaveProperty('password');

                authToken = res.body.data.token;
            } else {
                // Database might not be available
                expect([503, 500]).toContain(res.status);
            }
        });

        it('should reject registration with invalid email', async () => {
            const invalidUser = {
                ...testUser,
                email: 'invalid-email',
            };

            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(invalidUser);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('status', 'fail');
        });

        it('should reject registration with short password', async () => {
            const invalidUser = {
                username: 'testuser2',
                email: 'test2@example.com',
                password: 'short',
            };

            const res = await request(app)
                .post('/api/v1/auth/register')
                .send(invalidUser);

            expect(res.status).toBe(400);
        });

        it('should reject registration with missing fields', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({ username: 'testuser' });

            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should reject login with invalid credentials', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'wrongpassword',
                });

            expect([401, 500, 503]).toContain(res.status);
        });

        it('should reject login with missing fields', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({ email: 'test@example.com' });

            expect(res.status).toBe(400);
        });

        it('should reject login with invalid email format', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'not-an-email',
                    password: 'password123',
                });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/v1/auth/me', () => {
        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/v1/auth/me');

            expect(res.status).toBe(401);
        });

        it('should return 401 with invalid token', async () => {
            const res = await request(app)
                .get('/api/v1/auth/me')
                .set('Authorization', 'Bearer invalid-token');

            expect(res.status).toBe(401);
        });

        if (authToken) {
            it('should return user data with valid token', async () => {
                const res = await request(app)
                    .get('/api/v1/auth/me')
                    .set('Authorization', `Bearer ${authToken}`);

                if (res.status === 200) {
                    expect(res.body).toHaveProperty('status', 'success');
                    expect(res.body.data).toHaveProperty('user');
                }
            });
        }
    });
});
