/**
 * Document Model
 * Encrypted document storage metadata
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';

export const Document = sequelize.define('Document', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    uploaded_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    category: {
        type: DataTypes.ENUM('lab-results', 'insurance', 'prescriptions', 'medical-records', 'imaging', 'other'),
        allowNull: false,
    },
    original_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    stored_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    mime_type: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    size_bytes: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    checksum_sha256: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },
    storage_location: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'S3 bucket path',
    },
    encryption_key_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'AWS KMS key ID or local encryption key reference',
    },
    encryption_iv: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'uploaded', 'processing', 'available', 'archived', 'deleted'),
        defaultValue: 'pending',
    },
    virus_scan_status: {
        type: DataTypes.ENUM('pending', 'clean', 'infected', 'failed'),
        defaultValue: 'pending',
    },
    virus_scan_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Auto-delete date for temporary documents',
    },
    access_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    last_accessed_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'documents',
    indexes: [
        {
            fields: ['user_id'],
        },
        {
            fields: ['category'],
        },
        {
            fields: ['status'],
        },
        {
            unique: true,
            fields: ['checksum_sha256', 'user_id'],
            name: 'unique_document_per_user',
        },
    ],
});

export default Document;
