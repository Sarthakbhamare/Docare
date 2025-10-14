/**
 * Audit Logging Middleware
 * HIPAA-compliant audit trail for all API requests
 */

import crypto from 'crypto';
import AuditLog from '../database/models/AuditLog.js';
import { logger } from '../utils/logger.js';

/**
 * Log all API requests for audit trail
 */
export const auditLogger = async (req, res, next) => {
    // Generate request ID for correlation
    req.id = crypto.randomUUID();
    req.startTime = Date.now();

    // Capture original end function
    const originalEnd = res.end;

    // Override res.end to capture response
    res.end = function (chunk, encoding) {
        res.end = originalEnd;
        res.end(chunk, encoding);

        // Log audit trail asynchronously
        setImmediate(() => {
            createAuditLog(req, res);
        });
    };

    next();
};

/**
 * Create audit log entry
 */
async function createAuditLog(req, res) {
    try {
        const action = determineAction(req);
        const { resourceType, resourceId } = extractResource(req);

        await AuditLog.create({
            user_id: req.userId || null,
            action,
            resource_type: resourceType,
            resource_id: resourceId,
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('user-agent'),
            request_id: req.id,
            status: res.statusCode < 400 ? 'success' : 'failure',
            error_message: res.statusCode >= 400 ? `HTTP ${res.statusCode}` : null,
            metadata: {
                method: req.method,
                path: req.path,
                duration: Date.now() - req.startTime,
                status_code: res.statusCode,
            },
        });
    } catch (error) {
        // Don't fail request if audit logging fails
        logger.error('Failed to create audit log:', error);
    }
}

/**
 * Determine action from request
 */
function determineAction(req) {
    const { method, path } = req;

    // Authentication actions
    if (path.includes('/auth/login')) return 'LOGIN';
    if (path.includes('/auth/logout')) return 'LOGOUT';
    if (path.includes('/auth/signup')) return 'SIGNUP';
    if (path.includes('/auth/refresh')) return 'REFRESH_TOKEN';
    if (path.includes('/auth/mfa')) return 'MFA_VERIFY';

    // CRUD operations
    if (method === 'GET') return 'VIEW';
    if (method === 'POST') return 'CREATE';
    if (method === 'PUT' || method === 'PATCH') return 'UPDATE';
    if (method === 'DELETE') return 'DELETE';

    return 'UNKNOWN';
}

/**
 * Extract resource information from request
 */
function extractResource(req) {
    const pathParts = req.path.split('/').filter(Boolean);

    if (pathParts.length < 3) {
        return { resourceType: null, resourceId: null };
    }

    // Expected format: /api/v1/resource/:id
    const resourceType = pathParts[2];
    const resourceId = pathParts[3] || null;

    // Validate UUID format for resourceId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validResourceId = resourceId && uuidRegex.test(resourceId) ? resourceId : null;

    return {
        resourceType: resourceType || null,
        resourceId: validResourceId,
    };
}

/**
 * Manual audit log for specific actions
 */
export async function logAuditAction(userId, action, details = {}) {
    try {
        await AuditLog.create({
            user_id: userId,
            action,
            resource_type: details.resourceType || null,
            resource_id: details.resourceId || null,
            ip_address: details.ipAddress || null,
            user_agent: details.userAgent || null,
            status: 'success',
            metadata: details.metadata || {},
        });
    } catch (error) {
        logger.error('Failed to log audit action:', error);
    }
}

export default auditLogger;
