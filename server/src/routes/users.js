/**
 * Users Routes
 * User profile and account management
 */

import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import User from '../database/models/User.js';
import UserProfile from '../database/models/UserProfile.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password_hash -mfa_secret');
        const profile = await UserProfile.findOne({ user_id: req.userId });

        res.json({
            success: true,
            data: {
                user,
                profile,
            },
        });
    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile',
        });
    }
});

/**
 * @route   PATCH /api/v1/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.patch('/me', async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        // Update basic user fields
        const allowedUserUpdates = ['name', 'email', 'phone_number'];
        Object.keys(req.body).forEach(key => {
            if (allowedUserUpdates.includes(key)) {
                user[key] = req.body[key];
            }
        });

        await user.save();

        // Update profile fields
        let profile = await UserProfile.findOne({ user_id: req.userId });
        if (!profile) {
            profile = new UserProfile({ user_id: req.userId });
        }

        const allowedProfileUpdates = [
            'bio',
            'avatar_url',
            'gender',
            'blood_type',
            'height_cm',
            'weight_kg',
            'allergies',
            'medical_conditions',
            'emergency_contact_name',
            'emergency_contact_phone',
            'emergency_contact_relationship',
        ];

        Object.keys(req.body).forEach(key => {
            if (allowedProfileUpdates.includes(key)) {
                profile[key] = req.body[key];
            }
        });

        // Handle encrypted fields
        if (req.body.date_of_birth) {
            profile.date_of_birth_encrypted = req.body.date_of_birth;
        }
        if (req.body.phone) {
            profile.setPhone(req.body.phone);
        }
        if (req.body.address) {
            profile.address_encrypted = req.body.address;
        }

        await profile.save();

        res.json({
            success: true,
            data: {
                user,
                profile,
            },
        });
    } catch (error) {
        logger.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile',
        });
    }
});

/**
 * @route   GET /api/v1/users/providers
 * @desc    Get list of all providers
 * @access  Private
 */
router.get('/providers', async (req, res) => {
    try {
        const { specialty } = req.query;
        const query = { role: 'provider', status: 'active' };

        const providers = await User.find(query).select('name email');
        const providerProfiles = await UserProfile.find({
            user_id: { $in: providers.map(p => p._id) },
        });

        // Filter by specialty if provided
        let filteredProviders = providers;
        if (specialty) {
            const specialtyProfileIds = providerProfiles
                .filter(p => p.specialty === specialty)
                .map(p => p.user_id.toString());
            
            filteredProviders = providers.filter(p =>
                specialtyProfileIds.includes(p._id.toString())
            );
        }

        // Combine user and profile data
        const result = filteredProviders.map(provider => {
            const profile = providerProfiles.find(
                p => p.user_id.toString() === provider._id.toString()
            );
            return {
                ...provider.toJSON(),
                specialty: profile?.specialty,
                bio: profile?.bio,
                avatar_url: profile?.avatar_url,
            };
        });

        res.json({
            success: true,
            count: result.length,
            data: result,
        });
    } catch (error) {
        logger.error('Get providers error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch providers',
        });
    }
});

/**
 * @route   DELETE /api/v1/users/me
 * @desc    Delete user account (soft delete)
 * @access  Private
 */
router.delete('/me', async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        user.status = 'deleted';
        user.email = `deleted_${Date.now()}_${user.email}`;
        await user.save();

        res.json({
            success: true,
            message: 'Account deleted successfully',
        });
    } catch (error) {
        logger.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete account',
        });
    }
});

export default router;
