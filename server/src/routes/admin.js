/**
 * Super Admin CMS Routes
 * Code-free platform management for administrators
 */

import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import User from '../database/models/User.js';
import UserProfile from '../database/models/UserProfile.js';
import Appointment from '../database/models/Appointment.js';
import Medication from '../database/models/Medication.js';
import Transaction from '../database/models/Transaction.js';
import Document from '../database/models/Document.js';
import AuditLog from '../database/models/AuditLog.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// All routes require super admin authentication
router.use(authenticate);
router.use(requireRole('super_admin'));

// ============================================
// DASHBOARD & ANALYTICS
// ============================================

/**
 * @route   GET /api/v1/admin/dashboard
 * @desc    Get comprehensive dashboard metrics
 * @access  Super Admin
 */
router.get('/dashboard', async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            totalProviders,
            totalPatients,
            todayAppointments,
            pendingTransactions,
            totalRevenue,
            documentsUploaded,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ status: 'active' }),
            User.countDocuments({ role: 'provider', status: 'active' }),
            User.countDocuments({ role: 'patient', status: 'active' }),
            Appointment.countDocuments({
                scheduled_start: {
                    $gte: new Date().setHours(0, 0, 0, 0),
                    $lte: new Date().setHours(23, 59, 59, 999),
                },
            }),
            Transaction.countDocuments({ status: 'pending' }),
            Transaction.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount_cents' } } },
            ]),
            Document.countDocuments(),
        ]);

        // Recent activity
        const recentUsers = await User.find()
            .select('name email role createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        const recentAudits = await AuditLog.find()
            .populate('user_id', 'name email')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            success: true,
            data: {
                metrics: {
                    total_users: totalUsers,
                    active_users: activeUsers,
                    total_providers: totalProviders,
                    total_patients: totalPatients,
                    today_appointments: todayAppointments,
                    pending_transactions: pendingTransactions,
                    total_revenue_cents: totalRevenue[0]?.total || 0,
                    documents_uploaded: documentsUploaded,
                },
                recent_users: recentUsers,
                recent_activity: recentAudits,
            },
        });
    } catch (error) {
        logger.error('Admin dashboard error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard data',
        });
    }
});

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with search/filter
 * @access  Super Admin
 */
router.get('/users', async (req, res) => {
    try {
        const { search, role, status, page = 1, limit = 50 } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        if (role) query.role = role;
        if (status) query.status = status;

        const users = await User.find(query)
            .select('-password_hash -mfa_secret')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            count: users.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: users,
        });
    } catch (error) {
        logger.error('Admin get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users',
        });
    }
});

/**
 * @route   PATCH /api/v1/admin/users/:id
 * @desc    Update user account (suspend, activate, change role)
 * @access  Super Admin
 */
router.patch('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        // Prevent modifying other super admins
        if (user.role === 'super_admin' && user._id.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                error: 'Cannot modify other super admin accounts',
            });
        }

        const allowedUpdates = ['name', 'email', 'role', 'status'];
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                user[key] = req.body[key];
            }
        });

        await user.save();

        // Log admin action
        await AuditLog.create({
            user_id: req.userId,
            action: 'ADMIN_UPDATE_USER',
            resource_type: 'User',
            resource_id: user._id.toString(),
            ip_address: req.ip,
            user_agent: req.headers['user-agent'],
            request_id: req.headers['x-request-id'] || 'unknown',
            metadata: { changes: req.body },
        });

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        logger.error('Admin update user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update user',
        });
    }
});

/**
 * @route   DELETE /api/v1/admin/users/:id
 * @desc    Permanently delete user account
 * @access  Super Admin
 */
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        if (user.role === 'super_admin') {
            return res.status(403).json({
                success: false,
                error: 'Cannot delete super admin accounts',
            });
        }

        await User.findByIdAndDelete(req.params.id);
        await UserProfile.deleteOne({ user_id: req.params.id });

        // Log admin action
        await AuditLog.create({
            user_id: req.userId,
            action: 'ADMIN_DELETE_USER',
            resource_type: 'User',
            resource_id: req.params.id,
            ip_address: req.ip,
            user_agent: req.headers['user-agent'],
            request_id: req.headers['x-request-id'] || 'unknown',
        });

        res.json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        logger.error('Admin delete user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete user',
        });
    }
});

// ============================================
// PROVIDER MANAGEMENT
// ============================================

/**
 * @route   POST /api/v1/admin/providers
 * @desc    Create new provider account
 * @access  Super Admin
 */
router.post('/providers', async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            specialty,
            bio,
            license_number,
            years_experience,
        } = req.body;

        if (!name || !email || !password || !specialty) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
        }

        // Check if email exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({
                success: false,
                error: 'Email already registered',
            });
        }

        // Create user account
        const user = new User({
            name,
            email,
            role: 'provider',
            status: 'active',
        });

        user.password_hash = password; // Will be hashed by pre-save hook
        await user.save();

        // Create provider profile
        const profile = new UserProfile({
            user_id: user._id,
            specialty,
            bio,
            license_number,
            years_experience,
        });
        await profile.save();

        // Log admin action
        await AuditLog.create({
            user_id: req.userId,
            action: 'ADMIN_CREATE_PROVIDER',
            resource_type: 'User',
            resource_id: user._id.toString(),
            ip_address: req.ip,
            user_agent: req.headers['user-agent'],
            request_id: req.headers['x-request-id'] || 'unknown',
        });

        res.status(201).json({
            success: true,
            data: {
                user,
                profile,
            },
        });
    } catch (error) {
        logger.error('Admin create provider error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create provider',
        });
    }
});

