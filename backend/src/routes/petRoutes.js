const express = require('express');
const petController = require('../controllers/petController');
const { validate, petSchemas } = require('../middleware/validator');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Pet:
 *       type: object
 *       required:
 *         - name
 *         - species
 *         - age
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         species:
 *           type: string
 *         age:
 *           type: integer
 *         breed:
 *           type: string
 *         description:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/pets:
 *   get:
 *     summary: Get all pets
 *     tags: [Pets]
 *     responses:
 *       200:
 *         description: List of all pets
 */
router.get('/', petController.getAllPets);

/**
 * @swagger
 * /api/v1/pets/{id}:
 *   get:
 *     summary: Get a pet by ID
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pet details
 *       404:
 *         description: Pet not found
 */
router.get('/:id', petController.getPetById);

/**
 * @swagger
 * /api/v1/pets:
 *   post:
 *     summary: Create a new pet
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pet'
 *     responses:
 *       201:
 *         description: Pet created successfully
 */
router.post('/', protect, validate(petSchemas.create), petController.createPet);

/**
 * @swagger
 * /api/v1/pets/{id}:
 *   put:
 *     summary: Update a pet
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pet'
 *     responses:
 *       200:
 *         description: Pet updated successfully
 */
router.put('/:id', protect, validate(petSchemas.update), petController.updatePet);

/**
 * @swagger
 * /api/v1/pets/{id}:
 *   delete:
 *     summary: Delete a pet
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Pet deleted successfully
 */
router.delete('/:id', protect, petController.deletePet);

module.exports = router;
