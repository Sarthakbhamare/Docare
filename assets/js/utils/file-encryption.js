/**
 * File Encryption Utilities
 * Uses Web Crypto API to encrypt files client-side before upload
 */

const ALGORITHM = { name: 'AES-GCM', length: 256 };
const IV_LENGTH = 12; // 96-bit IV recommended for AES-GCM

const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i += 1) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

const base64ToArrayBuffer = (base64) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

async function generateKey() {
    return crypto.subtle.generateKey(ALGORITHM, true, ['encrypt', 'decrypt']);
}

async function exportKey(key) {
    const raw = await crypto.subtle.exportKey('raw', key);
    return arrayBufferToBase64(raw);
}

function generateIV() {
    const iv = new Uint8Array(IV_LENGTH);
    crypto.getRandomValues(iv);
    return iv;
}

async function encryptArrayBuffer(buffer, key, iv) {
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, buffer);
    return encrypted;
}

async function decryptArrayBuffer(buffer, key, iv) {
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, buffer);
}

export async function encryptFile(file) {
    if (!file) throw new Error('No file provided for encryption');

    const key = await generateKey();
    const iv = generateIV();
    const fileBuffer = await file.arrayBuffer();
    const encryptedBuffer = await encryptArrayBuffer(fileBuffer, key, iv);

    return {
        encryptedData: encryptedBuffer,
        encryptedBase64: arrayBufferToBase64(encryptedBuffer),
        iv: arrayBufferToBase64(iv),
        key: await exportKey(key),
        metadata: {
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            lastModified: file.lastModified,
        },
    };
}

export async function decryptFile(encryptedBase64, keyBase64, ivBase64) {
    const encryptedBuffer = base64ToArrayBuffer(encryptedBase64);
    const keyBuffer = base64ToArrayBuffer(keyBase64);
    const key = await crypto.subtle.importKey('raw', keyBuffer, ALGORITHM, true, ['decrypt']);
    const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
    const decrypted = await decryptArrayBuffer(encryptedBuffer, key, iv);
    return decrypted;
}

export const FileEncryption = {
    encryptFile,
    decryptFile,
};
