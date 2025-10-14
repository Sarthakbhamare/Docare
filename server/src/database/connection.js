/**
 * Database Connection & Configuration
 * MongoDB with Mongoose ODM
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/docare_health';

const options = {
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10,
    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE) || 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
};

/**
 * Test database connection
 */
export const testConnection = async () => {
    try {
        await mongoose.connect(MONGODB_URI, options);
        logger.info('✅ MongoDB connection established successfully');
        return true;
    } catch (error) {
        logger.error('❌ Unable to connect to MongoDB:', error.message);
        throw error;
    }
};

/**
 * Initialize database and load models
 */
export const initializeDatabase = async () => {
    try {
        await testConnection();
        
        // Import all models to register schemas
        await import('./models/User.js');
        await import('./models/UserProfile.js');
        await import('./models/Appointment.js');
        await import('./models/Medication.js');
        await import('./models/Document.js');
        await import('./models/Message.js');
        await import('./models/EmergencyContact.js');
        await import('./models/Transaction.js');
        await import('./models/Device.js');
        await import('./models/AuditLog.js');
        await import('./models/RefreshToken.js');
        await import('./models/MFAToken.js');

        logger.info('📊 MongoDB models registered successfully');
        return mongoose;
    } catch (error) {
        logger.error('Failed to initialize MongoDB:', error);
        throw error;
    }
};

/**
 * Close database connection
 */
export const closeConnection = async () => {
    try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
    } catch (error) {
        logger.error('Error closing MongoDB connection:', error);
        throw error;
    }
};

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await closeConnection();
    process.exit(0);
});

export { mongoose };
export default mongoose;
