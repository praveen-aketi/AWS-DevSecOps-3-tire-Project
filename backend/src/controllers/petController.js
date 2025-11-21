const petService = require('../services/petService');
const { asyncHandler } = require('../middleware/errorHandler');

class PetController {
    // GET /api/v1/pets
    getAllPets = asyncHandler(async (req, res) => {
        req.logger.info('Fetching all pets');
        const pets = await petService.getAllPets();

        res.status(200).json({
            status: 'success',
            results: pets.length,
            data: { pets },
        });
    });

    // GET /api/v1/pets/:id
    getPetById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        req.logger.info(`Fetching pet with ID: ${id}`);

        const pet = await petService.getPetById(id);

        res.status(200).json({
            status: 'success',
            data: { pet },
        });
    });

    // POST /api/v1/pets
    createPet = asyncHandler(async (req, res) => {
        req.logger.info('Creating new pet', { petData: req.body });

        const pet = await petService.createPet(req.body);

        res.status(201).json({
            status: 'success',
            data: { pet },
        });
    });

    // PUT /api/v1/pets/:id
    updatePet = asyncHandler(async (req, res) => {
        const { id } = req.params;
        req.logger.info(`Updating pet with ID: ${id}`, { petData: req.body });

        const pet = await petService.updatePet(id, req.body);

        res.status(200).json({
            status: 'success',
            data: { pet },
        });
    });

    // DELETE /api/v1/pets/:id
    deletePet = asyncHandler(async (req, res) => {
        const { id } = req.params;
        req.logger.info(`Deleting pet with ID: ${id}`);

        await petService.deletePet(id);

        res.status(204).send();
    });
}

module.exports = new PetController();
