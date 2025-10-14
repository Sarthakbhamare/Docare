/**
 * Appointments Routes
 * Full CRUD operations for appointment management
 */

import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import Appointment from '../database/models/Appointment.js';
import User from '../database/models/User.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/appointments
 * @desc    Get all appointments for current user
 * @access  Private
 */
router.get('/', async (req, res) => {
    try {
        const { status, from, to, provider_id } = req.query;
        const query = {};

        // Build query based on user role
        if (req.user.role === 'patient') {
            query.patient_id = req.userId;
        } else if (req.user.role === 'provider') {
            query.provider_id = req.userId;
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by provider (for patients)
        if (provider_id && req.user.role === 'patient') {
            query.provider_id = provider_id;
        }

        // Filter by date range
        if (from || to) {
            query.scheduled_start = {};
            if (from) query.scheduled_start.$gte = new Date(from);
            if (to) query.scheduled_start.$lte = new Date(to);
        }

        const appointments = await Appointment.find(query)
            .populate('patient_id', 'name email')
            .populate('provider_id', 'name email')
            .sort({ scheduled_start: 1 });

        res.json({
            success: true,
            count: appointments.length,
            data: appointments,
        });
    } catch (error) {
        logger.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch appointments',
        });
    }
});

/**
 * @route   GET /api/v1/appointments/:id
 * @desc    Get single appointment
 * @access  Private
 */
router.get('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient_id', 'name email')
            .populate('provider_id', 'name email');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found',
            });
        }

        // Check authorization
        const isPatient = appointment.patient_id._id.toString() === req.userId;
        const isProvider = appointment.provider_id._id.toString() === req.userId;
        const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

        if (!isPatient && !isProvider && !isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to access this appointment',
            });
        }

        res.json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        logger.error('Get appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch appointment',
        });
    }
});

/**
 * @route   POST /api/v1/appointments
 * @desc    Create new appointment
 * @access  Private (Patient)
 */
router.post('/', async (req, res) => {
    try {
        const {
            provider_id,
            appointment_type,
            scheduled_start,
            scheduled_end,
            reason,
            notes,
        } = req.body;

        // Validate required fields
        if (!provider_id || !appointment_type || !scheduled_start || !scheduled_end) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
        }

        // Verify provider exists
        const provider = await User.findById(provider_id);
        if (!provider || provider.role !== 'provider') {
            return res.status(400).json({
                success: false,
                error: 'Invalid provider',
            });
        }

        // Check for scheduling conflicts
        const conflict = await Appointment.findOne({
            provider_id,
            status: { $in: ['scheduled', 'confirmed', 'in-progress'] },
            $or: [
                {
                    scheduled_start: { $lte: new Date(scheduled_start) },
                    scheduled_end: { $gt: new Date(scheduled_start) },
                },
                {
                    scheduled_start: { $lt: new Date(scheduled_end) },
                    scheduled_end: { $gte: new Date(scheduled_end) },
                },
            ],
        });

        if (conflict) {
            return res.status(409).json({
                success: false,
                error: 'Provider is not available at this time',
            });
        }

        // Create appointment
        const appointment = new Appointment({
            patient_id: req.userId,
            provider_id,
            appointment_type,
            scheduled_start: new Date(scheduled_start),
            scheduled_end: new Date(scheduled_end),
            reason,
            notes,
            status: 'scheduled',
        });

        await appointment.save();

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('patient_id', 'name email')
            .populate('provider_id', 'name email');

        res.status(201).json({
            success: true,
            data: populatedAppointment,
        });
    } catch (error) {
        logger.error('Create appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create appointment',
        });
    }
});

/**
 * @route   PATCH /api/v1/appointments/:id
 * @desc    Update appointment (reschedule, update status)
 * @access  Private
 */
