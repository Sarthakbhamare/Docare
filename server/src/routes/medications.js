/**
 * Medications Routes
 * Full CRUD operations for medication management
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Medication from '../database/models/Medication.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/medications
 * @desc    Get all medications for current user
 * @access  Private
 */
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const query = { user_id: req.userId };

        if (status) {
            query.status = status;
        }

        const medications = await Medication.find(query)
            .populate('prescribed_by', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: medications.length,
            data: medications,
        });
    } catch (error) {
        logger.error('Get medications error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch medications',
        });
    }
});

/**
 * @route   GET /api/v1/medications/:id
 * @desc    Get single medication
 * @access  Private
 */
router.get('/:id', async (req, res) => {
    try {
        const medication = await Medication.findById(req.params.id)
            .populate('prescribed_by', 'name email');

        if (!medication) {
            return res.status(404).json({
                success: false,
                error: 'Medication not found',
            });
        }

        // Check authorization
        if (medication.user_id.toString() !== req.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to access this medication',
            });
        }

        res.json({
            success: true,
            data: medication,
        });
    } catch (error) {
        logger.error('Get medication error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch medication',
        });
    }
});

/**
 * @route   POST /api/v1/medications
 * @desc    Add new medication
 * @access  Private
 */
router.post('/', async (req, res) => {
    try {
        const {
            prescribed_by,
            name,
            generic_name,
            dosage,
            frequency,
            route,
            start_date,
            end_date,
            pharmacy,
            refills_remaining,
            instructions,
            side_effects,
            reminder_enabled,
            reminder_times,
            notes,
        } = req.body;

        // Validate required fields
        if (!name || !dosage || !frequency || !start_date) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
        }

        const medication = new Medication({
            user_id: req.userId,
            prescribed_by,
            name,
            generic_name,
            dosage,
            frequency,
            route,
            start_date: new Date(start_date),
            end_date: end_date ? new Date(end_date) : null,
            pharmacy,
            refills_remaining,
            instructions,
            side_effects,
            reminder_enabled,
            reminder_times,
            notes,
            status: 'active',
        });

        await medication.save();

        const populated = await Medication.findById(medication._id)
            .populate('prescribed_by', 'name email');

        res.status(201).json({
            success: true,
            data: populated,
        });
    } catch (error) {
        logger.error('Create medication error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add medication',
        });
    }
});

/**
 * @route   PATCH /api/v1/medications/:id
 * @desc    Update medication
 * @access  Private
 */
router.patch('/:id', async (req, res) => {
    try {
        const medication = await Medication.findById(req.params.id);

        if (!medication) {
            return res.status(404).json({
                success: false,
                error: 'Medication not found',
            });
        }

        // Check authorization
        if (medication.user_id.toString() !== req.userId && req.user.role !== 'provider') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this medication',
            });
        }

        const allowedUpdates = [
            'dosage',
            'frequency',
            'route',
            'end_date',
            'pharmacy',
            'refills_remaining',
            'instructions',
            'side_effects',
            'reminder_enabled',
            'reminder_times',
            'status',
            'notes',
        ];

        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                medication[key] = req.body[key];
            }
        });

        await medication.save();

        const updated = await Medication.findById(medication._id)
            .populate('prescribed_by', 'name email');

        res.json({
            success: true,
            data: updated,
        });
    } catch (error) {
        logger.error('Update medication error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update medication',
        });
    }
});

/**
 * @route   DELETE /api/v1/medications/:id
 * @desc    Delete medication
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
    try {
        const medication = await Medication.findById(req.params.id);

        if (!medication) {
            return res.status(404).json({
                success: false,
                error: 'Medication not found',
            });
        }

        // Check authorization
        if (medication.user_id.toString() !== req.userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this medication',
            });
        }

        // Soft delete - mark as discontinued
        medication.status = 'discontinued';
        medication.end_date = new Date();
        await medication.save();

        res.json({
            success: true,
            message: 'Medication discontinued successfully',
        });
    } catch (error) {
        logger.error('Delete medication error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to discontinue medication',
        });
    }
});

/**
 * @route   POST /api/v1/medications/:id/refill
 * @desc    Request medication refill
 * @access  Private
 */
router.post('/:id/refill', async (req, res) => {
    try {
        const medication = await Medication.findById(req.params.id);

        if (!medication) {
            return res.status(404).json({
                success: false,
                error: 'Medication not found',
            });
        }

        // Check authorization
        if (medication.user_id.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized',
            });
        }

        if (medication.refills_remaining <= 0) {
            return res.status(400).json({
                success: false,
                error: 'No refills remaining. Please contact your provider.',
            });
        }

        medication.refills_remaining -= 1;
        await medication.save();

        // TODO: Send notification to pharmacy

        res.json({
            success: true,
            message: 'Refill request submitted',
            data: medication,
        });
    } catch (error) {
        logger.error('Refill request error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to request refill',
        });
    }
});

export default router;
