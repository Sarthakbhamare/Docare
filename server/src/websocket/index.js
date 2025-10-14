/**
 * WebSocket Server
 * Real-time messaging and notifications
 */

import { verifyAccessToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import User from '../database/models/User.js';
import Message from '../database/models/Message.js';

const connectedUsers = new Map(); // userId -> socket

/**
 * Initialize WebSocket server
 */
export function initializeWebSocket(io) {
    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.query.token;

            if (!token) {
                return next(new Error('Authentication required'));
            }

            // Verify token
            const decoded = verifyAccessToken(token);

            // Get user
            const user = await User.findByPk(decoded.userId);
            if (!user || user.status !== 'active') {
                return next(new Error('User not found or inactive'));
            }

            // Attach user to socket
            socket.userId = user.id;
            socket.userEmail = user.email;
            socket.userRole = user.role;

            next();
        } catch (error) {
            logger.error('WebSocket auth error:', error);
            next(new Error('Invalid token'));
        }
    });

    // Connection handler
    io.on('connection', (socket) => {
        const userId = socket.userId;
        logger.info(`User connected: ${userId}`);

        // Store connection
        connectedUsers.set(userId, socket);

        // Join user's personal room
        socket.join(`user:${userId}`);

        // Send welcome message
        socket.emit('connected', {
            message: 'Connected to DoCare Health',
            userId,
        });

        // Handle chat messages
        socket.on('message:send', async (data) => {
            try {
                const { recipientId, content, threadId } = data;

                // Create message in database
                const message = await Message.create({
                    thread_id: threadId,
                    sender_id: userId,
                    recipient_id: recipientId,
                    content_encrypted: content, // Will be encrypted by model
                });

                // Send to recipient if online
                const recipientSocket = connectedUsers.get(recipientId);
                if (recipientSocket) {
                    recipientSocket.emit('message:received', {
                        id: message.id,
                        threadId: message.thread_id,
                        senderId: userId,
                        content: message.getContent(),
                        createdAt: message.created_at,
                    });
                }

                // Acknowledge sender
                socket.emit('message:sent', {
                    id: message.id,
                    threadId: message.thread_id,
                });
            } catch (error) {
                logger.error('Message send error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Handle typing indicators
        socket.on('typing:start', (data) => {
            const { recipientId } = data;
            const recipientSocket = connectedUsers.get(recipientId);
            if (recipientSocket) {
                recipientSocket.emit('typing:start', { userId });
            }
        });

        socket.on('typing:stop', (data) => {
            const { recipientId } = data;
            const recipientSocket = connectedUsers.get(recipientId);
            if (recipientSocket) {
                recipientSocket.emit('typing:stop', { userId });
            }
        });

        // Handle read receipts
        socket.on('message:read', async (data) => {
            try {
                const { messageId } = data;

                const message = await Message.findByPk(messageId);
                if (message && message.recipient_id === userId) {
                    message.status = 'read';
                    message.read_at = new Date();
                    await message.save();

                    // Notify sender
                    const senderSocket = connectedUsers.get(message.sender_id);
                    if (senderSocket) {
                        senderSocket.emit('message:read', {
                            messageId,
                            readAt: message.read_at,
                        });
                    }
                }
            } catch (error) {
                logger.error('Message read error:', error);
            }
        });

        // Handle presence updates
        socket.on('presence:update', (data) => {
            const { status } = data; // online, away, busy, offline
            socket.broadcast.emit('presence:changed', {
                userId,
                status,
            });
        });

        // Disconnect handler
        socket.on('disconnect', (reason) => {
            logger.info(`User disconnected: ${userId} (${reason})`);
            connectedUsers.delete(userId);

            // Broadcast offline status
            socket.broadcast.emit('presence:changed', {
                userId,
                status: 'offline',
            });
        });

        // Error handler
        socket.on('error', (error) => {
            logger.error('Socket error:', error);
        });
    });

    logger.info('✅ WebSocket server initialized');
}

/**
 * Send notification to user
 */
export function sendNotification(userId, notification) {
    const socket = connectedUsers.get(userId);
    if (socket) {
        socket.emit('notification', notification);
        return true;
    }
    return false;
}

/**
 * Broadcast message to multiple users
 */
export function broadcast(userIds, event, data) {
    userIds.forEach(userId => {
        const socket = connectedUsers.get(userId);
        if (socket) {
            socket.emit(event, data);
        }
    });
}

/**
 * Get online status
 */
export function isUserOnline(userId) {
    return connectedUsers.has(userId);
}

export default {
    initializeWebSocket,
    sendNotification,
    broadcast,
    isUserOnline,
};
