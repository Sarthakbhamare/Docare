import { i18n } from '../i18n.js';
import { showToast } from '../toast.js';

const state = {
    searchQuery: '',
    results: null,
};

// Comprehensive medical knowledge base with conditions
const medicalConditions = {
    common_cold: {
        name: 'Common Cold',
        severity: 'mild',
        symptoms: ['runny nose', 'sneezing', 'sore throat', 'cough', 'congestion', 'mild fever'],
        description: 'A viral infection of the upper respiratory tract. Usually resolves on its own within 7-10 days.',
        selfCare: [
            'Get plenty of rest (7-9 hours of sleep)',
            'Stay hydrated - drink 8-10 glasses of water daily',
            'Use a humidifier to ease congestion',
            'Gargle with warm salt water for sore throat',
        ],
        warnings: ['Fever exceeds 103°F', 'Symptoms persist beyond 10 days', 'Difficulty breathing'],
        videos: [
            { title: 'How to Treat Common Cold', id: 'LdYeg-HgYHM' },
            { title: 'Cold vs Flu Differences', id: 'qkWeJrXj8kI' },
        ],
    },
    flu: {
        name: 'Influenza (Flu)',
        severity: 'moderate',
        symptoms: ['high fever', 'body aches', 'fatigue', 'dry cough', 'headache', 'chills'],
        description: 'A contagious respiratory illness caused by influenza viruses.',
        selfCare: [
            'Rest and avoid physical exertion',
            'Take antiviral medications if prescribed',
            'Use fever reducers like acetaminophen',
            'Drink plenty of fluids',
        ],
        warnings: ['Difficulty breathing', 'Chest pain', 'Severe weakness', 'Fever above 104°F'],
        videos: [
            { title: 'Understanding Flu Symptoms', id: 'h_W7OLdZPfY' },
            { title: 'Flu Prevention and Treatment', id: 'cYm2-bxcRBk' },
        ],
    },
    covid19: {
        name: 'COVID-19',
        severity: 'moderate',
        symptoms: ['fever', 'cough', 'loss of taste', 'loss of smell', 'shortness of breath', 'fatigue'],
        description: 'A contagious disease caused by the SARS-CoV-2 virus.',
        selfCare: [
            'Isolate from others to prevent spread',
            'Monitor oxygen levels',
            'Rest and hydrate well',
            'Take over-the-counter fever reducers',
        ],
        warnings: ['Severe shortness of breath', 'Chest pain', 'Confusion', 'Blue lips or face'],
        videos: [
            { title: 'COVID-19 Home Care Tips', id: 'qPoptbtBjkg' },
            { title: 'COVID Prevention Strategies', id: 'bPITHEiFWLc' },
        ],
    },
    heart_attack: {
        name: 'Possible Heart Attack',
        severity: 'emergency',
        symptoms: ['chest pain', 'arm pain', 'jaw pain', 'shortness of breath', 'sweating', 'nausea'],
        description: '🚨 MEDICAL EMERGENCY: Heart attack occurs when blood flow to the heart is blocked.',
        selfCare: [],
        warnings: ['Call 911 immediately', 'Do not drive yourself', 'Chew aspirin if not allergic'],
        videos: [
            { title: 'Heart Attack Warning Signs', id: 'I_740wAkfIU' },
        ],
    },
    migraine: {
        name: 'Migraine',
        severity: 'moderate',
        symptoms: ['severe headache', 'sensitivity to light', 'nausea', 'vomiting', 'visual disturbances'],
        description: 'A neurological condition causing intense, debilitating headaches.',
        selfCare: [
            'Rest in a dark, quiet room',
            'Apply cold compress to forehead',
            'Take prescribed migraine medication',
            'Avoid triggers (certain foods, stress)',
        ],
        warnings: ['Sudden severe headache', 'Headache with fever', 'Confusion or vision loss'],
        videos: [
            { title: 'Managing Migraines Naturally', id: '9l0fBf5RDhk' },
            { title: 'Migraine Relief Tips', id: 'RYJ1jxF48fY' },
        ],
    },
    gastroenteritis: {
        name: 'Gastroenteritis (Stomach Flu)',
        severity: 'mild',
        symptoms: ['nausea', 'vomiting', 'diarrhea', 'stomach pain', 'fever', 'cramps'],
        description: 'Inflammation of the digestive tract, usually caused by viral or bacterial infection.',
        selfCare: [
            'Stay hydrated with clear fluids',
            'Eat bland foods (BRAT diet: Bananas, Rice, Applesauce, Toast)',
            'Rest your stomach',
            'Avoid dairy and fatty foods',
        ],
        warnings: ['Severe dehydration', 'Blood in stool', 'High fever', 'Symptoms last more than 3 days'],
        videos: [
            { title: 'Stomach Flu Treatment at Home', id: 'jnP8MX0hMJc' },
            { title: 'Preventing Dehydration', id: 'j7s9MfRBGxU' },
        ],
    },
    anxiety: {
        name: 'Anxiety',
        severity: 'mild',
        symptoms: ['worry', 'nervousness', 'rapid heartbeat', 'sweating', 'restlessness', 'panic'],
        description: 'A mental health condition characterized by excessive worry and fear.',
        selfCare: [
            'Practice deep breathing exercises',
            'Try meditation or mindfulness',
            'Regular physical exercise',
            'Limit caffeine and alcohol',
            'Talk to a therapist or counselor',
        ],
        warnings: ['Suicidal thoughts', 'Unable to function daily', 'Panic attacks increase'],
        videos: [
            { title: 'Anxiety Management Techniques', id: 'rVFV3qDj_0k' },
            { title: 'Breathing Exercises for Anxiety', id: '4Lb5L-VEm34' },
        ],
    },
    asthma: {
        name: 'Asthma Attack',
        severity: 'moderate',
        symptoms: ['wheezing', 'shortness of breath', 'chest tightness', 'cough', 'difficulty breathing'],
        description: 'A condition where airways narrow and produce extra mucus.',
        selfCare: [
            'Use rescue inhaler as prescribed',
            'Sit upright to ease breathing',
            'Stay calm and breathe slowly',
            'Avoid triggers (smoke, allergens)',
        ],
        warnings: ['Severe difficulty breathing', 'Blue lips or fingernails', 'Inhaler not helping'],
        videos: [
            { title: 'Using an Asthma Inhaler Correctly', id: '0a7xvr0WqXY' },
            { title: 'Managing Asthma Daily', id: 'p6M4eRAU5kM' },
        ],
    },
    allergies: {
        name: 'Allergic Reaction',
        severity: 'mild',
        symptoms: ['sneezing', 'itchy eyes', 'runny nose', 'rash', 'hives'],
        description: 'An immune system response to a foreign substance.',
        selfCare: [
            'Take antihistamines',
            'Avoid known allergens',
            'Use saline nasal rinse',
            'Apply cool compress for skin reactions',
        ],
        warnings: ['Difficulty breathing', 'Swelling of face or throat', 'Severe rash spreading'],
        videos: [
            { title: 'Allergy Relief Tips', id: 'SYiRBqzMNWE' },
            { title: 'Understanding Allergies', id: 'nXwqZIkz_mE' },
        ],
    },
    stroke: {
        name: 'Possible Stroke',
        severity: 'emergency',
        symptoms: ['facial drooping', 'arm weakness', 'speech difficulty', 'sudden confusion', 'vision problems'],
        description: '🚨 MEDICAL EMERGENCY: A stroke occurs when blood supply to the brain is interrupted.',
        selfCare: [],
        warnings: ['Call 911 immediately', 'Note the time symptoms started', 'Do NOT wait'],
        videos: [
            { title: 'FAST Stroke Recognition', id: 'QmGjy1NQsX0' },
        ],
    },
};

