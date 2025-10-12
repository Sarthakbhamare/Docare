import { i18n } from '../i18n.js';
import { showToast } from '../toast.js';
import { auth } from '../auth.js';

const deviceCatalog = [
    {
        id: 'dev-fitbit',
        name: 'Fitbit',
        icon: '⌚',
        category: 'Wearable',
        description: 'Track steps, heart rate, sleep, and active minutes',
        metrics: ['Steps', 'Heart rate', 'Sleep stages', 'Active energy', 'Floors climbed'],
        status: 'connected',
        lastSync: '2025-10-12T06:20:00',
        syncFrequency: 'Real-time',
        dataPoints: 1247,
    },
    {
        id: 'dev-apple',
        name: 'Apple Health',
        icon: '🍎',
        category: 'Platform',
        description: 'Centralized health data from iPhone and Apple Watch',
        metrics: ['Heart rate', 'Blood oxygen', 'ECG', 'Active energy', 'Mindfulness minutes'],
        status: 'disconnected',
        lastSync: null,
        syncFrequency: 'Hourly',
        dataPoints: 0,
    },
    {
        id: 'dev-gfit',
        name: 'Google Fit',
        icon: '🏃',
        category: 'Platform',
        description: 'Activity tracking and workout history from Android devices',
        metrics: ['Steps', 'Distance', 'Active minutes', 'Heart points', 'Weight'],
        status: 'connected',
        lastSync: '2025-10-11T21:45:00',
        syncFrequency: 'Every 4 hours',
        dataPoints: 832,
    },
    {
        id: 'dev-withings',
        name: 'Withings Scale',
        icon: '⚖️',
        category: 'Device',
        description: 'Smart scale for weight, BMI, and body composition',
        metrics: ['Weight', 'BMI', 'Body fat %', 'Muscle mass', 'Bone mass'],
        status: 'pending',
        lastSync: null,
        syncFrequency: 'After each measurement',
        dataPoints: 0,
    },
    {
        id: 'dev-omron',
        name: 'Omron Blood Pressure',
        icon: '🩺',
        category: 'Device',
        description: 'Monitor and track blood pressure readings',
        metrics: ['Systolic BP', 'Diastolic BP', 'Pulse', 'Irregular heartbeat detection'],
        status: 'disconnected',
        lastSync: null,
        syncFrequency: 'Manual sync',
        dataPoints: 0,
    },
    {
        id: 'dev-strava',
        name: 'Strava',
        icon: '🚴',
        category: 'App',
        description: 'Running and cycling activity tracker',
        metrics: ['Distance', 'Pace', 'Elevation', 'Cadence', 'Power'],
        status: 'connected',
        lastSync: '2025-10-12T07:10:00',
        syncFrequency: 'After each activity',
        dataPoints: 156,
    },
];

const syncHistory = [
    { id: 'sync-1', device: 'Fitbit', timestamp: '2025-10-12T06:20:00', status: 'Success', records: 87 },
    { id: 'sync-2', device: 'Strava', timestamp: '2025-10-12T07:10:00', status: 'Success', records: 12 },
    { id: 'sync-3', device: 'Google Fit', timestamp: '2025-10-11T21:45:00', status: 'Success', records: 54 },
    { id: 'sync-4', device: 'Fitbit', timestamp: '2025-10-11T18:20:00', status: 'Success', records: 92 },
    { id: 'sync-5', device: 'Google Fit', timestamp: '2025-10-11T15:30:00', status: 'Partial', records: 23 },
];

const formatTimestamp = isoString => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const now = new Date('2025-10-12T10:00:00');
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
};

