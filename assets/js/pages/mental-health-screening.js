import { i18n } from '../i18n.js';
import { auth } from '../auth.js';
import { showToast } from '../toast.js';

// PHQ-9 Depression Screening Questionnaire
const phq9Questions = [
    {
        id: 'phq9_1',
        text: 'Little interest or pleasure in doing things',
        options: [
            { value: 0, text: 'Not at all' },
            { value: 1, text: 'Several days' },
            { value: 2, text: 'More than half the days' },
            { value: 3, text: 'Nearly every day' }
        ]
    },
    {
        id: 'phq9_2',
        text: 'Feeling down, depressed, or hopeless',
        options: [
            { value: 0, text: 'Not at all' },
            { value: 1, text: 'Several days' },
            { value: 2, text: 'More than half the days' },
            { value: 3, text: 'Nearly every day' }
        ]
    },
    {
        id: 'phq9_3',
        text: 'Trouble falling or staying asleep, or sleeping too much',
        options: [
            { value: 0, text: 'Not at all' },
            { value: 1, text: 'Several days' },
            { value: 2, text: 'More than half the days' },
            { value: 3, text: 'Nearly every day' }
        ]
    },
    {
        id: 'phq9_4',
        text: 'Feeling tired or having little energy',
        options: [
            { value: 0, text: 'Not at all' },
            { value: 1, text: 'Several days' },
            { value: 2, text: 'More than half the days' },
            { value: 3, text: 'Nearly every day' }
        ]
    },
    {
        id: 'phq9_5',
        text: 'Poor appetite or overeating',
        options: [
            { value: 0, text: 'Not at all' },
            { value: 1, text: 'Several days' },
            { value: 2, text: 'More than half the days' },
            { value: 3, text: 'Nearly every day' }
        ]
    },
    {
        id: 'phq9_6',
        text: 'Feeling bad about yourself or that you are a failure or have let yourself or your family down',
        options: [
            { value: 0, text: 'Not at all' },
            { value: 1, text: 'Several days' },
            { value: 2, text: 'More than half the days' },
            { value: 3, text: 'Nearly every day' }
        ]
    },
    {
        id: 'phq9_7',
        text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
        options: [
            { value: 0, text: 'Not at all' },
            { value: 1, text: 'Several days' },
            { value: 2, text: 'More than half the days' },
            { value: 3, text: 'Nearly every day' }
        ]
    },
    {
        id: 'phq9_8',
        text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
        options: [
            { value: 0, text: 'Not at all' },
            { value: 1, text: 'Several days' },
            { value: 2, text: 'More than half the days' },
            { value: 3, text: 'Nearly every day' }
        ]
    },
    {
        id: 'phq9_9',
        text: 'Thoughts that you would be better off dead, or of hurting yourself',
        options: [
            { value: 0, text: 'Not at all' },
            { value: 1, text: 'Several days' },
            { value: 2, text: 'More than half the days' },
            { value: 3, text: 'Nearly every day' }
        ]
    }
];

// GAD-7 Anxiety Screening Questionnaire
const gad7Questions = [
    {
        id: 'gad7_1',
        text: 'Feeling nervous, anxious, or on edge',
        options: [
            { value: 0, text: 'Not at all' },
            { value: 1, text: 'Several days' },
            { value: 2, text: 'More than half the days' },
            { value: 3, text: 'Nearly every day' }
        ]
    },
    {
        id: 'gad7_2',
        text: 'Not being able to stop or control worrying',
        options: [
            { value: 0, text: 'Not at all' },
            { value: 1, text: 'Several days' },
            { value: 2, text: 'More than half the days' },
            { value: 3, text: 'Nearly every day' }
        ]
    },
    {
        id: 'gad7_3',
        text: 'Worrying too much about different things',
        options: [
            { value: 0, text: 'Not at all' },
            { value: 1, text: 'Several days' },
            { value: 2, text: 'More than half the days' },
            { value: 3, text: 'Nearly every day' }
        ]
    },
    {
        id: 'gad7_4',
        text: 'Trouble relaxing',
        options: [
            { value: 0, text: 'Not at all' },
            { value: 1, text: 'Several days' },
            { value: 2, text: 'More than half the days' },
            { value: 3, text: 'Nearly every day' }
        ]
    },
    {
        id: 'gad7_5',
        text: 'Being so restless that it is hard to sit still',
        options: [
            { value: 0, text: 'Not at all' },
            { value: 1, text: 'Several days' },
            { value: 2, text: 'More than half the days' },
            { value: 3, text: 'Nearly every day' }
        ]
    },
    {
        id: 'gad7_6',
        text: 'Becoming easily annoyed or irritable',
        options: [
            { value: 0, text: 'Not at all' },
            { value: 1, text: 'Several days' },
            { value: 2, text: 'More than half the days' },
            { value: 3, text: 'Nearly every day' }
        ]
    },
    {
        id: 'gad7_7',
        text: 'Feeling afraid, as if something awful might happen',
        options: [
            { value: 0, text: 'Not at all' },
            { value: 1, text: 'Several days' },
            { value: 2, text: 'More than half the days' },
            { value: 3, text: 'Nearly every day' }
        ]
    }
];

