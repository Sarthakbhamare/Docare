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
        required: true, // S3 key or path
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
        required: true, // SHA-256 hash
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

// Indexes
documentSchema.index({ user_id: 1, createdAt: -1 });
documentSchema.index({ category: 1 });
documentSchema.index({ virus_scan_status: 1 });
documentSchema.index({ checksum: 1 });

export const Document = mongoose.model('Document', documentSchema);
export default Document;
