import { i18n } from '../i18n.js';
import { showToast } from '../toast.js';
import { showPaymentModal, downloadReceipt, exportTransactionsCSV } from '../components/payment-modal.js';

const outstandingBalance = 128.40;

const transactions = [
    { id: 'txn-1', date: '2025-09-30', description: 'CBT Session with Dr. Patel', amount: 85.00, status: 'Paid', category: 'Therapy', method: 'Visa •••• 4242' },
    { id: 'txn-2', date: '2025-09-25', description: 'Lab Test Panel - Complete Blood Count', amount: 128.40, status: 'Outstanding', category: 'Lab Work', method: null },
    { id: 'txn-3', date: '2025-09-20', description: 'Medication Refill - Sertraline 50mg', amount: 45.00, status: 'Paid', category: 'Pharmacy', method: 'Visa •••• 4242' },
    { id: 'txn-4', date: '2025-09-10', description: 'Virtual Consultation - Primary Care', amount: 75.00, status: 'Paid', category: 'Consultation', method: 'Mastercard •••• 8888' },
    { id: 'txn-5', date: '2025-08-28', description: 'Physical Therapy Session', amount: 95.00, status: 'Paid', category: 'Therapy', method: 'Visa •••• 4242' },
    { id: 'txn-6', date: '2025-08-15', description: 'Annual Physical Examination', amount: 150.00, status: 'Paid', category: 'Consultation', method: 'HSA Card •••• 1234' },
];

const paymentMethods = [
    { id: 'pm-1', type: 'Visa', last4: '4242', expiry: '12/26', isDefault: true },
    { id: 'pm-2', type: 'Mastercard', last4: '8888', expiry: '08/27', isDefault: false },
    { id: 'pm-3', type: 'HSA Card', last4: '1234', expiry: '03/28', isDefault: false },
];

const insuranceInfo = {
    provider: 'Blue Cross Blue Shield',
    policyNumber: 'BCBS-2025-98765',
    groupNumber: 'GRP-123456',
    coverageLevel: 'Gold Plan',
    deductible: { met: 850, total: 1500 },
    outOfPocket: { met: 1240, total: 3000 },
};

const formatCurrency = amount => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const formatDate = dateStr => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

