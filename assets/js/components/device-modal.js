import { showToast } from '../toast.js';
import { DevicesAPI } from '../api.js';

let activeModal = null;

/**
 * Device Connection Modal with OAuth Flow
 */
export function showDeviceConnectModal(deviceType = null) {
    if (activeModal) {
        activeModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container modal-container--large">
            <div class="modal-header">
                <h2>Connect Health Device</h2>
                <button class="modal-close" data-close-modal aria-label="Close modal">✕</button>
            </div>
            
            <div class="modal-body">
                ${deviceType ? renderOAuthFlow(deviceType) : renderDeviceSelection()}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    activeModal = modal;

    wireDeviceModal(modal, deviceType);
}

/**
 * Device Selection Screen
 */
function renderDeviceSelection() {
    return `
        <div class="device-selection">
            <p class="device-description">
                Connect your fitness tracker or health app to automatically sync your health data with DoCare.
            </p>

            <div class="devices-grid">
                <div class="device-card" data-device="fitbit">
                    <div class="device-icon">⌚</div>
                    <h3>Fitbit</h3>
                    <p>Sync steps, heart rate, sleep, and activity data</p>
                    <button class="button-primary" data-connect="fitbit">
                        Connect Fitbit
                    </button>
                </div>

                <div class="device-card" data-device="apple">
                    <div class="device-icon">🍎</div>
                    <h3>Apple Health</h3>
                    <p>Import health data from your iPhone or Apple Watch</p>
                    <button class="button-primary" data-connect="apple">
                        Connect Apple Health
                    </button>
                </div>

                <div class="device-card" data-device="google">
                    <div class="device-icon">🏃</div>
                    <h3>Google Fit</h3>
                    <p>Sync activity, nutrition, and wellness metrics</p>
                    <button class="button-primary" data-connect="google">
                        Connect Google Fit
                    </button>
                </div>

                <div class="device-card" data-device="withings">
                    <div class="device-icon">⚖️</div>
                    <h3>Withings</h3>
                    <p>Connect smart scales, watches, and health monitors</p>
                    <button class="button-primary" data-connect="withings">
                        Connect Withings
                    </button>
                </div>

                <div class="device-card" data-device="garmin">
                    <div class="device-icon">🏔️</div>
                    <h3>Garmin</h3>
                    <p>Sync running, cycling, and advanced fitness metrics</p>
                    <button class="button-primary" data-connect="garmin">
                        Connect Garmin
                    </button>
                </div>

                <div class="device-card" data-device="oura">
                    <div class="device-icon">💍</div>
                    <h3>Oura Ring</h3>
                    <p>Track sleep quality, readiness, and recovery</p>
                    <button class="button-primary" data-connect="oura">
                        Connect Oura
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * OAuth Flow Screen
 */
function renderOAuthFlow(deviceType) {
    const deviceInfo = getDeviceInfo(deviceType);

    return `
        <div class="oauth-flow">
            <div class="oauth-header">
                <div class="device-icon large">${deviceInfo.icon}</div>
                <h3>Connect ${deviceInfo.name}</h3>
            </div>

            <div class="permissions-section">
                <h4>DoCare would like to access:</h4>
                <div class="permissions-list">
                    ${deviceInfo.permissions.map(perm => `
                        <div class="permission-item">
                            <span class="permission-icon">✓</span>
                            <div>
                                <strong>${perm.title}</strong>
                                <p>${perm.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="info-box">
                <span class="info-icon">🔒</span>
                <p>Your health data is encrypted and never shared without your explicit permission.</p>
            </div>

            <div class="oauth-actions">
                <button class="button-secondary" data-back-to-selection>
                    ← Back
                </button>
                <button class="button-primary" data-authorize="${deviceType}">
                    Authorize Access
                </button>
            </div>

            <p class="oauth-footer">
                By authorizing, you agree to DoCare's <a href="#/privacy">Privacy Policy</a> and 
                <a href="#/terms">Terms of Service</a>.
            </p>
        </div>
    `;
}

/**
 * Device Permission Management Modal
 */
export function showPermissionsModal(device) {
    if (activeModal) {
        activeModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h2>Manage ${device.name} Permissions</h2>
                <button class="modal-close" data-close-modal aria-label="Close modal">✕</button>
            </div>
            
            <div class="modal-body">
                <div class="device-status">
                    <div class="status-indicator status-indicator--${device.status}"></div>
                    <div>
                        <strong>Status:</strong> ${device.status === 'connected' ? 'Connected' : 'Disconnected'}
                    </div>
                </div>

                <div class="sync-info">
                    <p><strong>Last Sync:</strong> ${device.lastSync || 'Never'}</p>
                    <button class="button-secondary" data-sync-now>
                        🔄 Sync Now
                    </button>
                </div>

                <h4>Data Access Permissions</h4>
                <div class="permissions-toggle-list">
                    <label class="permission-toggle">
                        <input type="checkbox" checked data-permission="activity" />
                        <div>
                            <strong>Activity Data</strong>
                            <p>Steps, distance, calories burned</p>
                        </div>
                    </label>

                    <label class="permission-toggle">
                        <input type="checkbox" checked data-permission="heart" />
                        <div>
                            <strong>Heart Rate</strong>
                            <p>Resting HR, active HR, HR variability</p>
                        </div>
                    </label>

                    <label class="permission-toggle">
                        <input type="checkbox" checked data-permission="sleep" />
                        <div>
                            <strong>Sleep Data</strong>
                            <p>Sleep duration, quality, stages</p>
                        </div>
                    </label>

                    <label class="permission-toggle">
                        <input type="checkbox" data-permission="nutrition" />
                        <div>
                            <strong>Nutrition</strong>
                            <p>Meals, water intake, macros</p>
                        </div>
                    </label>

                    <label class="permission-toggle">
                        <input type="checkbox" data-permission="weight" />
                        <div>
                            <strong>Weight & Body Composition</strong>
                            <p>Weight, BMI, body fat percentage</p>
                        </div>
                    </label>
                </div>

                <div class="danger-zone">
                    <h4>Danger Zone</h4>
                    <button class="button-danger" data-disconnect="${device.id}">
                        Disconnect ${device.name}
                    </button>
                    <p class="help-text">This will revoke access and stop syncing data.</p>
                </div>
            </div>

            <div class="modal-footer">
                <button class="button-secondary" data-close-modal>Cancel</button>
                <button class="button-primary" data-save-permissions>Save Changes</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    activeModal = modal;

    wirePermissionsModal(modal, device);
}

function wireDeviceModal(modal, deviceType) {
    // Connect buttons
    modal.querySelectorAll('[data-connect]').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.connect;
            showDeviceConnectModal(type);
        });
    });

    // Back to selection
    modal.querySelector('[data-back-to-selection]')?.addEventListener('click', () => {
        showDeviceConnectModal();
    });

    // Authorize button
    modal.querySelector('[data-authorize]')?.addEventListener('click', async (e) => {
        const btn = e.target;
        const type = btn.dataset.authorize;

        btn.disabled = true;
        btn.textContent = 'Connecting...';

        try {
            // Simulate OAuth redirect + callback
            await simulateOAuthFlow(type);

            const result = await DevicesAPI.connectDevice({
                type,
                accessToken: 'mock_token_' + Date.now(),
            });

            if (result.success) {
                showToast(`${getDeviceInfo(type).name} connected successfully!`, { variant: 'success' });
                closeModal(modal);
                setTimeout(() => window.location.reload(), 1000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            showToast('Connection failed. Please try again.', { variant: 'error' });
            btn.disabled = false;
            btn.textContent = 'Authorize Access';
        }
    });

    // Close modal
    modal.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(modal));
    });
}

