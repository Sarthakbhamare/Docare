// Ensure hash routing is initialized for GitHub Pages
if (!window.location.hash || window.location.hash === '#' || window.location.hash === '') {
    window.location.replace(window.location.pathname + window.location.search + '#/');
}

import { auth } from './auth.js';
import { i18n } from './i18n.js';
import { showToast } from './toast.js';

import { LandingPage } from './pages/home.js';
import { LoginPage } from './pages/login.js';
import { SignupPage } from './pages/signup.js';
import { DashboardPage } from './pages/dashboard.js';
import { MessagesPage } from './pages/messages.js';
import { SymptomCheckerPage } from './pages/symptom-checker.js';
import { MedicationsPage } from './pages/medications.js';
import { AppointmentsPage } from './pages/appointments.js';
import { BillingPage } from './pages/billing.js';
import { DevicesPage } from './pages/devices.js';
import { VideoCallPage } from './pages/video-call.js';
import { ProfilePage } from './pages/profile.js';
import { NotFoundPage } from './pages/not-found.js';

const appRoot = document.querySelector('[data-app-root]');
if (!appRoot) {
    throw new Error('App root element missing.');
}

const isFileProtocol = window.location.protocol === 'file:';

const STORAGE_THEME_KEY = 'docare.theme';

const applyStoredTheme = () => {
    const storedTheme = localStorage.getItem(STORAGE_THEME_KEY);
    if (storedTheme === 'high-contrast') {
        document.documentElement.setAttribute('data-theme', 'high-contrast');
    }
};

applyStoredTheme();

auth.init();

const privateNavItems = [
    { labelKey: 'nav.dashboard', route: '/dashboard' },
    { labelKey: 'nav.appointments', route: '/appointments' },
    { labelKey: 'nav.symptomChecker', route: '/symptom-checker' },
    { labelKey: 'nav.messages', route: '/messages' },
    { labelKey: 'nav.medications', route: '/medications' },
    { labelKey: 'nav.billing', route: '/billing' },
    { labelKey: 'nav.devices', route: '/devices' },
    { labelKey: 'nav.profile', route: '/profile' },
];

const routes = {
    '/': LandingPage,
    '/login': LoginPage,
    '/signup': SignupPage,
    '/dashboard': DashboardPage,
    '/symptom-checker': SymptomCheckerPage,
    '/messages': MessagesPage,
    '/medications': MedicationsPage,
    '/appointments': AppointmentsPage,
    '/billing': BillingPage,
    '/devices': DevicesPage,
    '/video-call': VideoCallPage,
    '/profile': ProfilePage,
};

const normalizePath = rawPath => {
    if (!rawPath) return '/';
    if (rawPath.toLowerCase().endsWith('index.html')) {
        return '/';
    }
    let path = rawPath.replace(/index\.html$/i, '');
    if (!path.startsWith('/')) {
        const anchor = document.createElement('a');
        anchor.href = rawPath;
        path = anchor.pathname;
        path = path.replace(/index\.html$/i, '');
    }
    if (path.endsWith('/') && path !== '/') {
        path = path.slice(0, -1);
    }
    if (path === '') {
        return '/';
    }
    if (!routes[path] && path.includes('.')) {
        return '/';
    }
    if (!routes[path] && path !== '/' && path.split('/').length > 2) {
        const segments = path.split('/');
        const last = `/${segments.at(-1)}`;
        if (routes[last]) {
            return last;
        }
    }
    return path;
};

const renderPublicHeader = () => `
    <header class="app-header app-header--public">
        <div class="container app-header__inner">
            <a class="app-brand" data-route="/" href="/" aria-label="${i18n.t('brand.name')}">
                <img src="./img/logo.jpg" alt="DoCare logo">
                <span>${i18n.t('brand.name')}</span>
            </a>
            <nav class="app-header__nav" aria-label="Public navigation">
                <a class="nav-link nav-link--text" data-route="/login" href="/login">${i18n.t('actions.login')}</a>
            </nav>
            <div class="app-header__utilities">
                <button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle high contrast theme">
                    <span class="theme-icon">🌓</span>
                </button>
                ${renderLocaleSelector()}
            </div>
        </div>
    </header>
`;

const renderPrivateHeader = user => `
    <header class="app-header app-header--private">
        <div class="container app-header__inner">
            <a class="app-brand" data-route="/dashboard" href="/dashboard" aria-label="${i18n.t('brand.name')}">
                <img src="./img/logo.jpg" alt="DoCare logo">
                <span>${i18n.t('brand.name')}</span>
            </a>
            <div class="app-header__utilities">
                <button class="utility-toggle" type="button" data-theme-toggle aria-pressed="${document.documentElement.getAttribute('data-theme') === 'high-contrast'}">
                    High contrast
                </button>
                ${renderLocaleSelector()}
                <span class="avatar-chip" role="button" tabindex="0" data-route="/profile">
                    ${user?.avatarInitials ?? 'ME'}
                </span>
                <button class="utility-toggle" type="button" data-logout>${i18n.t('actions.logout')}</button>
            </div>
        </div>
    </header>
`;

