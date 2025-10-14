/**
 * Refresh Token Model
 * JWT refresh token storage and rotation
 */

import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    token_hash: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    expires_at: {
        type: Date,
        required: true,
        index: true,
    },
    is_revoked: {
        type: Boolean,
        default: false,
        index: true,
    },
    revoked_at: {
        type: Date,
        default: null,
    },
    ip_address: {
        type: String,
        default: null,
    },
    user_agent: {
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

refreshTokenSchema.index({ user_id: 1, is_revoked: 1 });

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;