function wirePermissionsModal(modal, device) {
    // Sync now button
    modal.querySelector('[data-sync-now]')?.addEventListener('click', async (e) => {
        const btn = e.target;
        btn.disabled = true;
        btn.textContent = '🔄 Syncing...';

        try {
            await DevicesAPI.syncDevice(device.id);
            showToast('Data synced successfully', { variant: 'success' });
            btn.textContent = '✓ Synced';
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = '🔄 Sync Now';
            }, 2000);
        } catch (error) {
            showToast('Sync failed', { variant: 'error' });
            btn.disabled = false;
            btn.textContent = '🔄 Sync Now';
        }
    });

    // Disconnect button
    modal.querySelector('[data-disconnect]')?.addEventListener('click', async (e) => {
        if (!confirm(`Are you sure you want to disconnect ${device.name}?`)) return;

        try {
            await DevicesAPI.disconnectDevice(device.id);
            showToast(`${device.name} disconnected`, { variant: 'success' });
            closeModal(modal);
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            showToast('Failed to disconnect', { variant: 'error' });
        }
    });

    // Save permissions
    modal.querySelector('[data-save-permissions]')?.addEventListener('click', async () => {
        const permissions = {};
        modal.querySelectorAll('[data-permission]').forEach(checkbox => {
            permissions[checkbox.dataset.permission] = checkbox.checked;
        });

        try {
            await DevicesAPI.updatePermissions(device.id, permissions);
            showToast('Permissions updated', { variant: 'success' });
            closeModal(modal);
        } catch (error) {
            showToast('Failed to update permissions', { variant: 'error' });
        }
    });

    // Close modal
    modal.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(modal));
    });
}

