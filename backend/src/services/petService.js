const pool = require('../config/database');
const { NotFoundError } = require('../utils/errors');

class PetService {
    // Get all pets
    async getAllPets() {
        try {
            const result = await pool.query('SELECT * FROM pets ORDER BY created_at DESC');
            return result.rows;
        } catch (error) {
            // Fallback to mock data if database is unavailable
            if (error.code === 'ECONNREFUSED' || error.code === '3D000') {
                return [
                    { id: 1, name: 'Fluffy', species: 'Cat', age: 3, breed: 'Persian' },
                    { id: 2, name: 'Max', species: 'Dog', age: 5, breed: 'Golden Retriever' },
                    { id: 3, name: 'Whiskers', species: 'Cat', age: 2, breed: 'Siamese' },
                    { id: 4, name: 'Buddy', species: 'Dog', age: 4, breed: 'Labrador' },
                ];
            }
            throw error;
        }
    }

    // Get single pet by ID
    async getPetById(id) {
        const result = await pool.query('SELECT * FROM pets WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            throw new NotFoundError(`Pet with ID ${id} not found`);
        }

        return result.rows[0];
    }

    // Create new pet
    async createPet(petData) {
        const { name, species, age, breed, description } = petData;

        const result = await pool.query(
            `INSERT INTO pets (name, species, age, breed, description) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
            [name, species, age, breed, description]
        );

        return result.rows[0];
    }

    // Update pet
    async updatePet(id, petData) {
        // First check if pet exists
        await this.getPetById(id);

        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.entries(petData).forEach(([key, value]) => {
            fields.push(`${key} = $${paramCount}`);
            values.push(value);
            paramCount++;
        });

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const query = `
      UPDATE pets 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Delete pet
    async deletePet(id) {
        // First check if pet exists
        await this.getPetById(id);

        await pool.query('DELETE FROM pets WHERE id = $1', [id]);
        return { message: 'Pet deleted successfully' };
    }
}

module.exports = new PetService();