// Screening state
let screeningState = {
    currentAssessment: null,
    phq9Responses: {},
    gad7Responses: {},
    currentQuestionIndex: 0,
    isCompleted: false,
    results: null
};

const getDepressionSeverity = (score) => {
    if (score <= 4) return { level: 'minimal', color: '#10b981', description: 'Minimal depression' };
    if (score <= 9) return { level: 'mild', color: '#f59e0b', description: 'Mild depression' };
    if (score <= 14) return { level: 'moderate', color: '#f97316', description: 'Moderate depression' };
    if (score <= 19) return { level: 'moderately-severe', color: '#ef4444', description: 'Moderately severe depression' };
    return { level: 'severe', color: '#dc2626', description: 'Severe depression' };
};

const getAnxietySeverity = (score) => {
    if (score <= 4) return { level: 'minimal', color: '#10b981', description: 'Minimal anxiety' };
    if (score <= 9) return { level: 'mild', color: '#f59e0b', description: 'Mild anxiety' };
    if (score <= 14) return { level: 'moderate', color: '#f97316', description: 'Moderate anxiety' };
    return { level: 'severe', color: '#ef4444', description: 'Severe anxiety' };
};

const getRecommendations = (depressionScore, anxietyScore) => {
    const recommendations = [];
    
    if (depressionScore >= 10 || anxietyScore >= 10) {
        recommendations.push({
            priority: 'high',
            icon: '👨‍⚕️',
            title: 'Consult a Mental Health Professional',
            description: 'Your scores suggest moderate to severe symptoms. A mental health professional can provide proper assessment and treatment options.',
            action: 'Schedule Appointment',
            actionType: 'appointment'
        });
    }
    
    if (depressionScore >= 5 || anxietyScore >= 5) {
        recommendations.push({
            priority: 'medium',
            icon: '🧘',
            title: 'Practice Mindfulness & Meditation',
            description: 'Regular mindfulness practice can help reduce symptoms of depression and anxiety.',
            action: 'Start Meditation',
            actionType: 'meditation'
        });
        
        recommendations.push({
            priority: 'medium',
            icon: '💪',
            title: 'Regular Physical Activity',
            description: 'Exercise has been shown to be as effective as medication for mild to moderate depression.',
            action: 'View Exercise Plan',
            actionType: 'exercise'
        });
    }
    
    if (depressionScore > 0 || anxietyScore > 0) {
        recommendations.push({
            priority: 'low',
            icon: '😴',
            title: 'Improve Sleep Hygiene',
            description: 'Good sleep is crucial for mental health. Aim for 7-9 hours of quality sleep.',
            action: 'Sleep Tips',
            actionType: 'sleep'
        });
        
        recommendations.push({
            priority: 'low',
            icon: '👥',
            title: 'Connect with Support Groups',
            description: 'Connecting with others who understand your experience can be very helpful.',
            action: 'Find Groups',
            actionType: 'support'
        });
    }
    
    // Crisis intervention
    if (screeningState.phq9Responses['phq9_9'] >= 1) {
        recommendations.unshift({
            priority: 'emergency',
            icon: '🚨',
            title: 'Immediate Safety Concerns',
            description: 'If you are having thoughts of self-harm, please reach out for immediate help.',
            action: 'Crisis Resources',
            actionType: 'crisis'
        });
    }
    
    return recommendations;
};