router.patch('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found',
            });
        }

        // Check authorization
        const isPatient = appointment.patient_id.toString() === req.userId;
        const isProvider = appointment.provider_id.toString() === req.userId;
        const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

        if (!isPatient && !isProvider && !isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this appointment',
            });
        }

        const {
            scheduled_start,
            scheduled_end,
            status,
            notes,
            cancellation_reason,
        } = req.body;

        // If rescheduling, check for conflicts
        if (scheduled_start || scheduled_end) {
            const newStart = scheduled_start ? new Date(scheduled_start) : appointment.scheduled_start;
            const newEnd = scheduled_end ? new Date(scheduled_end) : appointment.scheduled_end;

            const conflict = await Appointment.findOne({
                _id: { $ne: appointment._id },
                provider_id: appointment.provider_id,
                status: { $in: ['scheduled', 'confirmed', 'in-progress'] },
                $or: [
                    {
                        scheduled_start: { $lte: newStart },
                        scheduled_end: { $gt: newStart },
                    },
                    {
                        scheduled_start: { $lt: newEnd },
                        scheduled_end: { $gte: newEnd },
                    },
                ],
            });

            if (conflict) {
                return res.status(409).json({
                    success: false,
                    error: 'Provider is not available at this time',
                });
            }

            appointment.scheduled_start = newStart;
            appointment.scheduled_end = newEnd;
        }

        // Update other fields
        if (status) {
            appointment.status = status;
            
            if (status === 'cancelled' && cancellation_reason) {
                appointment.cancellation_reason = cancellation_reason;
                appointment.cancelled_at = new Date();
            }
        }

        if (notes) appointment.notes = notes;

        await appointment.save();

        const updated = await Appointment.findById(appointment._id)
            .populate('patient_id', 'name email')
            .populate('provider_id', 'name email');

        res.json({
            success: true,
            data: updated,
        });
    } catch (error) {
        logger.error('Update appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update appointment',
        });
    }
});

/**
 * @route   DELETE /api/v1/appointments/:id
 * @desc    Cancel/delete appointment
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                error: 'Appointment not found',
            });
        }

        // Check authorization
        const isPatient = appointment.patient_id.toString() === req.userId;
        const isProvider = appointment.provider_id.toString() === req.userId;
        const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

        if (!isPatient && !isProvider && !isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to cancel this appointment',
            });
        }

        // Soft delete - mark as cancelled instead of deleting
        appointment.status = 'cancelled';
        appointment.cancelled_at = new Date();
        appointment.cancellation_reason = req.body.reason || 'Cancelled by user';
        await appointment.save();

        res.json({
            success: true,
            message: 'Appointment cancelled successfully',
        });
    } catch (error) {
        logger.error('Delete appointment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel appointment',
        });
    }
});

/**
 * @route   GET /api/v1/appointments/providers/available
 * @desc    Get available time slots for providers
 * @access  Private (Patient)
 */
router.get('/providers/available', async (req, res) => {
    try {
        const { provider_id, date } = req.query;

        if (!provider_id || !date) {
            return res.status(400).json({
                success: false,
                error: 'Provider ID and date are required',
            });
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Get all booked appointments for this provider on this date
        const bookedAppointments = await Appointment.find({
            provider_id,
            status: { $in: ['scheduled', 'confirmed', 'in-progress'] },
            scheduled_start: { $gte: startOfDay, $lte: endOfDay },
        }).select('scheduled_start scheduled_end');

        // Generate available slots (9 AM - 5 PM, 30-min intervals)
        const slots = [];
        const workStart = 9;
        const workEnd = 17;
        
        for (let hour = workStart; hour < workEnd; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const slotStart = new Date(date);
                slotStart.setHours(hour, minute, 0, 0);
                
                const slotEnd = new Date(slotStart);
                slotEnd.setMinutes(slotEnd.getMinutes() + 30);

                // Check if slot is available
                const isBooked = bookedAppointments.some(apt => {
                    return (
                        (slotStart >= apt.scheduled_start && slotStart < apt.scheduled_end) ||
                        (slotEnd > apt.scheduled_start && slotEnd <= apt.scheduled_end)
                    );
                });

                if (!isBooked) {
                    slots.push({
                        start: slotStart,
                        end: slotEnd,
                    });
                }
            }
        }

        res.json({
            success: true,
            count: slots.length,
            data: slots,
        });
    } catch (error) {
        logger.error('Get available slots error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch available slots',
        });
    }
});

export default router;
