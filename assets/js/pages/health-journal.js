/**
 * Health Journal Page
 * Daily wellness tracking, mood logging, symptom tracking
 */

import { i18n } from '../i18n.js';
import { showToast } from '../toast.js';
import { auth } from '../auth.js';

// Mock data for journal entries
const journalEntries = [
    {
        id: 'journal-1',
        date: '2025-10-12',
        mood: 7,
        moodEmoji: '😊',
        energy: 8,
        sleep: 7.5,
        symptoms: ['Mild headache', 'Slight anxiety'],
        medications: [
            { name: 'Sertraline 50mg', taken: true, time: '08:00 AM' },
            { name: 'Vitamin D', taken: true, time: '08:00 AM' }
        ],
        notes: 'Had a good day overall. Morning walk helped with anxiety. Work was productive.',
        tags: ['work', 'exercise', 'positive'],
        activities: ['Walking 30min', 'Meditation 10min'],
    },
    {
        id: 'journal-2',
        date: '2025-10-11',
        mood: 5,
        moodEmoji: '😐',
        energy: 6,
        sleep: 6,
        symptoms: ['Anxiety', 'Racing thoughts', 'Fatigue'],
        medications: [
            { name: 'Sertraline 50mg', taken: true, time: '08:15 AM' },
            { name: 'Vitamin D', taken: false, time: 'Skipped' }
        ],
        notes: 'Rough day. Struggled with work deadlines. Skipped evening meditation.',
        tags: ['stress', 'work', 'anxiety'],
        activities: ['Breathing exercises 5min'],
    },
    {
        id: 'journal-3',
        date: '2025-10-10',
        mood: 8,
        moodEmoji: '😄',
        energy: 9,
        sleep: 8,
        symptoms: [],
        medications: [
            { name: 'Sertraline 50mg', taken: true, time: '07:45 AM' },
            { name: 'Vitamin D', taken: true, time: '07:45 AM' }
        ],
        notes: 'Excellent day! Therapy session was really helpful. Feeling optimistic about progress.',
        tags: ['therapy', 'positive', 'breakthrough'],
        activities: ['Therapy 60min', 'Yoga 30min', 'Walking 45min'],
    },
];

const moodScale = [
    { value: 1, emoji: '😢', label: 'Very Bad', color: '#ef4444' },
    { value: 2, emoji: '😟', label: 'Bad', color: '#f97316' },
    { value: 3, emoji: '😕', label: 'Poor', color: '#f59e0b' },
    { value: 4, emoji: '😐', label: 'Below Average', color: '#eab308' },
    { value: 5, emoji: '😐', label: 'Neutral', color: '#84cc16' },
    { value: 6, emoji: '🙂', label: 'Okay', color: '#22c55e' },
    { value: 7, emoji: '😊', label: 'Good', color: '#10b981' },
    { value: 8, emoji: '😄', label: 'Great', color: '#14b8a6' },
    { value: 9, emoji: '😁', label: 'Excellent', color: '#06b6d4' },
    { value: 10, emoji: '🤩', label: 'Amazing', color: '#0ea5e9' },
];

const commonSymptoms = [
    'Headache', 'Anxiety', 'Depression', 'Fatigue', 'Insomnia',
    'Racing thoughts', 'Panic', 'Irritability', 'Low energy',
    'Muscle tension', 'Nausea', 'Dizziness', 'Concentration issues'
];

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
};

const formatShortDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

const getMoodColor = (mood) => {
    const moodData = moodScale.find(m => m.value === Math.round(mood));
    return moodData?.color || '#94a3b8';
};

const getMoodEmoji = (mood) => {
    const moodData = moodScale.find(m => m.value === Math.round(mood));
    return moodData?.emoji || '😐';
};

const calculateAverage = (entries, key) => {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, entry) => acc + (entry[key] || 0), 0);
    return (sum / entries.length).toFixed(1);
};

const calculateAdherence = (entries) => {
    let totalMeds = 0;
    let takenMeds = 0;
    
    entries.forEach(entry => {
        entry.medications?.forEach(med => {
            totalMeds++;
            if (med.taken) takenMeds++;
        });
    });
    
    return totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 100;
};

