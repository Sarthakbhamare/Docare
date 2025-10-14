import { showToast } from './toast.js';
import { EmergencyAPI, getCurrentLocation } from './api.js';
import { auth } from './auth.js';

let isSOSActive = false;
let countdownInterval = null;

/**
 * Emergency SOS Modal Component
 * Provides confirmation before triggering emergency services
 */
export function showEmergencySOSModal() {
    if (isSOSActive) {
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'emergency-modal';
    modal.innerHTML = `
        <div class="emergency-modal__overlay" data-emergency-close></div>
        <div class="emergency-modal__content">
            <div class="emergency-modal__icon">🚨</div>
            <h2>Emergency SOS</h2>
            <p class="emergency-modal__warning">
                This will immediately alert emergency services and your emergency contacts.
            </p>
            
            <div class="emergency-modal__countdown" data-countdown-display style="display: none;">
                <div class="countdown-circle">
                    <span data-countdown-number>10</span>
                </div>
                <p>Calling 911 in <strong data-countdown-text>10</strong> seconds...</p>
                <p class="helper-text">Click Cancel to stop</p>
            </div>
            
            <div class="emergency-modal__actions" data-initial-actions>
                <button class="button-primary button-primary--danger" type="button" data-confirm-emergency>
                    🚨 Confirm Emergency
                </button>
                <button class="button-secondary" type="button" data-emergency-close>
                    Cancel
                </button>
            </div>
            
            <div class="emergency-modal__actions" data-countdown-actions style="display: none;">
                <button class="button-secondary" type="button" data-emergency-cancel>
                    Cancel SOS
                </button>
            </div>
            
            <div class="emergency-info">
                <p>📍 Location sharing will be enabled</p>
                <p>👤 Emergency contacts will be notified</p>
                <p>🚑 911 will be alerted</p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Wire up event listeners
    wireEmergencyModal(modal);

    // Focus trap
    const focusableElements = modal.querySelectorAll('button');
    focusableElements[0]?.focus();
}

function wireEmergencyModal(modal) {
    const confirmBtn = modal.querySelector('[data-confirm-emergency]');
    const cancelBtns = modal.querySelectorAll('[data-emergency-close], [data-emergency-cancel]');
    const countdownDisplay = modal.querySelector('[data-countdown-display]');
    const initialActions = modal.querySelector('[data-initial-actions]');
    const countdownActions = modal.querySelector('[data-countdown-actions]');
    const countdownNumber = modal.querySelector('[data-countdown-number]');
    const countdownText = modal.querySelector('[data-countdown-text]');

    // Confirm button - start countdown
    confirmBtn?.addEventListener('click', () => {
        startEmergencyCountdown(modal, countdownDisplay, initialActions, countdownActions, countdownNumber, countdownText);
    });

    // Cancel buttons
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            cancelEmergency(modal);
        });
    });

    // Click outside to close
    modal.querySelector('[data-emergency-close]')?.addEventListener('click', () => {
        cancelEmergency(modal);
    });

    // ESC key to close
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            cancelEmergency(modal);
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function startEmergencyCountdown(modal, countdownDisplay, initialActions, countdownActions, countdownNumber, countdownText) {
    isSOSActive = true;
    let timeLeft = 10;

    // Show countdown UI
    countdownDisplay.style.display = 'block';
    initialActions.style.display = 'none';
    countdownActions.style.display = 'flex';

    showToast('Emergency SOS initiated. You have 10 seconds to cancel.', { variant: 'warning', duration: 10000 });

    countdownInterval = setInterval(() => {
        timeLeft--;
        countdownNumber.textContent = timeLeft;
        countdownText.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            triggerEmergencyServices(modal);
        }
    }, 1000);
}

async function triggerEmergencyServices(modal) {
    try {
        showToast('🚨 Contacting emergency services...', { variant: 'error', duration: 5000 });

        // Get user location
        let location = null;
        try {
            location = await getCurrentLocation();
            console.log('[Emergency] Location obtained:', location);
        } catch (error) {
            console.error('[Emergency] Could not get location:', error);
        }

        // Trigger SOS API
        const sosResult = await EmergencyAPI.triggerSOS(location);
        
        if (sosResult.success) {
            // Notify emergency contacts
            const user = auth.getUser();
            if (user) {
                await EmergencyAPI.notifyEmergencyContacts(user.id, location);
            }

            // Share location
            if (location) {
                await EmergencyAPI.shareLocation(location);
            }

            // Update UI
            updateModalToSuccess(modal);
            
            // Auto-close after 5 seconds
            setTimeout(() => {
                closeEmergencyModal(modal);
            }, 5000);
        } else {
            throw new Error('SOS trigger failed');
        }
    } catch (error) {
        console.error('[Emergency] Error:', error);
        showToast('Emergency alert failed. Please call 911 directly.', { variant: 'error', duration: 8000 });
        closeEmergencyModal(modal);
    }
}

function updateModalToSuccess(modal) {
    const content = modal.querySelector('.emergency-modal__content');
    content.innerHTML = `
        <div class="emergency-modal__icon emergency-modal__icon--success">✅</div>
        <h2>Emergency Services Contacted</h2>
        <div class="emergency-success">
            <p>✅ 911 has been alerted</p>
            <p>✅ Emergency contacts notified</p>
            <p>✅ Location shared with responders</p>
        </div>
        <p class="emergency-modal__info">Help is on the way. Stay calm and follow emergency dispatcher instructions.</p>
        <button class="button-secondary" type="button" onclick="this.closest('.emergency-modal').remove(); document.body.style.overflow = ''">
            Close
        </button>
    `;
    
    showToast('✅ Emergency services have been contacted. Help is on the way.', { variant: 'success', duration: 8000 });
}

function cancelEmergency(modal) {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    isSOSActive = false;
    closeEmergencyModal(modal);
    
    if (isSOSActive) {
        showToast('Emergency SOS cancelled', { variant: 'info', duration: 3000 });
    }
}

function closeEmergencyModal(modal) {
    modal.remove();
    document.body.style.overflow = '';
    isSOSActive = false;
    
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

/**
 * Quick Emergency Call (bypasses confirmation)
 * Use for critical situations where confirmation is not needed
 */
export async function quickEmergencyCall() {
    try {
        showToast('🚨 Initiating emergency call...', { variant: 'error', duration: 3000 });
        
        // Open 911 dialer on mobile devices
        if (/Android|iPhone/i.test(navigator.userAgent)) {
            window.location.href = 'tel:911';
        } else {
            // Desktop: show instructions
            showToast('📞 Please call 911 immediately on your phone', { variant: 'error', duration: 10000 });
        }

        // Still trigger backend emergency services
        const location = await getCurrentLocation().catch(() => null);
        await EmergencyAPI.triggerSOS(location);
        
        const user = auth.getUser();
        if (user) {
            await EmergencyAPI.notifyEmergencyContacts(user.id, location);
        }
    } catch (error) {
        console.error('[Emergency] Quick call error:', error);
        showToast('Please call 911 directly on your phone', { variant: 'error', duration: 8000 });
    }
}

/**
 * Get emergency contacts for current user
 */
export function getEmergencyContacts() {
    const user = auth.getUser();
    if (!user || !user.profile) {
        return [];
    }

    const contacts = [];
    
    if (user.profile.emergencyContact) {
        contacts.push({
            name: user.profile.emergencyContact.name,
            phone: user.profile.emergencyContact.phone,
            relationship: 'Emergency Contact',
        });
    }

    return contacts;
}
