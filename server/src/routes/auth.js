/**
 * Authentication Routes
 * Login, signup, token refresh, MFA
 */

import express from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

import User from '../database/models/User.js';
import UserProfile from '../database/models/UserProfile.js';
import RefreshToken from '../database/models/RefreshToken.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hash, generateToken } from '../utils/encryption.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, APIError } from '../middleware/errorHandler.js';
import { logAuditAction } from '../middleware/auditLogger.js';
import { validateRequest } from '../middleware/validator.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/v1/auth/signup
 * Register new user
 */
router.post(
    '/signup',
    authRateLimiter,
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('dateOfBirth').optional().isDate(),
        body('phone').optional().isMobilePhone(),
    ],
    validateRequest,
    asyncHandler(async (req, res) => {
        const { email, password, name, dateOfBirth, phone, gender } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new APIError('Email already registered', 409);
        }

        // Create user
        const user = await User.create({
            email,
            password_hash: password, // Will be hashed by model hook
            name,
            terms_accepted_at: new Date(),
            privacy_accepted_at: new Date(),
        });

        // Create profile
        const profile = await UserProfile.create({
            user_id: user.id,
            gender: gender || null,
        });

        if (dateOfBirth) {
            profile.setDateOfBirth(dateOfBirth);
        }
        if (phone) {
            profile.setPhone(phone);
        }
        await profile.save();

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            userId: user.id,
        });

        // Store refresh token
        await RefreshToken.create({
            user_id: user.id,
            token_hash: hash(refreshToken),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            ip_address: req.ip,
            user_agent: req.get('user-agent'),
        });

        // Audit log
        await logAuditAction(user.id, 'SIGNUP', {
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(201).json({
            success: true,
            data: {
                user: user.toSafeJSON(),
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_in: 900, // 15 minutes
            },
        });
    })
);

/**
 * POST /api/v1/auth/login
 * Authenticate user
 */
router.post(
    '/login',
    authRateLimiter,
    [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty(),
    ],
    validateRequest,
    asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new APIError('Invalid credentials', 401);
        }

        // Check account status
        if (user.status !== 'active') {
            throw new APIError('Account suspended or deactivated', 403);
        }

        // Check if locked
        if (user.locked_until && new Date() < new Date(user.locked_until)) {
            throw new APIError('Account temporarily locked', 403, {
                locked_until: user.locked_until,
            });
        }

        // Verify password
        const isValid = await user.validatePassword(password);
        if (!isValid) {
            // Increment failed attempts
            user.failed_login_attempts += 1;

            // Lock account after 5 failed attempts
            if (user.failed_login_attempts >= 5) {
                user.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
                await user.save();
                throw new APIError('Too many failed attempts. Account locked for 30 minutes', 403);
            }

            await user.save();
            throw new APIError('Invalid credentials', 401);
        }

        // Reset failed attempts
        user.failed_login_attempts = 0;
        user.locked_until = null;
        user.last_login_at = new Date();
        user.last_login_ip = req.ip;
        await user.save();

        // Check if MFA is enabled
        if (user.mfa_enabled) {
            // Return MFA challenge
            return res.json({
                success: true,
                mfa_required: true,
                user_id: user.id,
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            userId: user.id,
        });

        // Store refresh token
        await RefreshToken.create({
            user_id: user.id,
            token_hash: hash(refreshToken),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            ip_address: req.ip,
            user_agent: req.get('user-agent'),
        });

        // Audit log
        await logAuditAction(user.id, 'LOGIN', {
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            data: {
                user: user.toSafeJSON(),
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_in: 900,
            },
        });
    })
);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post(
    '/refresh',
    [body('refresh_token').notEmpty()],
    validateRequest,
    asyncHandler(async (req, res) => {
        const { refresh_token } = req.body;

        // Verify token
        const decoded = verifyRefreshToken(refresh_token);

        // Check if token exists and is not revoked
        const tokenRecord = await RefreshToken.findOne({
            where: {
                user_id: decoded.userId,
                token_hash: hash(refresh_token),
                is_revoked: false,
            },
        });

        if (!tokenRecord) {
            throw new APIError('Invalid or revoked refresh token', 401);
        }

        // Check expiration
        if (new Date() > new Date(tokenRecord.expires_at)) {
            throw new APIError('Refresh token expired', 401);
        }

        // Get user
        const user = await User.findByPk(decoded.userId);
        if (!user || user.status !== 'active') {
            throw new APIError('User not found or inactive', 401);
        }

        // Generate new access token
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        res.json({
            success: true,
            data: {
                access_token: accessToken,
                expires_in: 900,
            },
        });
    })
);

/**
 * POST /api/v1/auth/logout
 * Logout and revoke refresh token
 */
router.post(
    '/logout',
    authenticate,
    asyncHandler(async (req, res) => {
        const { refresh_token } = req.body;

        if (refresh_token) {
            // Revoke refresh token
            await RefreshToken.update(
                { is_revoked: true, revoked_at: new Date() },
                {
                    where: {
                        user_id: req.userId,
                        token_hash: hash(refresh_token),
                    },
                }
            );
        }

        // Audit log
        await logAuditAction(req.userId, 'LOGOUT', {
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    })
);

export default router;