export const HealthJournalPage = {
    isPublic: false,
    getTitle() {
        return `Health Journal • ${i18n.t('brand.name')}`;
    },
    render() {
        const avgMood = calculateAverage(journalEntries, 'mood');
        const avgEnergy = calculateAverage(journalEntries, 'energy');
        const avgSleep = calculateAverage(journalEntries, 'sleep');
        const adherence = calculateAdherence(journalEntries);

        return `
            <section class="health-journal-page">
                <header class="health-journal-page__header">
                    <div>
                        <h1>📔 Health Journal</h1>
                        <p>Track your daily wellness, mood, and symptoms</p>
                    </div>
                    <button class="button-primary" type="button" data-new-entry>
                        + New Entry
                    </button>
                </header>

                <!-- Analytics Dashboard -->
                <div class="journal-analytics">
                    <div class="analytics-card">
                        <div class="analytics-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">📊</div>
                        <div class="analytics-content">
                            <h3>7-Day Average</h3>
                            <div class="analytics-metrics">
                                <div class="metric">
                                    <span class="metric-label">Mood</span>
                                    <span class="metric-value">${avgMood}/10</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Energy</span>
                                    <span class="metric-value">${avgEnergy}/10</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Sleep</span>
                                    <span class="metric-value">${avgSleep}h</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="analytics-card">
                        <div class="analytics-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">💊</div>
                        <div class="analytics-content">
                            <h3>Medication Adherence</h3>
                            <div class="adherence-display">
                                <div class="circular-progress" style="--progress: ${adherence};">
                                    <span class="progress-value">${adherence}%</span>
                                </div>
                                <div class="adherence-info">
                                    <p>Great job! You've taken ${adherence}% of your medications this week.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="analytics-card">
                        <div class="analytics-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">🎯</div>
                        <div class="analytics-content">
                            <h3>Wellness Streak</h3>
                            <div class="streak-display">
                                <div class="streak-number">7</div>
                                <p>days of consistent journaling!</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Mood Trend Chart -->
                <section class="mood-chart-section">
                    <div class="section-header">
                        <h2>Mood & Energy Trends</h2>
                        <div class="chart-controls">
                            <button class="chart-filter-btn active" data-filter="7d">7 Days</button>
                            <button class="chart-filter-btn" data-filter="30d">30 Days</button>
                            <button class="chart-filter-btn" data-filter="90d">90 Days</button>
                        </div>
                    </div>
                    <div class="mood-chart">
                        <svg class="line-chart" viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">
                            <!-- Grid lines -->
                            ${Array.from({length: 11}, (_, i) => `
                                <line x1="50" y1="${250 - i * 20}" x2="750" y2="${250 - i * 20}" 
                                      stroke="#e5e7eb" stroke-width="1" stroke-dasharray="5,5" />
                                <text x="30" y="${255 - i * 20}" font-size="12" fill="#6b7280">${i}</text>
                            `).join('')}
                            
                            <!-- Mood line -->
                            <polyline points="${journalEntries.slice().reverse().map((entry, i) => 
                                `${50 + (i * 100)},${250 - (entry.mood * 20)}`
                            ).join(' ')}" 
                            fill="none" stroke="#667eea" stroke-width="3" />
                            
                            <!-- Mood points -->
                            ${journalEntries.slice().reverse().map((entry, i) => `
                                <circle cx="${50 + (i * 100)}" cy="${250 - (entry.mood * 20)}" 
                                        r="6" fill="#667eea" stroke="#fff" stroke-width="2">
                                    <title>${entry.moodEmoji} ${entry.mood}/10 - ${formatShortDate(entry.date)}</title>
                                </circle>
                            `).join('')}
                            
                            <!-- Energy line -->
                            <polyline points="${journalEntries.slice().reverse().map((entry, i) => 
                                `${50 + (i * 100)},${250 - (entry.energy * 20)}`
                            ).join(' ')}" 
                            fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="5,5" />
                            
                            <!-- Energy points -->
                            ${journalEntries.slice().reverse().map((entry, i) => `
                                <circle cx="${50 + (i * 100)}" cy="${250 - (entry.energy * 20)}" 
                                        r="4" fill="#f59e0b" stroke="#fff" stroke-width="2">
                                    <title>⚡ ${entry.energy}/10 - ${formatShortDate(entry.date)}</title>
                                </circle>
                            `).join('')}
                            
                            <!-- X-axis labels -->
                            ${journalEntries.slice().reverse().map((entry, i) => `
                                <text x="${50 + (i * 100)}" y="280" font-size="12" fill="#6b7280" text-anchor="middle">
                                    ${formatShortDate(entry.date)}
                                </text>
                            `).join('')}
                        </svg>
                        <div class="chart-legend">
                            <div class="legend-item">
                                <span class="legend-dot" style="background: #667eea;"></span>
                                <span>Mood</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-dot" style="background: #f59e0b; border: 2px dashed #f59e0b;"></span>
                                <span>Energy</span>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Journal Entries List -->
                <section class="journal-entries-section">
                    <div class="section-header">
                        <h2>Recent Entries</h2>
                        <div class="filter-controls">
                            <input type="search" class="search-input" placeholder="Search entries..." data-search-journal />
                            <select class="select" data-filter-tag>
                                <option value="all">All Tags</option>
                                <option value="work">Work</option>
                                <option value="therapy">Therapy</option>
                                <option value="exercise">Exercise</option>
                                <option value="anxiety">Anxiety</option>
                                <option value="positive">Positive</option>
                            </select>
                        </div>
                    </div>
                    <div class="journal-entries-list">
                        ${journalEntries.map(entry => `
                            <article class="journal-entry-card">
                                <div class="journal-entry-header">
                                    <div class="entry-date">
                                        <h3>${formatDate(entry.date)}</h3>
                                        <div class="entry-mood">
                                            <span class="mood-emoji" style="font-size: 2rem;">${entry.moodEmoji}</span>
                                            <div class="mood-details">
                                                <strong>Mood: ${entry.mood}/10</strong>
                                                <span class="helper-text">Energy: ${entry.energy}/10 • Sleep: ${entry.sleep}h</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button class="button-ghost" type="button" data-edit-entry="${entry.id}">Edit</button>
                                </div>
                                
                                ${entry.symptoms.length > 0 ? `
                                    <div class="entry-symptoms">
                                        <strong>Symptoms:</strong>
                                        <div class="symptom-tags">
                                            ${entry.symptoms.map(symptom => `
                                                <span class="symptom-tag">${symptom}</span>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <div class="entry-medications">
                                    <strong>Medications (${entry.medications.filter(m => m.taken).length}/${entry.medications.length} taken):</strong>
                                    <div class="medication-list">
                                        ${entry.medications.map(med => `
                                            <div class="medication-item ${med.taken ? 'taken' : 'skipped'}">
                                                <span class="med-icon">${med.taken ? '✓' : '✗'}</span>
                                                <span>${med.name} - ${med.time}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                ${entry.notes ? `
                                    <div class="entry-notes">
                                        <p>${entry.notes}</p>
                                    </div>
                                ` : ''}
                                
                                ${entry.activities.length > 0 ? `
                                    <div class="entry-activities">
                                        <strong>Activities:</strong>
                                        <div class="activity-chips">
                                            ${entry.activities.map(activity => `
                                                <span class="activity-chip">🏃 ${activity}</span>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                                
                                <div class="entry-tags">
                                    ${entry.tags.map(tag => `
                                        <span class="tag-badge">#${tag}</span>
                                    `).join('')}
                                </div>
                            </article>
                        `).join('')}
                    </div>
                </section>
            </section>
        `;
    },
    afterRender() {
        // New entry button
        document.querySelector('[data-new-entry]')?.addEventListener('click', () => {
            showToast('Opening journal entry form...', { variant: 'info', duration: 2000 });
            // TODO: Open journal entry modal
        });

        // Edit entry buttons
        document.querySelectorAll('[data-edit-entry]').forEach(btn => {
            btn.addEventListener('click', () => {
                const entryId = btn.dataset.editEntry;
                showToast('Opening entry editor...', { variant: 'info', duration: 2000 });
                // TODO: Open journal entry modal with existing data
            });
        });

        // Chart filter buttons
        document.querySelectorAll('.chart-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                showToast(`Showing ${e.target.dataset.filter} trend`, { variant: 'success', duration: 1500 });
            });
        });

        // Search functionality
        document.querySelector('[data-search-journal]')?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            // TODO: Filter journal entries by search query
            console.log('Searching for:', query);
        });

        // Tag filter
        document.querySelector('[data-filter-tag]')?.addEventListener('change', (e) => {
            const tag = e.target.value;
            if (tag !== 'all') {
                showToast(`Filtering by #${tag}`, { variant: 'info', duration: 1500 });
            }
            // TODO: Filter journal entries by tag
        });
    },
};
