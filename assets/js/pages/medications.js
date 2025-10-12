import { i18n } from '../i18n.js';
import { showToast } from '../toast.js';

const medications = [
    {
        id: 'med-1',
        name: 'Sertraline',
        dosage: '50 mg',
        schedule: 'Once daily · Morning',
        nextRefill: 'Oct 18, 2025',
        remainingDoses: 5,
        refillStage: 2,
        refillable: true,
    },
    {
        id: 'med-2',
        name: 'Vitamin D3',
        dosage: '1000 IU',
        schedule: 'Once daily · Evening',
        nextRefill: 'Nov 5, 2025',
        remainingDoses: 18,
        refillStage: 1,
        refillable: false,
    },
];

const adherenceLog = [
    { id: 'log-1', label: 'Sertraline', status: 'Taken', date: 'Oct 12' },
    { id: 'log-2', label: 'Vitamin D3', status: 'Missed', date: 'Oct 11' },
    { id: 'log-3', label: 'Sertraline', status: 'Taken', date: 'Oct 11' },
];

const refillStages = ['Request sent', 'Approved', 'Ready for pickup/delivery'];

const pharmacyLocations = [
    { id: 'pharm-1', name: 'DoCare Pharmacy - Downtown', address: '145 Wellness Ave' },
    { id: 'pharm-2', name: 'Green Cross Pharmacy', address: '22 Health Blvd' },
    { id: 'pharm-3', name: 'Home Delivery', address: 'Schedule doorstep delivery' },
];

export const MedicationsPage = {
    isPublic: false,
    getTitle() {
        return `${i18n.t('nav.medications')} • ${i18n.t('brand.name')}`;
    },
    render() {
        return `
            <section class="medications-page">
                <header class="medications-page__header">
                    <h1>${i18n.t('medications.title')}</h1>
                    <p>${i18n.t('medications.subtitle')}</p>
                </header>
                <div class="medication-list">
                    ${medications.map(med => `
                        <article class="medication-card" data-medication="${med.id}">
                            <div class="medication-card__header">
                                <div>
                                    <h2>${med.name}</h2>
                                    <div class="medication-card__meta">
                                        <span>${med.dosage}</span>
                                        <span>${med.schedule}</span>
                                        <span>${i18n.t('medications.nextRefill')} ${med.nextRefill}</span>
                                    </div>
                                </div>
                                <span class="pill-count">${med.remainingDoses} ${i18n.t('medications.dosesLeft')}</span>
                            </div>
                            <div class="medication-card__actions">
                                <button class="button-primary" data-mark-taken="${med.id}">${i18n.t('actions.markTaken')}</button>
                                <button class="button-secondary" data-route="/messages">${i18n.t('actions.messageProvider')}</button>
                                ${med.refillable ? `<button class="button-secondary" data-request-refill="${med.id}">${i18n.t('medications.requestRefill')}</button>` : ''}
                            </div>
                            ${med.refillable ? `
                                <div class="refill-status" role="list">
                                    ${refillStages.map((stage, index) => `
                                        <div class="refill-status__step ${index <= med.refillStage ? 'refill-status__step--active' : ''}" data-stage-index="${index}">
                                            <span>${stage}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </article>
                    `).join('')}
                </div>
                <article class="adherence-log">
                    <h2>${i18n.t('medications.adherenceLog')}</h2>
                    <div class="adherence-log__grid">
                        ${adherenceLog.map(entry => `
                            <div class="adherence-log__item">
                                <strong>${entry.date}</strong>
                                <span>${entry.label}</span>
                                <span class="helper-text">${entry.status}</span>
                            </div>
                        `).join('')}
                    </div>
                </article>
                <article class="pharmacy-card">
                    <h2>${i18n.t('medications.pharmacyCardTitle')}</h2>
                    <label class="label">
                        ${i18n.t('medications.pharmacySelect')}
                        <select class="select" data-pharmacy-select>
                            ${pharmacyLocations.map(location => `
                                <option value="${location.id}">${location.name} · ${location.address}</option>
                            `).join('')}
                        </select>
                    </label>
                    <div class="delivery-options">
                        <label class="label" data-checkbox-row>
                            <span>${i18n.t('medications.deliveryPickup')}</span>
                            <input type="radio" name="delivery-mode" value="pickup" checked>
                        </label>
                        <label class="label" data-checkbox-row>
                            <span>${i18n.t('medications.deliveryShip')}</span>
                            <input type="radio" name="delivery-mode" value="delivery">
                        </label>
                    </div>
                    <button class="button-primary" type="button" data-confirm-pharmacy>${i18n.t('medications.confirmLocation')}</button>
                </article>
            </section>
        `;
    },
    afterRender() {
        document.querySelectorAll('[data-mark-taken]').forEach(button => {
            button.addEventListener('click', () => {
                showToast('Great job staying consistent! Adherence logged for today.', { variant: 'success', duration: 3200 });
            });
        });

        document.querySelectorAll('[data-request-refill]').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-request-refill');
                const medication = medications.find(item => item.id === id);
                if (!medication) return;
                showToast(`${medication.name} refill request forwarded to your clinician.`, { variant: 'info', duration: 3600 });
            });
        });

        const pharmacySelect = document.querySelector('[data-pharmacy-select]');
        const deliveryOptions = document.querySelectorAll('input[name="delivery-mode"]');
        const confirmPharmacy = document.querySelector('[data-confirm-pharmacy]');

        confirmPharmacy?.addEventListener('click', () => {
            const pharmacy = pharmacyLocations.find(item => item.id === pharmacySelect?.value);
            const deliveryMode = Array.from(deliveryOptions).find(option => option.checked)?.value ?? 'pickup';
            const message = deliveryMode === 'delivery'
                ? i18n.t('medications.deliveryScheduled')
                : i18n.t('medications.pickupReady');
            showToast(`${message} ${pharmacy ? pharmacy.name : ''}`, { variant: 'success', duration: 3600 });
        });
    },
};
