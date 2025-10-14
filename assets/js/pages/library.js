import { i18n } from '../i18n.js';
import { showToast } from '../toast.js';
import { articles, videos } from '../data/library.js';

const state = {
    searchQuery: '',
    selectedCategory: 'all',
    selectedType: 'all',
    savedResources: JSON.parse(localStorage.getItem('docare.savedResources') || '[]'),
};

const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'mental-health', label: 'Mental Health' },
    { id: 'physical-health', label: 'Physical Health' },
    { id: 'nutrition', label: 'Nutrition' },
    { id: 'fitness', label: 'Fitness' },
    { id: 'sleep', label: 'Sleep' },
    { id: 'stress', label: 'Stress Management' },
    { id: 'chronic-care', label: 'Chronic Conditions' },
];

const resourceTypes = [
    { id: 'all', label: 'All Types' },
    { id: 'article', label: 'Articles' },
    { id: 'video', label: 'Videos' },
];

// Enhanced library data with categories
const enhancedArticles = [
    {
        id: 'art-1',
        title: 'Understanding Anxiety and Panic Attacks',
        description: 'Learn about anxiety symptoms, triggers, and evidence-based coping strategies.',
        url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders',
        category: 'mental-health',
        type: 'article',
        readTime: '8 min',
        author: 'National Institute of Mental Health',
        featured: true,
    },
    {
        id: 'art-2',
        title: 'Heart-Healthy Diet Guidelines',
        description: 'Comprehensive guide to eating for cardiovascular health.',
        url: 'https://www.heart.org/en/healthy-living/healthy-eating',
        category: 'nutrition',
        type: 'article',
        readTime: '12 min',
        author: 'American Heart Association',
        featured: true,
    },
    {
        id: 'art-3',
        title: 'Managing Chronic Pain Without Medication',
        description: 'Alternative approaches to pain management including physical therapy and mindfulness.',
        url: 'https://www.mayoclinic.org/diseases-conditions/chronic-pain',
        category: 'chronic-care',
        type: 'article',
        readTime: '10 min',
        author: 'Mayo Clinic',
        featured: false,
    },
    {
        id: 'art-4',
        title: 'Sleep Hygiene: Better Sleep Habits',
        description: 'Science-backed tips for improving sleep quality and duration.',
        url: 'https://www.sleepfoundation.org/sleep-hygiene',
        category: 'sleep',
        type: 'article',
        readTime: '6 min',
        author: 'Sleep Foundation',
        featured: true,
    },
    {
        id: 'art-5',
        title: 'Stress Reduction Techniques',
        description: 'Practical stress management strategies for daily life.',
        url: 'https://www.apa.org/topics/stress',
        category: 'stress',
        type: 'article',
        readTime: '7 min',
        author: 'American Psychological Association',
        featured: false,
    },
    ...articles.map((art, idx) => ({
        id: `art-legacy-${idx}`,
        ...art,
        category: 'physical-health',
        readTime: '5 min',
        author: 'DoCare Health',
        featured: false,
    })),
];

const enhancedVideos = [
    {
        id: 'vid-1',
        title: 'Guided Meditation for Anxiety Relief',
        description: '15-minute guided meditation to calm anxiety and reduce stress.',
        url: 'https://www.youtube.com/watch?v=ZToicYcHIOU',
        category: 'mental-health',
        type: 'video',
        duration: '15:24',
        views: '2.4M',
        featured: true,
    },
    {
        id: 'vid-2',
        title: 'Beginner Yoga for Back Pain',
        description: 'Gentle yoga routine designed to relieve lower back pain.',
        url: 'https://www.youtube.com/watch?v=4pKly2JojMw',
        category: 'fitness',
        type: 'video',
        duration: '20:15',
        views: '1.8M',
        featured: true,
    },
    {
        id: 'vid-3',
        title: 'Understanding Depression',
        description: 'Educational video about depression symptoms and treatment options.',
        url: 'https://www.youtube.com/watch?v=z-IR48Mb3W0',
        category: 'mental-health',
        type: 'video',
        duration: '12:30',
        views: '3.1M',
        featured: true,
    },
    {
        id: 'vid-4',
        title: 'Healthy Meal Prep for Beginners',
        description: 'Simple and nutritious meal prep ideas for the week.',
        url: 'https://www.youtube.com/watch?v=sgtBuGEGXU4',
        category: 'nutrition',
        type: 'video',
        duration: '18:45',
        views: '5.2M',
        featured: false,
    },
    {
        id: 'vid-5',
        title: 'Breathing Exercises for Panic Attacks',
        description: 'Quick breathing techniques to manage panic attacks in the moment.',
        url: 'https://www.youtube.com/watch?v=tEmt1Znux58',
        category: 'stress',
        type: 'video',
        duration: '8:12',
        views: '980K',
        featured: false,
    },
    ...videos.map((vid, idx) => ({
        id: `vid-legacy-${idx}`,
        ...vid,
        category: 'physical-health',
        duration: '10:00',
        views: '500K',
        featured: false,
    })),
];

