import { auth } from '../auth.js';
import { i18n } from '../i18n.js';
import { showToast } from '../toast.js';

export const LoginPage = {
    isPublic: true,
    getTitle() {
        return `${i18n.t('actions.login')} • ${i18n.t('brand.name')}`;
    },
    render() {
        return `
            <section class="auth-page" aria-labelledby="login-heading">
                <div class="auth-page__card form-card">
                    <div class="auth-page__intro">
                        <h1 id="login-heading">${i18n.t('auth.loginTitle')}</h1>
                        <p class="auth-page__summary">${i18n.t('auth.loginSubtitle')}</p>
                    </div>
                    <form data-auth-form="login" class="auth-form" novalidate aria-describedby="login-helper">
                        <div class="auth-form__section">
                            <span class="auth-form__section-title">${i18n.t('auth.credentialsSection')}</span>
                            <div class="form-grid">
                                <label class="label">
                                    ${i18n.t('auth.emailLabel')}
                                    <input class="input" type="email" name="email" autocomplete="email" required>
                                </label>
                                <label class="label">
                                    ${i18n.t('auth.passwordLabel')}
                                    <input class="input" type="password" name="password" autocomplete="current-password" required>
                                </label>
                            </div>
                        </div>
                        <div class="auth-form__section form-grid form-grid--two-col">
                            <label class="label" data-checkbox-row>
                                <span>${i18n.t('auth.rememberDevice')}</span>
                                <input type="checkbox" name="remember" value="true">
                            </label>
                            <div>
                                <button class="button-ghost" type="button" data-forgot-password>${i18n.t('auth.forgotPassword')}</button>
                                <p id="login-helper" class="helper-text">${i18n.t('auth.mfaHint')}</p>
                            </div>
                        </div>
                        <div class="auth-form__actions">
                            <button class="button-primary" type="submit" data-auth-submit>${i18n.t('actions.login')}</button>
                        </div>
                    </form>
                    <p class="auth-switch">
                        ${i18n.t('auth.needAccount')} 
                        <button class="button-ghost" data-route="/signup">${i18n.t('actions.signup')}</button>
                    </p>
                </div>
            </section>
        `;
    },
    afterRender() {
        const form = document.querySelector('[data-auth-form="login"]');
        if (!form) return;

        form.addEventListener('submit', event => {
            event.preventDefault();
            const submitButton = form.querySelector('[data-auth-submit]');
            const formData = new FormData(form);
            const rawEmail = formData.get('email')?.toString().trim() ?? '';
            const password = formData.get('password')?.toString().trim() ?? '';
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(rawEmail.toLowerCase())) {
                showToast(i18n.t('auth.invalidEmail'), { variant: 'error' });
                return;
            }

            if (!password) {
                showToast(i18n.t('auth.passwordRequired'), { variant: 'error' });
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = `${i18n.t('actions.login')}…`;

            auth.login({
                email: rawEmail.toLowerCase(),
                password,
            }).then(user => {
                showToast(`Welcome back, ${user.name}!`, { variant: 'success', duration: 3200 });
                window.__appRouter?.navigate('/dashboard');
            }).catch(error => {
                showToast(error.message || 'Unable to login. Please try again.', { variant: 'error' });
            }).finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = i18n.t('actions.login');
            });
        });

        const forgotButton = document.querySelector('[data-forgot-password]');
        forgotButton?.addEventListener('click', () => {
            showToast(i18n.t('auth.forgotPasswordHint'), { variant: 'info', duration: 3600 });
        });
    },
};
