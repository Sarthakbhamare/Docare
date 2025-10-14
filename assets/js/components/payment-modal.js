import { showToast } from '../toast.js';
import { BillingAPI } from '../api.js';

let activeModal = null;

/**
 * Payment Modal with Stripe-like UI
 */
export function showPaymentModal(amount, transactionId = null) {
    if (activeModal) {
        activeModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container modal-container--large">
            <div class="modal-header">
                <h2>Complete Payment</h2>
                <button class="modal-close" data-close-modal aria-label="Close modal">✕</button>
            </div>
            
            <form class="modal-body payment-form" data-payment-form>
                <div class="payment-summary">
                    <div class="summary-row">
                        <span>Amount Due</span>
                        <strong class="amount-large">$${amount.toFixed(2)}</strong>
                    </div>
                </div>

                <div class="payment-methods-selector">
                    <h3>Payment Method</h3>
                    <div class="payment-method-tabs">
                        <button type="button" class="payment-tab active" data-method="card">
                            💳 Credit/Debit Card
                        </button>
                        <button type="button" class="payment-tab" data-method="bank">
                            🏦 Bank Account
                        </button>
                        <button type="button" class="payment-tab" data-method="hsa">
                            🏥 HSA/FSA Card
                        </button>
                    </div>
                </div>

                <!-- Card Payment Form -->
                <div class="payment-method-content" data-content="card">
                    <label class="label">
                        Card Number
                        <div class="card-input-wrapper">
                            <input 
                                type="text" 
                                class="input input-card" 
                                name="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                maxlength="19"
                                data-card-number
                                required
                            />
                            <span class="card-brand" data-card-brand></span>
                        </div>
                    </label>

                    <div class="form-grid form-grid--two-col">
                        <label class="label">
                            Expiry Date
                            <input 
                                type="text" 
                                class="input" 
                                name="expiry"
                                placeholder="MM / YY"
                                maxlength="7"
                                data-expiry
                                required
                            />
                        </label>

                        <label class="label">
                            CVV
                            <input 
                                type="text" 
                                class="input" 
                                name="cvv"
                                placeholder="123"
                                maxlength="4"
                                data-cvv
                                required
                            />
                        </label>
                    </div>

                    <label class="label">
                        Cardholder Name
                        <input 
                            type="text" 
                            class="input" 
                            name="cardholderName"
                            placeholder="John Doe"
                            required
                        />
                    </label>

                    <label class="label">
                        Billing ZIP Code
                        <input 
                            type="text" 
                            class="input" 
                            name="zipCode"
                            placeholder="12345"
                            maxlength="10"
                            required
                        />
                    </label>

                    <label class="checkbox-label">
                        <input type="checkbox" name="saveCard" />
                        <span>Save this card for future payments</span>
                    </label>
                </div>

                <!-- Bank Account Form -->
                <div class="payment-method-content" data-content="bank" style="display: none;">
                    <label class="label">
                        Account Holder Name
                        <input type="text" class="input" name="accountName" placeholder="John Doe" />
                    </label>

                    <label class="label">
                        Routing Number
                        <input type="text" class="input" name="routing" placeholder="110000000" maxlength="9" />
                    </label>

                    <label class="label">
                        Account Number
                        <input type="text" class="input" name="accountNumber" placeholder="000123456789" maxlength="17" />
                    </label>

                    <label class="label">
                        Account Type
                        <select class="select" name="accountType">
                            <option value="checking">Checking</option>
                            <option value="savings">Savings</option>
                        </select>
                    </label>
                </div>

                <!-- HSA/FSA Form -->
                <div class="payment-method-content" data-content="hsa" style="display: none;">
                    <div class="info-box">
                        <span class="info-icon">ℹ️</span>
                        <p>HSA/FSA cards can only be used for qualified medical expenses.</p>
                    </div>

                    <label class="label">
                        HSA/FSA Card Number
                        <input type="text" class="input" name="hsaCard" placeholder="1234 5678 9012 3456" maxlength="19" />
                    </label>

                    <div class="form-grid form-grid--two-col">
                        <label class="label">
                            Expiry Date
                            <input type="text" class="input" name="hsaExpiry" placeholder="MM / YY" maxlength="7" />
                        </label>

                        <label class="label">
                            CVV
                            <input type="text" class="input" name="hsaCvv" placeholder="123" maxlength="4" />
                        </label>
                    </div>
                </div>

                <div class="security-badges">
                    <span class="badge">🔒 Secure Payment</span>
                    <span class="badge">🛡️ PCI Compliant</span>
                    <span class="badge">✅ 256-bit SSL</span>
                </div>
            </form>

            <div class="modal-footer">
                <button class="button-secondary" type="button" data-close-modal>Cancel</button>
                <button class="button-primary" type="submit" data-submit-payment>
                    Pay $${amount.toFixed(2)}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    activeModal = modal;

    wirePaymentModal(modal, amount, transactionId);
}

/**
 * Receipt Generation & Download
 */
export function downloadReceipt(transaction) {
    showToast('Generating receipt...', { variant: 'info', duration: 2000 });

    setTimeout(() => {
        const receipt = generateReceiptHTML(transaction);
        const blob = new Blob([receipt], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `docare-receipt-${transaction.id}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Receipt downloaded successfully', { variant: 'success', duration: 2000 });
    }, 1000);
}

/**
 * Export Transaction History to CSV
 */
export function exportTransactionsCSV(transactions) {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Status', 'Payment Method'];
    const rows = transactions.map(t => [
        t.date,
        t.description,
        t.category,
        t.amount,
        t.status,
        t.method || 'N/A',
    ]);

    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `docare-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Transaction history exported', { variant: 'success', duration: 2000 });
}

function wirePaymentModal(modal, amount, transactionId) {
    const form = modal.querySelector('[data-payment-form]');
    const submitBtn = modal.querySelector('[data-submit-payment]');
    const tabs = modal.querySelectorAll('.payment-tab');
    const contents = modal.querySelectorAll('.payment-method-content');

    // Card number formatting
    const cardNumberInput = modal.querySelector('[data-card-number]');
    const cardBrand = modal.querySelector('[data-card-brand]');
    
    cardNumberInput?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '');
        value = value.replace(/(.{4})/g, '$1 ').trim();
        e.target.value = value;

        // Detect card brand
        const firstDigit = value.charAt(0);
        if (firstDigit === '4') {
            cardBrand.textContent = 'Visa';
        } else if (firstDigit === '5') {
            cardBrand.textContent = 'Mastercard';
        } else if (firstDigit === '3') {
            cardBrand.textContent = 'Amex';
        } else {
            cardBrand.textContent = '';
        }
    });

    // Expiry date formatting
    const expiryInput = modal.querySelector('[data-expiry]');
    expiryInput?.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '').replace('/', '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + ' / ' + value.slice(2, 4);
        }
        e.target.value = value;
    });

    // CVV validation
    const cvvInput = modal.querySelector('[data-cvv]');
    cvvInput?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    // Payment method tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const method = tab.dataset.method;
            contents.forEach(content => {
                content.style.display = content.dataset.content === method ? 'block' : 'none';
            });
        });
    });

    // Close modal
    modal.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(modal));
    });

    // Submit payment
    submitBtn?.addEventListener('click', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Basic validation
        const activeMethod = modal.querySelector('.payment-tab.active').dataset.method;
        if (activeMethod === 'card') {
            if (!data.cardNumber || !data.expiry || !data.cvv || !data.cardholderName || !data.zipCode) {
                showToast('Please fill in all card details', { variant: 'error' });
                return;
            }
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        try {
            const result = await BillingAPI.processPayment({
                amount,
                transactionId,
                method: activeMethod,
                ...data,
            });

            if (result.success) {
                showSuccessModal(result.data);
                closeModal(modal);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            showToast('Payment failed. Please check your details and try again.', { variant: 'error' });
            submitBtn.disabled = false;
            submitBtn.textContent = `Pay $${amount.toFixed(2)}`;
        }
    });
}

