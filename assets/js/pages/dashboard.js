import { auth } from '../auth.js';
import { i18n } from '../i18n.js';

const activityItems = [
    { id: 'act-1', title: 'Completed mood journal', timestamp: 'Today · 8:30 AM' },
    { id: 'act-2', title: 'Viewed article: Stress Management 101', timestamp: 'Yesterday · 9:12 PM' },
    { id: 'act-3', title: 'Medication logged: Sertraline 50mg', timestamp: 'Yesterday · 7:00 AM' },
];

const upcomingItems = [
    { id: 'up-1', title: 'Video consult with Dr. Patel', timestamp: 'Tomorrow · 10:00 AM' },
    { id: 'up-2', title: 'Medication refill reminder', timestamp: 'Oct 15 · 8:00 AM' },
];

const savedContent = [
    { id: 'saved-1', title: 'Breathing exercises for panic attacks', type: 'Article', url: '#' },
    { id: 'saved-2', title: 'Guided meditation for better sleep', type: 'Video', url: '#' },
];

const quickActions = [
    { type: 'route', route: '/appointments', labelKey: 'nav.appointments' },
    { type: 'route', route: '/symptom-checker', labelKey: 'actions.symptomCheck' },
    { type: 'route', route: '/messages', labelKey: 'actions.messageProvider' },
    { type: 'route', route: '/medications', labelKey: 'actions.viewMedications' },
    { type: 'route', route: '/billing', labelKey: 'nav.billing' },
    { type: 'route', route: '/devices', labelKey: 'nav.devices' },
    { type: 'upload', labelKey: 'dashboard.uploadDocuments', category: 'lab-results' },
];

const connectedDevices = [
    { id: 'dev-fitbit', name: 'Fitbit', status: 'connected', lastSync: 'Today · 6:20 AM', metrics: ['Steps', 'Sleep', 'Heart rate'] },
    { id: 'dev-apple', name: 'Apple Health', status: 'disconnected', lastSync: 'Not connected', metrics: ['Heart rate', 'Active energy'] },
    { id: 'dev-gfit', name: 'Google Fit', status: 'connected', lastSync: 'Yesterday · 9:45 PM', metrics: ['Steps', 'Distance'] },
];

const nutritionSummary = {
    calories: { consumed: 1420, target: 2000 },
    macros: [
        { id: 'macro-carb', label: 'Carbs', consumed: 180, target: 250, unit: 'g' },
        { id: 'macro-protein', label: 'Protein', consumed: 78, target: 110, unit: 'g' },
        { id: 'macro-fat', label: 'Fat', consumed: 45, target: 60, unit: 'g' },
    ],
};

const sleepInsights = {
    score: 86,
    duration: '7h 18m',
    phases: [
        { id: 'sleep-rem', label: 'REM', percent: 22, tone: 'rem' },
        { id: 'sleep-deep', label: 'Deep', percent: 18, tone: 'deep' },
        { id: 'sleep-light', label: 'Light', percent: 44, tone: 'light' },
        { id: 'sleep-awake', label: 'Awake', percent: 16, tone: 'awake' },
    ],
    tips: [
        'Aim for lights-out 20 minutes earlier tonight to improve deep sleep.',
        'Avoid caffeine after 2 PM to stabilise REM cycles.',
        'Try a 10-minute winding-down routine to reduce awake periods.',
    ],
};

const nextAppointment = {
    provider: 'Dr. Priya Patel',
    specialty: 'Psychiatrist',
    date: 'Oct 18, 2025',
    time: '10:30 AM',
    mode: 'Virtual consult',
    status: 'Confirmed',
    countdown: 'in 3 days',
};

const billingSummary = {
    outstandingBalance: 128.4,
    currency: 'USD',
    transactions: [
        { id: 'bill-1', label: 'CBT Session · Sep 30', amount: 85.0, status: 'Paid' },
        { id: 'bill-2', label: 'Lab test panel · Sep 25', amount: 128.4, status: 'Outstanding' },
        { id: 'bill-3', label: 'Medication refill · Sep 20', amount: 45.0, status: 'Paid' },
    ],
};

const challengeStatus = {
    active: [
        { id: 'chal-steps', title: '5k Steps · 14 Days', progress: 64 },
        { id: 'chal-hydrate', title: 'Hydration Hero', progress: 40 },
    ],
    leaderboard: [
        { id: 'lb-1', name: 'JR', points: 420 },
        { id: 'lb-2', name: 'AK', points: 395 },
        { id: 'lb-3', name: 'MP', points: 365 },
    ],
};

const rewardsSummary = {
    points: 1240,
    badges: [
        { id: 'badge-1', label: 'Wellness Warrior' },
        { id: 'badge-2', label: 'Sleep Champion' },
        { id: 'badge-3', label: 'Medication Maestro' },
    ],
    shop: [
        { id: 'reward-1', label: 'Guided meditation series', cost: 450 },
        { id: 'reward-2', label: 'Telehealth co-pay credit', cost: 800 },
    ],
};

