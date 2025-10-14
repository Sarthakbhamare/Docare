/**
 * MFA Token Model
 * For two-factor authentication codes
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';

export const MFAToken = sequelize.define('MFAToken', {
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
    token_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('totp', 'sms', 'email', 'backup'),
        allowNull: false,
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    is_used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    used_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    tableName: 'mfa_tokens',
    indexes: [
        {
            fields: ['user_id'],
        },
        {
            fields: ['expires_at'],
        },
    ],
});

export default MFAToken;
