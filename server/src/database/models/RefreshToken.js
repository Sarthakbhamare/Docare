/**
 * Refresh Token Model
 * For JWT refresh token rotation
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';

export const RefreshToken = sequelize.define('RefreshToken', {
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
        unique: true,
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    is_revoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    revoked_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
    },
    user_agent: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
}, {
    tableName: 'refresh_tokens',
    indexes: [
        {
            fields: ['user_id'],
        },
        {
            unique: true,
            fields: ['token_hash'],
        },
        {
            fields: ['expires_at'],
        },
    ],
});

export default RefreshToken;
