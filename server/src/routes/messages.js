/**
 * Messages Routes
 * Secure encrypted messaging between patients and providers
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Message from '../database/models/Message.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/messages/threads
 * @desc    Get all message threads for current user
 * @access  Private
 */
router.get('/threads', async (req, res) => {
    try {
        // Get all threads where user is sender or recipient
        const threads = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender_id: req.user._id },
                        { recipient_id: req.user._id },
                    ],
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: '$thread_id',
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$recipient_id', req.user._id] },
                                        { $eq: ['$status', 'sent'] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $sort: { 'lastMessage.createdAt': -1 },
            },
        ]);

        // Populate sender and recipient info
        await Message.populate(threads, {
            path: 'lastMessage.sender_id lastMessage.recipient_id',
            select: 'name email role',
        });

        res.json({
            success: true,
            count: threads.length,
            data: threads,
        });
    } catch (error) {
        logger.error('Get threads error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch message threads',
        });
    }
});

/**
 * @route   GET /api/v1/messages/:threadId
 * @desc    Get all messages in a thread
 * @access  Private
 */
router.get('/:threadId', async (req, res) => {
    try {
        const messages = await Message.find({
            thread_id: req.params.threadId,
            $or: [
                { sender_id: req.userId },
                { recipient_id: req.userId },
            ],
        })
            .populate('sender_id', 'name email role')
            .populate('recipient_id', 'name email role')
            .sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
            {
                thread_id: req.params.threadId,
                recipient_id: req.userId,
                status: 'sent',
            },
            {
                status: 'read',
                read_at: new Date(),
            }
        );

        res.json({
            success: true,
            count: messages.length,
            data: messages,
        });
    } catch (error) {
        logger.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch messages',
        });
    }
});

/**
 * @route   POST /api/v1/messages
 * @desc    Send new message
 * @access  Private
 */
router.post('/', async (req, res) => {
    try {
        const { recipient_id, content, thread_id, reply_to_message_id, priority } = req.body;

        if (!recipient_id || !content) {
            return res.status(400).json({
                success: false,
                error: 'Recipient and content are required',
            });
        }

        const message = new Message({
            thread_id: thread_id || uuidv4(),
            sender_id: req.userId,
            recipient_id,
            reply_to_message_id,
            priority: priority || 'normal',
        });

        // Encrypt content
        message.setContent(content);

        await message.save();

        const populated = await Message.findById(message._id)
            .populate('sender_id', 'name email role')
            .populate('recipient_id', 'name email role');

        // TODO: Send real-time notification via WebSocket

        res.status(201).json({
            success: true,
            data: populated,
        });
    } catch (error) {
        logger.error('Send message error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send message',
        });
    }
});

/**
 * @route   PATCH /api/v1/messages/:id
 * @desc    Update message status
 * @access  Private
 */
router.patch('/:id', async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                error: 'Message not found',
            });
        }

        // Only recipient can mark as read
        if (message.recipient_id.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized',
            });
        }

        if (req.body.status) {
            message.status = req.body.status;
            if (req.body.status === 'read') {
                message.read_at = new Date();
            }
        }

        await message.save();

        res.json({
            success: true,
            data: message,
        });
    } catch (error) {
        logger.error('Update message error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update message',
        });
    }
});

export default router;
