import { auth } from '../auth.js';
import { i18n } from '../i18n.js';
import { showToast } from '../toast.js';

export const SignupPage = {
    isPublic: true,
    getTitle() {
        return `${i18n.t('actions.signup')} • ${i18n.t('brand.name')}`;
    },
    render() {
        return `
            <section class="auth-page" aria-labelledby="signup-heading">
                <div class="auth-page__card form-card">
                    <div class="auth-page__intro">
                        <h1 id="signup-heading">${i18n.t('auth.signupTitle')}</h1>
                        <p class="auth-page__summary">${i18n.t('auth.signupSubtitle')}</p>
                    </div>
                    <form data-auth-form="signup" class="auth-form" novalidate>
                        <div class="auth-form__section">
                            <span class="auth-form__section-title">${i18n.t('auth.personalSection')}</span>
                            <div class="form-grid form-grid--two-col">
                                <label class="label">
                                    ${i18n.t('auth.nameLabel')}
                                    <input class="input" type="text" name="name" autocomplete="name" required>
                                </label>
                                <label class="label">
                                    ${i18n.t('auth.dobLabel')}
                                    <input class="input" type="date" name="dob" required>
                                </label>
                                <label class="label">
                                    ${i18n.t('auth.emailLabel')}
                                    <input class="input" type="email" name="email" autocomplete="email" required>
                                </label>
                                <label class="label">
                                    ${i18n.t('auth.phoneLabel')}
                                    <input class="input" type="tel" name="phone" autocomplete="tel" required>
                                </label>
                                <label class="label">
                                    ${i18n.t('auth.genderLabel')}
                                    <select class="select" name="gender" required>
                                        <option value="">${i18n.t('auth.genderPlaceholder')}</option>
                                        <option value="female">${i18n.t('auth.genderFemale')}</option>
                                        <option value="male">${i18n.t('auth.genderMale')}</option>
                                        <option value="non-binary">${i18n.t('auth.genderNonBinary')}</option>
                                        <option value="prefer-not">${i18n.t('auth.genderPreferNot')}</option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        <div class="auth-form__section">
                            <span class="auth-form__section-title">${i18n.t('auth.securitySection')}</span>
                            <div class="form-grid form-grid--two-col">
                                <label class="label">
                                    ${i18n.t('auth.passwordLabel')}
                                    <input class="input" type="password" name="password" autocomplete="new-password" required>
                                </label>
                                <label class="label">
                                    ${i18n.t('auth.confirmPasswordLabel')}
                                    <input class="input" type="password" name="confirm" autocomplete="new-password" required>
                                </label>
                            </div>
                        </div>

                        <div class="auth-form__section">
                            <span class="auth-form__section-title">${i18n.t('auth.addressSection')}</span>
                            <div class="form-grid form-grid--two-col">
                                <label class="label">
                                    ${i18n.t('auth.addressLine1')}
                                    <input class="input" type="text" name="address1" autocomplete="address-line1" required>
                                </label>
                                <label class="label">
                                    ${i18n.t('auth.addressLine2')}
                                    <input class="input" type="text" name="address2" autocomplete="address-line2">
                                </label>
                                <label class="label">
                                    ${i18n.t('auth.cityLabel')}
                                    <input class="input" type="text" name="city" autocomplete="address-level2" required>
                                </label>
                                <label class="label">
                                    ${i18n.t('auth.stateLabel')}
                                    <input class="input" type="text" name="state" autocomplete="address-level1" required>
                                </label>
                                <label class="label">
                                    ${i18n.t('auth.postalLabel')}
                                    <input class="input" type="text" name="postal" autocomplete="postal-code" required>
                                </label>
                            </div>
                        </div>

                        <div class="auth-form__section">
                            <span class="auth-form__section-title">${i18n.t('auth.emergencySection')}</span>
                            <div class="form-grid form-grid--two-col">
                                <label class="label">
                                    ${i18n.t('auth.emergencyContactName')}
                                    <input class="input" type="text" name="emergencyName" required>
                                </label>
                                <label class="label">
                                    ${i18n.t('auth.emergencyContactPhone')}
                                    <input class="input" type="tel" name="emergencyPhone" required>
                                </label>
                            </div>
                        </div>

                        <div class="auth-form__section">
                            <span class="auth-form__section-title">${i18n.t('auth.healthSection')}</span>
                            <div class="form-grid">
                                <label class="label">
                                    ${i18n.t('auth.conditionsLabel')}
                                    <textarea class="textarea" name="conditions" rows="3" placeholder="Hypertension, Asthma"></textarea>
                                </label>
                                <label class="label">
                                    ${i18n.t('auth.allergiesLabel')}
                                    <textarea class="textarea" name="allergies" rows="3" placeholder="Peanuts, Penicillin"></textarea>
                                </label>
                                <label class="label">
                                    ${i18n.t('auth.physicianLabel')}
                                    <input class="input" type="text" name="physician">
                                </label>
                            </div>
                        </div>

                        <div class="auth-form__section">
                            <span class="auth-form__section-title">${i18n.t('auth.insuranceSection')}</span>
                            <div class="form-grid form-grid--two-col">
                                <label class="label">
                                    ${i18n.t('auth.insuranceProvider')}
                                    <input class="input" type="text" name="insuranceProvider">
                                </label>
                                <label class="label">
                                    ${i18n.t('auth.policyNumber')}
                                    <input class="input" type="text" name="policyNumber">
                                </label>
                            </div>
                        </div>

                        <div class="auth-form__section">
                            <label class="label" data-checkbox-row>
                                <span>${i18n.t('auth.consentWearables')}</span>
                                <input type="checkbox" name="wearableConsent" value="true">
                            </label>
                            <label class="label" data-checkbox-row>
                                <span>${i18n.t('auth.consentDataShare')}</span>
                                <input type="checkbox" name="dataConsent" value="true" required>
                            </label>
                        </div>

                        <div class="auth-form__actions">
                            <button class="button-primary" type="submit" data-auth-submit>${i18n.t('actions.signup')}</button>
                            <p class="helper-text">${i18n.t('auth.summaryNotice')}</p>
                        </div>
                    </form>
                    <p class="auth-switch">
                        ${i18n.t('auth.haveAccount')} 
                        <button class="button-ghost" data-route="/login">${i18n.t('actions.login')}</button>
                    </p>
                </div>
            </section>
        `;
    },
    afterRender() {
        const form = document.querySelector('[data-auth-form="signup"]');
        if (!form) return;

        form.addEventListener('submit', event => {
            event.preventDefault();
            const submitButton = form.querySelector('[data-auth-submit]');
            const formData = new FormData(form);
            const name = formData.get('name')?.toString().trim() ?? '';
            const rawEmail = formData.get('email')?.toString().trim() ?? '';
            const password = formData.get('password')?.toString().trim() ?? '';
            const confirm = formData.get('confirm')?.toString().trim() ?? '';
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const dateOfBirth = formData.get('dob')?.toString();
            const phone = formData.get('phone')?.toString().trim() ?? '';
            const gender = formData.get('gender')?.toString();
            const address1 = formData.get('address1')?.toString().trim() ?? '';
            const address2 = formData.get('address2')?.toString().trim() ?? '';
            const city = formData.get('city')?.toString().trim() ?? '';
            const state = formData.get('state')?.toString().trim() ?? '';
            const postal = formData.get('postal')?.toString().trim() ?? '';
            const emergencyName = formData.get('emergencyName')?.toString().trim() ?? '';
            const emergencyPhone = formData.get('emergencyPhone')?.toString().trim() ?? '';
            const conditions = formData.get('conditions')?.toString().trim() ?? '';
            const allergies = formData.get('allergies')?.toString().trim() ?? '';
            const physician = formData.get('physician')?.toString().trim() ?? '';
            const insuranceProvider = formData.get('insuranceProvider')?.toString().trim() ?? '';
            const policyNumber = formData.get('policyNumber')?.toString().trim() ?? '';
            const wearableConsent = formData.get('wearableConsent') === 'true';
            const dataConsent = formData.get('dataConsent') === 'true';

            if (!name) {
                showToast(i18n.t('auth.nameRequired'), { variant: 'error' });
                return;
            }

            if (!emailPattern.test(rawEmail.toLowerCase())) {
                showToast(i18n.t('auth.invalidEmail'), { variant: 'error' });
                return;
            }

            if (!password) {
                showToast(i18n.t('auth.passwordRequired'), { variant: 'error' });
                return;
            }

            if (password !== confirm) {
                showToast(i18n.t('auth.passwordMismatch'), { variant: 'error' });
                return;
            }

            if (!dateOfBirth) {
                showToast(i18n.t('auth.dobRequired'), { variant: 'error' });
                return;
            }

            if (!phone) {
                showToast(i18n.t('auth.phoneRequired'), { variant: 'error' });
                return;
            }

            if (!gender) {
                showToast(i18n.t('auth.genderRequired'), { variant: 'error' });
                return;
            }

            if (!address1 || !city || !state || !postal) {
                showToast(i18n.t('auth.addressRequired'), { variant: 'error' });
                return;
            }

            if (!emergencyName || !emergencyPhone) {
                showToast(i18n.t('auth.emergencyRequired'), { variant: 'error' });
                return;
            }

            if (!dataConsent) {
                showToast(i18n.t('auth.dataConsentRequired'), { variant: 'error' });
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = `${i18n.t('actions.signup')}…`;

            auth.signup({
                name,
                email: rawEmail.toLowerCase(),
                password,
                profile: {
                    dateOfBirth,
                    phone,
                    gender,
                    address: {
                        line1: address1,
                        line2: address2,
                        city,
                        state,
                        postal,
                    },
                    emergencyContact: {
                        name: emergencyName,
                        phone: emergencyPhone,
                    },
                    conditions,
                    allergies,
                    primaryPhysician: physician,
                    insurance: {
                        provider: insuranceProvider,
                        policyNumber,
                    },
                    wearableConsent,
                    dataConsent,
                },
            }).then(user => {
                showToast(`${i18n.t('auth.signupSuccess')} ${user.name}!`, { variant: 'success', duration: 3600 });
                window.__appRouter?.navigate('/dashboard');
            }).catch(error => {
                console.error('[Signup] Error:', error);
                const errorMessage = error?.message || error?.toString() || i18n.t('auth.signupFailed');
                showToast(errorMessage, { variant: 'error' });
            }).finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = i18n.t('actions.signup');
            });
        });
    },
};
