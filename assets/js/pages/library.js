import { articles, videos } from '../data/library.js';
import { showToast } from '../toast.js';

const symptoms = ['Cough', 'Cold', 'Fever', 'Sore Throat'];

const state = {
    searchQuery: '',
    types: new Set(['article', 'video']),
    symptoms: new Set(),
    loading: false,
};

const selectors = {
    searchInput: '[data-library-search]',
    typeFilters: '[data-filter-type]',
    symptomFilters: '[data-filter-symptom]',
    searchButton: '[data-library-submit]',
    articlesList: '#articles-list',
    videosList: '#videos-list',
    loadingIndicator: '[data-loading-indicator]',
};

const toggleLoading = isLoading => {
    state.loading = isLoading;
    const button = document.querySelector(selectors.searchButton);
    const indicator = document.querySelector(selectors.loadingIndicator);

    if (button) {
        button.disabled = isLoading;
        button.setAttribute('aria-busy', String(isLoading));
        button.textContent = isLoading ? 'Searching…' : 'Search';
    }

    if (indicator) {
        indicator.style.display = isLoading ? 'inline-flex' : 'none';
    }
};

const hydrateSymptomFilters = () => {
    const container = document.querySelector('[data-symptom-filter-group]');
    if (!container) return;

    container.innerHTML = symptoms.map(symptom => `
        <label class="filter-chip">
            <input type="checkbox" value="${symptom}" data-filter-symptom>
            ${symptom}
        </label>
    `).join('');
};

const readFormState = () => {
    const searchInput = document.querySelector(selectors.searchInput);
    const typeCheckBoxes = document.querySelectorAll(selectors.typeFilters);
    const symptomCheckBoxes = document.querySelectorAll(selectors.symptomFilters);

    state.searchQuery = searchInput?.value.trim().toLowerCase() ?? '';

    state.types.clear();
    typeCheckBoxes.forEach(input => {
        if (input.checked) {
            state.types.add(input.value);
        }
    });

    state.symptoms.clear();
    symptomCheckBoxes.forEach(input => {
        if (input.checked) {
            state.symptoms.add(input.value.toLowerCase());
        }
    });
};

const filterResource = resource => {
    const matchesType = state.types.size === 0 || state.types.has(resource.type);
    const matchesQuery = !state.searchQuery || resource.title.toLowerCase().includes(state.searchQuery) || resource.description.toLowerCase().includes(state.searchQuery);
    const matchesSymptom = state.symptoms.size === 0 || resource.symptoms.some(symptom => state.symptoms.has(symptom.toLowerCase()));
    return matchesType && matchesQuery && matchesSymptom;
};

const renderResourceList = (listElement, resources, emptyMessage) => {
    if (!listElement) return;

    listElement.innerHTML = '';

    if (resources.length === 0) {
        listElement.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
        return;
    }

    resources.forEach(resource => {
        const card = document.createElement('article');
        card.className = 'card resource-card';
        card.innerHTML = `
            <h3>${resource.title}</h3>
            <p>${resource.description}</p>
            <div class="resource-card__meta">
                <span>${resource.symptoms.join(', ')}</span>
            </div>
            <a href="${resource.url}" target="_blank" rel="noopener">${resource.type === 'video' ? 'Watch video' : 'Read more'}</a>
        `;
        listElement.appendChild(card);
    });
};

const runSearch = () => {
    readFormState();
    toggleLoading(true);

    requestAnimationFrame(() => {
        const filteredArticles = articles.filter(filterResource);
        const filteredVideos = videos.filter(filterResource);

        renderResourceList(
            document.querySelector(selectors.articlesList),
            filteredArticles,
            'No articles matched your filters. Try broadening your search.'
        );

        renderResourceList(
            document.querySelector(selectors.videosList),
            filteredVideos,
            'No videos matched your filters. Try broadening your search.'
        );

        toggleLoading(false);

        if (filteredArticles.length === 0 && filteredVideos.length === 0) {
            showToast('No resources found. Adjust filters and try again.', { variant: 'warning' });
        } else {
            showToast(`Found ${filteredArticles.length + filteredVideos.length} learning resources for you.`, { variant: 'success', duration: 3600 });
        }
    });
};

const wireForm = () => {
    const button = document.querySelector(selectors.searchButton);
    if (button) {
        button.addEventListener('click', event => {
            event.preventDefault();
            runSearch();
        });
    }

    const searchInput = document.querySelector(selectors.searchInput);
    searchInput?.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            runSearch();
        }
    });
};

window.addEventListener('DOMContentLoaded', () => {
    hydrateSymptomFilters();
    wireForm();
    runSearch();
});
