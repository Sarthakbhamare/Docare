import { i18n } from '../i18n.js';
import { showToast } from '../toast.js';
import { providers, initialThreads } from '../data/providers.js';

const state = {
    selectedProviderId: providers[0]?.id ?? null,
    threads: JSON.parse(JSON.stringify(initialThreads)),
};

const getThread = providerId => {
    if (!state.threads[providerId]) {
        state.threads[providerId] = [];
    }
    return state.threads[providerId];
};

const renderProviderList = () => `
    <aside class="provider-list" aria-label="${i18n.t('messages.providers')}">
        <h2 class="section__headline">${i18n.t('messages.providers')}</h2>
        ${providers.map(provider => `
            <article class="provider-card ${provider.id === state.selectedProviderId ? 'provider-card--active' : ''}" data-provider-id="${provider.id}" tabindex="0">
                <strong>${provider.name}</strong>
                <div class="provider-card__meta">${provider.specialty}</div>
                <div class="helper-text">${provider.nextAvailable}</div>
            </article>
        `).join('')}
    </aside>
`;

const renderChatPanel = () => {
    if (!state.selectedProviderId) {
        return `
            <div class="chat-panel" data-chat-panel>
                <div class="chat-header">
                    <h2>${i18n.t('messages.title')}</h2>
                </div>
                <p class="helper-text">${i18n.t('messages.threadPlaceholder')}</p>
            </div>
        `;
    }

    const provider = providers.find(p => p.id === state.selectedProviderId);
    const thread = getThread(state.selectedProviderId);

    return `
        <div class="chat-panel" data-chat-panel>
            <div class="chat-header">
                <div>
                    <h2>${provider.name}</h2>
                    <p class="helper-text">${provider.specialty}</p>
                </div>
                <button class="button-secondary" data-start-consult>${i18n.t('actions.startConsult')}</button>
            </div>
            <div class="chat-log" data-chat-log>
                ${thread.map(message => `
                    <div class="chat-message ${message.sender === 'user' ? 'chat-message--outgoing' : ''}">
                        <p>${message.text}</p>
                        <span class="helper-text">${message.timestamp}</span>
                    </div>
                `).join('')}
            </div>
            <form class="chat-compose" data-chat-form>
                <label class="label">
                    <span class="sr-only">${i18n.t('messages.composePlaceholder')}</span>
                    <textarea class="textarea" rows="3" placeholder="${i18n.t('messages.composePlaceholder')}" required></textarea>
                </label>
                <div class="chat-actions">
                    <button class="button-secondary" type="button" data-attach>${i18n.t('actions.export')}</button>
                    <button class="button-primary" type="submit">${i18n.t('actions.sendMessage')}</button>
                </div>
            </form>
        </div>
    `;
};

const autoScroll = container => {
    if (!container) return;
    container.scrollTop = container.scrollHeight;
};

const simulateProviderResponse = providerId => {
    setTimeout(() => {
        const thread = getThread(providerId);
        thread.push({
            id: `auto-${Date.now()}`,
            sender: 'provider',
            text: 'Thanks for the update. I will follow up shortly.',
            timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        });
        if (providerId === state.selectedProviderId) {
            const viewRoot = document.querySelector('[data-view-root]');
            if (viewRoot) {
                viewRoot.innerHTML = MessagesPage.render();
                MessagesPage.afterRender();
            }
        }
    }, 2400 + Math.random() * 1600);
};

export const MessagesPage = {
    isPublic: false,
    onRouteEnter() {
        state.selectedProviderId = providers[0]?.id ?? null;
    },
    getTitle() {
        return `${i18n.t('nav.messages')} • ${i18n.t('brand.name')}`;
    },
    render() {
        return `
            <section class="messages-page">
                <header class="dashboard__header">
                    <h1>${i18n.t('messages.title')}</h1>
                    <p>${i18n.t('messages.subtitle')}</p>
                </header>
                <div class="messages-page__layout">
                    ${renderProviderList()}
                    ${renderChatPanel()}
                </div>
                <p class="helper-text">${i18n.t('messages.escalationCopy')}</p>
            </section>
        `;
    },
    afterRender() {
        document.querySelectorAll('[data-provider-id]').forEach(card => {
            card.addEventListener('click', () => {
                state.selectedProviderId = card.getAttribute('data-provider-id');
                const viewRoot = document.querySelector('[data-view-root]');
                if (viewRoot) {
                    viewRoot.innerHTML = MessagesPage.render();
                    MessagesPage.afterRender();
                }
            });

            card.addEventListener('keypress', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    card.click();
                }
            });
        });

        const chatForm = document.querySelector('[data-chat-form]');
        if (chatForm) {
            chatForm.addEventListener('submit', event => {
                event.preventDefault();
                const textarea = chatForm.querySelector('textarea');
                const message = textarea.value.trim();
                if (!message) {
                    return;
                }

                const thread = getThread(state.selectedProviderId);
                thread.push({
                    id: `user-${Date.now()}`,
                    sender: 'user',
                    text: message,
                    timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
                });
                textarea.value = '';

                const chatLog = document.querySelector('[data-chat-log]');
                if (chatLog) {
                    chatLog.innerHTML = thread.map(entry => `
                        <div class="chat-message ${entry.sender === 'user' ? 'chat-message--outgoing' : ''}">
                            <p>${entry.text}</p>
                            <span class="helper-text">${entry.timestamp}</span>
                        </div>
                    `).join('');
                    autoScroll(chatLog);
                }

                simulateProviderResponse(state.selectedProviderId);
            });
        }

        const consultButton = document.querySelector('[data-start-consult]');
        consultButton?.addEventListener('click', () => {
            showToast('Launching secure video room via WebRTC…', { variant: 'info', duration: 4000 });
            setTimeout(() => {
                showToast('Live consult connected. Recording and transcription are disabled by default.', { variant: 'success', duration: 4800 });
            }, 2200);
        });
    },
};
