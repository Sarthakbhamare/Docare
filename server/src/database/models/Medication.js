/**
 * Medication Model
 * Tracks patient medications and adherence
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';

export const Medication = sequelize.define('Medication', {
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
    prescribed_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    generic_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    dosage: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    frequency: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    route: {
        type: DataTypes.ENUM('oral', 'topical', 'injection', 'inhalation', 'other'),
        defaultValue: 'oral',
    },
    instructions: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    refills_remaining: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    pharmacy: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('active', 'completed', 'discontinued', 'on-hold'),
        defaultValue: 'active',
    },
    reminder_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    reminder_times: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of time strings for daily reminders',
    },
}, {
    tableName: 'medications',
    indexes: [
        {
            fields: ['user_id'],
        },
        {
            fields: ['status'],
        },
    ],
});

export default Medication;
