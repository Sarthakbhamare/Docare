/**
 * User Model
 * Core authentication and user account data
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
        index: true,
    },
    password_hash: {
        type: String,
        required: true,
        select: false, // Don't include by default in queries
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['patient', 'provider', 'admin'],
        default: 'patient',
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'deactivated'],
        default: 'active',
        required: true,
        index: true,
    },
    email_verified: {
        type: Boolean,
        default: false,
    },
    email_verified_at: {
        type: Date,
        default: null,
    },
    mfa_enabled: {
        type: Boolean,
        default: false,
    },
    mfa_secret: {
        type: String,
        default: null,
        select: false, // Don't include by default in queries
    },
    last_login_at: {
        type: Date,
        default: null,
    },
    last_login_ip: {
        type: String,
        default: null,
    },
    failed_login_attempts: {
        type: Number,
        default: 0,
    },
    locked_until: {
        type: Date,
        default: null,
    },
    password_changed_at: {
        type: Date,
        default: null,
    },
    terms_accepted_at: {
        type: Date,
        default: null,
    },
    privacy_accepted_at: {
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
            delete ret.password_hash;
            delete ret.mfa_secret;
            return ret;
        },
    },
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
    if (!this.isModified('password_hash')) {
        return next();
    }
    
    try {
        this.password_hash = await bcrypt.hash(this.password_hash, 12);
        if (this.isModified('password_hash') && !this.isNew) {
            this.password_changed_at = new Date();
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to validate password
userSchema.methods.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
};

// Instance method to get safe JSON (without sensitive fields)
userSchema.methods.toSafeJSON = function() {
    const obj = this.toObject();
    delete obj.password_hash;
    delete obj.mfa_secret;
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
};

export const User = mongoose.model('User', userSchema);
export default User;