// Symptom keyword mapping for intelligent matching
const symptomKeywords = {
    'fever': ['flu', 'covid19', 'gastroenteritis'],
    'cough': ['common_cold', 'flu', 'covid19', 'asthma'],
    'chest pain': ['heart_attack', 'asthma'],
    'shortness of breath': ['covid19', 'heart_attack', 'asthma'],
    'breathing': ['covid19', 'heart_attack', 'asthma'],
    'headache': ['common_cold', 'flu', 'migraine'],
    'migraine': ['migraine'],
    'nausea': ['gastroenteritis', 'migraine', 'heart_attack'],
    'vomiting': ['gastroenteritis', 'migraine'],
    'diarrhea': ['gastroenteritis'],
    'stomach': ['gastroenteritis'],
    'anxiety': ['anxiety'],
    'worry': ['anxiety'],
    'panic': ['anxiety'],
    'nervous': ['anxiety'],
    'wheezing': ['asthma'],
    'arm pain': ['heart_attack'],
    'jaw pain': ['heart_attack'],
    'sweating': ['heart_attack', 'anxiety'],
    'sneezing': ['common_cold', 'allergies'],
    'runny nose': ['common_cold', 'allergies'],
    'itchy': ['allergies'],
    'rash': ['allergies'],
    'hives': ['allergies'],
    'allergy': ['allergies'],
    'stroke': ['stroke'],
    'facial drooping': ['stroke'],
    'arm weakness': ['stroke'],
    'speech difficulty': ['stroke'],
    'confusion': ['stroke'],
};

