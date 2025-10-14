/**
 * Emergency Contact Model
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';
import { encrypt, decrypt } from '../../utils/encryption.js';

export const EmergencyContact = sequelize.define('EmergencyContact', {
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
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    relationship: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    phone_encrypted: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    priority_order: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
}, {
    tableName: 'emergency_contacts',
    indexes: [
        {
            fields: ['user_id'],
        },
    ],
});

EmergencyContact.prototype.getPhone = function() {
    return this.phone_encrypted ? decrypt(this.phone_encrypted) : null;
};

EmergencyContact.prototype.setPhone = function(value) {
    this.phone_encrypted = encrypt(value);
};

export default EmergencyContact;