const allResources = [...enhancedArticles, ...enhancedVideos];

const filterResources = () => {
    return allResources.filter(resource => {
        const matchesSearch = !state.searchQuery || 
            resource.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            resource.description.toLowerCase().includes(state.searchQuery.toLowerCase());
        
        const matchesCategory = state.selectedCategory === 'all' || resource.category === state.selectedCategory;
        const matchesType = state.selectedType === 'all' || resource.type === state.selectedType;
        
        return matchesSearch && matchesCategory && matchesType;
    });
};

const toggleSaveResource = (resourceId) => {
    const index = state.savedResources.indexOf(resourceId);
    if (index > -1) {
        state.savedResources.splice(index, 1);
        showToast('Removed from saved resources', { variant: 'info', duration: 2000 });
    } else {
        state.savedResources.push(resourceId);
        showToast('Saved to your library', { variant: 'success', duration: 2000 });
    }
    localStorage.setItem('docare.savedResources', JSON.stringify(state.savedResources));
    
    // Re-render the page
    const viewRoot = document.querySelector('[data-view-root]');
    if (viewRoot) {
        viewRoot.innerHTML = LibraryPage.render();
        LibraryPage.afterRender();
    }
};

const shareResource = (resource) => {
    if (navigator.share) {
        navigator.share({
            title: resource.title,
            text: resource.description,
            url: resource.url,
        }).then(() => {
            showToast('Resource shared successfully', { variant: 'success', duration: 2000 });
        }).catch(() => {
            copyResourceLink(resource);
        });
    } else {
        copyResourceLink(resource);
    }
};

const copyResourceLink = (resource) => {
    navigator.clipboard.writeText(resource.url).then(() => {
        showToast('Link copied to clipboard', { variant: 'success', duration: 2000 });
    }).catch(() => {
        showToast('Could not copy link', { variant: 'error', duration: 2000 });
    });
};

function renderResourceCard(resource) {
    const isSaved = state.savedResources.includes(resource.id);
    const categoryLabel = categories.find(c => c.id === resource.category)?.label || resource.category;
    
    return `
        <article class="resource-card resource-card--${resource.type}">
            <div class="resource-card__header">
                <span class="resource-type-badge">${resource.type === 'video' ? '🎥' : '📄'} ${resource.type}</span>
                ${resource.featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
            </div>
            
            <div class="resource-card__content">
                <h3 class="resource-title">${resource.title}</h3>
                <p class="resource-description">${resource.description}</p>
                
                <div class="resource-meta">
                    <span class="category-tag">${categoryLabel}</span>
                    ${resource.readTime ? `<span class="meta-item">📖 ${resource.readTime}</span>` : ''}
                    ${resource.duration ? `<span class="meta-item">⏱️ ${resource.duration}</span>` : ''}
                    ${resource.views ? `<span class="meta-item">👁️ ${resource.views}</span>` : ''}
                </div>
                
                ${resource.author ? `<p class="resource-author">By ${resource.author}</p>` : ''}
            </div>
            
            <div class="resource-card__actions">
                <button class="button-primary" type="button" data-open-resource="${resource.url}">
                    ${resource.type === 'video' ? 'Watch' : 'Read'} ${resource.type === 'video' ? '▶️' : '→'}
                </button>
                <button 
                    class="button-icon ${isSaved ? 'button-icon--active' : ''}" 
                    type="button" 
                    data-save-resource="${resource.id}"
                    title="${isSaved ? 'Remove from saved' : 'Save for later'}"
                >
                    ${isSaved ? '❤️' : '🤍'}
                </button>
                <button 
                    class="button-icon" 
                    type="button" 
                    data-share-resource="${resource.id}"
                    title="Share resource"
                >
                    📤
                </button>
            </div>
        </article>
    `;
}