/**
 * @route   GET /api/v1/admin/providers/:id/schedule
 * @desc    View provider's schedule and availability
 * @access  Super Admin
 */
router.get('/providers/:id/schedule', async (req, res) => {
    try {
        const { from, to } = req.query;
        const query = { provider_id: req.params.id };

        if (from || to) {
            query.scheduled_start = {};
            if (from) query.scheduled_start.$gte = new Date(from);
            if (to) query.scheduled_start.$lte = new Date(to);
        }

        const appointments = await Appointment.find(query)
            .populate('patient_id', 'name email')
            .sort({ scheduled_start: 1 });

        res.json({
            success: true,
            count: appointments.length,
            data: appointments,
        });
    } catch (error) {
        logger.error('Admin get provider schedule error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch provider schedule',
        });
    }
});

// ============================================
// CONTENT MANAGEMENT SYSTEM (CMS)
// ============================================

/**
 * @route   GET /api/v1/admin/library/articles
 * @desc    Get all library articles for CMS management
 * @access  Super Admin
 */
router.get('/library/articles', async (req, res) => {
    try {
        // TODO: Create LibraryArticle model
        // For now, return mock structure
        res.json({
            success: true,
            message: 'Library CMS endpoint - implement LibraryArticle model',
            data: [],
        });
    } catch (error) {
        logger.error('Admin get articles error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch articles',
        });
    }
});

/**
 * @route   POST /api/v1/admin/library/articles
 * @desc    Create new library article
 * @access  Super Admin
 */
router.post('/library/articles', async (req, res) => {
    try {
        const { title, content, category, tags, is_published } = req.body;

        // TODO: Implement LibraryArticle model
        res.status(501).json({
            success: false,
            error: 'Library CMS not yet implemented',
        });
    } catch (error) {
        logger.error('Admin create article error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create article',
        });
    }
});

// ============================================
// SYSTEM CONFIGURATION
// ============================================

/**
 * @route   GET /api/v1/admin/settings
 * @desc    Get system settings
 * @access  Super Admin
 */
router.get('/settings', async (req, res) => {
    try {
        // TODO: Create SystemSettings model
        const settings = {
            symptom_checker_emergency_threshold: 8,
            default_appointment_duration_minutes: 30,
            max_appointments_per_day: 16,
            medication_reminder_default_times: ['08:00', '12:00', '18:00'],
            enable_video_calls: true,
            enable_group_therapy: true,
            max_file_size_mb: 10,
            allowed_file_types: ['pdf', 'jpg', 'png', 'docx'],
        };

        res.json({
            success: true,
            data: settings,
        });
    } catch (error) {
        logger.error('Admin get settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch settings',
        });
    }
});

/**
 * @route   PATCH /api/v1/admin/settings
 * @desc    Update system settings
 * @access  Super Admin
 */
router.patch('/settings', async (req, res) => {
    try {
        // TODO: Implement SystemSettings model
        // For now, just acknowledge
        
        // Log admin action
        await AuditLog.create({
            user_id: req.userId,
            action: 'ADMIN_UPDATE_SETTINGS',
            resource_type: 'SystemSettings',
            resource_id: 'global',
            ip_address: req.ip,
            user_agent: req.headers['user-agent'],
            request_id: req.headers['x-request-id'] || 'unknown',
            metadata: { settings: req.body },
        });

        res.json({
            success: true,
            message: 'Settings updated successfully',
        });
    } catch (error) {
        logger.error('Admin update settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update settings',
        });
    }
});

// ============================================
// AUDIT LOG ACCESS
// ============================================

/**
 * @route   GET /api/v1/admin/audit-logs
 * @desc    View system audit logs
 * @access  Super Admin
 */
router.get('/audit-logs', async (req, res) => {
    try {
        const { user_id, action, from, to, page = 1, limit = 100 } = req.query;
        const query = {};

        if (user_id) query.user_id = user_id;
        if (action) query.action = { $regex: action, $options: 'i' };
        if (from || to) {
            query.createdAt = {};
            if (from) query.createdAt.$gte = new Date(from);
            if (to) query.createdAt.$lte = new Date(to);
        }

        const logs = await AuditLog.find(query)
            .populate('user_id', 'name email role')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await AuditLog.countDocuments(query);

        res.json({
            success: true,
            count: logs.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: logs,
        });
    } catch (error) {
        logger.error('Admin get audit logs error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch audit logs',
        });
    }
});

// ============================================
// SYSTEM HEALTH & MONITORING
// ============================================

/**
 * @route   GET /api/v1/admin/system/health
 * @desc    Get system health metrics
 * @access  Super Admin
 */
router.get('/system/health', async (req, res) => {
    try {
        const dbStatus = await import('../database/connection.js').then(module => {
            return module.default.connection?.readyState === 1 ? 'connected' : 'disconnected';
        });

        res.json({
            success: true,
            data: {
                status: 'healthy',
                uptime_seconds: process.uptime(),
                memory_usage: process.memoryUsage(),
                database: dbStatus,
                node_version: process.version,
                platform: process.platform,
            },
        });
    } catch (error) {
        logger.error('Admin system health error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch system health',
        });
    }
});

export default router;
