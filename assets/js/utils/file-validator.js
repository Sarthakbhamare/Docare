/**
 * File Validation Utilities
 * Validates file type, size, and signature before upload
 */

const DEFAULT_ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
];

const SIGNATURE_MAP = {
    pdf: {
        label: 'PDF Document',
        mime: 'application/pdf',
        signature: '25504446', // %PDF
    },
    png: {
        label: 'PNG Image',
        mime: 'image/png',
        signature: '89504E47', // .PNG
    },
    jpg: {
        label: 'JPEG Image',
        mime: 'image/jpeg',
        signature: 'FFD8FF', // ÿØÿ
    },
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const readableFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const bufferToHex = (buffer) => {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
};

const detectFileTypeBySignature = (signatureHex) => {
    if (!signatureHex) return null;

    for (const key of Object.keys(SIGNATURE_MAP)) {
        const type = SIGNATURE_MAP[key];
        if (signatureHex.startsWith(type.signature)) {
            return { ...type, extension: key };
        }
    }

    return null;
};

const normalizeMimeType = (mime) => {
    if (!mime) return null;
    const lower = mime.toLowerCase();
    if (lower === 'image/jpg') return 'image/jpeg';
    return lower;
};

async function readFileSignature(file, length = 4) {
    try {
        const slice = file.slice(0, length);
        const buffer = await slice.arrayBuffer();
        return bufferToHex(buffer);
    } catch (error) {
        console.warn('[File Validation] Unable to read file signature:', error);
        return null;
    }
}

async function computeSHA256(file) {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return bufferToHex(hashBuffer);
}

/**
 * Validate a single file
 */
export async function validateFile(file, options = {}) {
    const allowedTypes = options.allowedTypes || DEFAULT_ALLOWED_MIME_TYPES;
    const maxSize = options.maxSize || MAX_FILE_SIZE_BYTES;
    const existingNames = options.existingNames || [];

    const errors = [];
    const warnings = [];

    if (!file) {
        return {
            valid: false,
            errors: ['No file provided.'],
            warnings,
        };
    }

    if (existingNames.includes(file.name.toLowerCase())) {
        warnings.push('A file with this name was already added. It will be renamed automatically.');
    }

    if (file.size === 0) {
        errors.push('File is empty.');
    }

    if (file.size > maxSize) {
        errors.push(`File exceeds maximum size of ${readableFileSize(maxSize)}.`);
    }

    const signatureHex = await readFileSignature(file);
    const signatureType = detectFileTypeBySignature(signatureHex);

    const normalizedMime = normalizeMimeType(file.type);
    const mimeAllowed = allowedTypes.includes(normalizedMime);

    if (!signatureType && !mimeAllowed) {
        errors.push('Unsupported file type. Only PDF, JPG, and PNG files are allowed.');
    }

    if (signatureType && !allowedTypes.includes(signatureType.mime)) {
        errors.push(`File type (${signatureType.label}) is not permitted.`);
    }

    if (signatureType && normalizedMime && signatureType.mime !== normalizedMime) {
        warnings.push(`File extension does not match its content type (${signatureType.label}). Proceed with caution.`);
    }

    const checksum = await computeSHA256(file);

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        signatureHex,
        detectedType: signatureType || (mimeAllowed ? { mime: normalizedMime, label: normalizedMime, extension: normalizedMime.split('/')[1] } : null),
        checksum,
        readableSize: readableFileSize(file.size),
    };
}

/**
 * Validate multiple files
 */
export async function validateFiles(fileList, options = {}) {
    const files = Array.from(fileList || []);
    const results = [];
    const seenNames = new Set(options.existingNames || []);

    for (const file of files) {
        const result = await validateFile(file, {
            ...options,
            existingNames: Array.from(seenNames),
        });

        results.push({ file, ...result });
        seenNames.add(file.name.toLowerCase());
    }

    return {
        valid: results.every((item) => item.valid),
        results,
    };
}

export const FileValidation = {
    validateFile,
    validateFiles,
    readableFileSize,
};
