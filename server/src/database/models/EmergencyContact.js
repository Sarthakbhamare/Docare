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
