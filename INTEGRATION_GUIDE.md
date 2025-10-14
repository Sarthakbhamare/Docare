# Phase 2 Integration Guide

## Quick Start: Wiring Components to Pages

This guide shows exactly how to integrate Phase 2 components into existing pages. Copy-paste these code snippets to replace toast-only buttons with functional modals.

---

## **1. Appointments Page Integration**

**File:** `assets/js/pages/appointments.js`

### Step 1: Add Import at Top
```javascript
import { showAppointmentModal, showCancelAppointmentModal } from '../components/appointment-modal.js';
```

### Step 2: Replace "Schedule New Appointment" Button
**Find this:**
```javascript
document.querySelector('[data-action="schedule-new"]')?.addEventListener('click', () => {
    showToast('Opening appointment scheduler...', { variant: 'info' });
});
```

**Replace with:**
```javascript
document.querySelector('[data-action="schedule-new"]')?.addEventListener('click', () => {
    showAppointmentModal();
});
```

### Step 3: Replace "Reschedule" Buttons
**Find this:**
```javascript
document.querySelectorAll('[data-reschedule]').forEach(btn => {
    btn.addEventListener('click', () => {
        showToast('Rescheduling appointment...', { variant: 'info' });
    });
});
```

**Replace with:**
```javascript
document.querySelectorAll('[data-reschedule]').forEach(btn => {
    btn.addEventListener('click', () => {
        const appointmentId = btn.dataset.reschedule;
        const appointmentCard = btn.closest('.appointment-card');
        
        // Extract appointment data from card
        const appointment = {
            id: appointmentId,
            date: appointmentCard.querySelector('[data-date]')?.textContent || '',
            time: appointmentCard.querySelector('[data-time]')?.textContent || '',
            provider: appointmentCard.querySelector('[data-provider]')?.textContent || '',
            type: appointmentCard.querySelector('[data-type]')?.textContent || 'Virtual',
        };
        
        showAppointmentModal(appointment, 'reschedule');
    });
});
```

### Step 4: Replace "Cancel" Buttons
**Find this:**
```javascript
document.querySelectorAll('[data-cancel]').forEach(btn => {
    btn.addEventListener('click', () => {
        showToast('Canceling appointment...', { variant: 'warning' });
    });
});
```

**Replace with:**
```javascript
document.querySelectorAll('[data-cancel]').forEach(btn => {
    btn.addEventListener('click', () => {
        const appointmentId = btn.dataset.cancel;
        const appointmentCard = btn.closest('.appointment-card');
        
        // Extract appointment data from card
        const appointment = {
            id: appointmentId,
            date: appointmentCard.querySelector('[data-date]')?.textContent || '',
            time: appointmentCard.querySelector('[data-time]')?.textContent || '',
            provider: appointmentCard.querySelector('[data-provider]')?.textContent || '',
        };
        
        showCancelAppointmentModal(appointment);
    });
});
```

---

## **2. Billing Page Integration**

**File:** `assets/js/pages/billing.js`

### Step 1: Add Import at Top
```javascript
import { showPaymentModal, downloadReceipt, exportTransactionsCSV } from '../components/payment-modal.js';
```

### Step 2: Replace "Pay Bill" Buttons
**Find this:**
```javascript
document.querySelectorAll('[data-pay-bill]').forEach(btn => {
    btn.addEventListener('click', () => {
        showToast('Opening payment gateway...', { variant: 'info' });
    });
});
```

**Replace with:**
```javascript
document.querySelectorAll('[data-pay-bill]').forEach(btn => {
    btn.addEventListener('click', () => {
        const amount = parseFloat(btn.dataset.amount) || 0;
        const transactionId = btn.dataset.transactionId || null;
        
        showPaymentModal(amount, transactionId);
    });
});
```

### Step 3: Replace "Download Receipt" Buttons
**Find this:**
```javascript
document.querySelectorAll('[data-download-receipt]').forEach(btn => {
    btn.addEventListener('click', () => {
        showToast('Downloading receipt...', { variant: 'info' });
    });
});
```

**Replace with:**
```javascript
document.querySelectorAll('[data-download-receipt]').forEach(btn => {
    btn.addEventListener('click', () => {
        const transactionId = btn.dataset.transactionId;
        const transactionCard = btn.closest('.transaction-card');
        
        const transaction = {
            id: transactionId,
            amount: parseFloat(transactionCard.querySelector('[data-amount]')?.textContent.replace('$', '') || '0'),
            date: transactionCard.querySelector('[data-date]')?.textContent || new Date().toISOString(),
            description: transactionCard.querySelector('[data-description]')?.textContent || 'Medical Service',
            status: transactionCard.querySelector('[data-status]')?.textContent || 'Paid',
        };
        
        downloadReceipt(transaction);
    });
});
```

### Step 4: Replace "Export History" Button
**Find this:**
```javascript
document.querySelector('[data-export-history]')?.addEventListener('click', () => {
    showToast('Exporting transaction history...', { variant: 'info' });
});
```

