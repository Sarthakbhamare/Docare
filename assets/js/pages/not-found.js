import { i18n } from '../i18n.js';

export const NotFoundPage = {
    isPublic: true,
    getTitle() {
        return `404 • ${i18n.t('brand.name')}`;
    },
    render() {
        return `
            <section class="section">
                <div class="container section__inner">
                    <h1 class="hero__title">Page not found</h1>
                    <p class="section__copy">The page you are looking for does not exist or has been moved.</p>
                    <div class="hero__cta-group">
                        <button class="cta-button" data-route="/">Return home</button>
                        <button class="cta-button cta-button--secondary" data-route="/login">${i18n.t('actions.login')}</button>
                    </div>
                </div>
            </section>
        `;
    },
};
