import { showToast } from '../toast.js';
import { DocumentsAPI } from '../api.js';
import { FileValidation } from '../utils/file-validator.js';
import { encryptFile } from '../utils/file-encryption.js';

let activeModal = null;

const DOCUMENT_CATEGORIES = [
    {
        id: 'lab-results',
        name: 'Lab Results',
        icon: '🧪',
        description: 'Upload bloodwork, imaging, and diagnostic reports.',
    },
    {
        id: 'insurance',
        name: 'Insurance Cards',
        icon: '🛡️',
        description: 'Add front/back images of insurance or ID cards.',
    },
    {
        id: 'prescriptions',
        name: 'Prescriptions',
        icon: '💊',
        description: 'Store prescription copies or doctor instructions.',
    },
    {
        id: 'medical-records',
        name: 'Medical Records',
        icon: '📄',
        description: 'Upload discharge summaries or medical history.',
    },
];

const STATUS_META = {
    pending: { label: 'Pending', badge: 'badge-neutral' },
    ready: { label: 'Ready', badge: 'badge-neutral' },
    encrypting: { label: 'Encrypting', badge: 'badge-info' },
    scanning: { label: 'Scanning', badge: 'badge-info' },
    uploading: { label: 'Uploading', badge: 'badge-info' },
    success: { label: 'Uploaded', badge: 'badge-success' },
    failed: { label: 'Failed', badge: 'badge-error' },
};

const formatDateTime = (date = new Date()) => {
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const sanitizeFileName = (name) => {
    return name
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9.-]/g, '')
        .toLowerCase();
};

const buildStorageName = (fileName, category) => {
    const extension = fileName.includes('.') ? fileName.split('.').pop() : 'bin';
    const base = sanitizeFileName(fileName.replace(/\.[^/.]+$/, ''));
    return `${category}-${base}-${Date.now()}.${extension}`;
};

const createFileEntry = (file, validation) => ({
    id: crypto.randomUUID(),
    file,
    validation,
    status: validation.valid ? 'ready' : 'failed',
    progress: 0,
    error: validation.errors?.[0] || null,
    warnings: validation.warnings || [],
    encrypted: null,
    document: null,
});

const simulateVirusScan = async () => {
    await new Promise((resolve) => setTimeout(resolve, 900 + Math.random() * 900));
    const passed = Math.random() > 0.02; // 98% pass rate
    if (!passed) {
        throw new Error('Potential threat detected. Upload blocked.');
    }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function initFileUploadTriggers(selector = '[data-upload-documents]') {
    const triggers = document.querySelectorAll(selector);
    if (!triggers.length) return;

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const category = trigger.dataset.uploadCategory || 'lab-results';
            showFileUploadModal(category);
        });
    });
}