// Analyze symptoms and return matching conditions
const analyzeSymptoms = (query) => {
    const text = query.toLowerCase();
    const matchedConditions = new Set();
    
    // Check for keyword matches
    Object.entries(symptomKeywords).forEach(([keyword, conditions]) => {
        if (text.includes(keyword)) {
            conditions.forEach(c => matchedConditions.add(c));
        }
    });
    
    // Return matched conditions with full details
    return Array.from(matchedConditions).map(id => ({
        id,
        ...medicalConditions[id],
    }));
};

// Calculate match percentage based on symptoms
const calculateMatchPercentage = (condition, query) => {
    const queryWords = query.toLowerCase().split(/\s+/);
    const conditionSymptoms = condition.symptoms.map(s => s.toLowerCase());
    
    let matches = 0;
    queryWords.forEach(word => {
        if (conditionSymptoms.some(symptom => symptom.includes(word) || word.includes(symptom))) {
            matches++;
        }
    });
    
    const percentage = Math.min(95, Math.max(60, Math.round((matches / queryWords.length) * 100)));
    return percentage;
};

// Render emergency alert
const renderEmergencyAlert = () => `
    <div class="emergency-alert">
        <div class="emergency-icon">🚨</div>
        <div class="emergency-content">
            <h2 class="emergency-title">⚠️ SEEK IMMEDIATE MEDICAL ATTENTION</h2>
            <p class="emergency-message">Your symptoms suggest a condition that requires urgent care. Do not wait.</p>
            <div class="emergency-actions">
                <button class="emergency-button primary" onclick="window.location.href='tel:911'">
                    📞 Call 911 Now
                </button>
                <button class="emergency-button secondary" onclick="window.location.href='tel:811'">
                    🏥 Find Hospital
                </button>
            </div>
        </div>
    </div>
`;

