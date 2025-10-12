const navigationConfig = [
    { label: 'Home', route: '/home' },
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Symptom Checker', route: '/symptom-checker' },
    { label: 'Articles & Videos', route: '/library' },
    { label: 'Support', route: '/support' },
];

const secondaryNavConfig = [
    { label: 'Profile', route: '/profile' },
    { label: 'Messages', route: '/messages' },
    { label: 'Emergency', route: '/emergency', cta: true },
];

const footerPrimaryLinks = [
    { label: 'Privacy Policy', route: '/privacy' },
    { label: 'Terms of Service', route: '/terms' },
    { label: 'Accessibility', route: '/accessibility' },
];

const footerSecondaryLinks = [
    { label: 'Contact', route: '/support' },
    { label: 'Status', route: '/status' },
    { label: 'Press', route: '/press' },
];

const renderNavigationLinks = (items, className) => items.map(item => (
    `<a class="${className} ${item.cta ? `${className}--cta` : ''}" data-route="${item.route}" href="${item.route}">${item.label}</a>`
)).join('');

const renderHeader = () => {
    const headerHost = document.querySelector('[data-app-header]');
    if (!headerHost) return;

    headerHost.classList.add('app-header');
    headerHost.innerHTML = `
        <div class="container app-header__inner">
            <a class="app-brand" data-route="/home" href="/home" aria-label="DoCare home">
                <img src="./img/logo.jpg" alt="DoCare logo">
                <span>DoCare Health</span>
            </a>
            <nav class="nav-list" aria-label="Primary">
                ${renderNavigationLinks(navigationConfig, 'nav-link')}
                ${renderNavigationLinks(secondaryNavConfig, 'nav-link')}
            </nav>
            <div class="app-header__utilities">
                <button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle high contrast theme">
                    <span class="theme-icon">🌓</span>
                </button>
            </div>
            <button class="app-header__mobile-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu">
                <span class="sr-only">Toggle navigation</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                </svg>
            </button>
        </div>
        <div class="mobile-menu" id="mobile-menu">
            <div class="mobile-menu__list" role="menu">
                ${renderNavigationLinks([...navigationConfig, ...secondaryNavConfig], 'mobile-menu__link')}
            </div>
        </div>
    `;
};

const renderFooter = () => {
    const footerHost = document.querySelector('[data-app-footer]');
    if (!footerHost) return;

    const currentYear = new Date().getFullYear();

    footerHost.classList.add('app-footer');
    footerHost.innerHTML = `
        <div class="container app-footer__inner">
            <div class="app-footer__brand">
                <a class="app-brand" data-route="/home" href="/home">
                    <img src="./img/logo.jpg" alt="DoCare logo">
                    <span>DoCare Health</span>
                </a>
                <p>Transforming compassionate care into everyday support for individuals and families.</p>
            </div>
            <div class="app-footer__nav" aria-label="Footer primary">
                ${footerPrimaryLinks.map(link => `<a class="app-footer__link" data-route="${link.route}" href="${link.route}">${link.label}</a>`).join('')}
            </div>
            <div class="app-footer__meta" aria-label="Footer secondary">
                ${footerSecondaryLinks.map(link => `<a class="app-footer__link" data-route="${link.route}" href="${link.route}">${link.label}</a>`).join('')}
            </div>
        </div>
        <div class="container app-footer__bottom">
            <span>© ${currentYear} DoCare Health. All rights reserved.</span>
            <span>Need help? <a class="app-footer__link" data-route="/support" href="/support">Visit support</a></span>
        </div>
    `;
};

const wireMobileMenu = () => {
    const toggle = document.querySelector('.app-header__mobile-toggle');
    const menu = document.getElementById('mobile-menu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        menu.classList.toggle('open', !expanded);
    });
};

const enhanceNavigation = () => {
    const links = document.querySelectorAll('a[data-route]');
    links.forEach(link => {
        link.addEventListener('click', event => {
            if (window.__appRouter) {
                event.preventDefault();
                window.__appRouter.navigate(link.getAttribute('data-route'));
            }
        });
    });
};

window.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    renderFooter();
    wireMobileMenu();
    enhanceNavigation();
});
