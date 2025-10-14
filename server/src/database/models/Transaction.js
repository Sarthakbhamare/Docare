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
