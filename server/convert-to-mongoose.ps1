# MongoDB Model Conversion Script
# Run this PowerShell script to convert all Sequelize models to Mongoose

Write-Host "Converting Sequelize models to Mongoose..." -ForegroundColor Cyan

# Medication Model
$medicationContent = @'
/**
 * Medication Model
 * Patient medication tracking and adherence
 */

import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
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
    prescribed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
medicationSchema.index({ user_id: 1, start_date: -1 });

export const Medication = mongoose.model('Medication', medicationSchema);
export default Medication;
'@

Set-Content -Path "src\database\models\Medication.js" -Value $medicationContent
Write-Host "✓ Medication.js converted" -ForegroundColor Green

# Document Model
$documentContent = @'
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
documentSchema.index({ category: 1 });
documentSchema.index({ virus_scan_status: 1 });
documentSchema.index({ checksum: 1 });

export const Document = mongoose.model('Document', documentSchema);
export default Document;
'@

Set-Content -Path "src\database\models\Document.js" -Value $documentContent
Write-Host "✓ Document.js converted" -ForegroundColor Green

Write-Host "`nConversion complete! Now run:" -ForegroundColor Cyan
Write-Host "  npm install" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Yellow
