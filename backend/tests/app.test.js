const request = require('supertest');
const app = require('../app');

describe('Health Check Endpoints', () => {
    describe('GET /', () => {
        it('should return welcome message', async () => {
            const res = await request(app).get('/');
            expect(res.status).toBe(200);
            expect(res.text).toContain('SecurePetStore');
        });
    });

    describe('GET /health', () => {
        it('should return healthy status', async () => {
            const res = await request(app).get('/health');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('status', 'healthy');
        });
    });

    describe('GET /health/live', () => {
        it('should return alive status', async () => {
            const res = await request(app).get('/health/live');
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('status', 'alive');
        });
    });

    describe('GET /health/ready', () => {
        it('should check database connection', async () => {
            const res = await request(app).get('/health/ready');
            expect(res.status).toBeGreaterThanOrEqual(200);
            expect(res.body).toHaveProperty('status');
            expect(res.body).toHaveProperty('database');
        });
    });
});

describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
        const res = await request(app).get('/api/v1/unknown');
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('status', 'fail');
    });
});
