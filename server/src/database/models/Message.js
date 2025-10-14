/**
 * Message Model
 * Patient-provider secure messaging
 */

import mongoose from 'mongoose';
import { encrypt, decrypt } from '../../utils/encryption.js';

const messageSchema = new mongoose.Schema({
    thread_id: {
        type: String,
        required: true,
        index: true,
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    recipient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    content_encrypted: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'archived'],
        default: 'sent',
    },
    read_at: {
        type: Date,
        default: null,
    },
    is_system_message: {
        type: Boolean,
        default: false,
    },
    reply_to_message_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null,
    },
    attachments: {
        type: [String],
        default: [],
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal',
    },
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});

messageSchema.index({ thread_id: 1, createdAt: -1 });
messageSchema.index({ sender_id: 1, recipient_id: 1 });

messageSchema.methods.getContent = function() {
    return this.content_encrypted ? decrypt(this.content_encrypted) : null;
};

messageSchema.methods.setContent = function(value) {
    this.content_encrypted = value ? encrypt(value) : null;
};

export const Message = mongoose.model('Message', messageSchema);
export default Message;
