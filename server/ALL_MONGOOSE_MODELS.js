/**
 * ALL MONGOOSE MODELS - Copy each section to respective file
 * This file contains all 12 Mongoose models for quick reference
 */

// ============================================
// 1. USER.JS - ✅ ALREADY CONVERTED
// ============================================

// ============================================
// 2. USERPROFILE.JS - ✅ ALREADY CONVERTED
// ============================================

// ============================================
// 3. APPOINTMENT.JS - ✅ ALREADY CONVERTED
// ============================================

// ============================================
// 4. MEDICATION.JS
// ============================================
/**
 * Medication Model
 * Tracks patient medications and adherence
 */

import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    prescribed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    name: {
        type: String,
        required: true,
    },
    generic_name: {
        type: String,
        default: null,
    },
    dosage: {
        type: String,
        required: true,
    },
    frequency: {
        type: String,
        required: true,
    },
    route: {
        type: String,
        enum: ['oral', 'topical', 'injection', 'inhalation', 'other'],
        default: 'oral',
    },
    start_date: {
        type: Date,
        required: true,
    },
    end_date: {
        type: Date,
        default: null,
    },
    pharmacy: {
        type: String,
        default: null,
    },
    refills_remaining: {
        type: Number,
        default: 0,
        min: 0,
    },
    instructions: {
        type: String,
        default: null,
    },
    side_effects: {
        type: String,
        default: null,
    },
    reminder_enabled: {
        type: Boolean,
        default: false,
    },
    reminder_times: {
        type: [String],
        default: [],
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'discontinued'],
        default: 'active',
        required: true,
        index: true,
    },
    notes: {
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

medicationSchema.index({ user_id: 1, status: 1 });

export const Medication = mongoose.model('Medication', medicationSchema);
export default Medication;

// ============================================
// 5. DOCUMENT.JS
// ============================================
/**
 * Document Model
 * Encrypted document metadata and file storage
 */

import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    uploaded_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    filename: {
        type: String,
        required: true,
    },
    original_filename: {
        type: String,
        required: true,
    },
    file_type: {
        type: String,
        required: true,
    },
    file_size: {
        type: Number,
        required: true,
        min: 0,
    },
    storage_location: {
        type: String,
        required: true,
    },
    encryption_key_id: {
        type: String,
        required: true,
    },
    encryption_iv: {
        type: String,
        required: true,
    },
    checksum: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['lab-result', 'prescription', 'imaging', 'insurance', 'consent-form', 'other'],
        default: 'other',
    },
    description: {
        type: String,
        default: null,
    },
    virus_scan_status: {
        type: String,
        enum: ['pending', 'clean', 'infected', 'error'],
        default: 'pending',
    },
    virus_scan_at: {
        type: Date,
        default: null,
    },
    access_count: {
        type: Number,
        default: 0,
    },
    last_accessed_at: {
        type: Date,
        default: null,
    },
    expires_at: {
        type: Date,
        default: null,
    },
    tags: {
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

documentSchema.index({ user_id: 1, createdAt: -1 });
documentSchema.index({ checksum: 1 });

export const Document = mongoose.model('Document', documentSchema);
export default Document;

// ============================================
// 6. MESSAGE.JS
// ============================================
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

// ============================================
// 7. EMERGENCYCONTACT.JS
// ============================================
/**
 * Emergency Contact Model
 */

import mongoose from 'mongoose';
import { encrypt, decrypt } from '../../utils/encryption.js';

const emergencyContactSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
    },
    relationship: {
        type: String,
        required: true,
    },
    phone_encrypted: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        default: null,
    },
    is_primary: {
        type: Boolean,
        default: false,
    },
    priority_order: {
        type: Number,
        default: 1,
        min: 1,
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

emergencyContactSchema.index({ user_id: 1, priority_order: 1 });

emergencyContactSchema.methods.getPhone = function() {
    return this.phone_encrypted ? decrypt(this.phone_encrypted) : null;
};

emergencyContactSchema.methods.setPhone = function(value) {
    this.phone_encrypted = value ? encrypt(value) : null;
};

export const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);
export default EmergencyContact;

// ============================================
// 8. TRANSACTION.JS
// ============================================
/**
 * Transaction Model
 * Billing and payment tracking
 */

import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    appointment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        default: null,
    },
    amount_cents: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        default: 'USD',
    },
    type: {
        type: String,
        enum: ['consultation', 'prescription', 'lab-test', 'copay', 'other'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
        required: true,
        index: true,
    },
    payment_method: {
        type: String,
        enum: ['card', 'insurance', 'bank_transfer', 'cash', 'other'],
        required: true,
    },
    payment_intent_id: {
        type: String,
        default: null,
    },
    stripe_charge_id: {
        type: String,
        default: null,
    },
    receipt_url: {
        type: String,
        default: null,
    },
    description: {
        type: String,
        default: null,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    processed_at: {
        type: Date,
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

transactionSchema.index({ user_id: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;

// ============================================
// 9. DEVICE.JS
// ============================================
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

// ============================================
// 10. AUDITLOG.JS
// ============================================
/**
 * Audit Log Model
 * Immutable audit trail for HIPAA compliance
 */

import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true,
    },
    action: {
        type: String,
        required: true,
        index: true,
    },
    resource_type: {
        type: String,
        required: true,
    },
    resource_id: {
        type: String,
        default: null,
    },
    ip_address: {
        type: String,
        required: true,
    },
    user_agent: {
        type: String,
        default: null,
    },
    request_id: {
        type: String,
        required: true,
        index: true,
    },
    status_code: {
        type: Number,
        default: null,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        },
    },
});

// Prevent deletion (immutable logs)
auditLogSchema.pre('remove', function(next) {
    next(new Error('Audit logs cannot be deleted'));
});

auditLogSchema.pre('deleteOne', function(next) {
    next(new Error('Audit logs cannot be deleted'));
});

auditLogSchema.pre('deleteMany', function(next) {
    next(new Error('Audit logs cannot be deleted'));
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user_id: 1, createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;

// ============================================
// 11. REFRESHTOKEN.JS
// ============================================
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

// ============================================
// 12. MFATOKEN.JS
// ============================================
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
