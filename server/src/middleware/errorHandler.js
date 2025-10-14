/**
 * Error Handler Middleware
 * Centralized error handling with security and compliance
 */

import { logger } from '../utils/logger.js';

/**
 * Not Found Handler (404)
 */
export const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Resource not found',
        path: req.path,
    });
};

/**
 * Global Error Handler
 */
export const errorHandler = (err, req, res, next) => {
    // Log error
    logger.error('Error occurred:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        userId: req.userId,
        requestId: req.id,
    });

    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    // Prepare error response
    const errorResponse = {
        success: false,
        error: getErrorMessage(err, statusCode),
        request_id: req.id,
    };

    // Add additional details in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
        errorResponse.details = err.details || null;
    }

    // Handle specific error types
    if (err.name === 'ValidationError') {
        errorResponse.validation_errors = formatValidationErrors(err);
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        errorResponse.error = 'Resource already exists';
        errorResponse.field = err.fields ? Object.keys(err.fields)[0] : null;
    }

    if (err.name === 'SequelizeForeignKeyConstraintError') {
        errorResponse.error = 'Referenced resource not found';
    }

    // Send error response
    res.status(statusCode).json(errorResponse);
};

/**
 * Get safe error message (don't expose internal details)
 */
function getErrorMessage(err, statusCode) {
    // In production, use generic messages for 5xx errors
    if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
        return 'An internal server error occurred';
    }

    // Custom error messages
    if (err.message) {
        return err.message;
    }

    // Default messages by status code
    const defaultMessages = {
        400: 'Bad request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not found',
        409: 'Conflict',
        422: 'Validation failed',
        429: 'Too many requests',
        500: 'Internal server error',
    };

    return defaultMessages[statusCode] || 'An error occurred';
}

/**
 * Format validation errors
 */
function formatValidationErrors(err) {
    if (err.errors && Array.isArray(err.errors)) {
        return err.errors.map(e => ({
            field: e.path,
            message: e.message,
            type: e.type,
        }));
    }

    return null;
}

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
    constructor(message, statusCode = 500, details = null) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Async error wrapper
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export default {
    notFoundHandler,
    errorHandler,
    APIError,
    asyncHandler,
};
