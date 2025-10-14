/**
 * Request Validation Middleware
 * Express-validator integration
 */

import { validationResult } from 'express-validator';
import { APIError } from './errorHandler.js';

/**
 * Validate request and return errors
 */
export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            field: err.param,
            message: err.msg,
            value: err.value,
        }));

        throw new APIError('Validation failed', 422, { errors: formattedErrors });
    }

    next();
};

export default validateRequest;
