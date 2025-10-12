const ensureToastContainer = () => {
    let container = document.querySelector('[data-toast-container]');
    if (!container) {
        container = document.createElement('div');
        container.setAttribute('data-toast-container', '');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
};

const createToastElement = (message, variant = 'info', duration = 4000) => {
    const toast = document.createElement('div');
    toast.className = `toast toast--${variant}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', variant === 'error' ? 'assertive' : 'polite');
    toast.innerHTML = `
        <span class="toast__message">${message}</span>
        <button class="toast__close" type="button" aria-label="Dismiss notification">×</button>
    `;

    const closeButton = toast.querySelector('.toast__close');
    closeButton.addEventListener('click', () => {
        toast.classList.add('toast--leaving');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    });

    if (duration > 0) {
        setTimeout(() => {
            if (toast.isConnected) {
                toast.classList.add('toast--leaving');
                toast.addEventListener('animationend', () => toast.remove(), { once: true });
            }
        }, duration);
    }

    return toast;
};

export const showToast = (message, { variant = 'info', duration = 4000 } = {}) => {
    const container = ensureToastContainer();
    const toast = createToastElement(message, variant, duration);
    container.appendChild(toast);
};

window.addEventListener('DOMContentLoaded', ensureToastContainer);
