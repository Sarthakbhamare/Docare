import { showToast } from '../toast.js';
import { AppointmentsAPI } from '../api.js';

let activeModal = null;

/**
 * Appointment Scheduling/Rescheduling Modal
 */
export function showAppointmentModal(appointment = null, mode = 'schedule') {
    if (activeModal) {
        activeModal.remove();
    }

    const isReschedule = mode === 'reschedule' && appointment;
    const title = isReschedule ? 'Reschedule Appointment' : 'Schedule New Appointment';

    // Available time slots (mock data - would come from API)
    const availableSlots = generateTimeSlots();
    const providers = [
        { id: 'patel', name: 'Dr. Priya Patel', specialty: 'Psychiatrist' },
        { id: 'chen', name: 'Dr. James Chen', specialty: 'Primary Care' },
        { id: 'martinez', name: 'Sarah Martinez, LCSW', specialty: 'Therapist' },
    ];

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container modal-container--large">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="modal-close" data-close-modal aria-label="Close modal">✕</button>
            </div>
            
            <form class="modal-body" data-appointment-form>
                <div class="form-grid">
                    <label class="label">
                        Select Provider
                        <select class="select" name="provider" required>
                            <option value="">Choose a provider...</option>
                            ${providers.map(p => `
                                <option value="${p.id}" ${appointment?.provider === p.name ? 'selected' : ''}>
                                    ${p.name} - ${p.specialty}
                                </option>
                            `).join('')}
                        </select>
                    </label>

                    <label class="label">
                        Appointment Type
                        <select class="select" name="type" required>
                            <option value="">Select type...</option>
                            <option value="virtual" ${appointment?.mode === 'Virtual' ? 'selected' : ''}>Virtual Consultation</option>
                            <option value="in-person" ${appointment?.mode === 'In-person' ? 'selected' : ''}>In-Person Visit</option>
                            <option value="follow-up">Follow-up</option>
                        </select>
                    </label>
                </div>

                <div class="form-grid form-grid--two-col">
                    <label class="label">
                        Preferred Date
                        <input 
                            type="date" 
                            class="input" 
                            name="date" 
                            min="${new Date().toISOString().split('T')[0]}"
                            value="${appointment?.date || ''}"
                            required
                            data-date-picker
                        />
                    </label>

                    <label class="label">
                        Preferred Time
                        <select class="select" name="time" required data-time-select>
                            <option value="">Select date first...</option>
                        </select>
                    </label>
                </div>

                <div class="available-slots-section" data-slots-container style="display: none;">
                    <h3>Available Time Slots</h3>
                    <p class="helper-text">Click to select a time slot</p>
                    <div class="time-slots-grid" data-slots-grid></div>
                </div>

                <label class="label">
                    Reason for Visit (Optional)
                    <textarea 
                        class="textarea" 
                        name="reason" 
                        rows="3" 
                        placeholder="Brief description of your concerns..."
                        maxlength="500"
                    >${appointment?.notes || ''}</textarea>
                    <span class="character-count" data-char-count>0 / 500</span>
                </label>

                <div class="appointment-summary" data-summary style="display: none;">
                    <h3>Appointment Summary</h3>
                    <div class="summary-details"></div>
                </div>
            </form>

            <div class="modal-footer">
                <button class="button-secondary" type="button" data-close-modal>Cancel</button>
                <button class="button-primary" type="submit" data-submit-appointment>
                    ${isReschedule ? 'Confirm Reschedule' : 'Schedule Appointment'}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    activeModal = modal;

    wireAppointmentModal(modal, appointment, isReschedule);
}

/**
 * Appointment Cancellation Confirmation
 */
