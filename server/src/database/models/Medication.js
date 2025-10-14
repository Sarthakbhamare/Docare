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
