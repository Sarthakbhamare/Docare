import { i18n } from '../i18n.js';
import { showToast } from '../toast.js';

const upcomingAppointments = [
    {
        id: 'apt-1',
        provider: 'Dr. Priya Patel',
        specialty: 'Psychiatrist',
        date: '2025-10-18',
        time: '10:30 AM',
        duration: '45 min',
        mode: 'Virtual',
        status: 'Confirmed',
        notes: 'Follow-up on medication adjustment',
        location: 'Telehealth - Video Call',
    },
    {
        id: 'apt-2',
        provider: 'Dr. James Chen',
        specialty: 'Primary Care',
        date: '2025-10-22',
        time: '2:00 PM',
        duration: '30 min',
        mode: 'In-person',
        status: 'Confirmed',
        notes: 'Annual physical examination',
        location: 'DoCare Clinic, Suite 204',
    },
    {
        id: 'apt-3',
        provider: 'Sarah Martinez, LCSW',
        specialty: 'Therapist',
        date: '2025-10-25',
        time: '4:00 PM',
        duration: '60 min',
        mode: 'Virtual',
        status: 'Pending',
        notes: 'Weekly therapy session',
        location: 'Telehealth - Video Call',
    },
];

const pastAppointments = [
    {
        id: 'apt-past-1',
        provider: 'Dr. Priya Patel',
        specialty: 'Psychiatrist',
        date: '2025-10-04',
        time: '10:30 AM',
        mode: 'Virtual',
        status: 'Completed',
        summary: 'Discussed medication effectiveness. Adjusted dosage.',
    },
    {
        id: 'apt-past-2',
        provider: 'Sarah Martinez, LCSW',
        specialty: 'Therapist',
        date: '2025-09-27',
        time: '4:00 PM',
        mode: 'Virtual',
        status: 'Completed',
        summary: 'Worked on coping strategies for work-related stress.',
    },
];

const availableSlots = [
    { date: '2025-10-15', time: '9:00 AM' },
    { date: '2025-10-15', time: '11:30 AM' },
    { date: '2025-10-16', time: '2:00 PM' },
    { date: '2025-10-17', time: '10:00 AM' },
    { date: '2025-10-17', time: '3:30 PM' },
];

const formatDate = dateStr => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const getDaysUntil = dateStr => {
    const now = new Date('2025-10-12');
    const target = new Date(dateStr);
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff < 7) return `in ${diff} days`;
    return formatDate(dateStr);
};