export const LibraryPage = {
    isPublic: false,
    getTitle() {
        return `Resource Library • ${i18n.t('brand.name')}`;
    },
    render() {
        const filteredResources = filterResources();
        const featuredResources = allResources.filter(r => r.featured);
        const savedResourcesData = allResources.filter(r => state.savedResources.includes(r.id));
        
        return `
            <section class="library-page">
                <header class="library-page__header">
                    <div>
                        <h1>Resource Library</h1>
                        <p>Evidence-based articles, videos, and guides for your health journey</p>
                    </div>
                </header>

                <div class="library-filters">
                    <div class="search-bar">
                        <input 
                            type="search" 
                            class="input search-input" 
                            placeholder="Search articles, videos, and resources..." 
                            value="${state.searchQuery}"
                            data-library-search
                        />
                    </div>
                    
                    <div class="filter-row">
                        <select class="select" data-category-filter>
                            ${categories.map(cat => `
                                <option value="${cat.id}" ${state.selectedCategory === cat.id ? 'selected' : ''}>
                                    ${cat.label}
                                </option>
                            `).join('')}
                        </select>
                        
                        <select class="select" data-type-filter>
                            ${resourceTypes.map(type => `
                                <option value="${type.id}" ${state.selectedType === type.id ? 'selected' : ''}>
                                    ${type.label}
                                </option>
                            `).join('')}
                        </select>
                        
                        <button class="button-secondary" type="button" data-clear-filters>
                            Clear Filters
                        </button>
                    </div>
                </div>

                ${savedResourcesData.length > 0 ? `
                    <section class="library-section">
                        <h2 class="section-title">
                            <span>📚 Your Saved Resources</span>
                            <span class="count-badge">${savedResourcesData.length}</span>
                        </h2>
                        <div class="resource-grid">
                            ${savedResourcesData.map(resource => renderResourceCard(resource)).join('')}
                        </div>
                    </section>
                ` : ''}

                ${featuredResources.length > 0 && state.searchQuery === '' ? `
                    <section class="library-section">
                        <h2 class="section-title">⭐ Featured Resources</h2>
                        <div class="resource-grid">
                            ${featuredResources.slice(0, 3).map(resource => renderResourceCard(resource)).join('')}
                        </div>
                    </section>
                ` : ''}

                <section class="library-section">
                    <h2 class="section-title">
                        <span>${state.searchQuery ? 'Search Results' : 'All Resources'}</span>
                        <span class="count-badge">${filteredResources.length}</span>
                    </h2>
                    
                    ${filteredResources.length > 0 ? `
                        <div class="resource-grid">
                            ${filteredResources.map(resource => renderResourceCard(resource)).join('')}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <p>No resources found matching your criteria.</p>
                            <button class="button-secondary" type="button" data-clear-filters>Clear Filters</button>
                        </div>
                    `}
                </section>
            </section>
        `;
    },
    afterRender() {
        const searchInput = document.querySelector('[data-library-search]');
        searchInput?.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            const viewRoot = document.querySelector('[data-view-root]');
            if (viewRoot) {
                viewRoot.innerHTML = LibraryPage.render();
                LibraryPage.afterRender();
            }
        });

        const categoryFilter = document.querySelector('[data-category-filter]');
        categoryFilter?.addEventListener('change', (e) => {
            state.selectedCategory = e.target.value;
            const viewRoot = document.querySelector('[data-view-root]');
            if (viewRoot) {
                viewRoot.innerHTML = LibraryPage.render();
                LibraryPage.afterRender();
            }
        });

        const typeFilter = document.querySelector('[data-type-filter]');
        typeFilter?.addEventListener('change', (e) => {
            state.selectedType = e.target.value;
            const viewRoot = document.querySelector('[data-view-root]');
            if (viewRoot) {
                viewRoot.innerHTML = LibraryPage.render();
                LibraryPage.afterRender();
            }
        });

        document.querySelectorAll('[data-clear-filters]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.searchQuery = '';
                state.selectedCategory = 'all';
                state.selectedType = 'all';
                const viewRoot = document.querySelector('[data-view-root]');
                if (viewRoot) {
                    viewRoot.innerHTML = LibraryPage.render();
                    LibraryPage.afterRender();
                }
            });
        });

        document.querySelectorAll('[data-save-resource]').forEach(btn => {
            btn.addEventListener('click', () => {
                const resourceId = btn.getAttribute('data-save-resource');
                toggleSaveResource(resourceId);
            });
        });

        document.querySelectorAll('[data-share-resource]').forEach(btn => {
            btn.addEventListener('click', () => {
                const resourceId = btn.getAttribute('data-share-resource');
                const resource = allResources.find(r => r.id === resourceId);
                if (resource) {
                    shareResource(resource);
                }
            });
        });

        document.querySelectorAll('[data-open-resource]').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.getAttribute('data-open-resource');
                window.open(url, '_blank', 'noopener,noreferrer');
            });
        });
    },
};
