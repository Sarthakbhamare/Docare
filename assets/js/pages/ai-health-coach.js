import { i18n } from '../i18n.js';
import { auth } from '../auth.js';
import { showToast } from '../toast.js';

// Mock health data and AI recommendations
const healthData = {
    recentSymptoms: ['headache', 'fatigue', 'stress'],
    medications: ['Sertraline 50mg', 'Vitamin D3'],
    activities: ['walking', 'meditation', 'sleep tracking'],
    vitalSigns: {
        heartRate: 72,
        bloodPressure: '120/80',
        weight: 155,
        bmi: 23.2
    },
    sleepData: {
        averageHours: 7.2,
        quality: 'Good',
        consistency: 85
    },
    moodTrends: [
        { date: '2025-10-15', mood: 7, energy: 6, stress: 4 },
        { date: '2025-10-14', mood: 6, energy: 5, stress: 6 },
        { date: '2025-10-13', mood: 8, energy: 7, stress: 3 },
        { date: '2025-10-12', mood: 7, energy: 6, stress: 4 },
        { date: '2025-10-11', mood: 6, energy: 5, stress: 7 }
    ]
};

const aiRecommendations = {
    immediate: [
        {
            id: 'hydration',
            title: 'Increase Water Intake',
            description: 'Based on your recent fatigue symptoms, you may be dehydrated. Aim for 8-10 glasses of water daily.',
            priority: 'high',
            category: 'nutrition',
            actionButton: 'Set Hydration Reminder',
            evidence: 'Studies show that even mild dehydration can cause fatigue and headaches.'
        },
        {
            id: 'sleep-schedule',
            title: 'Optimize Sleep Schedule',
            description: 'Your sleep data shows inconsistent bedtimes. A regular sleep schedule can improve energy and mood.',
            priority: 'medium',
            category: 'lifestyle',
            actionButton: 'Create Sleep Plan',
            evidence: 'Consistent sleep timing regulates circadian rhythms and improves overall health.'
        },
        {
            id: 'stress-management',
            title: 'Active Stress Management',
            description: 'Your stress levels have been elevated. Consider adding deep breathing exercises to your routine.',
            priority: 'high',
            category: 'mental-health',
            actionButton: 'Start Breathing Exercise',
            evidence: 'Regular stress management techniques can reduce cortisol levels and improve wellbeing.'
        }
    ],
    weekly: [
        {
            id: 'exercise-plan',
            title: 'Personalized Exercise Plan',
            description: 'Based on your health profile, 30 minutes of moderate cardio 3x per week would benefit your cardiovascular health.',
            category: 'fitness',
            actionButton: 'View Exercise Plan'
        },
        {
            id: 'nutrition-review',
            title: 'Nutrition Assessment',
            description: 'Consider tracking your meals for a week to identify potential nutritional gaps.',
            category: 'nutrition',
            actionButton: 'Start Food Journal'
        }
    ],
    longTerm: [
        {
            id: 'preventive-care',
            title: 'Preventive Care Screening',
            description: 'Schedule your annual physical and discuss cardiovascular risk factors with your doctor.',
            category: 'prevention',
            actionButton: 'Schedule Physical'
        },
        {
            id: 'health-goals',
            title: 'Set Health Goals',
            description: 'Create measurable health goals for the next 3 months based on your current health status.',
            category: 'goals',
            actionButton: 'Create Goals'
        }
    ]
};

const healthInsights = {
    overallScore: 78,
    trends: {
        improving: ['sleep quality', 'medication adherence'],
        declining: ['stress levels', 'physical activity'],
        stable: ['mood', 'weight']
    },
    riskFactors: [
        { factor: 'Stress Management', level: 'moderate', description: 'Recent stress spikes may impact overall health' },
        { factor: 'Physical Activity', level: 'low', description: 'Activity levels below recommended guidelines' }
    ]
};