**Replace with:**
```javascript
document.querySelector('[data-export-history]')?.addEventListener('click', () => {
    // Get all transactions from page or localStorage
    const transactionCards = document.querySelectorAll('.transaction-card');
    const transactions = Array.from(transactionCards).map(card => ({
        date: card.querySelector('[data-date]')?.textContent || '',
        description: card.querySelector('[data-description]')?.textContent || '',
        category: card.querySelector('[data-category]')?.textContent || '',
        amount: card.querySelector('[data-amount]')?.textContent || '',
        status: card.querySelector('[data-status]')?.textContent || '',
        method: card.querySelector('[data-method]')?.textContent || 'N/A',
    }));
    
    exportTransactionsCSV(transactions);
});
```

---

## **3. Devices Page Integration**

**File:** `assets/js/pages/devices.js`

### Step 1: Add Import at Top
```javascript
import { showDeviceConnectModal, showPermissionsModal } from '../components/device-modal.js';
```

### Step 2: Replace "Connect Device" Button
**Find this:**
```javascript
document.querySelector('[data-connect-device]')?.addEventListener('click', () => {
    showToast('Opening device connection...', { variant: 'info' });
});
```

**Replace with:**
```javascript
document.querySelector('[data-connect-device]')?.addEventListener('click', () => {
    showDeviceConnectModal(); // Shows device selection screen
});
```

### Step 3: Replace Individual Device Connect Buttons
**Find this:**
```javascript
document.querySelectorAll('[data-connect]').forEach(btn => {
    btn.addEventListener('click', () => {
        const deviceType = btn.dataset.connect;
        showToast(`Connecting ${deviceType}...`, { variant: 'info' });
    });
});
```

**Replace with:**
```javascript
document.querySelectorAll('[data-connect]').forEach(btn => {
    btn.addEventListener('click', () => {
        const deviceType = btn.dataset.connect;
        showDeviceConnectModal(deviceType); // Opens OAuth flow directly
    });
});
```

### Step 4: Replace "Manage Permissions" Buttons
**Find this:**
```javascript
document.querySelectorAll('[data-manage-device]').forEach(btn => {
    btn.addEventListener('click', () => {
        showToast('Opening device settings...', { variant: 'info' });
    });
});
```

**Replace with:**
```javascript
document.querySelectorAll('[data-manage-device]').forEach(btn => {
    btn.addEventListener('click', () => {
        const deviceId = btn.dataset.deviceId;
        const deviceCard = btn.closest('.device-card');
        
        const device = {
            id: deviceId,
            name: deviceCard.querySelector('[data-name]')?.textContent || '',
            status: deviceCard.querySelector('[data-status]')?.textContent || 'disconnected',
            lastSync: deviceCard.querySelector('[data-last-sync]')?.textContent || 'Never',
        };
        
        showPermissionsModal(device);
    });
});
```

---

## **4. Form Validation Integration**

### Example 1: Login Form

**File:** `assets/js/pages/auth.js`

```javascript
import { FormValidator, validators } from '../utils/form-validation.js';

// In the login page render function
function renderLoginPage() {
    // ... existing render code ...
    
    // After form is rendered
    const loginForm = document.querySelector('#login-form');
    
    const validator = new FormValidator(loginForm, {
        validateOnBlur: true,
        validateOnInput: false,
        onSubmit: async (data) => {
            // Existing login logic
            await handleLogin(data.email, data.password);
        }
    });
    
    validator.addField('email', [
        validators.required,
        validators.email
    ]);
    
    validator.addField('password', [
        validators.required,
        validators.minLength(6)
    ]);
}
```

### Example 2: Signup Form

```javascript
function renderSignupPage() {
    // ... existing render code ...
    
    const signupForm = document.querySelector('#signup-form');
    
    const validator = new FormValidator(signupForm, {
        onSubmit: async (data) => {
            await handleSignup(data);
        }
    });
    
    validator.addField('name', [validators.required]);
    validator.addField('email', [validators.required, validators.email]);
    validator.addField('phone', [validators.required, validators.phone]);
    validator.addField('password', [validators.required, validators.strongPassword]);
    validator.addField('confirmPassword', [
        validators.required,
        validators.match('password', (name) => {
            return signupForm.querySelector(`[name="${name}"]`).value;
        })
    ]);
}
```

### Example 3: Auto-Setup from HTML Attributes

**HTML:**
```html
<form id="contact-form">
    <label class="label">
        Email <span class="required">*</span>
        <input name="email" type="email" class="input" required data-validate />
    </label>
    
    <label class="label">
        Phone <span class="required">*</span>
        <input name="phone" type="tel" class="input" required data-validate />
    </label>
    
    <label class="label">
        Message <span class="required">*</span>
        <textarea name="message" class="textarea" required 
                  data-minlength="10" data-maxlength="500" data-validate></textarea>
    </label>
    
    <button type="submit" class="button-primary">Submit</button>
</form>
```