export const AppointmentsPage = {
    isPublic: false,
    getTitle() {
        return `${i18n.t('appointments.title')} • ${i18n.t('brand.name')}`;
    },
    render() {
        return `
            <section class="appointments-page">
                <header class="appointments-page__header">
                    <div>
                        <h1>${i18n.t('appointments.title')}</h1>
                        <p>${i18n.t('appointments.subtitle')}</p>
                    </div>
                    <button class="button-primary" type="button" data-action="schedule-new">
                        <span>+ ${i18n.t('appointments.scheduleNew')}</span>
                    </button>
                </header>

                <div class="appointments-grid">
                    <section class="appointments-section">
                        <div class="section-header">
                            <h2>${i18n.t('appointments.upcoming')}</h2>
                            <span class="count-badge">${upcomingAppointments.length}</span>
                        </div>
                        <div class="appointment-cards">
                            ${upcomingAppointments.map(apt => `
                                <article class="appointment-card appointment-card--${apt.status.toLowerCase()}">
                                    <div class="appointment-card__header">
                                        <div class="appointment-card__provider">
                                            <h3>${apt.provider}</h3>
                                            <p class="helper-text">${apt.specialty}</p>
                                        </div>
                                        <span class="status-badge status-badge--${apt.status.toLowerCase()}">${apt.status}</span>
                                    </div>
                                    <div class="appointment-card__details">
                                        <div class="detail-row">
                                            <span class="detail-icon">📅</span>
                                            <div>
                                                <strong>${formatDate(apt.date)}</strong>
                                                <span class="helper-text">${getDaysUntil(apt.date)}</span>
                                            </div>
                                        </div>
                                        <div class="detail-row">
                                            <span class="detail-icon">🕐</span>
                                            <div>
                                                <strong>${apt.time}</strong>
                                                <span class="helper-text">${apt.duration}</span>
                                            </div>
                                        </div>
                                        <div class="detail-row">
                                            <span class="detail-icon">${apt.mode === 'Virtual' ? '💻' : '🏥'}</span>
                                            <div>
                                                <strong>${apt.mode}</strong>
                                                <span class="helper-text">${apt.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                    ${apt.notes ? `<div class="appointment-card__notes"><strong>Notes:</strong> ${apt.notes}</div>` : ''}
                                    <div class="appointment-card__actions">
                                        ${apt.mode === 'Virtual' && apt.status === 'Confirmed' ? `<button class="button-primary" type="button" data-join-video="${apt.id}">${i18n.t('appointments.joinVideo')}</button>` : ''}
                                        <button class="button-secondary" type="button" data-reschedule="${apt.id}">${i18n.t('appointments.reschedule')}</button>
                                        <button class="button-ghost" type="button" data-cancel="${apt.id}">${i18n.t('appointments.cancel')}</button>
                                    </div>
                                </article>
                            `).join('')}
                        </div>
                    </section>

                    <aside class="appointments-sidebar">
                        <section class="quick-schedule-card">
                            <h2>${i18n.t('appointments.quickSchedule')}</h2>
                            <p class="helper-text">${i18n.t('appointments.quickScheduleDesc')}</p>
                            <div class="available-slots">
                                ${availableSlots.map(slot => `
                                    <button class="slot-button" type="button" data-book-slot="${slot.date}-${slot.time}">
                                        <span class="slot-date">${formatDate(slot.date)}</span>
                                        <span class="slot-time">${slot.time}</span>
                                    </button>
                                `).join('')}
                            </div>
                        </section>

                        <section class="appointment-tips">
                            <h3>${i18n.t('appointments.prepTips')}</h3>
                            <ul>
                                <li>${i18n.t('appointments.tip1')}</li>
                                <li>${i18n.t('appointments.tip2')}</li>
                                <li>${i18n.t('appointments.tip3')}</li>
                                <li>${i18n.t('appointments.tip4')}</li>
                            </ul>
                        </section>
                    </aside>
                </div>

                <section class="appointments-section">
                    <div class="section-header">
                        <h2>${i18n.t('appointments.pastAppointments')}</h2>
                        <button class="button-ghost" type="button" data-view-all-history>${i18n.t('appointments.viewAll')}</button>
                    </div>
                    <div class="past-appointments-list">
                        ${pastAppointments.map(apt => `
                            <article class="past-appointment-card">
                                <div class="past-appointment-card__header">
                                    <div>
                                        <h3>${apt.provider}</h3>
                                        <p class="helper-text">${apt.specialty}</p>
                                    </div>
                                    <span class="past-appointment-date">${formatDate(apt.date)}</span>
                                </div>
                                <div class="past-appointment-card__summary">
                                    <strong>${i18n.t('appointments.summary')}:</strong>
                                    <p>${apt.summary}</p>
                                </div>
                                <div class="past-appointment-card__actions">
                                    <button class="button-secondary" type="button" data-view-notes="${apt.id}">${i18n.t('appointments.viewNotes')}</button>
                                    <button class="button-ghost" type="button" data-rebook="${apt.id}">${i18n.t('appointments.bookAgain')}</button>
                                </div>
                            </article>
                        `).join('')}
                    </div>
                </section>
            </section>
        `;
    },
    afterRender() {
        document.querySelector('[data-action="schedule-new"]')?.addEventListener('click', () => {
            showToast(i18n.t('appointments.scheduleNewToast'), { variant: 'info', duration: 3000 });
        });

        document.querySelectorAll('[data-join-video]').forEach(btn => {
            btn.addEventListener('click', () => {
                showToast('Joining video call...', { variant: 'success', duration: 1500 });
                setTimeout(() => {
                    window.__appRouter?.navigate('/video-call');
                }, 500);
            });
        });

        document.querySelectorAll('[data-reschedule]').forEach(btn => {
            btn.addEventListener('click', () => {
                showToast(i18n.t('appointments.reschedulePrompt'), { variant: 'info', duration: 3000 });
            });
        });

        document.querySelectorAll('[data-cancel]').forEach(btn => {
            btn.addEventListener('click', () => {
                showToast(i18n.t('appointments.cancelConfirm'), { variant: 'warning', duration: 3500 });
            });
        });

        document.querySelectorAll('[data-book-slot]').forEach(btn => {
            btn.addEventListener('click', () => {
                showToast(i18n.t('appointments.slotSelected'), { variant: 'success', duration: 2500 });
            });
        });
    },
};
