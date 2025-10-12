import { i18n } from '../i18n.js';

export const LandingPage = {
    isPublic: true,
    getTitle() {
        return `${i18n.t('brand.name')} • ${i18n.t('brand.tagline')}`;
    },
    render() {
        return `
            <section class="hero">
                <div class="container hero__inner">
                    <h1 class="hero__title">${i18n.t('landing.heroTitle')}</h1>
                    <p class="hero__subtitle">${i18n.t('landing.heroSubtitle')}</p>
                    <div class="hero__cta-group" role="group" aria-label="Primary actions">
                        <button class="cta-button" type="button" data-route="/signup">${i18n.t('actions.getStarted')}</button>
                        <a class="cta-link" data-route="/login" href="/login">${i18n.t('actions.login')}</a>
                    </div>
                </div>
            </section>
            <section class="section">
                <div class="container section__inner section__inner--feature">
                    <h2 class="section__headline">${i18n.t('landing.sectionOneTitle')}</h2>
                    <p class="section__copy">${i18n.t('landing.sectionOneCopy')}</p>
                    <div class="feature-grid">
                        <article class="card feature-card">
                            <span class="feature-card__badge">1:1 Guidance</span>
                            <h3>Personalized Dashboard</h3>
                            <p>Track progress, appointments, and mood insights with a unified view tailored to your goals.</p>
                        </article>
                        <article class="card feature-card">
                            <span class="feature-card__badge">Clinician Approved</span>
                            <h3>Resource Library</h3>
                            <p>Filter trusted articles and videos by symptom or condition to discover what works for you.</p>
                        </article>
                        <article class="card feature-card">
                            <span class="feature-card__badge">24/7</span>
                            <h3>Live &amp; Asynchronous Support</h3>
                            <p>Message specialists, join virtual visits, or escalate to urgent care when you need it most.</p>
                        </article>
                    </div>
                </div>
            </section>
            <section class="section">
                <div class="container section__inner">
                    <h2 class="section__headline">${i18n.t('landing.sectionTwoTitle')}</h2>
                    <p class="section__copy">${i18n.t('landing.sectionTwoCopy')}</p>
                    <div class="hero__cta-group">
                        <button class="cta-button cta-button--alert" type="button" data-route="/profile">${i18n.t('actions.viewSafety')}</button>
                    </div>
                </div>
            </section>
        `;
    },
    afterRender() {},
};
