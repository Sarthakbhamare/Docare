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
