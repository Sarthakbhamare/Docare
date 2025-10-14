/**
 * DoCare Health Backend Server
 * HIPAA-compliant API gateway with security hardening
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { logger, requestLogger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { auditLogger } from './middleware/auditLogger.js';
import { initializeDatabase } from './database/connection.js';
import { initializeWebSocket } from './websocket/index.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import appointmentRoutes from './routes/appointments.js';
import medicationRoutes from './routes/medications.js';
import documentRoutes from './routes/documents.js';
import messageRoutes from './routes/messages.js';
import emergencyRoutes from './routes/emergency.js';
import billingRoutes from './routes/billing.js';
import deviceRoutes from './routes/devices.js';
import videoRoutes from './routes/video.js';
import healthRoutes from './routes/health.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
}));

// CORS configuration
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// Body parsing & compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter);

// Audit logging for all requests
app.use(auditLogger);

// Health check endpoint (unauthenticated)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        uptime: process.uptime(),
    });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/medications', medicationRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/emergency', emergencyRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/devices', deviceRoutes);
app.use('/api/v1/video', videoRoutes);
app.use('/api/v1/health', healthRoutes);

// WebSocket initialization
initializeWebSocket(io);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    
    httpServer.close(() => {
        logger.info('HTTP server closed');
    });

    io.close(() => {
        logger.info('WebSocket server closed');
    });

    // Close database connections
    try {
        const { sequelize } = await import('./database/connection.js');
        await sequelize.close();
        logger.info('Database connections closed');
    } catch (error) {
        logger.error('Error closing database:', error);
    }

    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
    try {
        // Initialize database
        await initializeDatabase();
        logger.info('Database initialized successfully');

        // Start HTTP server
        httpServer.listen(PORT, () => {
            logger.info(`🚀 DoCare Health API running on port ${PORT}`);
            logger.info(`📊 Environment: ${NODE_ENV}`);
            logger.info(`🔒 HIPAA Compliance Mode: ENABLED`);
            logger.info(`🔐 MFA: ${process.env.ENABLE_MFA === 'true' ? 'ENABLED' : 'DISABLED'}`);
            logger.info(`💬 WebSocket: ${process.env.ENABLE_WEBSOCKET === 'true' ? 'ENABLED' : 'DISABLED'}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export { app, io };