const renderHealthScore = () => `
    <div class="health-score-card">
        <div class="score-circle">
            <div class="score-value">${healthInsights.overallScore}</div>
            <div class="score-label">Health Score</div>
        </div>
        <div class="score-breakdown">
            <h3>Health Trends</h3>
            <div class="trend-indicators">
                <div class="trend-group improving">
                    <span class="trend-icon">↗️</span>
                    <div>
                        <strong>Improving</strong>
                        <p>${healthInsights.trends.improving.join(', ')}</p>
                    </div>
                </div>
                <div class="trend-group stable">
                    <span class="trend-icon">→</span>
                    <div>
                        <strong>Stable</strong>
                        <p>${healthInsights.trends.stable.join(', ')}</p>
                    </div>
                </div>
                <div class="trend-group declining">
                    <span class="trend-icon">↘️</span>
                    <div>
                        <strong>Needs Attention</strong>
                        <p>${healthInsights.trends.declining.join(', ')}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

const renderRecommendationCard = (rec, timeframe) => `
    <div class="recommendation-card priority-${rec.priority || 'medium'}">
        <div class="rec-header">
            <div class="rec-category ${rec.category}">${getCategoryIcon(rec.category)}</div>
            <div class="rec-priority">${rec.priority || timeframe}</div>
        </div>
        <h3>${rec.title}</h3>
        <p>${rec.description}</p>
        ${rec.evidence ? `<div class="evidence-note">💡 ${rec.evidence}</div>` : ''}
        <button class="button-primary rec-action" data-action="${rec.id}">
            ${rec.actionButton || 'Learn More'}
        </button>
    </div>
`;

const getCategoryIcon = (category) => {
    const icons = {
        'nutrition': '🥗',
        'lifestyle': '🌱',
        'mental-health': '🧠',
        'fitness': '💪',
        'prevention': '🛡️',
        'goals': '🎯'
    };
    return icons[category] || '📋';
};

const renderVitalSigns = () => `
    <div class="vitals-dashboard">
        <h3>Recent Vitals</h3>
        <div class="vitals-grid">
            <div class="vital-item">
                <span class="vital-icon">❤️</span>
                <div>
                    <strong>${healthData.vitalSigns.heartRate} bpm</strong>
                    <p>Heart Rate</p>
                </div>
            </div>
            <div class="vital-item">
                <span class="vital-icon">📊</span>
                <div>
                    <strong>${healthData.vitalSigns.bloodPressure}</strong>
                    <p>Blood Pressure</p>
                </div>
            </div>
            <div class="vital-item">
                <span class="vital-icon">⚖️</span>
                <div>
                    <strong>${healthData.vitalSigns.weight} lbs</strong>
                    <p>Weight</p>
                </div>
            </div>
            <div class="vital-item">
                <span class="vital-icon">📏</span>
                <div>
                    <strong>${healthData.vitalSigns.bmi}</strong>
                    <p>BMI</p>
                </div>
            </div>
        </div>
    </div>