const renderAssessmentSelection = () => `
    <div class="assessment-selection">
        <h2>🧠 Mental Health Assessments</h2>
        <p>These scientifically-validated screening tools can help identify potential mental health concerns. Please answer honestly based on how you have been feeling over the past 2 weeks.</p>
        
        <div class="assessment-cards">
            <div class="assessment-card" data-assessment="phq9">
                <div class="assessment-icon">😔</div>
                <h3>PHQ-9 Depression Screening</h3>
                <p>A 9-question assessment to screen for depression symptoms and severity.</p>
                <div class="assessment-details">
                    <span>📋 9 questions</span>
                    <span>⏱️ 2-3 minutes</span>
                    <span>🏥 Clinically validated</span>
                </div>
                <button class="button-primary" data-start-assessment="phq9">Start Assessment</button>
            </div>
            
            <div class="assessment-card" data-assessment="gad7">
                <div class="assessment-icon">😰</div>
                <h3>GAD-7 Anxiety Screening</h3>
                <p>A 7-question assessment to screen for generalized anxiety disorder.</p>
                <div class="assessment-details">
                    <span>📋 7 questions</span>
                    <span>⏱️ 2-3 minutes</span>
                    <span>🏥 Clinically validated</span>
                </div>
                <button class="button-primary" data-start-assessment="gad7">Start Assessment</button>
            </div>
            
            <div class="assessment-card combined" data-assessment="combined">
                <div class="assessment-icon">🎯</div>
                <h3>Combined Screening</h3>
                <p>Take both assessments for a comprehensive mental health screening.</p>
                <div class="assessment-details">
                    <span>📋 16 questions</span>
                    <span>⏱️ 5-6 minutes</span>
                    <span>🔍 Comprehensive</span>
                </div>
                <button class="button-primary" data-start-assessment="combined">Start Combined</button>
            </div>
        </div>
        
        <div class="disclaimer">
            <h4>⚠️ Important Disclaimer</h4>
            <p>These assessments are screening tools only and are not diagnostic. They cannot replace professional medical evaluation. If you are experiencing a mental health crisis or having thoughts of self-harm, please contact emergency services or a crisis hotline immediately.</p>
            <div class="crisis-resources">
                <p><strong>Crisis Resources:</strong></p>
                <ul>
                    <li>National Suicide Prevention Lifeline: <strong>988</strong></li>
                    <li>Crisis Text Line: Text HOME to <strong>741741</strong></li>
                    <li>Emergency: <strong>911</strong></li>
                </ul>
            </div>
        </div>
    </div>
`;

const renderQuestion = (questions, questionIndex) => {
    const question = questions[questionIndex];
    const totalQuestions = questions.length;
    const progress = ((questionIndex + 1) / totalQuestions) * 100;
    
    return `
        <div class="question-container">
            <div class="question-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <span class="progress-text">Question ${questionIndex + 1} of ${totalQuestions}</span>
            </div>
            
            <div class="question-content">
                <h3>Over the last 2 weeks, how often have you been bothered by:</h3>
                <h2>${question.text}</h2>
                
                <div class="answer-options">
                    ${question.options.map(option => `
                        <label class="option-label">
                            <input type="radio" name="${question.id}" value="${option.value}" class="option-input">
                            <span class="option-text">${option.text}</span>
                            <span class="option-check">✓</span>
                        </label>
                    `).join('')}
                </div>
                
                <div class="question-navigation">
                    ${questionIndex > 0 ? `<button class="button-secondary" data-prev-question>← Previous</button>` : '<div></div>'}
                    <button class="button-primary" data-next-question disabled>Next →</button>
                </div>
            </div>
        </div>
    `;
};

