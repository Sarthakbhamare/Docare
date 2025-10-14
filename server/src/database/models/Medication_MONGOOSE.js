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
        type: [String], // Array of time strings like ["08:00", "20:00"]
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

// Compound indexes
medicationSchema.index({ user_id: 1, status: 1 });
medicationSchema.index({ user_id: 1, start_date: -1 });

export const Medication = mongoose.model('Medication', medicationSchema);
export default Medication;