export function showCancelAppointmentModal(appointment) {
    if (activeModal) {
        activeModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h2>Cancel Appointment</h2>
                <button class="modal-close" data-close-modal aria-label="Close modal">✕</button>
            </div>
            
            <div class="modal-body">
                <div class="warning-box">
                    <span class="warning-icon">⚠️</span>
                    <div>
                        <p><strong>Are you sure you want to cancel this appointment?</strong></p>
                        <p class="helper-text">This action cannot be undone.</p>
                    </div>
                </div>

                <div class="appointment-details-card">
                    <h3>${appointment.provider}</h3>
                    <p>${appointment.specialty}</p>
                    <div class="detail-row">
                        <strong>Date:</strong> ${appointment.date}
                    </div>
                    <div class="detail-row">
                        <strong>Time:</strong> ${appointment.time}
                    </div>
                    <div class="detail-row">
                        <strong>Type:</strong> ${appointment.mode}
                    </div>
                </div>

                <label class="label">
                    Reason for Cancellation (Optional)
                    <select class="select" data-cancel-reason>
                        <option value="">Select a reason...</option>
                        <option value="schedule-conflict">Schedule conflict</option>
                        <option value="feeling-better">Feeling better</option>
                        <option value="found-another">Found another provider</option>
                        <option value="cost">Cost concerns</option>
                        <option value="other">Other</option>
                    </select>
                </label>
            </div>

            <div class="modal-footer">
                <button class="button-secondary" type="button" data-close-modal>Keep Appointment</button>
                <button class="button-primary button-primary--danger" type="button" data-confirm-cancel>
                    Yes, Cancel Appointment
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    activeModal = modal;

    wireCancelModal(modal, appointment);
}

function wireAppointmentModal(modal, appointment, isReschedule) {
    const form = modal.querySelector('[data-appointment-form]');
    const datePicker = modal.querySelector('[data-date-picker]');
    const timeSelect = modal.querySelector('[data-time-select]');
    const slotsContainer = modal.querySelector('[data-slots-container]');
    const slotsGrid = modal.querySelector('[data-slots-grid]');
    const submitBtn = modal.querySelector('[data-submit-appointment]');
    const textarea = form.querySelector('textarea');
    const charCount = modal.querySelector('[data-char-count]');

    // Character counter
    textarea?.addEventListener('input', () => {
        const count = textarea.value.length;
        charCount.textContent = `${count} / 500`;
        charCount.style.color = count > 450 ? 'var(--color-error)' : 'var(--color-text-muted)';
    });

    // Date change - load available slots
    datePicker?.addEventListener('change', async () => {
        const selectedDate = datePicker.value;
        if (!selectedDate) return;

        slotsContainer.style.display = 'block';
        slotsGrid.innerHTML = '<p class="helper-text">Loading available slots...</p>';

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const slots = generateTimeSlots();
        renderTimeSlots(slotsGrid, slots, timeSelect);
    });

    // Close handlers
    modal.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(modal));
    });

    // Submit appointment
    submitBtn?.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        if (!data.provider || !data.type || !data.date || !data.time) {
            showToast('Please fill in all required fields', { variant: 'error' });
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = isReschedule ? 'Rescheduling...' : 'Scheduling...';

        try {
            const result = await AppointmentsAPI.scheduleAppointment({
                ...data,
                originalId: appointment?.id,
            });

            if (result.success) {
                showToast(
                    isReschedule 
                        ? 'Appointment rescheduled successfully!' 
                        : 'Appointment scheduled successfully!',
                    { variant: 'success', duration: 3000 }
                );
                closeModal(modal);
                
                // Refresh page
                setTimeout(() => {
                    const viewRoot = document.querySelector('[data-view-root]');
                    if (viewRoot && window.__currentPage?.afterRender) {
                        window.location.reload();
                    }
                }, 1000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            showToast('Failed to schedule appointment. Please try again.', { variant: 'error' });
            submitBtn.disabled = false;
            submitBtn.textContent = isReschedule ? 'Confirm Reschedule' : 'Schedule Appointment';
        }
    });
}

function wireCancelModal(modal, appointment) {
    const confirmBtn = modal.querySelector('[data-confirm-cancel]');

    modal.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(modal));
    });

    confirmBtn?.addEventListener('click', async () => {
        const reason = modal.querySelector('[data-cancel-reason]')?.value;
        
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Cancelling...';

        try {
            const result = await AppointmentsAPI.cancelAppointment(appointment.id, reason);
            
            if (result.success) {
                showToast('Appointment cancelled successfully', { variant: 'success', duration: 3000 });
                closeModal(modal);
                
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            showToast('Failed to cancel appointment. Please try again.', { variant: 'error' });
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Yes, Cancel Appointment';
        }
    });
}

function generateTimeSlots() {
    const slots = [];
    const hours = [9, 10, 11, 13, 14, 15, 16, 17];
    
    hours.forEach(hour => {
        [0, 30].forEach(minute => {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour;
            
            slots.push({
                time,
                display: `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`,
                available: Math.random() > 0.3, // 70% availability
            });
        });
    });
    
    return slots;
}

function renderTimeSlots(container, slots, timeSelect) {
    container.innerHTML = slots.map(slot => `
        <button 
            type="button"
            class="time-slot ${slot.available ? '' : 'time-slot--unavailable'}"
            data-time="${slot.time}"
            ${!slot.available ? 'disabled' : ''}
        >
            ${slot.display}
        </button>
    `).join('');

    // Update select dropdown
    timeSelect.innerHTML = `
        <option value="">Select time...</option>
        ${slots.filter(s => s.available).map(slot => `
            <option value="${slot.time}">${slot.display}</option>
        `).join('')}
    `;

    // Wire up slot buttons
    container.querySelectorAll('.time-slot:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.time-slot').forEach(b => b.classList.remove('time-slot--selected'));
            btn.classList.add('time-slot--selected');
            timeSelect.value = btn.dataset.time;
        });
    });
}

function closeModal(modal) {
    modal.remove();
    document.body.style.overflow = '';
    activeModal = null;
}
