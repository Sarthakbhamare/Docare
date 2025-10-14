/**
 * Appointment Model
 * Manages patient-provider appointments and consultations
 */

import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    patient_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    provider_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    appointment_type: {
        type: String,
        enum: ['video', 'in-person', 'phone', 'chat'],
        default: 'video',
        required: true,
    },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
        default: 'scheduled',
        required: true,
        index: true,
    },
    scheduled_start: {
        type: Date,
        required: true,
        index: true,
    },
    scheduled_end: {
        type: Date,
        required: true,
    },
    actual_start: {
        type: Date,
        default: null,
    },
    actual_end: {
        type: Date,
        default: null,
    },
    reason: {
        type: String,
        maxlength: 500,
        default: null,
    },
    notes: {
        type: String,
        default: null,
    },
    cancellation_reason: {
        type: String,
        maxlength: 500,
        default: null,
    },
    cancelled_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    cancelled_at: {
        type: Date,
        default: null,
    },
    video_room_id: {
        type: String,
        default: null,
    },
    location: {
        type: String,
        maxlength: 500,
        default: null,
    },
    reminder_sent: {
        type: Boolean,
        default: false,
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

// Compound indexes for common queries
appointmentSchema.index({ patient_id: 1, scheduled_start: -1 });
appointmentSchema.index({ provider_id: 1, scheduled_start: -1 });
appointmentSchema.index({ status: 1, scheduled_start: 1 });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
