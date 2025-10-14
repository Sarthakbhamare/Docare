/**
 * Devices Routes
 * Wearable device integration management
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Device from '../database/models/Device.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/devices
 * @desc    Get all devices for current user
 * @access  Private
 */
router.get('/', async (req, res) => {
    try {
        const devices = await Device.find({ user_id: req.userId })
            .select('-oauth_token_encrypted -oauth_refresh_token_encrypted')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: devices.length,
            data: devices,
        });
    } catch (error) {
        logger.error('Get devices error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch devices',
        });
    }
});

/**
 * @route   POST /api/v1/devices
 * @desc    Connect new device
 * @access  Private
 */
router.post('/', async (req, res) => {
    try {
        const {
            device_type,
            device_name,
            oauth_token,
            oauth_refresh_token,
            token_expires_at,
            permissions_granted,
        } = req.body;

        if (!device_type || !device_name) {
            return res.status(400).json({
                success: false,
                error: 'Device type and name are required',
            });
        }

        const device = new Device({
            user_id: req.userId,
            device_type,
            device_name,
            token_expires_at: token_expires_at ? new Date(token_expires_at) : null,
            permissions_granted: permissions_granted || [],
            is_active: true,
        });

        // Encrypt OAuth tokens
        if (oauth_token) device.setOAuthToken(oauth_token);
        if (oauth_refresh_token) device.setOAuthRefreshToken(oauth_refresh_token);

        await device.save();

        // Return device without encrypted tokens
        const deviceData = device.toJSON();
        delete deviceData.oauth_token_encrypted;
        delete deviceData.oauth_refresh_token_encrypted;

        res.status(201).json({
            success: true,
            data: deviceData,
        });
    } catch (error) {
        logger.error('Connect device error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to connect device',
        });
    }
});

/**
 * @route   PATCH /api/v1/devices/:id
 * @desc    Update device settings
 * @access  Private
 */
router.patch('/:id', async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);

        if (!device) {
            return res.status(404).json({
                success: false,
                error: 'Device not found',
            });
        }

        if (device.user_id.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized',
            });
        }

        const allowedUpdates = [
            'device_name',
            'is_active',
            'sync_frequency_minutes',
            'permissions_granted',
        ];

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                device[key] = req.body[key];
            }
        });

        await device.save();

        const deviceData = device.toJSON();
        delete deviceData.oauth_token_encrypted;
        delete deviceData.oauth_refresh_token_encrypted;

        res.json({
            success: true,
            data: deviceData,
        });
    } catch (error) {
        logger.error('Update device error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update device',
        });
    }
});

/**
 * @route   DELETE /api/v1/devices/:id
 * @desc    Disconnect device
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);

        if (!device) {
            return res.status(404).json({
                success: false,
                error: 'Device not found',
            });
        }

        if (device.user_id.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized',
            });
        }

        await Device.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Device disconnected successfully',
        });
    } catch (error) {
        logger.error('Disconnect device error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to disconnect device',
        });
    }
});

/**
 * @route   POST /api/v1/devices/:id/sync
 * @desc    Trigger manual sync for device
 * @access  Private
 */
router.post('/:id/sync', async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);

        if (!device) {
            return res.status(404).json({
                success: false,
                error: 'Device not found',
            });
        }

        if (device.user_id.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized',
            });
        }

        if (!device.is_active) {
            return res.status(400).json({
                success: false,
                error: 'Device is not active',
            });
        }

        // TODO: Implement actual device sync logic

        device.last_sync_at = new Date();
        await device.save();

        res.json({
            success: true,
            message: 'Sync initiated',
            data: {
                last_sync_at: device.last_sync_at,
            },
        });
    } catch (error) {
        logger.error('Sync device error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to sync device',
        });
    }
});

export default router;