function showSuccessModal(paymentData) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-body text-center">
                <div class="success-icon">✅</div>
                <h2>Payment Successful!</h2>
                <p>Your payment of <strong>$${paymentData.amount || '0.00'}</strong> has been processed.</p>
                
                <div class="transaction-details">
                    <div class="detail-row">
                        <span>Transaction ID:</span>
                        <strong>${paymentData.transactionId}</strong>
                    </div>
                    <div class="detail-row">
                        <span>Date:</span>
                        <strong>${new Date().toLocaleDateString()}</strong>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="button-secondary" data-download-receipt>
                        📄 Download Receipt
                    </button>
                    <button class="button-primary" data-close-success>
                        Done
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('[data-download-receipt]')?.addEventListener('click', () => {
        downloadReceipt({
            id: paymentData.transactionId,
            amount: paymentData.amount,
            date: new Date().toISOString(),
        });
    });

    modal.querySelector('[data-close-success]')?.addEventListener('click', () => {
        modal.remove();
        window.location.reload();
    });
}

function generateReceiptHTML(transaction) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>DoCare Health - Receipt</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .receipt-id { color: #666; margin-top: 10px; }
        .section { margin-bottom: 30px; }
        .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .total { font-size: 20px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; margin-top: 20px; }
        .footer { text-align: center; color: #666; margin-top: 40px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">DoCare Health</div>
        <div class="receipt-id">Receipt #${transaction.id}</div>
        <div>${new Date(transaction.date).toLocaleDateString()}</div>
    </div>

    <div class="section">
        <h3>Transaction Details</h3>
        <div class="row">
            <span>Description:</span>
            <strong>${transaction.description || 'Medical Service'}</strong>
        </div>
        <div class="row">
            <span>Date:</span>
            <strong>${new Date(transaction.date).toLocaleDateString()}</strong>
        </div>
        <div class="row">
            <span>Status:</span>
            <strong>${transaction.status || 'Paid'}</strong>
        </div>
    </div>

    <div class="section">
        <div class="row total">
            <span>Total Paid:</span>
            <strong>$${transaction.amount.toFixed(2)}</strong>
        </div>
    </div>

    <div class="footer">
        <p>Thank you for choosing DoCare Health</p>
        <p>Questions? Contact us at billing@docare.health</p>
    </div>
</body>
</html>
    `;
}

function closeModal(modal) {
    modal.remove();
    document.body.style.overflow = '';
    activeModal = null;
}
