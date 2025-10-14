/**
 * Audit Log Model
 * HIPAA-compliant audit trail for all PHI access
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';

export const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    action: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'e.g., LOGIN, LOGOUT, VIEW_PROFILE, UPDATE_MEDICATION, DELETE_DOCUMENT',
    },
    resource_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Type of resource accessed',
    },
    resource_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'ID of resource accessed',
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    user_agent: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    request_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'Correlation ID for request tracing',
    },
    status: {
        type: DataTypes.ENUM('success', 'failure', 'error'),
        allowNull: false,
    },
    error_message: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional contextual information',
    },
}, {
    tableName: 'audit_logs',
    indexes: [
        {
            fields: ['user_id'],
        },
        {
            fields: ['action'],
        },
        {
            fields: ['created_at'],
        },
        {
            fields: ['resource_type', 'resource_id'],
        },
    ],
    // Prevent updates and deletes on audit logs
    timestamps: true,
    updatedAt: false,
});

// Override destroy to prevent deletion
AuditLog.beforeDestroy(() => {
    throw new Error('Audit logs cannot be deleted');
});

export default AuditLog;