// Render condition card with all details
const renderConditionCard = (condition, matchPercentage) => {
    const isEmergency = condition.severity === 'emergency';
    
    return `
        <div class="condition-card ${isEmergency ? 'emergency-card' : ''}">
            ${isEmergency ? renderEmergencyAlert() : ''}
            
            <div class="condition-header">
                <h3>${condition.name}</h3>
                <div class="condition-badges">
                    <span class="severity-badge severity-${condition.severity}">${condition.severity.toUpperCase()}</span>
                    <span class="match-badge">${matchPercentage}% Match</span>
                </div>
            </div>
            
            <div class="likelihood-bar">
                <div class="likelihood-fill" style="width: ${matchPercentage}%; background: ${isEmergency ? '#e74c3c' : '#3498db'}"></div>
            </div>
            <p class="likelihood-text">
                <strong>Likelihood:</strong> ${matchPercentage}% probability this could be ${condition.name}
            </p>
            
            <div class="condition-description">
                <p>${condition.description}</p>
            </div>
            
            ${!isEmergency && condition.selfCare.length > 0 ? `
                <div class="self-care-section">
                    <h4>🏠 Self-Care Recommendations</h4>
                    <ul>
                        ${condition.selfCare.map(care => `<li>${care}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${condition.warnings.length > 0 ? `
                <div class="warnings-section">
                    <h4>⚠️ Warning Signs - Seek Medical Care If:</h4>
                    <ul>
                        ${condition.warnings.map(warning => `<li>${warning}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${condition.videos.length > 0 ? `
                <div class="videos-section">
                    <h4>📺 Educational Videos</h4>
                    <div class="video-grid">
                        ${condition.videos.map(video => `
                            <div class="video-card">
                                <div class="video-thumbnail" onclick="window.open('https://www.youtube.com/watch?v=${video.id}', '_blank')">
                                    <img src="https://img.youtube.com/vi/${video.id}/mqdefault.jpg" alt="${video.title}" />
                                    <div class="play-button">▶️</div>
                                </div>
                                <p class="video-title">${video.title}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${!isEmergency ? `
                <div class="action-buttons">
                    ${condition.severity === 'moderate' ? `
                        <button class="btn-primary" onclick="window.location.href='/#/appointments'">
                            📅 Book Appointment
                        </button>
                    ` : ''}
                    <button class="btn-secondary" onclick="window.location.href='/#/messages'">
                        💬 Message Doctor
                    </button>
                </div>
            ` : ''}
        </div>
    `;
};

// Render search results
const renderResults = () => {
    if (!state.searchQuery) {
        return `
            <div class="initial-state">
                <h3>Enter your symptoms above</h3>
                <p>Describe what you're experiencing, and we'll provide personalized health information.</p>
                <div class="example-searches">
                    <h4>Try searching for:</h4>
                    <button class="chip" data-example="fever and cough">Fever and cough</button>
                    <button class="chip" data-example="chest pain shortness of breath">Chest pain & breathing difficulty</button>
                    <button class="chip" data-example="severe headache light sensitivity">Severe headache</button>
                    <button class="chip" data-example="nausea vomiting diarrhea">Stomach issues</button>
                </div>
            </div>
        `;
    }
    
    const conditions = analyzeSymptoms(state.searchQuery);
    
    if (conditions.length === 0) {
        return `
            <div class="no-results">
                <h3>No specific conditions found</h3>
                <p>We couldn't match your symptoms. Please consult a healthcare provider.</p>
                <button class="btn-primary" onclick="window.location.href='/#/appointments'">
                    Schedule Appointment
                </button>
            </div>
        `;
    }
    
    // Sort by severity (emergency first)
    conditions.sort((a, b) => {
        const severityOrder = { emergency: 0, moderate: 1, mild: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
    });
    
    return `
        <div class="results-header">
            <h2>Possible Conditions (${conditions.length} found)</h2>
            <p>Based on your symptoms. This is for informational purposes only.</p>
        </div>
        <div class="results-grid">
            ${conditions.map(condition => 
                renderConditionCard(condition, calculateMatchPercentage(condition, state.searchQuery))
            ).join('')}
        </div>
        <div class="disclaimer">
            <strong>Medical Disclaimer:</strong> This information is for educational purposes only. Always consult with a qualified healthcare professional for proper diagnosis and treatment.
        </div>
    `;
};

export const SymptomCheckerPage = {
    isPublic: true,
    onRouteEnter() {
        state.searchQuery = '';
        state.results = null;
    },
    getTitle() {
        return `${i18n.t('nav.symptomChecker')} • ${i18n.t('brand.name')}`;
    },
    render() {
        return `
            <section class="symptom-checker-advanced">
                <header class="checker-header">
                    <h1>🩺 AI-Powered Symptom Checker</h1>
                    <p>Enter your symptoms and get instant health insights with personalized recommendations</p>
                </header>
                
                <div class="search-container">
                    <input 
                        type="text" 
                        data-symptom-input 
                        placeholder="Describe your symptoms... (e.g., 'fever, cough, and body aches')"
                        value="${state.searchQuery}"
                    />
                    <button class="search-btn" data-search-btn>
                        🔍 Analyze Symptoms
                    </button>
                </div>
                
                <div class="results-container">
                    ${renderResults()}
                </div>
            </section>
        `;
    },
    afterRender() {
        const input = document.querySelector('[data-symptom-input]');
        const searchBtn = document.querySelector('[data-search-btn]');
        
        const performSearch = () => {
            if (input) {
                state.searchQuery = input.value.trim();
                if (state.searchQuery) {
                    const viewRoot = document.querySelector('[data-view-root]');
                    if (viewRoot) {
                        viewRoot.innerHTML = SymptomCheckerPage.render();
                        SymptomCheckerPage.afterRender();
                    }
                    showToast('Analyzing your symptoms...', { variant: 'info', duration: 2000 });
                }
            }
        };
        
        searchBtn?.addEventListener('click', performSearch);
        
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Example chips
        document.querySelectorAll('[data-example]').forEach(chip => {
            chip.addEventListener('click', () => {
                const example = chip.getAttribute('data-example');
                if (input && example) {
                    input.value = example;
                    state.searchQuery = example;
                    const viewRoot = document.querySelector('[data-view-root]');
                    if (viewRoot) {
                        viewRoot.innerHTML = SymptomCheckerPage.render();
                        SymptomCheckerPage.afterRender();
                    }
                }
            });
        });
    },
};
