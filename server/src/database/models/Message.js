/**
 * Message Model
 * Patient-provider secure messaging
 */

import { DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';
import { encrypt, decrypt } from '../../utils/encryption.js';

export const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    thread_id: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'Groups messages into conversations',
    },
    sender_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    recipient_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    content_encrypted: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('sent', 'delivered', 'read', 'archived'),
        defaultValue: 'sent',
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    is_system_message: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    reply_to_message_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'messages',
            key: 'id',
        },
    },
    attachments: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of document IDs',
    },
}, {
    tableName: 'messages',
    indexes: [
        {
            fields: ['thread_id'],
        },
        {
            fields: ['sender_id'],
        },
        {
            fields: ['recipient_id'],
        },
        {
            fields: ['status'],
        },
    ],
});

// Virtual fields for encryption/decryption
Message.prototype.getContent = function() {
    return this.content_encrypted ? decrypt(this.content_encrypted) : '';
};

Message.prototype.setContent = function(value) {
    this.content_encrypted = encrypt(value);
};

export default Message;
