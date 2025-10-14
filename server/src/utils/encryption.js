/**
 * PHI Encryption Utilities
 * AES-256-GCM encryption for Protected Health Information
 */

import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = parseInt(process.env.ENCRYPTION_IV_LENGTH || '16');
const AUTH_TAG_LENGTH = 16;

// Ensure encryption key is proper length
if (Buffer.from(ENCRYPTION_KEY, 'hex').length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
}

/**
 * Encrypt data using AES-256-GCM
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted data with IV and auth tag (format: iv:authTag:encrypted)
 */
export function encrypt(text) {
    if (!text) return null;

    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(
            ALGORITHM,
            Buffer.from(ENCRYPTION_KEY, 'hex'),
            iv
        );

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        // Return format: iv:authTag:encrypted
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypt data using AES-256-GCM
 * @param {string} encryptedData - Encrypted data (format: iv:authTag:encrypted)
 * @returns {string} - Decrypted plain text
 */
export function decrypt(encryptedData) {
    if (!encryptedData) return null;

    try {
        const parts = encryptedData.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format');
        }

        const [ivHex, authTagHex, encrypted] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');

        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            Buffer.from(ENCRYPTION_KEY, 'hex'),
            iv
        );

        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
}

/**
 * Hash data using SHA-256 (one-way hash for checksums)
 * @param {string|Buffer} data - Data to hash
 * @returns {string} - Hex-encoded hash
 */
export function hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a random token
 * @param {number} length - Token length in bytes
 * @returns {string} - Hex-encoded token
 */
export function generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Constant-time string comparison to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} - True if strings match
 */
export function secureCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
        return false;
    }

    if (a.length !== b.length) {
        return false;
    }

    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export default {
    encrypt,
    decrypt,
    hash,
    generateToken,
    secureCompare,
};