export const BillingPage = {
    isPublic: false,
    getTitle() {
        return `${i18n.t('billing.title')} • ${i18n.t('brand.name')}`;
    },
    render() {
        return `
            <section class="billing-page">
                <header class="billing-page__header">
                    <div>
                        <h1>${i18n.t('billing.title')}</h1>
                        <p>${i18n.t('billing.subtitle')}</p>
                    </div>
                </header>

                <div class="billing-grid">
                    <div class="billing-main">
                        ${outstandingBalance > 0 ? `
                        <div class="balance-alert">
                            <div class="balance-alert__icon">⚠️</div>
                            <div class="balance-alert__content">
                                <h2>${i18n.t('billing.outstandingBalance')}</h2>
                                <p class="balance-amount">${formatCurrency(outstandingBalance)}</p>
                                <p class="helper-text">${i18n.t('billing.balanceDesc')}</p>
                            </div>
                            <button class="button-primary" type="button" data-pay-balance>${i18n.t('billing.payNow')}</button>
                        </div>
                        ` : ''}

                        <section class="billing-section">
                            <div class="section-header">
                                <h2>${i18n.t('billing.transactionHistory')}</h2>
                                <div class="filter-controls">
                                    <select class="select select--sm" data-filter-category>
                                        <option value="all">${i18n.t('billing.allCategories')}</option>
                                        <option value="therapy">${i18n.t('billing.therapy')}</option>
                                        <option value="consultation">${i18n.t('billing.consultation')}</option>
                                        <option value="pharmacy">${i18n.t('billing.pharmacy')}</option>
                                        <option value="lab">${i18n.t('billing.labWork')}</option>
                                    </select>
                                    <button class="button-ghost" type="button" data-export-csv>${i18n.t('billing.exportCSV')}</button>
                                </div>
                            </div>
                            <div class="transactions-table">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>${i18n.t('billing.date')}</th>
                                            <th>${i18n.t('billing.description')}</th>
                                            <th>${i18n.t('billing.category')}</th>
                                            <th>${i18n.t('billing.amount')}</th>
                                            <th>${i18n.t('billing.status')}</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${transactions.map(txn => `
                                            <tr class="transaction-row transaction-row--${txn.status.toLowerCase()}">
                                                <td>${formatDate(txn.date)}</td>
                                                <td>
                                                    <strong>${txn.description}</strong>
                                                    ${txn.method ? `<span class="helper-text">${txn.method}</span>` : ''}
                                                </td>
                                                <td><span class="category-badge">${txn.category}</span></td>
                                                <td><strong>${formatCurrency(txn.amount)}</strong></td>
                                                <td><span class="status-badge status-badge--${txn.status.toLowerCase()}">${txn.status}</span></td>
                                                <td>
                                                    <button class="button-ghost button-ghost--sm" type="button" data-view-receipt="${txn.id}">${i18n.t('billing.viewReceipt')}</button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    <aside class="billing-sidebar">
                        <section class="insurance-card">
                            <h2>${i18n.t('billing.insuranceInfo')}</h2>
                            <div class="insurance-details">
                                <div class="insurance-provider">
                                    <strong>${insuranceInfo.provider}</strong>
                                    <span class="insurance-plan">${insuranceInfo.coverageLevel}</span>
                                </div>
                                <div class="insurance-grid">
                                    <div class="insurance-field">
                                        <span class="insurance-label">${i18n.t('billing.policyNumber')}</span>
                                        <span class="insurance-value">${insuranceInfo.policyNumber}</span>
                                    </div>
                                    <div class="insurance-field">
                                        <span class="insurance-label">${i18n.t('billing.groupNumber')}</span>
                                        <span class="insurance-value">${insuranceInfo.groupNumber}</span>
                                    </div>
                                </div>
                                <div class="coverage-progress">
                                    <div class="coverage-item">
                                        <div class="coverage-header">
                                            <span>${i18n.t('billing.deductible')}</span>
                                            <strong>${formatCurrency(insuranceInfo.deductible.met)} / ${formatCurrency(insuranceInfo.deductible.total)}</strong>
                                        </div>
                                        <div class="progress-bar">
                                            <span class="progress-bar__value" style="--progress:${(insuranceInfo.deductible.met / insuranceInfo.deductible.total) * 100}%"></span>
                                        </div>
                                    </div>
                                    <div class="coverage-item">
                                        <div class="coverage-header">
                                            <span>${i18n.t('billing.outOfPocket')}</span>
                                            <strong>${formatCurrency(insuranceInfo.outOfPocket.met)} / ${formatCurrency(insuranceInfo.outOfPocket.total)}</strong>
                                        </div>
                                        <div class="progress-bar">
                                            <span class="progress-bar__value" style="--progress:${(insuranceInfo.outOfPocket.met / insuranceInfo.outOfPocket.total) * 100}%"></span>
                                        </div>
                                    </div>
                                </div>
                                <button class="button-secondary" type="button" data-update-insurance>${i18n.t('billing.updateInsurance')}</button>
                            </div>
                        </section>

                        <section class="payment-methods-card">
                            <div class="card-header">
                                <h2>${i18n.t('billing.paymentMethods')}</h2>
                                <button class="button-ghost button-ghost--sm" type="button" data-add-payment>+ ${i18n.t('billing.addNew')}</button>
                            </div>
                            <div class="payment-methods-list">
                                ${paymentMethods.map(pm => `
                                    <div class="payment-method-item ${pm.isDefault ? 'payment-method-item--default' : ''}">
                                        <div class="payment-method-icon">${pm.type === 'Visa' ? '💳' : pm.type === 'Mastercard' ? '💳' : '🏥'}</div>
                                        <div class="payment-method-info">
                                            <strong>${pm.type} •••• ${pm.last4}</strong>
                                            <span class="helper-text">${i18n.t('billing.expires')} ${pm.expiry}</span>
                                        </div>
                                        ${pm.isDefault ? `<span class="default-badge">${i18n.t('billing.default')}</span>` : ''}
                                        <button class="button-ghost button-ghost--sm" type="button" data-remove-payment="${pm.id}">×</button>
                                    </div>
                                `).join('')}
                            </div>
                        </section>

                        <section class="billing-help">
                            <h3>${i18n.t('billing.needHelp')}</h3>
                            <ul>
                                <li><a href="#">${i18n.t('billing.helpLink1')}</a></li>
                                <li><a href="#">${i18n.t('billing.helpLink2')}</a></li>
                                <li><a href="#">${i18n.t('billing.helpLink3')}</a></li>
                            </ul>
                            <button class="button-secondary" type="button" data-contact-billing>${i18n.t('billing.contactSupport')}</button>
                        </section>
                    </aside>
                </div>
            </section>
        `;
    },
    afterRender() {
        document.querySelector('[data-pay-balance]')?.addEventListener('click', () => {
            showPaymentModal(outstandingBalance);
        });

        document.querySelectorAll('[data-view-receipt]').forEach(btn => {
            btn.addEventListener('click', () => {
                const txnId = btn.dataset.viewReceipt;
                const transaction = transactions.find(t => t.id === txnId);
                
                if (transaction) {
                    downloadReceipt(transaction);
                }
            });
        });

        document.querySelector('[data-export-csv]')?.addEventListener('click', () => {
            exportTransactionsCSV(transactions);
        });

        document.querySelector('[data-add-payment]')?.addEventListener('click', () => {
            showPaymentModal(0, null, 'add-method');
        });
    },
};
