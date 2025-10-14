/**
 * Device Model
 * Wearable device integration
 */

import mongoose from 'mongoose';
import { encrypt, decrypt } from '../../utils/encryption.js';

const deviceSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    device_type: {
        type: String,
        enum: ['fitbit', 'apple-watch', 'google-fit', 'samsung-health', 'other'],
        required: true,
    },
    device_name: {
        type: String,
        required: true,
    },
    oauth_token_encrypted: {
        type: String,
        default: null,
    },
    oauth_refresh_token_encrypted: {
        type: String,
        default: null,
    },
    token_expires_at: {
        type: Date,
        default: null,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    last_sync_at: {
        type: Date,
        default: null,
    },
    sync_frequency_minutes: {
        type: Number,
        default: 60,
        min: 5,
    },
    permissions_granted: {
        type: [String],
        default: [],
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

deviceSchema.index({ user_id: 1, is_active: 1 });

deviceSchema.methods.getOAuthToken = function() {
    return this.oauth_token_encrypted ? decrypt(this.oauth_token_encrypted) : null;
};

deviceSchema.methods.setOAuthToken = function(value) {
    this.oauth_token_encrypted = value ? encrypt(value) : null;
};

deviceSchema.methods.getOAuthRefreshToken = function() {
    return this.oauth_refresh_token_encrypted ? decrypt(this.oauth_refresh_token_encrypted) : null;
};

deviceSchema.methods.setOAuthRefreshToken = function(value) {
    this.oauth_refresh_token_encrypted = value ? encrypt(value) : null;
};

export const Device = mongoose.model('Device', deviceSchema);
export default Device;