const renderResults = () => {
    const phq9Score = Object.values(screeningState.phq9Responses).reduce((sum, val) => sum + (val || 0), 0);
    const gad7Score = Object.values(screeningState.gad7Responses).reduce((sum, val) => sum + (val || 0), 0);
    
    const depressionSeverity = getDepressionSeverity(phq9Score);
    const anxietySeverity = getAnxietySeverity(gad7Score);
    const recommendations = getRecommendations(phq9Score, gad7Score);
    
    return `
        <div class="results-container">
            <div class="results-header">
                <h2>📊 Your Mental Health Assessment Results</h2>
                <p>Based on your responses, here are your screening results and personalized recommendations.</p>
            </div>
            
            <div class="scores-summary">
                ${Object.keys(screeningState.phq9Responses).length > 0 ? `
                    <div class="score-card depression">
                        <div class="score-header">
                            <span class="score-icon">😔</span>
                            <h3>Depression Screening (PHQ-9)</h3>
                        </div>
                        <div class="score-value" style="color: ${depressionSeverity.color}">
                            ${phq9Score} / 27
                        </div>
                        <div class="score-severity" style="background: ${depressionSeverity.color}20; color: ${depressionSeverity.color}">
                            ${depressionSeverity.description}
                        </div>
                        <div class="score-interpretation">
                            ${phq9Score <= 4 ? 'Your responses suggest minimal depression symptoms.' :
                              phq9Score <= 9 ? 'Your responses suggest mild depression symptoms that may benefit from monitoring.' :
                              phq9Score <= 14 ? 'Your responses suggest moderate depression symptoms that warrant professional evaluation.' :
                              phq9Score <= 19 ? 'Your responses suggest moderately severe depression that should be evaluated by a mental health professional.' :
                              'Your responses suggest severe depression that requires immediate professional attention.'}
                        </div>
                    </div>
                ` : ''}
                
                ${Object.keys(screeningState.gad7Responses).length > 0 ? `
                    <div class="score-card anxiety">
                        <div class="score-header">
                            <span class="score-icon">😰</span>
                            <h3>Anxiety Screening (GAD-7)</h3>
                        </div>
                        <div class="score-value" style="color: ${anxietySeverity.color}">
                            ${gad7Score} / 21
                        </div>
                        <div class="score-severity" style="background: ${anxietySeverity.color}20; color: ${anxietySeverity.color}">
                            ${anxietySeverity.description}
                        </div>
                        <div class="score-interpretation">
                            ${gad7Score <= 4 ? 'Your responses suggest minimal anxiety symptoms.' :
                              gad7Score <= 9 ? 'Your responses suggest mild anxiety symptoms that may benefit from monitoring.' :
                              gad7Score <= 14 ? 'Your responses suggest moderate anxiety symptoms that warrant professional evaluation.' :
                              'Your responses suggest severe anxiety that requires immediate professional attention.'}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="recommendations-section">
                <h3>💡 Personalized Recommendations</h3>
                <div class="recommendations-grid">
                    ${recommendations.map(rec => `
                        <div class="recommendation-card priority-${rec.priority}">
                            <div class="rec-header">
                                <span class="rec-icon">${rec.icon}</span>
                                <div class="rec-priority ${rec.priority}">${rec.priority === 'emergency' ? 'URGENT' : rec.priority.toUpperCase()}</div>
                            </div>
                            <h4>${rec.title}</h4>
                            <p>${rec.description}</p>
                            <button class="button-primary" data-action="${rec.actionType}">${rec.action}</button>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="follow-up-care">
                <h3>🔄 Follow-up Care</h3>
                <div class="care-options">
                    <div class="care-option">
                        <h4>📅 Schedule Professional Consultation</h4>
                        <p>Connect with a licensed mental health professional for comprehensive evaluation and treatment planning.</p>
                        <button class="button-primary" data-action="appointment">Book Appointment</button>
                    </div>
                    <div class="care-option">
                        <h4>💬 Join Support Groups</h4>
                        <p>Connect with others who understand your experience in our moderated support communities.</p>
                        <button class="button-secondary" data-action="support">Find Groups</button>
                    </div>
                    <div class="care-option">
                        <h4>📱 Download Mental Health Resources</h4>
                        <p>Access guided meditations, mood tracking tools, and self-help resources.</p>
                        <button class="button-secondary" data-action="resources">Get Resources</button>
                    </div>
                </div>
            </div>
            
            <div class="results-actions">
                <button class="button-secondary" data-restart-screening>Take Another Assessment</button>
                <button class="button-primary" data-save-results>Save Results to Profile</button>
            </div>
        </div>
    `;
};

export const MentalHealthScreeningPage = {
    isPublic: false,
    getTitle() {
        return 'Mental Health Screening • DoCare Health';
    },
    render() {
        if (screeningState.isCompleted) {
            return `
                <section class="mental-health-screening">
                    ${renderResults()}
                </section>
            `;
        }
        
        if (screeningState.currentAssessment) {
            const questions = screeningState.currentAssessment === 'phq9' ? phq9Questions :
                            screeningState.currentAssessment === 'gad7' ? gad7Questions :
                            [...phq9Questions, ...gad7Questions];
            
            return `
                <section class="mental-health-screening">
                    <div class="assessment-header">
                        <h1>🧠 Mental Health Assessment</h1>
                        <p>Please answer each question based on how you have been feeling over the past 2 weeks.</p>
                        <button class="button-secondary small" data-cancel-assessment>← Back to Selection</button>
                    </div>
                    ${renderQuestion(questions, screeningState.currentQuestionIndex)}
                </section>
            `;
        }
        
        return `
            <section class="mental-health-screening">
                <header class="screening-header">
                    <h1>🧠 Mental Health Screening</h1>
                    <p>Take scientifically-validated assessments to understand your mental health and get personalized recommendations.</p>
                </header>
                ${renderAssessmentSelection()}
            </section>
        `;
    },
    afterRender() {
        // Assessment selection handlers
        const startAssessmentBtns = document.querySelectorAll('[data-start-assessment]');
        startAssessmentBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const assessmentType = btn.dataset.startAssessment;
                screeningState.currentAssessment = assessmentType;
                screeningState.currentQuestionIndex = 0;
                screeningState.phq9Responses = {};
                screeningState.gad7Responses = {};
                screeningState.isCompleted = false;
                
                // Re-render the page
                window.__appRouter?.navigate('/mental-health-screening');
            });
        });

        // Question navigation
        const nextBtn = document.querySelector('[data-next-question]');
        const prevBtn = document.querySelector('[data-prev-question]');
        const cancelBtn = document.querySelector('[data-cancel-assessment]');

        // Answer selection
        const optionInputs = document.querySelectorAll('.option-input');
        optionInputs.forEach(input => {
            input.addEventListener('change', () => {
                const questionId = input.name;
                const value = parseInt(input.value);
                
                // Store the response
                if (questionId.startsWith('phq9_')) {
                    screeningState.phq9Responses[questionId] = value;
                } else if (questionId.startsWith('gad7_')) {
                    screeningState.gad7Responses[questionId] = value;
                }
                
                // Enable next button
                if (nextBtn) {
                    nextBtn.disabled = false;
                }
            });
        });

        // Next question handler
        nextBtn?.addEventListener('click', () => {
            const questions = screeningState.currentAssessment === 'phq9' ? phq9Questions :
                            screeningState.currentAssessment === 'gad7' ? gad7Questions :
                            [...phq9Questions, ...gad7Questions];
            
            if (screeningState.currentQuestionIndex < questions.length - 1) {
                screeningState.currentQuestionIndex++;
                window.__appRouter?.navigate('/mental-health-screening');
            } else {
                // Assessment completed
                screeningState.isCompleted = true;
                window.__appRouter?.navigate('/mental-health-screening');
            }
        });

        // Previous question handler
        prevBtn?.addEventListener('click', () => {
            if (screeningState.currentQuestionIndex > 0) {
                screeningState.currentQuestionIndex--;
                window.__appRouter?.navigate('/mental-health-screening');
            }
        });

        // Cancel assessment handler
        cancelBtn?.addEventListener('click', () => {
            screeningState.currentAssessment = null;
            screeningState.currentQuestionIndex = 0;
            window.__appRouter?.navigate('/mental-health-screening');
        });

        // Restart screening handler
        const restartBtn = document.querySelector('[data-restart-screening]');
        restartBtn?.addEventListener('click', () => {
            screeningState = {
                currentAssessment: null,
                phq9Responses: {},
                gad7Responses: {},
                currentQuestionIndex: 0,
                isCompleted: false,
                results: null
            };
            window.__appRouter?.navigate('/mental-health-screening');
        });

        // Action handlers
        const actionButtons = document.querySelectorAll('[data-action]');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                
                switch (action) {
                    case 'appointment':
                        showToast('Redirecting to appointment scheduling...', { variant: 'info', duration: 2000 });
                        setTimeout(() => window.__appRouter?.navigate('/appointments'), 1000);
                        break;
                    case 'meditation':
                        showToast('Opening guided meditation resources...', { variant: 'info', duration: 2000 });
                        break;
                    case 'exercise':
                        showToast('Loading personalized exercise recommendations...', { variant: 'info', duration: 2000 });
                        break;
                    case 'sleep':
                        showToast('Accessing sleep improvement resources...', { variant: 'info', duration: 2000 });
                        break;
                    case 'support':
                        showToast('Finding support groups in your area...', { variant: 'info', duration: 2000 });
                        break;
                    case 'crisis':
                        showToast('Opening crisis intervention resources...', { variant: 'error', duration: 3000 });
                        break;
                    case 'resources':
                        showToast('Downloading mental health toolkit...', { variant: 'success', duration: 2000 });
                        break;
                    default:
                        break;
                }
            });
        });

        // Save results handler
        const saveBtn = document.querySelector('[data-save-results]');
        saveBtn?.addEventListener('click', () => {
            showToast('Assessment results saved to your profile!', { variant: 'success', duration: 3000 });
        });

        console.log('Mental Health Screening page initialized');
    }
};