const renderLocaleSelector = () => `
    <label class="sr-only" for="locale-select">${i18n.t('profile.languageLabel')}</label>
    <select id="locale-select" class="select" data-locale-toggle>
        <option value="en" ${i18n.getLocale() === 'en' ? 'selected' : ''}>English</option>
        <option value="hi" ${i18n.getLocale() === 'hi' ? 'selected' : ''}>हिन्दी</option>
    </select>
`;

const renderFooter = () => `
    <footer class="app-footer">
        <div class="container app-footer__inner">
            <div class="app-footer__brand">
                <a class="app-brand" data-route="/" href="/">
                    <img src="./img/logo.jpg" alt="DoCare logo">
                    <span>${i18n.t('brand.name')}</span>
                </a>
                <p>${i18n.t('brand.tagline')}</p>
            </div>
            <div class="app-footer__group" aria-label="${i18n.t('footer.legal')}">
                <h3 class="app-footer__heading">${i18n.t('footer.legal')}</h3>
                <a class="app-footer__link" href="#">${i18n.t('footer.privacy')}</a>
                <a class="app-footer__link" href="#">${i18n.t('footer.terms')}</a>
                <a class="app-footer__link" href="#accessibility">${i18n.t('footer.accessibility')}</a>
            </div>
            <div class="app-footer__group" aria-label="${i18n.t('footer.support')}">
                <h3 class="app-footer__heading">${i18n.t('footer.support')}</h3>
                <a class="app-footer__link" href="#contact">${i18n.t('footer.contact')}</a>
                <a class="app-footer__link" href="#">${i18n.t('footer.status')}</a>
                <a class="app-footer__link" href="#support">${i18n.t('footer.supportCta')}</a>
            </div>
            <div class="app-footer__group" aria-label="${i18n.t('footer.company')}">
                <h3 class="app-footer__heading">${i18n.t('footer.company')}</h3>
                <a class="app-footer__link" href="#">${i18n.t('footer.press')}</a>
                <a class="app-footer__link" href="#">${i18n.t('actions.getStarted')}</a>
                <a class="app-footer__link" href="#">${i18n.t('actions.viewSafety')}</a>
            </div>
        </div>
        <div class="container app-footer__bottom">
            <span>© ${new Date().getFullYear()} ${i18n.t('brand.name')}</span>
            <span>${i18n.t('footer.help')} <a class="app-footer__link" href="#support">${i18n.t('footer.visitSupport')}</a></span>
        </div>
    </footer>
`;

const renderSidebar = currentPath => `
    <aside class="app-sidebar" aria-label="Primary">
        <div class="app-sidebar__section">
            <h2 class="app-sidebar__title">${i18n.t('brand.tagline')}</h2>
            <nav class="sidebar-nav">
                ${privateNavItems.map(item => `
                    <a class="sidebar-nav__link" data-route="${item.route}" href="${item.route}" aria-current="${currentPath === item.route ? 'page' : 'false'}">
                        ${i18n.t(item.labelKey)}
                    </a>
                `).join('')}
            </nav>
        </div>
        <div class="app-sidebar__footer">
            <p>${i18n.t('brand.tagline')}</p>
        </div>
    </aside>
`;

const wireInternalNavigation = (root, router) => {
    root.querySelectorAll('[data-route]').forEach(element => {
        element.addEventListener('click', event => {
            const route = element.getAttribute('data-route');
            if (!route || route.startsWith('http') || route.startsWith('#')) {
                return;
            }
            event.preventDefault();
            router.navigate(route);
        });

        if (!['A', 'BUTTON'].includes(element.tagName)) {
            element.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    const route = element.getAttribute('data-route');
                    if (route) {
                        router.navigate(route);
                    }
                }
            });
        }
    });
};

const wireLocaleToggle = () => {
    const select = document.querySelector('[data-locale-toggle]');
    if (select) {
        select.addEventListener('change', () => {
            i18n.setLocale(select.value);
        });
    }
};

const wireThemeToggle = () => {
    const button = document.querySelector('[data-theme-toggle]');
    if (!button) return;
    button.addEventListener('click', () => {
        const isHighContrast = document.documentElement.getAttribute('data-theme') === 'high-contrast';
        if (isHighContrast) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.removeItem(STORAGE_THEME_KEY);
        } else {
            document.documentElement.setAttribute('data-theme', 'high-contrast');
            localStorage.setItem(STORAGE_THEME_KEY, 'high-contrast');
        }
        button.setAttribute('aria-pressed', String(!isHighContrast));
        showToast(`High contrast ${isHighContrast ? 'disabled' : 'enabled'}.`, { variant: 'info', duration: 2400 });
    });
    
    // Initialize theme toggle button states
    const updateThemeToggleStates = () => {
        const isHighContrast = document.documentElement.getAttribute('data-theme') === 'high-contrast';
        const themeToggleButtons = document.querySelectorAll('.theme-toggle, [data-theme-toggle]');
        themeToggleButtons.forEach(btn => {
            btn.setAttribute('aria-pressed', isHighContrast);
            if (btn.classList.contains('theme-toggle')) {
                const icon = btn.querySelector('.theme-icon');
                if (icon) icon.textContent = isHighContrast ? '☀️' : '🌓';
            }
        });
    };
    
    // Initialize on page load
    updateThemeToggleStates();
};

