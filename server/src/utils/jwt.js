/**
 * JWT Utilities
 * Token generation and validation
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('JWT secrets must be defined in environment variables');
}

/**
 * Generate access token
 * @param {object} payload - User data to encode
 * @returns {string} - JWT access token
 */
export function generateAccessToken(payload) {
    return jwt.sign(
        {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            type: 'access',
        },
        JWT_SECRET,
        {
            expiresIn: JWT_ACCESS_EXPIRY,
            issuer: 'docare-health',
            audience: 'docare-api',
        }
    );
}

/**
 * Generate refresh token
 * @param {object} payload - User data to encode
 * @returns {string} - JWT refresh token
 */
export function generateRefreshToken(payload) {
    return jwt.sign(
        {
            userId: payload.userId,
            type: 'refresh',
            jti: crypto.randomUUID(), // Unique token ID
        },
        JWT_REFRESH_SECRET,
        {
            expiresIn: JWT_REFRESH_EXPIRY,
            issuer: 'docare-health',
            audience: 'docare-api',
        }
    );
}

/**
 * Verify access token
 * @param {string} token - JWT token to verify
 * @returns {object} - Decoded payload
 */
export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET, {
            issuer: 'docare-health',
            audience: 'docare-api',
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Access token expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid access token');
        }
        throw error;
    }
}

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {object} - Decoded payload
 */
export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET, {
            issuer: 'docare-health',
            audience: 'docare-api',
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Refresh token expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid refresh token');
        }
        throw error;
    }
}

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {object} - Decoded payload
 */
export function decodeToken(token) {
    return jwt.decode(token);
}

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiration date
 */
export function getTokenExpiration(token) {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
        return null;
    }
    return new Date(decoded.exp * 1000);
}

export default {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    decodeToken,
    getTokenExpiration,
};