`;

const renderMoodChart = () => {
    const chartData = healthData.moodTrends.reverse();
    return `
        <div class="mood-chart">
            <h3>Mood & Energy Trends (5 Days)</h3>
            <div class="chart-container">
                <svg viewBox="0 0 400 200" class="trend-chart">
                    <!-- Grid lines -->
                    ${[1,2,3,4,5,6,7,8,9,10].map(i => 
                        `<line x1="0" y1="${i * 20}" x2="400" y2="${i * 20}" stroke="#f0f0f0" stroke-width="1"/>`
                    ).join('')}
                    
                    <!-- Mood line -->
                    <polyline 
                        points="${chartData.map((d, i) => `${i * 80 + 40},${200 - (d.mood * 20)}`).join(' ')}"
                        fill="none" 
                        stroke="#2563eb" 
                        stroke-width="3"
                        stroke-linecap="round"
                    />
                    
                    <!-- Energy line -->
                    <polyline 
                        points="${chartData.map((d, i) => `${i * 80 + 40},${200 - (d.energy * 20)}`).join(' ')}"
                        fill="none" 
                        stroke="#10b981" 
                        stroke-width="3"
                        stroke-linecap="round"
                    />
                    
                    <!-- Stress line -->
                    <polyline 
                        points="${chartData.map((d, i) => `${i * 80 + 40},${200 - (d.stress * 20)}`).join(' ')}"
                        fill="none" 
                        stroke="#ef4444" 
                        stroke-width="3"
                        stroke-linecap="round"
                    />
                    
                    <!-- Data points -->
                    ${chartData.map((d, i) => `
                        <circle cx="${i * 80 + 40}" cy="${200 - (d.mood * 20)}" r="4" fill="#2563eb"/>
                        <circle cx="${i * 80 + 40}" cy="${200 - (d.energy * 20)}" r="4" fill="#10b981"/>
                        <circle cx="${i * 80 + 40}" cy="${200 - (d.stress * 20)}" r="4" fill="#ef4444"/>
                    `).join('')}
                </svg>
                <div class="chart-legend">
                    <div class="legend-item">
                        <span class="legend-color" style="background: #2563eb;"></span>
                        <span>Mood</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background: #10b981;"></span>
                        <span>Energy</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background: #ef4444;"></span>
                        <span>Stress</span>
                    </div>
                </div>
            </div>
        </div>
    `;
};

const handleRecommendationAction = (actionId) => {
    const actions = {
        'hydration': () => {
            showToast('💧 Hydration reminder set for every 2 hours!', { variant: 'success', duration: 3000 });
        },
        'sleep-schedule': () => {
            showToast('😴 Sleep schedule optimization plan created!', { variant: 'info', duration: 3000 });
        },
        'stress-management': () => {
            showToast('🧘 Starting 5-minute breathing exercise...', { variant: 'info', duration: 3000 });
        },
        'exercise-plan': () => {
            showToast('💪 Personalized exercise plan generated!', { variant: 'success', duration: 3000 });
        },
        'nutrition-review': () => {
            showToast('🥗 Nutrition tracking started!', { variant: 'info', duration: 3000 });
        },
        'preventive-care': () => {
            showToast('📅 Redirecting to appointment scheduling...', { variant: 'info', duration: 3000 });
            setTimeout(() => window.__appRouter?.navigate('/appointments'), 1500);
        },
        'health-goals': () => {
            showToast('🎯 Health goal setting wizard launched!', { variant: 'success', duration: 3000 });
        }
    };
    
    if (actions[actionId]) {
        actions[actionId]();
    }
};

export const AIHealthCoachPage = {
    isPublic: false,
    getTitle() {
        return 'AI Health Coach • DoCare Health';
    },
    render() {
        const user = auth.getUser();
        return `
            <section class="ai-health-coach">
                <header class="coach-header">
                    <div class="coach-intro">
                        <h1>🤖 AI Health Coach</h1>
                        <p>Your personal health assistant analyzing your data to provide personalized recommendations and insights.</p>
                        <div class="last-analysis">
                            <span>Last Analysis: Today at ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                    </div>
                </header>

                <div class="coach-dashboard">
                    <!-- Health Score Overview -->
                    ${renderHealthScore()}

                    <!-- Vital Signs -->
                    ${renderVitalSigns()}

                    <!-- Mood & Energy Trends -->
                    ${renderMoodChart()}

                    <!-- AI Recommendations -->
                    <div class="recommendations-section">
                        <h2>🎯 Personalized Recommendations</h2>
                        
                        <div class="recommendations-tabs">
                            <button class="tab-button active" data-tab="immediate">Immediate Actions</button>
                            <button class="tab-button" data-tab="weekly">This Week</button>
                            <button class="tab-button" data-tab="longterm">Long Term</button>
                        </div>

                        <div class="tab-content active" data-tab-content="immediate">
                            <div class="recommendations-grid">
                                ${aiRecommendations.immediate.map(rec => renderRecommendationCard(rec, 'immediate')).join('')}
                            </div>
                        </div>

                        <div class="tab-content" data-tab-content="weekly">
                            <div class="recommendations-grid">
                                ${aiRecommendations.weekly.map(rec => renderRecommendationCard(rec, 'weekly')).join('')}
                            </div>
                        </div>

                        <div class="tab-content" data-tab-content="longterm">
                            <div class="recommendations-grid">
                                ${aiRecommendations.longTerm.map(rec => renderRecommendationCard(rec, 'long-term')).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Risk Factors -->
                    <div class="risk-factors">
                        <h3>⚠️ Health Risk Factors</h3>
                        <div class="risk-grid">
                            ${healthInsights.riskFactors.map(risk => `
                                <div class="risk-card risk-${risk.level}">
                                    <div class="risk-header">
                                        <strong>${risk.factor}</strong>
                                        <span class="risk-level">${risk.level} risk</span>
                                    </div>
                                    <p>${risk.description}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Health Goals -->
                    <div class="health-goals">
                        <h3>🎯 Current Health Goals</h3>
                        <div class="goals-grid">
                            <div class="goal-card">
                                <h4>Improve Sleep Quality</h4>
                                <div class="goal-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: 75%"></div>
                                    </div>
                                    <span>75% Complete</span>
                                </div>
                                <p>Target: 8 hours of consistent sleep</p>
                            </div>
                            <div class="goal-card">
                                <h4>Reduce Stress Levels</h4>
                                <div class="goal-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: 45%"></div>
                                    </div>
                                    <span>45% Complete</span>
                                </div>
                                <p>Target: Daily stress level below 4/10</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },
    afterRender() {
        // Tab switching functionality
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Update active button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update active content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.dataset.tabContent === targetTab) {
                        content.classList.add('active');
                    }
                });
            });
        });

        // Recommendation action handlers
        const actionButtons = document.querySelectorAll('.rec-action');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const actionId = e.target.dataset.action;
                handleRecommendationAction(actionId);
            });
        });

        // Initialize any charts or interactive elements
        console.log('AI Health Coach page initialized');
    }
};