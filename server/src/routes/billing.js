/**
 * Billing/Transactions Routes
 * Payment processing and transaction history
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Transaction from '../database/models/Transaction.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/billing/transactions
 * @desc    Get all transactions for current user
 * @access  Private
 */
router.get('/transactions', async (req, res) => {
    try {
        const { status, type, from, to } = req.query;
        const query = { user_id: req.userId };

        if (status) query.status = status;
        if (type) query.type = type;

        if (from || to) {
            query.createdAt = {};
            if (from) query.createdAt.$gte = new Date(from);
            if (to) query.createdAt.$lte = new Date(to);
        }

        const transactions = await Transaction.find(query)
            .populate('appointment_id', 'scheduled_start provider_id')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: transactions.length,
            data: transactions,
        });
    } catch (error) {
        logger.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch transactions',
        });
    }
});

/**
 * @route   GET /api/v1/billing/balance
 * @desc    Get current account balance
 * @access  Private
 */
router.get('/balance', async (req, res) => {
    try {
        const pendingTransactions = await Transaction.find({
            user_id: req.userId,
            status: 'pending',
        });

        const balance = pendingTransactions.reduce(
            (sum, txn) => sum + txn.amount_cents,
            0
        );

        res.json({
            success: true,
            data: {
                balance_cents: balance,
                balance_display: `$${(balance / 100).toFixed(2)}`,
                currency: 'USD',
                pending_count: pendingTransactions.length,
            },
        });
    } catch (error) {
        logger.error('Get balance error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch balance',
        });
    }
});

/**
 * @route   POST /api/v1/billing/transactions
 * @desc    Create new transaction (payment)
 * @access  Private
 */
router.post('/transactions', async (req, res) => {
    try {
        const {
            appointment_id,
            amount_cents,
            type,
            payment_method,
            description,
        } = req.body;

        if (!amount_cents || !type || !payment_method) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
        }

        const transaction = new Transaction({
            user_id: req.userId,
            appointment_id,
            amount_cents,
            type,
            payment_method,
            description,
            status: 'pending',
        });

        await transaction.save();

        // TODO: Process payment with Stripe

        res.status(201).json({
            success: true,
            data: transaction,
        });
    } catch (error) {
        logger.error('Create transaction error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create transaction',
        });
    }
});

/**
 * @route   GET /api/v1/billing/transactions/:id/receipt
 * @desc    Download transaction receipt
 * @access  Private
 */
router.get('/transactions/:id/receipt', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('user_id', 'name email')
            .populate('appointment_id');

        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found',
            });
        }

        if (transaction.user_id._id.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized',
            });
        }

        // Generate receipt data
        const receipt = {
            transaction_id: transaction.id,
            date: transaction.createdAt,
            amount: `$${(transaction.amount_cents / 100).toFixed(2)}`,
            type: transaction.type,
            payment_method: transaction.payment_method,
            status: transaction.status,
            description: transaction.description,
            patient_name: transaction.user_id.name,
        };

        res.json({
            success: true,
            data: receipt,
        });
    } catch (error) {
        logger.error('Get receipt error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate receipt',
        });
    }
});

export default router;
