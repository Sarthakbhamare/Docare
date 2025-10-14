/**
 * Logging Utility
 * Winston-based structured logging with HIPAA compliance
 */

import winston from 'winston';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Custom format for logs
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        
        if (Object.keys(meta).length > 0) {
            // Filter out sensitive data
            const sanitized = sanitizeSensitiveData(meta);
            log += ` ${JSON.stringify(sanitized)}`;
        }
        
        return log;
    })
);

/**
 * Remove sensitive data from logs (HIPAA compliance)
 */
function sanitizeSensitiveData(data) {
    const sensitive = ['password', 'token', 'ssn', 'credit_card', 'api_key', 'secret'];
    const sanitized = { ...data };
    
    for (const key in sanitized) {
        if (sensitive.some(s => key.toLowerCase().includes(s))) {
            sanitized[key] = '[REDACTED]';
        }
        
        if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
            sanitized[key] = sanitizeSensitiveData(sanitized[key]);
        }
    }
    
    return sanitized;
}

// Create logger instance
export const logger = winston.createLogger({
    level: LOG_LEVEL,
    format: customFormat,
    transports: [
        // Console output
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                customFormat
            ),
        }),
        // Error log file
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Combined log file
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 10,
        }),
    ],
    // Don't exit on handled exceptions
    exitOnError: false,
});

// Stream for Morgan HTTP logging
export const morganStream = {
    write: (message) => {
        logger.http(message.trim());
    },
};

// Morgan middleware configuration
export const requestLogger = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    {
        stream: morganStream,
        skip: (req) => {
            // Skip health checks
            return req.url === '/health';
        },
    }
);

// Log unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', { reason, promise });
});

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

export default logger;
