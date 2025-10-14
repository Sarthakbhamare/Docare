/**
 * Rate Limiting Middleware
 * Protect against brute force and DDoS attacks
 */

import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

/**
 * General API rate limiter
 */
export const rateLimiter = rateLimit({
    windowMs: WINDOW_MS,
    max: MAX_REQUESTS,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn('Rate limit exceeded:', {
            ip: req.ip,
            path: req.path,
        });
        res.status(429).json({
            success: false,
            error: 'Too many requests, please try again later',
        });
    },
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    skipSuccessfulRequests: true,
    message: {
        success: false,
        error: 'Too many login attempts, please try again later',
    },
    handler: (req, res) => {
        logger.warn('Auth rate limit exceeded:', {
            ip: req.ip,
            email: req.body?.email,
        });
        res.status(429).json({
            success: false,
            error: 'Too many authentication attempts. Account temporarily locked.',
            retry_after: 900, // seconds
        });
    },
});

/**
 * Rate limiter for document uploads
 */
export const uploadRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 uploads per hour
    message: {
        success: false,
        error: 'Upload limit exceeded, please try again later',
    },
});

/**
 * Rate limiter for sensitive operations
 */
export const sensitiveOpRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        success: false,
        error: 'Too many sensitive operations, please try again later',
    },
});

export default rateLimiter;
