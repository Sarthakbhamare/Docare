/**
 * MFA Token Model
 * Two-factor authentication codes
 */

import mongoose from 'mongoose';

const mfaTokenSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['totp', 'sms', 'email', 'backup'],
        required: true,
    },
    token_hash: {
        type: String,
        required: true,
    },
    expires_at: {
        type: Date,
        required: true,
        index: true,
    },
    is_used: {
        type: Boolean,
        default: false,
    },
    used_at: {
        type: Date,
        default: null,
    },
    attempts: {
        type: Number,
        default: 0,
    },
    ip_address: {
        type: String,
        default: null,
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

mfaTokenSchema.index({ user_id: 1, is_used: 1 });
mfaTokenSchema.index({ expires_at: 1 });

export const MFAToken = mongoose.model('MFAToken', mfaTokenSchema);
export default MFAToken;
