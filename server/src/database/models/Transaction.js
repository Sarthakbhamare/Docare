/**
 * Transaction/Billing Model
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';

export const Transaction = sequelize.define('Transaction', {
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
    },
    appointment_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'appointments',
            key: 'id',
        },
    },
    amount_cents: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'USD',
    },
    type: {
        type: DataTypes.ENUM('charge', 'refund', 'adjustment'),
        defaultValue: 'charge',
    },
    status: {
        type: DataTypes.ENUM('pending', 'succeeded', 'failed', 'cancelled', 'refunded'),
        defaultValue: 'pending',
    },
    payment_method: {
        type: DataTypes.ENUM('card', 'insurance', 'bank_transfer'),
        allowNull: false,
    },
    payment_intent_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Stripe payment intent ID',
    },
    description: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    receipt_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    failure_reason: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
}, {
    tableName: 'transactions',
    indexes: [
        {
            fields: ['user_id'],
        },
        {
            fields: ['status'],
        },
    ],
});

export default Transaction;