**JavaScript:**
```javascript
import { FormValidator } from '../utils/form-validation.js';

const contactForm = document.querySelector('#contact-form');

const validator = new FormValidator(contactForm, {
    onSubmit: (data) => {
        // Submit logic
        console.log('Form data:', data);
    }
});

// Fields automatically configured from data-validate attributes!
```

---

## **5. HTML Attributes for Validation**

Add these data attributes to your HTML inputs to enable auto-validation:

```html
<!-- Required field -->
<input name="field" required data-validate />

<!-- Email validation -->
<input name="email" type="email" required data-validate />

<!-- Phone validation -->
<input name="phone" type="tel" required data-validate />

<!-- Number with range -->
<input name="age" type="number" min="18" max="120" data-validate />

<!-- Min/Max length -->
<input name="username" data-minlength="3" data-maxlength="20" data-validate />

<!-- Pattern matching -->
<input name="code" data-pattern="^[A-Z0-9]{6}$" 
       data-pattern-message="Must be 6 uppercase alphanumeric characters" 
       data-validate />

<!-- Match another field -->
<input name="confirmEmail" data-match="email" data-validate />
```

---

## **6. Testing Checklist**

After integration, test these scenarios:

### **Appointments:**
- [ ] Click "Schedule New" → Modal opens → Fill form → Submit → Success toast → Page reloads
- [ ] Click "Reschedule" → Modal opens with existing data → Change time → Submit → Success
- [ ] Click "Cancel" → Confirmation modal → Select reason → Confirm → Success
- [ ] Click X or overlay → Modal closes without action

### **Payments:**
- [ ] Click "Pay Bill" → Modal opens → Select Card → Enter details → Pay → Success modal → Receipt download
- [ ] Try invalid card number → Error message shows
- [ ] Switch to Bank Account tab → Form changes correctly
- [ ] Download receipt → HTML file downloads
- [ ] Export history → CSV file downloads

### **Devices:**
- [ ] Click "Connect Device" → Device selection grid shows
- [ ] Click "Connect Fitbit" → OAuth screen shows → Authorize → Success toast → Page reloads
- [ ] Click "Manage Permissions" → Modal opens → Toggle permissions → Save → Success
- [ ] Click "Sync Now" → Loading state → Success toast
- [ ] Click "Disconnect" → Confirmation → Disconnected

### **Forms:**
- [ ] Leave required field empty → Blur → Red border + error message
- [ ] Enter invalid email → Blur → Error message
- [ ] Enter valid email → Blur → Green border + ✓ icon
- [ ] Submit form with errors → First invalid field focused
- [ ] Submit valid form → Success

---

## **7. Common Issues & Solutions**

### Issue: Modal doesn't open
**Solution:** Check browser console for errors. Ensure import path is correct.

### Issue: Form validation not working
**Solution:** Ensure `data-validate` attribute is present on inputs. Check FormValidator initialization.

### Issue: Styles not applied
**Solution:** Verify `modal.css` and `form-validation.css` are linked in `index.html`.

### Issue: API calls fail
**Solution:** Check `assets/js/api.js` for mock implementation. Ensure API functions return proper `{ success, data, error }` objects.

### Issue: Character counter not updating
**Solution:** Verify textarea has `data-char-counter` attribute and counter element exists.

---

## **8. File Structure After Integration**

```
DoCare/
├── index.html (✅ Updated with CSS links)
├── assets/
│   ├── css/
│   │   └── components/
│   │       ├── modal.css (✅ NEW)
│   │       └── form-validation.css (✅ NEW)
│   └── js/
│       ├── components/
│       │   ├── appointment-modal.js (✅ NEW)
│       │   ├── payment-modal.js (✅ NEW)
│       │   └── device-modal.js (✅ NEW)
│       ├── utils/
│       │   └── form-validation.js (✅ NEW)
│       └── pages/
│           ├── appointments.js (⏳ UPDATE THIS)
│           ├── billing.js (⏳ UPDATE THIS)
│           ├── devices.js (⏳ UPDATE THIS)
│           └── auth.js (⏳ UPDATE THIS)
```

---

## **9. Next Steps**

1. ✅ Phase 2 components created (DONE)
2. ⏳ Integrate appointment modals (THIS GUIDE)
3. ⏳ Integrate payment modals (THIS GUIDE)
4. ⏳ Integrate device modals (THIS GUIDE)
5. ⏳ Apply form validation to all forms (THIS GUIDE)
6. ⏳ Build health journal pages (NEXT)
7. ⏳ Implement medication reminders (NEXT)
8. ⏳ Test and QA (CRITICAL)
9. ⏳ Commit and push (CRITICAL)

---

**Happy Integrating! 🚀**

If you encounter any issues, check the `PHASE2_SUMMARY.md` for detailed component documentation.
