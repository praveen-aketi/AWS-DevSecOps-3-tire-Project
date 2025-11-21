const Joi = require('joi');
const { ValidationError } = require('../utils/errors');

// Validate request body, params, or query
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));

            const validationError = new ValidationError('Validation failed');
            validationError.errors = errors;
            return next(validationError);
        }

        req.body = value;
        next();
    };
};

// Validation schemas
const petSchemas = {
    create: Joi.object({
        name: Joi.string().min(2).max(50).required(),
        species: Joi.string().min(2).max(30).required(),
        age: Joi.number().integer().min(0).max(50).required(),
        breed: Joi.string().max(50).optional(),
        description: Joi.string().max(500).optional(),
    }),

    update: Joi.object({
        name: Joi.string().min(2).max(50).optional(),
        species: Joi.string().min(2).max(30).optional(),
        age: Joi.number().integer().min(0).max(50).optional(),
        breed: Joi.string().max(50).optional(),
        description: Joi.string().max(500).optional(),
    }).min(1),
};

const authSchemas = {
    register: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(100).required(),
        username: Joi.string().alphanum().min(3).max(30).required(),
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }),
};

module.exports = {
    validate,
    petSchemas,
    authSchemas,
};
