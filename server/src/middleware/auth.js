/**
 * Authentication Middleware
 * JWT verification and user context injection
 */

import { verifyAccessToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import User from '../database/models/User.js';

/**
 * Verify JWT and attach user to request
 */
export const authenticate = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No authentication token provided',
            });
        }

        const token = authHeader.substring(7);

        // Verify token
        const decoded = verifyAccessToken(token);

        // Fetch user from database
        const user = await User.findById(decoded.userId).select('-password_hash -mfa_secret');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found',
            });
        }

        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                error: 'Account is suspended or deactivated',
            });
        }

        // Check if account is locked
        if (user.locked_until && new Date() < new Date(user.locked_until)) {
            return res.status(403).json({
                success: false,
                error: 'Account is temporarily locked',
                locked_until: user.locked_until,
            });
        }

        // Attach user to request
        req.user = user;
        req.userId = user.id;

        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        
        if (error.message.includes('expired')) {
            return res.status(401).json({
                success: false,
                error: 'Token expired',
                code: 'TOKEN_EXPIRED',
            });
        }

        return res.status(401).json({
            success: false,
            error: 'Invalid authentication token',
        });
    }
};

/**
 * Optional authentication (doesn't fail if no token)
 */
export const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    try {
        const token = authHeader.substring(7);
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.userId);
        
        if (user && user.status === 'active') {
            req.user = user;
            req.userId = user.id;
        }
    } catch (error) {
        // Silently fail for optional auth
        logger.debug('Optional auth failed:', error.message);
    }

    next();
};

/**
 * Require specific role
 */
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions',
            });
        }

        next();
    };
};

/**
 * Require MFA verification for sensitive operations
 */
export const requireMFA = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required',
        });
    }

    if (req.user.mfa_enabled && !req.headers['x-mfa-verified']) {
        return res.status(403).json({
            success: false,
            error: 'MFA verification required',
            code: 'MFA_REQUIRED',
        });
    }

    next();
};

export default {
    authenticate,
    optionalAuth,
    requireRole,
    requireMFA,
};
