/**
 * Device Integration Model
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';

export const Device = sequelize.define('Device', {
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
    device_type: {
        type: DataTypes.ENUM('fitbit', 'apple-health', 'google-fit', 'withings', 'garmin', 'oura'),
        allowNull: false,
    },
    device_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('connected', 'disconnected', 'error'),
        defaultValue: 'connected',
    },
    access_token_encrypted: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    refresh_token_encrypted: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    token_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    last_sync_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    sync_frequency_minutes: {
        type: DataTypes.INTEGER,
        defaultValue: 60,
    },
    permissions_granted: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of granted permission scopes',
    },
}, {
    tableName: 'devices',
    indexes: [
        {
            fields: ['user_id'],
        },
        {
            fields: ['status'],
        },
    ],
});

export default Device;
