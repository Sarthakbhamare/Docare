/**
 * User Profile Model
 * Extended patient health information (PHI - Protected Health Information)
 */

import mongoose from 'mongoose';
import { encrypt, decrypt } from '../../utils/encryption.js';

const userProfileSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    // Encrypted PHI fields
    date_of_birth_encrypted: {
        type: String,
        default: null,
    },
    phone_encrypted: {
        type: String,
        default: null,
    },
    ssn_encrypted: {
        type: String,
        default: null,
    },
    address_encrypted: {
        type: String,
        default: null,
    },
    // Non-PHI fields
    gender: {
        type: String,
        enum: ['male', 'female', 'non-binary', 'other', 'prefer-not-to-say'],
        default: null,
    },
    preferred_language: {
        type: String,
        default: 'en',
        maxlength: 10,
    },
    timezone: {
        type: String,
        default: 'America/New_York',
        maxlength: 50,
    },
    avatar_url: {
        type: String,
        default: null,
        maxlength: 500,
    },
    insurance_provider: {
        type: String,
        default: null,
    },
    insurance_policy_number_encrypted: {
        type: String,
        default: null,
    },
    primary_physician: {
        type: String,
        default: null,
    },
    allergies: {
        type: String,
        default: null,
    },
    medical_conditions: {
        type: String,
        default: null,
    },
    medications_list: {
        type: String,
        default: null,
    },
    blood_type: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        default: null,
    },
    height_cm: {
        type: Number,
        default: null,
        min: 0,
        max: 300,
    },
    weight_kg: {
        type: Number,
        default: null,
        min: 0,
        max: 500,
    },
    data_sharing_consent: {
        type: Boolean,
        default: false,
    },
    marketing_consent: {
        type: Boolean,
        default: false,
    },
    telemetry_consent: {
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

// Instance methods for encrypted fields
userProfileSchema.methods.getDateOfBirth = function() {
    return this.date_of_birth_encrypted ? decrypt(this.date_of_birth_encrypted) : null;
};

userProfileSchema.methods.setDateOfBirth = function(value) {
    this.date_of_birth_encrypted = value ? encrypt(value) : null;
};

userProfileSchema.methods.getPhone = function() {
    return this.phone_encrypted ? decrypt(this.phone_encrypted) : null;
};

userProfileSchema.methods.setPhone = function(value) {
    this.phone_encrypted = value ? encrypt(value) : null;
};

userProfileSchema.methods.getSSN = function() {
    return this.ssn_encrypted ? decrypt(this.ssn_encrypted) : null;
};

userProfileSchema.methods.setSSN = function(value) {
    this.ssn_encrypted = value ? encrypt(value) : null;
};

userProfileSchema.methods.getAddress = function() {
    if (!this.address_encrypted) return null;
    const decrypted = decrypt(this.address_encrypted);
    try {
        return JSON.parse(decrypted);
    } catch {
        return decrypted;
    }
};

userProfileSchema.methods.setAddress = function(value) {
    this.address_encrypted = value ? encrypt(JSON.stringify(value)) : null;
};

userProfileSchema.methods.getInsurancePolicyNumber = function() {
    return this.insurance_policy_number_encrypted ? decrypt(this.insurance_policy_number_encrypted) : null;
};

userProfileSchema.methods.setInsurancePolicyNumber = function(value) {
    this.insurance_policy_number_encrypted = value ? encrypt(value) : null;
};

export const UserProfile = mongoose.model('UserProfile', userProfileSchema);
export default UserProfile;