function getDeviceInfo(type) {
    const devices = {
        fitbit: {
            name: 'Fitbit',
            icon: '⌚',
            permissions: [
                { title: 'Activity Data', description: 'Steps, distance, calories, and active minutes' },
                { title: 'Heart Rate', description: 'Continuous heart rate monitoring and zones' },
                { title: 'Sleep Tracking', description: 'Sleep duration, stages, and quality scores' },
                { title: 'Profile Information', description: 'Name, age, weight, and height' },
            ],
        },
        apple: {
            name: 'Apple Health',
            icon: '🍎',
            permissions: [
                { title: 'Health Records', description: 'Medical records, allergies, and medications' },
                { title: 'Activity & Fitness', description: 'Workouts, steps, and exercise minutes' },
                { title: 'Body Measurements', description: 'Weight, height, BMI, and body composition' },
                { title: 'Vital Signs', description: 'Heart rate, blood pressure, and oxygen levels' },
            ],
        },
        google: {
            name: 'Google Fit',
            icon: '🏃',
            permissions: [
                { title: 'Physical Activity', description: 'Steps, move minutes, and heart points' },
                { title: 'Location Data', description: 'Track routes and outdoor activities' },
                { title: 'Body Metrics', description: 'Weight, height, and body fat percentage' },
                { title: 'Nutrition', description: 'Calorie intake and macronutrients' },
            ],
        },
        withings: {
            name: 'Withings',
            icon: '⚖️',
            permissions: [
                { title: 'Weight & Body Composition', description: 'Weight trends, BMI, fat mass, muscle mass' },
                { title: 'Blood Pressure', description: 'Systolic and diastolic readings' },
                { title: 'Sleep Data', description: 'Sleep cycles, breathing disturbances, snoring' },
                { title: 'Activity Tracking', description: 'Steps, distance, and calories' },
            ],
        },
        garmin: {
            name: 'Garmin',
            icon: '🏔️',
            permissions: [
                { title: 'Advanced Metrics', description: 'VO2 max, training load, recovery time' },
                { title: 'Workout Data', description: 'Running, cycling, swimming activities' },
                { title: 'Health Stats', description: 'Heart rate, stress levels, body battery' },
                { title: 'Sleep Analysis', description: 'Sleep stages, pulse ox during sleep' },
            ],
        },
        oura: {
            name: 'Oura Ring',
            icon: '💍',
            permissions: [
                { title: 'Readiness Score', description: 'Daily readiness and recovery insights' },
                { title: 'Sleep Quality', description: 'Deep sleep, REM, latency, efficiency' },
                { title: 'Activity Goals', description: 'Daily movement and calorie targets' },
                { title: 'Temperature', description: 'Body temperature trends and variations' },
            ],
        },
    };

    return devices[type] || devices.fitbit;
}

async function simulateOAuthFlow(deviceType) {
    // Simulate OAuth redirect delay
    return new Promise(resolve => setTimeout(resolve, 1500));
}

function closeModal(modal) {
    modal.remove();
    document.body.style.overflow = '';
    activeModal = null;
}