// Global theme toggle function for onclick handlers
window.toggleTheme = () => {
    const isHighContrast = document.documentElement.getAttribute('data-theme') === 'high-contrast';
    if (isHighContrast) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.removeItem(STORAGE_THEME_KEY);
    } else {
        document.documentElement.setAttribute('data-theme', 'high-contrast');
        localStorage.setItem(STORAGE_THEME_KEY, 'high-contrast');
    }
    
    // Update all theme toggle buttons
    const themeToggleButtons = document.querySelectorAll('.theme-toggle, [data-theme-toggle]');
    themeToggleButtons.forEach(button => {
        const isPressed = document.documentElement.getAttribute('data-theme') === 'high-contrast';
        button.setAttribute('aria-pressed', isPressed);
        if (button.classList.contains('theme-toggle')) {
            const icon = button.querySelector('.theme-icon');
            if (icon) icon.textContent = isPressed ? '☀️' : '🌓';
        }
    });
    
    // Show toast notification
    if (typeof showToast === 'function') {
        showToast(`High contrast ${isHighContrast ? 'disabled' : 'enabled'}.`, { variant: 'info', duration: 2400 });
    }
};

const wireLogout = router => {
    const button = document.querySelector('[data-logout]');
    button?.addEventListener('click', () => {
        auth.logout();
        router.navigate('/login');
    });
};

const focusMain = () => {
    const main = document.querySelector('main');
    if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus();
    }
};

class Router {
    constructor(root) {
        this.root = root;
        // Always use hashchange for GitHub Pages compatibility
        window.addEventListener('hashchange', () => this.renderCurrentRoute(false));
        auth.onAuthChange(() => this.renderCurrentRoute(true));
        i18n.onChange(() => this.renderCurrentRoute(true));
        this.renderCurrentRoute(true);
    }

    isAuthenticated() {
        return auth.isAuthenticated();
    }

    resolve(path) {
        const page = routes[path] ?? NotFoundPage;
        const isAuthed = this.isAuthenticated();

        if (!page.isPublic && !isAuthed) {
            return { redirect: '/login' };
        }

        if (page.isPublic && (path === '/login' || path === '/signup') && isAuthed) {
            return { redirect: '/dashboard' };
        }

        return { page };
    }

    navigate(path, replace = false) {
        const normalized = normalizePath(path);
        const target = this.resolve(normalized);
        if (target.redirect) {
            this.navigate(target.redirect, true);
            return;
        }

        // Always use hash routing for GitHub Pages compatibility
        const newHash = normalized === '/' ? '' : `#${normalized}`;
        if (replace) {
            history.replaceState({}, '', `${window.location.pathname}${newHash}`);
        } else {
            window.location.hash = newHash;
        }
        this.renderCurrentRoute(true);
    }

    renderCurrentRoute(scrollToTop) {
        // Always use hash routing for GitHub Pages compatibility
        const rawPath = window.location.hash?.slice(1) || '/';
        console.log('[Router] Raw path from hash:', rawPath);
        const path = normalizePath(rawPath);
        console.log('[Router] Normalized path:', path);
        console.log('[Router] Available routes:', Object.keys(routes));
        const { page, redirect } = this.resolve(path);
        console.log('[Router] Resolved page:', page === NotFoundPage ? 'NotFoundPage' : (typeof page === 'object' ? 'PageObject' : 'Unknown'));

        if (redirect) {
            this.navigate(redirect, true);
            return;
        }

        if (!page) {
            this.render(NotFoundPage, path);
            return;
        }

        this.render(page, path);

        if (scrollToTop) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            focusMain();
        }
    }

    render(page, path) {
        const user = auth.getUser();
        page.onRouteEnter?.();
        const content = page.render();
        document.title = page.getTitle?.() ?? i18n.t('brand.name');

        if (page.isPublic) {
            this.root.innerHTML = `
                <div class="app-shell app-shell--public">
                    ${renderPublicHeader()}
                    <main class="app-shell__main" aria-live="polite">
                        <div data-view-root>${content}</div>
                    </main>
                    ${renderFooter()}
                </div>
            `;
        } else {
            this.root.innerHTML = `
                <div class="app-shell app-shell--private">
                    ${renderPrivateHeader(user)}
                    <div class="app-shell__content">
                        ${renderSidebar(path)}
                        <main class="app-shell__main" aria-live="polite">
                            <div data-view-root>${content}</div>
                        </main>
                    </div>
                </div>
            `;
        }

        wireInternalNavigation(this.root, this);
        wireLocaleToggle();
        wireThemeToggle();
        wireLogout(this);
        page.afterRender?.();
    }
}

// Initialize router - it will handle initial route and navigation
const router = new Router(appRoot);
window.__appRouter = router;