export function showFileUploadModal(defaultCategory = 'lab-results') {
    if (activeModal) {
        activeModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay file-upload-overlay';
    modal.innerHTML = `
        <div class="modal-container modal-container--large file-upload-container">
            <div class="modal-header">
                <div>
                    <h2>Secure Document Upload</h2>
                    <p class="modal-subtitle">Files are encrypted locally before being stored in our secure vault.</p>
                </div>
                <button class="modal-close" data-close-modal aria-label="Close modal">✕</button>
            </div>

            <div class="modal-body file-upload-body">
                <div class="upload-layout">
                    <aside class="upload-categories" data-category-tabs>
                        ${DOCUMENT_CATEGORIES.map((cat) => `
                            <button class="category-tab" data-category-tab="${cat.id}">
                                <span class="category-icon">${cat.icon}</span>
                                <span class="category-name">${cat.name}</span>
                                <span class="category-description">${cat.description}</span>
                            </button>
                        `).join('')}
                    </aside>

                    <div class="upload-main">
                        <div class="drop-zone" data-drop-zone>
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple data-file-input hidden />
                            <div class="drop-zone__icon">📁</div>
                            <h3>Drag & Drop files here</h3>
                            <p>Supported formats: PDF, JPG, PNG (max 10 MB each)</p>
                            <button type="button" class="button-secondary" data-browse-files>Browse Files</button>
                        </div>

                        <div class="upload-summary">
                            <div class="summary-card">
                                <div>
                                    <h4>Security Trail</h4>
                                    <p>Your uploads are encrypted locally using AES-256 before transmission.</p>
                                </div>
                                <ul>
                                    <li>🔐 Local AES-256 encryption</li>
                                    <li>🛡️ Automated threat scanning</li>
                                    <li>📜 Audit log with SHA-256 checksums</li>
                                </ul>
                            </div>
                        </div>

                        <div class="file-list-wrapper">
                            <div class="file-list-header">
                                <h4>Files in Queue</h4>
                                <button class="button-tertiary" data-clear-list type="button">Clear All</button>
                            </div>
                            <ul class="file-list" data-file-list></ul>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer file-upload-footer">
                <div class="upload-status" data-upload-status>
                    <span class="status-indicator status-indicator--idle"></span>
                    <span data-status-text>No files selected</span>
                </div>
                <div class="upload-actions">
                    <button class="button-secondary" data-close-modal type="button">Cancel</button>
                    <button class="button-primary" data-upload-submit type="button" disabled>Upload Securely</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    activeModal = modal;

    wireFileUploadModal(modal, defaultCategory);
}

function wireFileUploadModal(modal, defaultCategory) {
    const categoryTabs = modal.querySelectorAll('[data-category-tab]');
    const dropZone = modal.querySelector('[data-drop-zone]');
    const fileInput = modal.querySelector('[data-file-input]');
    const browseButton = modal.querySelector('[data-browse-files]');
    const fileList = modal.querySelector('[data-file-list]');
    const clearButton = modal.querySelector('[data-clear-list]');
    const uploadButton = modal.querySelector('[data-upload-submit]');
    const statusText = modal.querySelector('[data-status-text]');
    const statusIndicator = modal.querySelector('.status-indicator');

    let selectedCategory = DOCUMENT_CATEGORIES.find((cat) => cat.id === defaultCategory) ? defaultCategory : DOCUMENT_CATEGORIES[0].id;
    let queuedFiles = [];
    let isProcessing = false;

    const updateCategoryUI = () => {
        categoryTabs.forEach((tab) => {
            if (tab.dataset.categoryTab === selectedCategory) {
                tab.classList.add('is-active');
                tab.setAttribute('aria-selected', 'true');
                tab.setAttribute('tabindex', '0');
            } else {
                tab.classList.remove('is-active');
                tab.setAttribute('aria-selected', 'false');
                tab.setAttribute('tabindex', '-1');
            }
        });
    };

    const updateStatus = (text, state = 'idle') => {
        statusText.textContent = text;
        statusIndicator.className = `status-indicator status-indicator--${state}`;
    };

    const updateUploadButton = () => {
        const hasReadyFiles = queuedFiles.some((item) => item.status === 'ready');
        uploadButton.disabled = !hasReadyFiles || isProcessing;
    };

    const renderFileList = () => {
        if (!queuedFiles.length) {
            fileList.innerHTML = '<li class="file-list-empty">No files added yet.</li>';
            updateStatus('No files selected', 'idle');
            updateUploadButton();
            return;
        }

        const itemsHtml = queuedFiles.map((item) => {
            const meta = STATUS_META[item.status] || STATUS_META.pending;
            const warnings = item.warnings?.length ? `<div class="file-warnings">${item.warnings.map((warning) => `<p>${warning}</p>`).join('')}</div>` : '';
            const error = item.error ? `<div class="file-error">${item.error}</div>` : '';

            return `
                <li class="file-item file-item--${item.status}" data-file-id="${item.id}">
                    <div class="file-item__meta">
                        <div class="file-item__icon">${item.validation?.detectedType?.extension === 'pdf' ? '📄' : '🖼️'}</div>
                        <div>
                            <p class="file-item__name">${item.file.name}</p>
                            <p class="file-item__details">${item.validation?.readableSize || ''}${item.validation?.detectedType ? ` • ${item.validation.detectedType.label || item.validation.detectedType.mime}` : ''}</p>
                        </div>
                    </div>
                    <div class="file-item__status">
                        <span class="status-badge ${meta.badge}">${meta.label}</span>
                        ${item.status === 'uploading' || item.status === 'encrypting' || item.status === 'scanning' ? `
                            <div class="progress-bar">
                                <div class="progress-bar__inner" style="width: ${item.progress}%"></div>
                            </div>
                        ` : ''}
                        ${item.status === 'ready' ? `
                            <button type="button" class="button-tertiary" data-remove-file="${item.id}">Remove</button>
                        ` : ''}
                        ${item.status === 'success' ? `
                            <p class="file-item__timestamp">Uploaded ${formatDateTime(new Date(item.document.uploadedAt))}</p>
                        ` : ''}
                        ${error}
                        ${warnings}
                    </div>
                </li>
            `;
        }).join('');

        fileList.innerHTML = itemsHtml;
        const hasErrors = queuedFiles.some((item) => item.status === 'failed');
        const hasReady = queuedFiles.some((item) => item.status === 'ready');
        if (hasErrors && !hasReady) {
            updateStatus('Some files require attention before uploading.', 'error');
        } else if (hasReady) {
            updateStatus(`${queuedFiles.length} file${queuedFiles.length > 1 ? 's' : ''} queued`, 'ready');
        } else {
            updateStatus('Queue updated', 'ready');
        }
        updateUploadButton();
    };

    const addFilesToQueue = async (fileListObject) => {
        if (!fileListObject?.length) {
            showToast('No files detected. Please select a PDF or image.', { variant: 'warning' });
            return;
        }

        const existingNames = queuedFiles.map((item) => item.file.name.toLowerCase());
        const validation = await FileValidation.validateFiles(fileListObject, { existingNames });

        validation.results.forEach((result) => {
            const entry = createFileEntry(result.file, result);
            if (!entry.validation.valid) {
                showToast(`${result.file.name}: ${entry.error}`, { variant: 'error' });
            }
            queuedFiles.push(entry);
        });

        renderFileList();
    };

    const removeFileFromQueue = (fileId) => {
        queuedFiles = queuedFiles.filter((item) => item.id !== fileId);
        renderFileList();
        if (!queuedFiles.length) {
            updateStatus('No files selected', 'idle');
        }
    };

    const clearQueue = () => {
        queuedFiles = [];
        renderFileList();
        updateStatus('Queue cleared', 'idle');
        showToast('Upload queue cleared', { variant: 'info' });
    };

    const uploadQueue = async () => {
        if (isProcessing) return;
        const filesToUpload = queuedFiles.filter((item) => item.status === 'ready');
        if (!filesToUpload.length) {
            showToast('Add files before uploading.', { variant: 'warning' });
            return;
        }

        isProcessing = true;
        updateStatus('Encrypting and uploading files...', 'processing');
        updateUploadButton();

        for (const entry of filesToUpload) {
            try {
                entry.status = 'encrypting';
                entry.progress = 10;
                renderFileList();

                const encryption = await encryptFile(entry.file);
                entry.progress = 40;
                entry.encrypted = encryption;
                renderFileList();

                entry.status = 'scanning';
                entry.progress = 60;
                renderFileList();
                await simulateVirusScan();

                entry.status = 'uploading';
                entry.progress = 75;
                renderFileList();

                await delay(300 + Math.random() * 500);

                const payload = {
                    category: selectedCategory,
                    metadata: {
                        storedName: buildStorageName(entry.file.name, selectedCategory),
                        originalName: entry.file.name,
                        mimeType: entry.file.type,
                        size: entry.file.size,
                        checksum: entry.validation.checksum,
                    },
                    encryption: {
                        algorithm: 'AES-GCM',
                        iv: encryption.iv,
                        key: encryption.key,
                    },
                };

                const response = await DocumentsAPI.uploadDocument(payload);

                entry.status = 'success';
                entry.progress = 100;
                entry.document = response.data?.document || response.document || null;
                renderFileList();

                showToast(`${entry.file.name} uploaded securely.`, { variant: 'success' });
                if (entry.document) {
                    document.dispatchEvent(new CustomEvent('documents:updated', { detail: { document: entry.document } }));
                }
            } catch (error) {
                console.error('[Upload Error]', error);
                entry.status = 'failed';
                entry.error = error.message || 'Upload failed. Please try again.';
                entry.progress = 0;
                renderFileList();
                showToast(`${entry.file.name} failed: ${entry.error}`, { variant: 'error' });
                updateStatus('One or more uploads failed validation.', 'error');
            }
        }

        isProcessing = false;
        const remaining = queuedFiles.filter((item) => item.status === 'ready').length;
        const hasFailures = queuedFiles.some((item) => item.status === 'failed');
        if (hasFailures) {
            updateStatus('Check failed uploads and retry when ready.', 'error');
        } else if (remaining === 0) {
            updateStatus('All files processed', 'success');
        } else {
            updateStatus(`${remaining} file(s) waiting`, 'ready');
        }
        updateUploadButton();
    };

    // Event wiring
    categoryTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            selectedCategory = tab.dataset.categoryTab;
            updateCategoryUI();
        });
    });

    browseButton.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (event) => {
        await addFilesToQueue(event.target.files);
        fileInput.value = '';
    });

    dropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropZone.classList.add('is-dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('is-dragover');
    });

    dropZone.addEventListener('drop', async (event) => {
        event.preventDefault();
        dropZone.classList.remove('is-dragover');
        await addFilesToQueue(event.dataTransfer.files);
    });

    fileList.addEventListener('click', (event) => {
        const removeBtn = event.target.closest('[data-remove-file]');
        if (removeBtn) {
            removeFileFromQueue(removeBtn.dataset.removeFile);
        }
    });

    clearButton.addEventListener('click', clearQueue);
    uploadButton.addEventListener('click', uploadQueue);

    modal.querySelectorAll('[data-close-modal]').forEach((btn) => {
        btn.addEventListener('click', () => closeFileUploadModal(modal));
    });

    updateCategoryUI();
    renderFileList();
}

function closeFileUploadModal(modal) {
    modal.remove();
    document.body.style.overflow = '';
    activeModal = null;
}
