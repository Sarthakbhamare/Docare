import { i18n } from '../i18n.js';
import { auth } from '../auth.js';
import { showToast } from '../toast.js';
import { showEmergencySOSModal } from '../emergency.js';

const PROFILE_THEME_KEY = 'docare.theme';

const getCurrentTheme = () => document.documentElement.getAttribute('data-theme') || 'default';

const deviceCatalog = [
    { id: 'fitbit', name: 'Fitbit', description: 'Steps · Heart rate · Sleep', logo: 'assets/img/fitbit.svg' },
    { id: 'apple-health', name: 'Apple Health', description: 'Vitals · Workouts · Trends', logo: 'assets/img/apple-health.svg' },
    { id: 'google-fit', name: 'Google Fit', description: 'Activity · Distance · Calories', logo: 'assets/img/google-fit.svg' },
];

const consentDataPoints = [
    { id: 'heartRate', label: 'Heart rate & vitals' },
    { id: 'moodLogs', label: 'Mood journaling entries' },
    { id: 'medicationAdherence', label: 'Medication adherence' },
    { id: 'sleepPatterns', label: 'Sleep patterns & duration' },
];

export const ProfilePage = {
    isPublic: false,
    getTitle() {
        return `${i18n.t('nav.profile')} • ${i18n.t('brand.name')}`;
    },
    render() {
        const user = auth.getUser();
        const profile = user?.profile ?? {};
        const address = profile.address ?? {};
        const emergency = profile.emergencyContact ?? {};
        const integrations = user?.integrations ?? {};
        const connectedDevices = new Set(integrations.devices ?? []);
        const dataConsent = profile.dataConsent ?? true;
        const dataPermissions = consentDataPoints.reduce((acc, point) => {
            const stored = profile.dataPermissions?.[point.id];
            acc[point.id] = stored ?? dataConsent;
            return acc;
        }, {});
        const mfaEnabled = profile.mfaEnabled ?? false;
        return `
            <section class="profile-page">
                <header class="profile-page__header">
                    <h1>${i18n.t('profile.title')}</h1>
                    <p>${i18n.t('profile.subtitle')}</p>
                </header>

                <div class="profile-sections">
                    <article class="form-card">
                        <h2>${i18n.t('profile.contactSection')}</h2>
                        <div class="form-grid form-grid--two-col">
                            <label class="label">
                                ${i18n.t('auth.nameLabel')}
                                <input class="input" type="text" value="${user?.name ?? ''}" disabled>
                            </label>
                            <label class="label">
                                ${i18n.t('auth.emailLabel')}
                                <input class="input" type="email" value="${user?.email ?? ''}" disabled>
                            </label>
                            <label class="label">
                                ${i18n.t('auth.phoneLabel')}
                                <input class="input" type="tel" value="${profile.phone ?? ''}" disabled>
                            </label>
                            <label class="label">
                                ${i18n.t('auth.dobLabel')}
                                <input class="input" type="text" value="${profile.dateOfBirth ?? ''}" disabled>
                            </label>
                        </div>
                        <div class="profile-summary">
                            <div>
                                <span class="helper-text">${i18n.t('auth.addressSection')}</span>
                                <p>${[address.line1, address.line2, address.city, address.state, address.postal].filter(Boolean).join(', ') || '—'}</p>
                            </div>
                            <div>
                                <span class="helper-text">${i18n.t('auth.emergencySection')}</span>
                                <p>${emergency.name ?? '—'} · ${emergency.phone ?? ''}</p>
                            </div>
                        </div>
                    </article>

                    <article class="form-card">
                        <h2>${i18n.t('profile.accessibilitySection')}</h2>
                        <div class="preference-toggle">
                            <span>${i18n.t('profile.highContrastLabel')}</span>
                            <button class="button-secondary" type="button" data-toggle-contrast>
                                ${i18n.t(getCurrentTheme() === 'high-contrast' ? 'profile.highContrastDisable' : 'profile.highContrastEnable')}
                            </button>
                        </div>
                    </article>

                    <article class="form-card">
                        <h2>${i18n.t('profile.localizationSection')}</h2>
                        <label class="label">
                            ${i18n.t('profile.languageLabel')}
                            <select class="select" data-locale-select>
                                <option value="en" ${i18n.getLocale() === 'en' ? 'selected' : ''}>English</option>
                                <option value="hi" ${i18n.getLocale() === 'hi' ? 'selected' : ''}>हिन्दी</option>
                            </select>
                        </label>
                        <button class="button-primary" type="button" data-save-preferences>${i18n.t('actions.savePreferences')}</button>
                    </article>

                    <article class="form-card">
                        <h2>${i18n.t('profile.devicesSection')}</h2>
                        <div class="devices-preferences">
                            ${deviceCatalog.map(device => `
                                <div class="device-preference" data-device="${device.id}">
                                    <div class="device-preference__info">
                                        <h3>${device.name}</h3>
                                        <p class="helper-text">${device.description}</p>
                                    </div>
                                    <button class="button-secondary" type="button" data-connect-device="${device.id}">
                                        ${i18n.t(connectedDevices.has(device.id) ? 'dashboard.disconnect' : 'dashboard.connect')}
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        <button class="button-primary" type="button" data-route="/dashboard">${i18n.t('profile.addDevice')}</button>
                    </article>

                    <article class="form-card">
                        <h2>${i18n.t('profile.dataPrivacySection')}</h2>
                        <p class="helper-text">${i18n.t('profile.consentHeading')}</p>
                        <div class="consent-grid">
                            ${consentDataPoints.map(point => `
                                <label class="label" data-checkbox-row>
                                    <span>${point.label}</span>
                                    <input type="checkbox" data-consent-toggle value="${point.id}" ${dataPermissions[point.id] ? 'checked' : ''}>
                                </label>
                            `).join('')}
                        </div>
                    </article>

                    <article class="form-card">
                        <h2>${i18n.t('profile.securitySection')}</h2>
                        <p class="helper-text">${i18n.t('profile.mfaDescription')}</p>
                        <div class="preference-toggle">
                            <span>${i18n.t('profile.toggleMfa')}</span>
                            <button class="button-secondary" type="button" data-toggle-mfa>
                                ${i18n.t(mfaEnabled ? 'profile.mfaDisableAction' : 'profile.mfaEnableAction')}
                            </button>
                        </div>
                    </article>

                    <article class="form-card">
                        <h2>${i18n.t('profile.sosSection')}</h2>
                        <p class="helper-text">${i18n.t('profile.sosDescription')}</p>
                        <button class="button-primary button-primary--alert" type="button" data-sos-trigger>${i18n.t('profile.sosButton')}</button>
                    </article>
                </div>
            </section>
        `;
    },
    afterRender() {
        const contrastButton = document.querySelector('[data-toggle-contrast]');
        contrastButton?.addEventListener('click', () => {
            const current = getCurrentTheme();
            const next = current === 'high-contrast' ? 'default' : 'high-contrast';
            if (next === 'default') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.removeItem(PROFILE_THEME_KEY);
            } else {
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem(PROFILE_THEME_KEY, next);
            }
            showToast(`Theme updated to ${next}.`, { variant: 'info', duration: 2600 });
            const button = document.querySelector('[data-toggle-contrast]');
            if (button) {
                button.textContent = i18n.t(next === 'high-contrast' ? 'profile.highContrastDisable' : 'profile.highContrastEnable');
            }
        });

        const localeButton = document.querySelector('[data-save-preferences]');
        const select = document.querySelector('[data-locale-select]');
        localeButton?.addEventListener('click', () => {
            if (select) {
                i18n.setLocale(select.value);
                showToast(i18n.t('profile.languageSaved'), { variant: 'success', duration: 2600 });
            }
        });

        const user = auth.getUser();
        const integrations = user?.integrations ?? {};
        const connectedDevices = new Set(integrations.devices ?? []);
        const permissions = consentDataPoints.reduce((acc, point) => {
            const stored = user?.profile?.dataPermissions?.[point.id];
            acc[point.id] = stored ?? user?.profile?.dataConsent ?? true;
            return acc;
        }, {});

        document.querySelectorAll('[data-connect-device]').forEach(button => {
            button.addEventListener('click', () => {
                const deviceId = button.getAttribute('data-connect-device');
                if (!deviceId) return;
                const isConnected = connectedDevices.has(deviceId);
                if (isConnected) {
                    connectedDevices.delete(deviceId);
                } else {
                    connectedDevices.add(deviceId);
                }
                auth.updateActiveUser({
                    integrations: {
                        ...integrations,
                        devices: Array.from(connectedDevices),
                    },
                });
                integrations.devices = Array.from(connectedDevices);
                user.integrations = { ...integrations };
                button.textContent = i18n.t(isConnected ? 'dashboard.connect' : 'dashboard.disconnect');
                showToast(i18n.t(isConnected ? 'profile.deviceDisconnected' : 'profile.deviceConnected'), { variant: 'info', duration: 2600 });
            });
        });

        document.querySelectorAll('[data-consent-toggle]').forEach(toggle => {
            toggle.addEventListener('change', () => {
                const id = toggle.value;
                permissions[id] = toggle.checked;
                const aggregated = Object.values(permissions).some(Boolean);
                auth.updateActiveUser({
                    profile: {
                        ...user?.profile,
                        dataConsent: aggregated,
                        dataPermissions: { ...permissions },
                    },
                });
                user.profile = {
                    ...(user?.profile ?? {}),
                    dataConsent: aggregated,
                    dataPermissions: { ...permissions },
                };
                showToast(i18n.t('profile.consentSaved'), { variant: 'success', duration: 2200 });
            });
        });

        const mfaToggle = document.querySelector('[data-toggle-mfa]');
        mfaToggle?.addEventListener('click', () => {
            const currentlyEnabled = Boolean(user?.profile?.mfaEnabled);
            const nextEnabled = !currentlyEnabled;
            auth.updateActiveUser({
                profile: {
                    ...user?.profile,
                    mfaEnabled: nextEnabled,
                },
            });
            user.profile = {
                ...(user?.profile ?? {}),
                mfaEnabled: nextEnabled,
            };
            mfaToggle.textContent = i18n.t(nextEnabled ? 'profile.mfaDisableAction' : 'profile.mfaEnableAction');
            showToast(i18n.t(nextEnabled ? 'profile.mfaEnabled' : 'profile.mfaDisabled'), { variant: 'info', duration: 2600 });
        });

        const sosButton = document.querySelector('[data-sos-trigger]');
        sosButton?.addEventListener('click', () => {
            showEmergencySOSModal();
        });
    },
};