const programLibrary = {
    inProgress: { id: 'prog-1', title: '7-Day Stress Reset', completion: 65 },
    upcoming: [
        { id: 'prog-2', title: 'Digital CBT Basics', duration: '4 weeks' },
        { id: 'prog-3', title: 'Low Back Pain Relief', duration: '3 weeks' },
    ],
};

const formatCurrency = amount => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export const DashboardPage = {
    isPublic: false,
    getTitle() {
        const user = auth.getUser();
        return user ? `${user.name} • ${i18n.t('nav.dashboard')} • ${i18n.t('brand.name')}` : `${i18n.t('nav.dashboard')} • ${i18n.t('brand.name')}`;
    },
    render() {
        const user = auth.getUser();
        return `
            <section class="dashboard">
                <header class="dashboard__header">
                    <p class="helper-text">${user ? `Hello, ${user.name}` : ''}</p>
                    <h1>${i18n.t('dashboard.title')}</h1>
                    <p>${i18n.t('dashboard.subtitle')}</p>
                </header>
                
                <div class="dashboard__grid dashboard__grid--metrics">
                    <article class="dashboard-card quick-actions">
                        <h2 class="section__headline">${i18n.t('dashboard.quickActions')}</h2>
                        <div class="quick-actions__buttons">
                            ${quickActions.map(action => {
                                if (action.type === 'upload') {
                                    return `
                                        <button class="button-primary" type="button" data-upload-documents data-upload-category="${action.category}">
                                            ${i18n.t(action.labelKey)}
                                        </button>
                                    `;
                                }
                                return `
                                    <button class="button-primary" type="button" data-route="${action.route}">
                                        ${i18n.t(action.labelKey)}
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </article>
                    
                    <article class="dashboard-card metric-card">
                        <header class="metric-card__header">
                            <h2 class="section__headline">${i18n.t('dashboard.nutrition')}</h2>
                            <span class="metric-pill">${nutritionSummary.calories.consumed}/${nutritionSummary.calories.target} kcal</span>
                        </header>
                        <div class="macro-progress">
                            ${nutritionSummary.macros.map(macro => {
                                const percent = Math.min(100, Math.round((macro.consumed / macro.target) * 100));
                                return `
                                    <div class="macro-progress__item">
                                        <div class="macro-progress__label">
                                            <span>${macro.label}</span>
                                            <span>${macro.consumed}/${macro.target} ${macro.unit}</span>
                                        </div>
                                        <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}">
                                            <span class="progress-bar__value" style="--progress:${percent}%"></span>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </article>
                    
                    <article class="dashboard-card metric-card">
                        <header class="metric-card__header">
                            <h2 class="section__headline">${i18n.t('dashboard.sleep')}</h2>
                            <span class="metric-pill metric-pill--success">${sleepInsights.score}/100</span>
                        </header>
                        <p class="metric-card__primary">${sleepInsights.duration}</p>
                        <p class="helper-text">${i18n.t('dashboard.sleepDuration')}</p>
                        <div class="sleep-timeline" aria-label="Sleep phases">
                            ${sleepInsights.phases.map(phase => `
                                <span class="sleep-timeline__segment sleep-timeline__segment--${phase.tone}" style="flex:${phase.percent}">
                                    <span>${phase.label}<small>${phase.percent}%</small></span>
                                </span>
                            `).join('')}
                        </div>
                    </article>
                </div>
                    <article class="dashboard-card metric-card">
                        <header class="metric-card__header">
                            <h2 class="section__headline">${i18n.t('dashboard.nextAppointment')}</h2>
                            <span class="status-chip">${nextAppointment.status}</span>
                        </header>
                        <p class="metric-card__primary">${nextAppointment.provider}</p>
                        <p class="helper-text">${nextAppointment.specialty} · ${nextAppointment.mode}</p>
                        <div class="appointment-details">
                            <span>${nextAppointment.date}</span>
                            <span>${nextAppointment.time}</span>
                        </div>
                        <p class="helper-text" style="margin-top: var(--space-2);">${i18n.t('dashboard.countdown')} ${nextAppointment.countdown}</p>
                        <div class="appointment-actions">
                            <button class="button-secondary" type="button" data-schedule-reschedule>${i18n.t('dashboard.reschedule')}</button>
                            <button class="button-ghost" type="button" data-schedule-cancel>${i18n.t('dashboard.cancel')}</button>
                        </div>
                    </article>
                    
                    <article class="dashboard-card metric-card">
                        <header class="metric-card__header">
                            <h2 class="section__headline">${i18n.t('dashboard.billing')}</h2>
                            <span class="metric-pill metric-pill--alert">${formatCurrency(billingSummary.outstandingBalance)}</span>
                        </header>
                        <div class="billing-list">
                            ${billingSummary.transactions.slice(0, 3).map(txn => `
                                <div class="billing-list__item">
                                    <div>
                                        <strong>${txn.label}</strong>
                                        <span class="helper-text">${txn.status}</span>
                                    </div>
                                    <span>${formatCurrency(txn.amount)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <button class="button-primary" type="button" data-route="/profile">${i18n.t('dashboard.payNow')}</button>
                    </article>
                </div>

                <div class="dashboard__grid dashboard__grid--wide">
                    <article class="dashboard-card">
                        <header class="metric-card__header">
                            <h2 class="section__headline">${i18n.t('dashboard.connectedDevices')}</h2>
                            <button class="button-secondary" type="button" data-route="/profile">${i18n.t('dashboard.manageConnections')}</button>
                        </header>
                        <div class="devices-grid">
                            ${connectedDevices.map(device => `
                                <div class="device-card" data-device-status="${device.status}">
                                    <div class="device-card__header">
                                        <h3>${device.name}</h3>
                                        <span class="status-chip status-chip--${device.status}">${i18n.t(device.status === 'connected' ? 'dashboard.connected' : 'dashboard.disconnected')}</span>
                                    </div>
                                    <p class="helper-text">${i18n.t('dashboard.lastSync')}: ${device.lastSync}</p>
                                    <ul class="device-card__metrics">
                                        ${device.metrics.map(metric => `<li>${metric}</li>`).join('')}
                                    </ul>
                                    ${device.status === 'disconnected' ? `<button class="button-secondary" type="button" data-connect-device="${device.id}">${i18n.t('dashboard.connect')}</button>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </article>
                    <article class="dashboard-card">
                        <header class="metric-card__header">
                            <h2 class="section__headline">${i18n.t('dashboard.challenges')}</h2>
                        </header>
                        <div class="challenge-grid">
                            <div class="challenge-grid__column">
                                <h3>${i18n.t('dashboard.activeChallenges')}</h3>
                                ${challengeStatus.active.map(challenge => `
                                    <div class="challenge-card">
                                        <strong>${challenge.title}</strong>
                                        <div class="progress-bar" role="progressbar" aria-valuenow="${challenge.progress}" aria-valuemin="0" aria-valuemax="100">
                                            <span class="progress-bar__value" style="--progress:${challenge.progress}%"></span>
                                        </div>
                                        <span class="helper-text">${challenge.progress}% complete</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="challenge-grid__column">
                                <h3>${i18n.t('dashboard.leaderboard')}</h3>
                                <ul class="leaderboard">
                                    ${challengeStatus.leaderboard.map((entry, index) => `
                                        <li>
                                            <span>${index + 1}. ${entry.name}</span>
                                            <span>${entry.points} pts</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    </article>
                </div>

                <div class="dashboard__grid">
                    <article class="dashboard-card">
                        <h2 class="section__headline">${i18n.t('dashboard.activityFeed')}</h2>
                        ${activityItems.map(item => `
                            <div class="activity-feed__item">
                                <strong>${item.title}</strong>
                                <span>${item.timestamp}</span>
                            </div>
                        `).join('')}
                    </article>
                    
                    <article class="dashboard-card">
                        <header class="metric-card__header">
                            <h2 class="section__headline">${i18n.t('dashboard.rewards')}</h2>
                            <span class="metric-pill">${rewardsSummary.points} pts</span>
                        </header>
                        <div class="badge-row">
                            ${rewardsSummary.badges.map(badge => `<span class="badge">${badge.label}</span>`).join('')}
                        </div>
                        <h3 class="section__headline section__headline--small">${i18n.t('dashboard.redeem')}</h3>
                        <ul class="rewards-shop">
                            ${rewardsSummary.shop.map(item => `
                                <li>
                                    <span>${item.label}</span>
                                    <span class="helper-text">${item.cost} pts</span>
                                </li>
                            `).join('')}
                        </ul>
                    </article>
                    
                    <article class="dashboard-card">
                        <h2 class="section__headline">${i18n.t('dashboard.programs')}</h2>
                        <div class="program-progress">
                            <div class="program-progress__header">
                                <strong>${programLibrary.inProgress.title}</strong>
                                <span>${programLibrary.inProgress.completion}%</span>
                            </div>
                            <div class="progress-bar" role="progressbar" aria-valuenow="${programLibrary.inProgress.completion}" aria-valuemin="0" aria-valuemax="100">
                                <span class="progress-bar__value" style="--progress:${programLibrary.inProgress.completion}%"></span>
                            </div>
                        </div>
                        <h3 class="section__headline section__headline--small">${i18n.t('dashboard.nextPrograms')}</h3>
                        <ul class="program-list">
                            ${programLibrary.upcoming.map(program => `
                                <li>
                                    <span>${program.title}</span>
                                    <span class="helper-text">${program.duration}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </article>
                </div>
            </section>
        `;
    },
};
