const request = require('supertest');
const app = require('../app');

describe('Pet API Endpoints', () => {
    let authToken;

    // Test data
    const testPet = {
        name: 'TestPet',
        species: 'Dog',
        age: 3,
        breed: 'Test Breed',
        description: 'Test description',
    };

    describe('GET /api/v1/pets', () => {
        it('should return all pets', async () => {
            const res = await request(app).get('/api/v1/pets');

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('pets');
            expect(Array.isArray(res.body.data.pets)).toBe(true);
        });

        it('should return results count', async () => {
            const res = await request(app).get('/api/v1/pets');

            expect(res.body).toHaveProperty('results');
            expect(typeof res.body.results).toBe('number');
            expect(res.body.results).toBeGreaterThanOrEqual(0);
        });
    });

    describe('GET /api/v1/pets/:id', () => {
        it('should return a single pet by ID', async () => {
            const res = await request(app).get('/api/v1/pets/1');

            if (res.status === 200) {
                expect(res.body).toHaveProperty('status', 'success');
                expect(res.body.data).toHaveProperty('pet');
                expect(res.body.data.pet).toHaveProperty('id', 1);
            } else {
                expect(res.status).toBe(404);
            }
        });

        it('should return 404 for non-existent pet', async () => {
            const res = await request(app).get('/api/v1/pets/99999');

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('status', 'fail');
        });
    });

    describe('POST /api/v1/pets (requires auth)', () => {
        it('should return 401 without authentication', async () => {
            const res = await request(app)
                .post('/api/v1/pets')
                .send(testPet);

            expect(res.status).toBe(401);
        });

        it('should reject invalid pet data', async () => {
            const invalidPet = { name: 'X' }; // Invalid: too short, missing required fields

            const res = await request(app)
                .post('/api/v1/pets')
                .set('Authorization', 'Bearer fake-token')
                .send(invalidPet);

            expect([400, 401]).toContain(res.status);
        });
    });

    describe('PUT /api/v1/pets/:id (requires auth)', () => {
        it('should return 401 without authentication', async () => {
            const res = await request(app)
                .put('/api/v1/pets/1')
                .send({ age: 5 });

            expect(res.status).toBe(401);
        });
    });

    describe('DELETE /api/v1/pets/:id (requires auth)', () => {
        it('should return 401 without authentication', async () => {
            const res = await request(app).delete('/api/v1/pets/1');

            expect(res.status).toBe(401);
        });
    });
});
