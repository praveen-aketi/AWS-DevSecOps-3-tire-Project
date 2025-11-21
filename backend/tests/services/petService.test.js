const petService = require('../../src/services/petService');
const { NotFoundError } = require('../../src/utils/errors');

// Mock the database
jest.mock('../../src/config/database', () => ({
    pool: {
        query: jest.fn(),
    },
}));

const { pool } = require('../../src/config/database');

describe('PetService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllPets', () => {
        it('should return all pets from database', async () => {
            const mockPets = [
                { id: 1, name: 'Fluffy', species: 'Cat', age: 3 },
                { id: 2, name: 'Max', species: 'Dog', age: 5 },
            ];

            pool.query.mockResolvedValue({ rows: mockPets });

            const result = await petService.getAllPets();

            expect(result).toEqual(mockPets);
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM pets ORDER BY created_at DESC');
        });

        it('should return mock data on database error', async () => {
            pool.query.mockRejectedValue({ code: 'ECONNREFUSED' });

            const result = await petService.getAllPets();

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });
    });

    describe('getPetById', () => {
        it('should return pet by ID', async () => {
            const mockPet = { id: 1, name: 'Fluffy', species: 'Cat', age: 3 };
            pool.query.mockResolvedValue({ rows: [mockPet] });

            const result = await petService.getPetById(1);

            expect(result).toEqual(mockPet);
            expect(pool.query).toHaveBeenCalledWith('SELECT * FROM pets WHERE id = $1', [1]);
        });

        it('should throw NotFoundError if pet does not exist', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(petService.getPetById(999)).rejects.toThrow(NotFoundError);
        });
    });

    describe('createPet', () => {
        it('should create a new pet', async () => {
            const petData = {
                name: 'Rocky',
                species: 'Dog',
                age: 3,
                breed: 'Bulldog',
                description: 'Friendly dog',
            };

            const mockCreatedPet = { id: 5, ...petData };
            pool.query.mockResolvedValue({ rows: [mockCreatedPet] });

            const result = await petService.createPet(petData);

            expect(result).toEqual(mockCreatedPet);
            expect(pool.query).toHaveBeenCalled();
        });
    });

    describe('updatePet', () => {
        it('should update an existing pet', async () => {
            const mockPet = { id: 1, name: 'Fluffy', species: 'Cat', age: 3 };
            const updateData = { age: 4 };
            const updatedPet = { ...mockPet, age: 4 };

            pool.query
                .mockResolvedValueOnce({ rows: [mockPet] }) // getPetById
                .mockResolvedValueOnce({ rows: [updatedPet] }); // update

            const result = await petService.updatePet(1, updateData);

            expect(result).toEqual(updatedPet);
        });

        it('should throw NotFoundError if pet does not exist', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(petService.updatePet(999, { age: 5 })).rejects.toThrow(NotFoundError);
        });
    });

    describe('deletePet', () => {
        it('should delete a pet', async () => {
            const mockPet = { id: 1, name: 'Fluffy' };
            pool.query
                .mockResolvedValueOnce({ rows: [mockPet] }) // getPetById
                .mockResolvedValueOnce({ rows: [] }); // delete

            const result = await petService.deletePet(1);

            expect(result).toHaveProperty('message');
        });

        it('should throw NotFoundError if pet does not exist', async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await expect(petService.deletePet(999)).rejects.toThrow(NotFoundError);
        });
    });
});