export const DevicesPage = {
    isPublic: false,
    getTitle() {
        return `${i18n.t('devices.title')} • ${i18n.t('brand.name')}`;
    },
    render() {
        const user = auth.getUser();
        const connectedCount = deviceCatalog.filter(d => d.status === 'connected').length;

        return `
            <section class="devices-page">
                <header class="devices-page__header">
                    <div>
                        <h1>${i18n.t('devices.title')}</h1>
                        <p>${i18n.t('devices.subtitle')}</p>
                    </div>
                    <div class="devices-stats">
                        <div class="stat-pill">
                            <span class="stat-label">${i18n.t('devices.connected')}</span>
                            <span class="stat-value">${connectedCount}</span>
                        </div>
                        <div class="stat-pill">
                            <span class="stat-label">${i18n.t('devices.dataPoints')}</span>
                            <span class="stat-value">${deviceCatalog.reduce((sum, d) => sum + d.dataPoints, 0)}</span>
                        </div>
                    </div>
                </header>

                <div class="devices-grid-layout">
                    <div class="devices-main">
                        <section class="devices-section">
                            <h2 class="section-title">${i18n.t('devices.connectedDevices')}</h2>
                            <div class="device-cards-grid">
                                ${deviceCatalog.filter(d => d.status === 'connected').map(device => `
                                    <article class="device-detail-card device-detail-card--${device.status}">
                                        <div class="device-detail-card__header">
                                            <div class="device-icon-large">${device.icon}</div>
                                            <div class="device-detail-card__title">
                                                <h3>${device.name}</h3>
                                                <span class="device-category">${device.category}</span>
                                            </div>
                                            <span class="status-indicator status-indicator--${device.status}"></span>
                                        </div>
                                        <p class="device-description">${device.description}</p>
                                        <div class="device-metrics-grid">
                                            ${device.metrics.slice(0, 4).map(metric => `
                                                <span class="metric-chip">${metric}</span>
                                            `).join('')}
                                        </div>
                                        <div class="device-sync-info">
                                            <div class="sync-detail">
                                                <span class="sync-label">${i18n.t('devices.lastSync')}</span>
                                                <strong>${formatTimestamp(device.lastSync)}</strong>
                                            </div>
                                            <div class="sync-detail">
                                                <span class="sync-label">${i18n.t('devices.dataPoints')}</span>
                                                <strong>${device.dataPoints.toLocaleString()}</strong>
                                            </div>
                                        </div>
                                        <div class="device-actions">
                                            <button class="button-secondary" type="button" data-sync-now="${device.id}">${i18n.t('devices.syncNow')}</button>
                                            <button class="button-ghost" type="button" data-disconnect="${device.id}">${i18n.t('devices.disconnect')}</button>
                                        </div>
                                    </article>
                                `).join('')}
                            </div>
                        </section>

                        <section class="devices-section">
                            <h2 class="section-title">${i18n.t('devices.availableIntegrations')}</h2>
                            <div class="device-cards-grid">
                                ${deviceCatalog.filter(d => d.status !== 'connected').map(device => `
                                    <article class="device-detail-card device-detail-card--${device.status}">
                                        <div class="device-detail-card__header">
                                            <div class="device-icon-large">${device.icon}</div>
                                            <div class="device-detail-card__title">
                                                <h3>${device.name}</h3>
                                                <span class="device-category">${device.category}</span>
                                            </div>
                                            ${device.status === 'pending' ? '<span class="status-badge status-badge--pending">Pending</span>' : ''}
                                        </div>
                                        <p class="device-description">${device.description}</p>
                                        <div class="device-metrics-grid">
                                            ${device.metrics.slice(0, 4).map(metric => `
                                                <span class="metric-chip metric-chip--muted">${metric}</span>
                                            `).join('')}
                                        </div>
                                        <div class="device-sync-info">
                                            <div class="sync-detail">
                                                <span class="sync-label">${i18n.t('devices.syncFrequency')}</span>
                                                <strong>${device.syncFrequency}</strong>
                                            </div>
                                        </div>
                                        <button class="button-primary" type="button" data-connect="${device.id}">${i18n.t('devices.connect')}</button>
                                    </article>
                                `).join('')}
                            </div>
                        </section>
                    </div>

                    <aside class="devices-sidebar">
                        <section class="sync-history-card">
                            <h2>${i18n.t('devices.syncHistory')}</h2>
                            <div class="sync-history-list">
                                ${syncHistory.map(sync => `
                                    <div class="sync-history-item sync-history-item--${sync.status.toLowerCase()}">
                                        <div class="sync-history-header">
                                            <strong>${sync.device}</strong>
                                            <span class="sync-status sync-status--${sync.status.toLowerCase()}">${sync.status}</span>
                                        </div>
                                        <div class="sync-history-meta">
                                            <span class="helper-text">${formatTimestamp(sync.timestamp)}</span>
                                            <span class="helper-text">${sync.records} ${i18n.t('devices.records')}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </section>

                        <section class="data-privacy-card">
                            <h2>${i18n.t('devices.dataPrivacy')}</h2>
                            <p class="helper-text">${i18n.t('devices.privacyDesc')}</p>
                            <ul class="privacy-points">
                                <li>✅ ${i18n.t('devices.privacy1')}</li>
                                <li>✅ ${i18n.t('devices.privacy2')}</li>
                                <li>✅ ${i18n.t('devices.privacy3')}</li>
                                <li>✅ ${i18n.t('devices.privacy4')}</li>
                            </ul>
                            <button class="button-secondary" type="button" data-manage-permissions>${i18n.t('devices.managePermissions')}</button>
                        </section>
                    </aside>
                </div>
            </section>
        `;
    },
    afterRender() {
        document.querySelectorAll('[data-connect]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const deviceId = e.target.getAttribute('data-connect');
                const device = deviceCatalog.find(d => d.id === deviceId);
                showToast(`${i18n.t('devices.connectingTo')} ${device?.name}...`, { variant: 'info', duration: 3000 });
            });
        });

        document.querySelectorAll('[data-disconnect]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const deviceId = e.target.getAttribute('data-disconnect');
                const device = deviceCatalog.find(d => d.id === deviceId);
                showToast(`${device?.name} ${i18n.t('devices.disconnected')}`, { variant: 'warning', duration: 2500 });
            });
        });

        document.querySelectorAll('[data-sync-now]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const deviceId = e.target.getAttribute('data-sync-now');
                const device = deviceCatalog.find(d => d.id === deviceId);
                showToast(`${i18n.t('devices.syncing')} ${device?.name}...`, { variant: 'info', duration: 2500 });
            });
        });
    },
};
