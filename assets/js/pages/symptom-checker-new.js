import { i18n } from '../i18n.js';
import { showToast } from '../toast.js';

const state = {
    symptoms: [],
    selectedCondition: null,
    searchQuery: '',
};

// Comprehensive medical knowledge base
const medicalConditions = {
    // Respiratory conditions
    common_cold: {
        name: 'Common Cold',
        category: 'Respiratory',
        severity: 'mild',
        symptoms: ['runny nose', 'sneezing', 'sore throat', 'cough', 'congestion', 'mild headache', 'low fever'],
        description: 'A viral infection of the upper respiratory tract. Usually resolves on its own within 7-10 days.',
        recommendations: [
            'Get plenty of rest (7-9 hours of sleep)',
            'Stay hydrated - drink 8-10 glasses of water daily',
            'Use a humidifier to ease congestion',
            'Gargle with warm salt water for sore throat',
            'Take over-the-counter pain relievers like acetaminophen or ibuprofen',
            'Avoid smoking and secondhand smoke',
        ],
        warnings: [
            'Seek medical attention if fever exceeds 103°F (39.4°C)',
            'If symptoms persist beyond 10 days',
            'If you experience difficulty breathing',
        ],
        homeRemedies: [
            'Honey and lemon tea (relieves throat irritation)',
            'Chicken soup (helps with hydration and nutrition)',
            'Ginger tea (anti-inflammatory properties)',
            'Steam inhalation with eucalyptus oil',
        ],
        youtubeVideos: [
            { title: 'How to Treat Common Cold Naturally', id: 'LdYeg-HgYHM' },
            { title: 'Cold vs Flu: What\'s the Difference?', id: 'qkWeJrXj8kI' },
            { title: 'Best Home Remedies for Cold', id: '0CYBe5Xg9Jc' },
        ],
    },
    
    flu: {
        name: 'Influenza (Flu)',
        category: 'Respiratory',
        severity: 'moderate',
        symptoms: ['high fever', 'body aches', 'fatigue', 'dry cough', 'headache', 'chills', 'sore throat'],
        description: 'A contagious respiratory illness caused by influenza viruses. More severe than common cold.',
        recommendations: [
            'Rest completely - your body needs energy to fight the virus',
            'Drink plenty of fluids (water, herbal tea, broth)',
            'Take antiviral medications if prescribed within 48 hours',
            'Use fever reducers like acetaminophen or ibuprofen',
            'Stay home to avoid spreading the virus (at least 24 hours after fever subsides)',
            'Maintain good nutrition even if appetite is low',
        ],
        warnings: [
            'Seek immediate care if breathing difficulties occur',
            'Watch for chest pain or pressure',
            'If fever returns after seeming to improve',
            'For high-risk individuals (elderly, pregnant, chronic conditions)',
        ],
        homeRemedies: [
            'Elderberry syrup (may reduce duration)',
            'Warm liquids like herbal tea',
            'Humidifier use for easier breathing',
        ],
        youtubeVideos: [
            { title: 'Flu Symptoms and Treatment', id: 'YPCudk5i9dw' },
            { title: 'How to Recover from Flu Fast', id: 'MU8bRZQXSQ0' },
            { title: 'Flu Prevention Tips', id: 'X9TFGn5pzYQ' },
        ],
    },
    
    covid19: {
        name: 'COVID-19',
        category: 'Respiratory',
        severity: 'moderate',
        symptoms: ['fever', 'dry cough', 'fatigue', 'loss of taste', 'loss of smell', 'shortness of breath', 'body aches'],
        description: 'Respiratory illness caused by SARS-CoV-2 virus. Symptoms range from mild to severe.',
        recommendations: [
            'Isolate immediately for at least 5 days',
            'Get tested to confirm diagnosis',
            'Monitor oxygen levels with pulse oximeter',
            'Rest and stay hydrated',
            'Contact healthcare provider about antiviral treatments',
            'Take fever reducers and pain relievers as needed',
            'Sleep in a separate room from family members',
        ],
        warnings: [
            'EMERGENCY: Difficulty breathing or shortness of breath',
            'EMERGENCY: Persistent chest pain or pressure',
            'EMERGENCY: New confusion or inability to wake',
            'EMERGENCY: Bluish lips or face',
            'Oxygen saturation below 94%',
        ],
        homeRemedies: [
            'Prone positioning (lying on stomach) may help breathing',
            'Deep breathing exercises',
            'Vitamin C, D, and Zinc supplementation',
        ],
        youtubeVideos: [
            { title: 'COVID-19: What You Need to Know', id: 'BtN-goy9VOY' },
            { title: 'How to Manage COVID at Home', id: 'U23l2IHrbNE' },
            { title: 'Long COVID Explained', id: '9cPy7MIQv28' },
        ],
    },
    
    asthma: {
        name: 'Asthma Attack',
        category: 'Respiratory',
        severity: 'moderate-severe',
        symptoms: ['wheezing', 'shortness of breath', 'chest tightness', 'coughing', 'rapid breathing'],
        description: 'Chronic condition causing airways to narrow and swell, producing extra mucus.',
        recommendations: [
            'Use rescue inhaler (albuterol) as prescribed',
            'Sit upright - do not lie down',
            'Take slow, steady breaths',
            'Stay calm to avoid worsening symptoms',
            'Remove yourself from triggers (smoke, allergens)',
            'Follow your asthma action plan',
        ],
        warnings: [
            'EMERGENCY: If rescue inhaler doesn\'t help after 15-20 minutes',
            'EMERGENCY: Lips or fingernails turn blue',
            'EMERGENCY: Difficulty speaking due to shortness of breath',
            'EMERGENCY: Extreme difficulty breathing',
        ],
        homeRemedies: [
            'Breathing exercises (pursed-lip breathing)',
            'Use air purifier to reduce triggers',
            'Avoid cold air exposure',
        ],
        youtubeVideos: [
            { title: 'Understanding Asthma', id: 'cH9dFToD-Ys' },
            { title: 'How to Use an Inhaler Properly', id: '2VicIK6VP_Q' },
            { title: 'Asthma Attack Management', id: 'xN5vK-Y4M6M' },
        ],
    },
    
    // Digestive conditions
    food_poisoning: {
        name: 'Food Poisoning',
        category: 'Digestive',
        severity: 'moderate',
        symptoms: ['nausea', 'vomiting', 'diarrhea', 'stomach cramps', 'fever', 'weakness'],
        description: 'Illness caused by consuming contaminated food or beverages.',
        recommendations: [
            'Stay hydrated - sip water, clear broths, or electrolyte drinks',
            'Rest your stomach - avoid solid foods initially',
            'Gradually reintroduce bland foods (BRAT diet: bananas, rice, applesauce, toast)',
            'Avoid dairy products, caffeine, and fatty foods',
            'Take probiotics to restore gut bacteria',
            'Wash hands frequently',
        ],
        warnings: [
            'Seek care if unable to keep liquids down for 24 hours',
            'Signs of dehydration (dark urine, dizziness, dry mouth)',
            'Bloody or black stools',
            'Fever above 101.5°F (38.6°C)',
            'Severe abdominal pain',
        ],
        homeRemedies: [
            'Ginger tea for nausea',
            'Peppermint tea to soothe stomach',
            'Apple cider vinegar diluted in water',
            'Activated charcoal for toxin absorption',
        ],
        youtubeVideos: [
            { title: 'Food Poisoning: Signs and Treatment', id: 'e7O4RJbHhQ0' },
            { title: 'How to Recover from Food Poisoning', id: 'ZjJnXZqh5Qg' },
            { title: 'Preventing Food Poisoning', id: 'CXjFz0maPYU' },
        ],
    },
    
    gastritis: {
        name: 'Gastritis',
        category: 'Digestive',
        severity: 'mild-moderate',
        symptoms: ['burning stomach pain', 'nausea', 'vomiting', 'bloating', 'loss of appetite', 'indigestion'],
        description: 'Inflammation of the stomach lining. Can be acute or chronic.',
        recommendations: [
            'Eat smaller, frequent meals (5-6 per day)',
            'Avoid spicy, acidic, and fried foods',
            'Stop alcohol consumption completely',
            'Quit smoking',
            'Reduce stress through relaxation techniques',
            'Take antacids or PPIs as recommended',
            'Avoid NSAIDs (ibuprofen, aspirin)',
        ],
        warnings: [
            'If vomiting blood or coffee-ground material',
            'Black, tarry stools (sign of bleeding)',
            'Severe, persistent abdominal pain',
        ],
        homeRemedies: [
            'Drink chamomile tea',
            'Consume probiotics (yogurt, kefir)',
            'Chew food slowly and thoroughly',
            'Eat more fiber',
        ],
        youtubeVideos: [
            { title: 'What is Gastritis?', id: 'ELkX8y-jh4s' },
            { title: 'Gastritis Diet: Foods to Eat and Avoid', id: '2Nkxk5CKfPw' },
            { title: 'Natural Remedies for Gastritis', id: 'yhqPo7XLQQU' },
        ],
    },
    
    ibs: {
        name: 'Irritable Bowel Syndrome (IBS)',
        category: 'Digestive',
        severity: 'mild-moderate',
        symptoms: ['abdominal pain', 'cramping', 'bloating', 'gas', 'diarrhea', 'constipation'],
        description: 'Chronic disorder affecting the large intestine. Symptoms vary between individuals.',
        recommendations: [
            'Follow low FODMAP diet',
            'Identify and avoid trigger foods',
            'Eat high-fiber foods (gradually increase)',
            'Exercise regularly (30 minutes daily)',
            'Manage stress with yoga, meditation, or therapy',
            'Stay hydrated',
            'Avoid large meals; eat smaller portions',
        ],
        warnings: [
            'Unexplained weight loss',
            'Rectal bleeding',
            'Persistent vomiting',
            'Difficulty swallowing',
        ],
        homeRemedies: [
            'Peppermint oil capsules',
            'Ginger for nausea',
            'Probiotics daily',
            'Fennel tea for bloating',
        ],
        youtubeVideos: [
            { title: 'Understanding IBS', id: 'H4bWd-w2h6c' },
            { title: 'Low FODMAP Diet Explained', id: 'rkMmjV5Qya0' },
            { title: 'Managing IBS Naturally', id: '2eBaFqHGxSs' },
        ],
    },
    
    // Cardiovascular
    high_blood_pressure: {
        name: 'High Blood Pressure (Hypertension)',
        category: 'Cardiovascular',
        severity: 'moderate',
        symptoms: ['headaches', 'dizziness', 'blurred vision', 'chest pain', 'shortness of breath', 'nosebleeds'],
        description: 'Condition where blood pressure remains consistently elevated. Often called "silent killer".',
        recommendations: [
            'Reduce sodium intake (less than 2,300mg daily)',
            'Exercise regularly (150 minutes per week)',
            'Maintain healthy weight',
            'Limit alcohol consumption',
            'Quit smoking immediately',
            'Manage stress effectively',
            'Take prescribed medications consistently',
            'Monitor blood pressure at home regularly',
        ],
        warnings: [
            'EMERGENCY: Systolic above 180 or diastolic above 120',
            'EMERGENCY: Severe headache with chest pain',
            'EMERGENCY: Difficulty breathing',
            'Vision problems',
        ],
        homeRemedies: [
            'DASH diet (Dietary Approaches to Stop Hypertension)',
            'Potassium-rich foods (bananas, spinach)',
            'Dark chocolate (in moderation)',
            'Garlic supplements',
        ],
        youtubeVideos: [
            { title: 'High Blood Pressure Explained', id: '6-bN-e5B5Ds' },
            { title: 'DASH Diet for Hypertension', id: 'xHzMUCL_IiA' },
            { title: 'Natural Ways to Lower Blood Pressure', id: 'QLiT4dojR1Y' },
        ],
    },
    
    // Mental Health
    anxiety: {
        name: 'Anxiety Disorder',
        category: 'Mental Health',
        severity: 'mild-moderate',
        symptoms: ['excessive worry', 'restlessness', 'fatigue', 'difficulty concentrating', 'irritability', 'muscle tension', 'sleep problems'],
        description: 'Mental health condition characterized by persistent, excessive worry and fear.',
        recommendations: [
            'Practice deep breathing exercises (4-7-8 technique)',
            'Try progressive muscle relaxation',
            'Exercise regularly - 30 minutes daily',
            'Maintain regular sleep schedule',
            'Limit caffeine and alcohol',
            'Consider cognitive behavioral therapy (CBT)',
            'Practice mindfulness meditation',
            'Join support groups',
        ],
        warnings: [
            'If experiencing panic attacks frequently',
            'If anxiety interferes with daily activities',
            'Thoughts of self-harm',
            'Severe physical symptoms',
        ],
        homeRemedies: [
            'Chamomile tea',
            'Lavender aromatherapy',
            'Magnesium supplements',
            'Omega-3 fatty acids',
            'Regular journaling',
        ],
        youtubeVideos: [
            { title: 'Understanding Anxiety Disorders', id: 'jryCoo0BrRk' },
            { title: 'Anxiety Relief Techniques', id: 'WmVoaqPQ8o8' },
            { title: 'Breathing Exercises for Anxiety', id: 'WQ-hW489-z8' },
        ],
    },
    
    depression: {
        name: 'Depression',
        category: 'Mental Health',
        severity: 'moderate',
        symptoms: ['persistent sadness', 'loss of interest', 'fatigue', 'sleep changes', 'appetite changes', 'difficulty concentrating', 'feelings of worthlessness'],
        description: 'Mood disorder causing persistent feelings of sadness and loss of interest.',
        recommendations: [
            'Seek professional help - therapy is highly effective',
            'Consider medication if recommended by doctor',
            'Exercise regularly - proven to boost mood',
            'Maintain social connections',
            'Set small, achievable daily goals',
            'Get sunlight exposure (15-30 minutes daily)',
            'Practice self-compassion',
            'Stick to regular sleep schedule',
        ],
        warnings: [
            'EMERGENCY: Thoughts of suicide or self-harm',
            'EMERGENCY: Call 988 (Suicide & Crisis Lifeline)',
            'Unable to perform daily activities',
            'Substance abuse',
        ],
        homeRemedies: [
            'St. John\'s Wort (consult doctor first)',
            'Omega-3 supplements',
            'Regular exercise routine',
            'Light therapy for seasonal depression',
            'Gratitude journaling',
        ],
        youtubeVideos: [
            { title: 'Understanding Depression', id: 'z-IR48Mb3W0' },
            { title: 'How to Cope with Depression', id: '1eLXPpCK_XE' },
            { title: 'Exercise and Depression', id: '2X4qySqsYP8' },
        ],
    },
    
    // Pain & Inflammation
    migraine: {
        name: 'Migraine Headache',
        category: 'Neurological',
        severity: 'moderate-severe',
        symptoms: ['throbbing pain', 'nausea', 'vomiting', 'light sensitivity', 'sound sensitivity', 'visual aura', 'dizziness'],
        description: 'Intense, debilitating headache often accompanied by nausea and sensitivity to light/sound.',
        recommendations: [
            'Rest in a quiet, dark room',
            'Apply cold compress to forehead',
            'Take prescribed migraine medication early',
            'Stay hydrated',
            'Identify and avoid triggers (foods, stress, sleep patterns)',
            'Maintain regular sleep schedule',
            'Practice stress management',
            'Consider preventive medications if frequent',
        ],
        warnings: [
            'Sudden, severe headache (thunderclap)',
            'Headache with fever, stiff neck, confusion',
            'Headache after head injury',
            'Increasing frequency or severity',
        ],
        homeRemedies: [
            'Ginger tea (anti-inflammatory)',
            'Peppermint oil on temples',
            'Magnesium supplements',
            'Riboflavin (Vitamin B2)',
            'Feverfew supplements',
        ],
        youtubeVideos: [
            { title: 'Migraine Relief Techniques', id: 'KeHPbMk9w9w' },
            { title: 'Understanding Migraines', id: 'zxwfDlhJIpw' },
            { title: 'Migraine Prevention Strategies', id: 'p4hDz7o4mKs' },
        ],
    },
    
    arthritis: {
        name: 'Arthritis',
        category: 'Musculoskeletal',
        severity: 'moderate',
        symptoms: ['joint pain', 'stiffness', 'swelling', 'reduced range of motion', 'warmth around joints'],
        description: 'Inflammation of one or more joints causing pain and stiffness.',
        recommendations: [
            'Maintain healthy weight to reduce joint stress',
            'Exercise regularly - low-impact activities (swimming, walking)',
            'Apply hot/cold therapy',
            'Take anti-inflammatory medications as prescribed',
            'Consider physical therapy',
            'Use assistive devices if needed',
            'Practice joint protection techniques',
        ],
        warnings: [
            'Sudden severe joint pain',
            'Joint appears deformed',
            'Inability to move the joint',
            'Intense swelling or redness',
        ],
        homeRemedies: [
            'Turmeric supplements (curcumin)',
            'Fish oil (omega-3 fatty acids)',
            'Epsom salt baths',
            'Gentle stretching exercises',
            'Ginger tea',
        ],
        youtubeVideos: [
            { title: 'Arthritis Explained', id: 'J8NbTLHZZTk' },
            { title: 'Exercises for Arthritis Pain', id: 'GWKf_Uk8x5w' },
            { title: 'Managing Arthritis Naturally', id: 'tRNRrL2JqMY' },
        ],
    },
    
    // Skin conditions
    eczema: {
        name: 'Eczema (Atopic Dermatitis)',
        category: 'Dermatological',
        severity: 'mild-moderate',
        symptoms: ['itchy skin', 'dry skin', 'red patches', 'thickened skin', 'small raised bumps', 'oozing or crusting'],
        description: 'Chronic skin condition causing inflammation, itching, and redness.',
        recommendations: [
            'Moisturize skin frequently (2-3 times daily)',
            'Use fragrance-free, gentle products',
            'Take short, lukewarm baths',
            'Apply topical corticosteroids as prescribed',
            'Identify and avoid triggers',
            'Wear soft, breathable fabrics',
            'Keep nails short to prevent scratching damage',
            'Use humidifier in dry environments',
        ],
        warnings: [
            'Signs of skin infection (pus, severe pain)',
            'Eczema spreading rapidly',
            'Not improving with treatment',
            'Affecting sleep or daily activities',
        ],
        homeRemedies: [
            'Coconut oil as moisturizer',
            'Colloidal oatmeal baths',
            'Aloe vera gel',
            'Apple cider vinegar (diluted)',
            'Probiotics',
        ],
        youtubeVideos: [
            { title: 'Eczema Treatment Guide', id: 'TxCcQhHk3Y0' },
            { title: 'How to Manage Eczema', id: 'dq8OdH_RP5c' },
            { title: 'Best Skincare for Eczema', id: 'bT4u9yg7V7I' },
        ],
    },
};

// Symptom keyword mapping
const symptomKeywords = {
    'runny nose': ['common_cold', 'flu'],
    'sneezing': ['common_cold', 'flu'],
    'sore throat': ['common_cold', 'flu', 'covid19'],
    'cough': ['common_cold', 'flu', 'covid19', 'asthma'],
    'fever': ['flu', 'covid19', 'food_poisoning'],
    'high fever': ['flu', 'covid19'],
    'body aches': ['flu', 'covid19'],
    'fatigue': ['flu', 'covid19', 'depression', 'anxiety'],
    'headache': ['common_cold', 'flu', 'covid19', 'migraine', 'high_blood_pressure'],
    'migraine': ['migraine'],
    'chest pain': ['asthma', 'high_blood_pressure'],
    'shortness of breath': ['covid19', 'asthma', 'high_blood_pressure'],
    'wheezing': ['asthma'],
    'loss of taste': ['covid19'],
    'loss of smell': ['covid19'],
    'nausea': ['food_poisoning', 'gastritis', 'migraine'],
    'vomiting': ['food_poisoning', 'gastritis', 'migraine'],
    'diarrhea': ['food_poisoning', 'ibs'],
    'stomach pain': ['food_poisoning', 'gastritis', 'ibs'],
    'abdominal pain': ['food_poisoning', 'gastritis', 'ibs'],
    'bloating': ['gastritis', 'ibs'],
    'constipation': ['ibs'],
    'anxiety': ['anxiety'],
    'worry': ['anxiety'],
    'panic': ['anxiety'],
    'depression': ['depression'],
    'sadness': ['depression'],
    'hopeless': ['depression'],
    'joint pain': ['arthritis'],
    'stiff': ['arthritis'],
    'swelling': ['arthritis'],
    'itchy': ['eczema'],
    'rash': ['eczema'],
    'dry skin': ['eczema'],
    'dizziness': ['high_blood_pressure'],
    'blurred vision': ['high_blood_pressure'],
};

const symptomKnowledgeBase = {
    'fever, cough, shortness of breath': [
        {
            name: 'COVID-19',
            doctors: ['Dr. Smith', 'Dr. John'],
            articles: ['Managing COVID-19', 'COVID-19 Prevention'],
            videos: ['COVID-19 Care Video 1', 'COVID-19 Care Video 2'],
        },
        {
            name: 'Influenza (Flu)',
            doctors: [],
            articles: ['Understanding Flu', 'Flu Management'],
            videos: ['Flu Explained', 'Living with Flu'],
        },
        {
            name: 'Pneumonia',
            doctors: [],
            articles: ['Pneumonia Treatment', 'Pneumonia Prevention'],
            videos: ['Pneumonia Care Video 1', 'Pneumonia Care Video 2'],
        },
    ],
    'sudden chest pain, shortness of breath': [
        {
            name: 'Pulmonary Embolism',
            doctors: [],
            articles: ['Pulmonary Embolism Overview', 'Pulmonary Embolism Treatment'],
            videos: ['Pulmonary Embolism Explained', 'Living with Pulmonary Embolism'],
        },
    ],
    'severe headache, sensitivity to light': [
        {
            name: 'Migraine',
            doctors: [],
            articles: ['Managing Migraines', 'Migraine Triggers'],
            videos: ['Migraine Relief Video 1', 'Migraine Relief Video 2'],
        },
        {
            name: 'Meningitis',
            doctors: [],
            articles: ['Understanding Meningitis', 'Meningitis Treatment'],
            videos: ['Meningitis Explained', 'Living with Meningitis'],
        },
    ],
    'abdominal pain, diarrhea, vomiting': [
        {
            name: 'Gastroenteritis',
            doctors: [],
            articles: ['Gastroenteritis Overview', 'Gastroenteritis Treatment'],
            videos: ['Gastroenteritis Explained', 'Living with Gastroenteritis'],
        },
        {
            name: 'Appendicitis',
            doctors: [],
            articles: ['Understanding Appendicitis', 'Appendicitis Surgery'],
            videos: ['Appendicitis Explained', 'Living with Appendicitis'],
        },
    ],
    'fatigue, weight loss, excessive thirst, blurred vision': [
        {
            name: 'Diabetes',
            doctors: ['Dr. Smith', 'Dr. John'],
            articles: ['Managing Diabetes', 'Diabetes Diet Tips'],
            videos: ['Diabetes Care Video 1', 'Diabetes Care Video 2'],
        },
        {
            name: 'Hyperthyroidism',
            doctors: [],
            articles: ['Understanding Hyperthyroidism', 'Hyperthyroidism Management'],
            videos: ['Hyperthyroidism Explained', 'Living with Hyperthyroidism'],
        },
    ],
    'joint pain, morning stiffness, swelling': [
        {
            name: 'Rheumatoid Arthritis',
            doctors: [],
            articles: ['Managing Rheumatoid Arthritis', 'Rheumatoid Arthritis Diet Tips'],
            videos: ['Rheumatoid Arthritis Care Video 1', 'Rheumatoid Arthritis Care Video 2'],
        },
        {
            name: 'Osteoarthritis',
            doctors: [],
            articles: ['Understanding Osteoarthritis', 'Osteoarthritis Management'],
            videos: ['Osteoarthritis Explained', 'Living with Osteoarthritis'],
        },
    ],
};

const analyzeSymptoms = (symptomText) => {
    const text = symptomText.toLowerCase();
    const matchedConditions = new Set();
    
    Object.entries(symptomKeywords).forEach(([keyword, conditions]) => {
        if (text.includes(keyword)) {
            conditions.forEach(c => matchedConditions.add(c));
        }
    });
    
    return Array.from(matchedConditions).map(id => ({
        id,
        ...medicalConditions[id],
    }));
};

const calculateSymptomMatch = (condition) => {
    if (!state.searchQuery || !condition.symptoms) return 75;
    
    const queryWords = state.searchQuery.toLowerCase().split(/\s+/);
    const conditionSymptoms = condition.symptoms.map(s => s.toLowerCase());
    
    let matchedSymptoms = 0;
    let exactMatches = 0;
    
    queryWords.forEach(word => {
        // Check for exact matches
        if (conditionSymptoms.some(symptom => symptom === word)) {
            exactMatches++;
            matchedSymptoms++;
        }
        // Check for partial matches
        else if (conditionSymptoms.some(symptom => symptom.includes(word) || word.includes(symptom))) {
            matchedSymptoms++;
        }
    });
    
    // Calculate base percentage
    let matchPercentage = Math.round((matchedSymptoms / Math.max(queryWords.length, 1)) * 100);
    
    // Boost for exact matches
    matchPercentage += exactMatches * 10;
    
    // Adjust based on condition severity for emergency conditions
    if (condition.severity === 'severe') {
        matchPercentage = Math.max(85, matchPercentage);
    }
    
    // Cap at realistic values
    return Math.min(95, Math.max(60, matchPercentage));
};

const getKnowledgeMatches = (query) => {
    if (!query) return [];

    const normalized = query.toLowerCase();
    const matches = [];

    Object.entries(symptomKnowledgeBase).forEach(([pattern, resources]) => {
        const phrases = pattern.split(',').map(part => part.trim().toLowerCase()).filter(Boolean);
        if (phrases.length === 0) return;

        const matchesCount = phrases.reduce((count, phrase) => (
            normalized.includes(phrase) ? count + 1 : count
        ), 0);

        const threshold = Math.ceil(phrases.length / 2);
        if (matchesCount >= threshold) {
            matches.push({ pattern, resources });
        }
    });

    return matches;
};

const renderKnowledgeSections = (matches) => {
    if (!matches.length) return '';

    return `
        <section class="knowledge-insights">
            <h2>Expert Insights & Resources</h2>
            <p class="knowledge-subtitle">Additional conditions, specialists, and educational materials related to the symptoms you entered.</p>
            ${matches.map(({ pattern, resources }) => `
                <div class="knowledge-pattern">
                    <div class="knowledge-pattern__header">
                        <span class="knowledge-pattern__label">Symptom Cluster:</span>
                        <span class="knowledge-pattern__value">${pattern}</span>
                    </div>
                    <div class="knowledge-grid">
                        ${resources.map(resource => `
                            <article class="knowledge-card">
                                <header class="knowledge-card__header">
                                    <h3>${resource.name}</h3>
                                </header>
                                ${resource.doctors?.length ? `
                                    <div class="knowledge-card__section">
                                        <h4>Recommended Specialists</h4>
                                        <ul>
                                            ${resource.doctors.map(doctor => `<li>${doctor}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                                ${resource.articles?.length ? `
                                    <div class="knowledge-card__section">
                                        <h4>Key Reading</h4>
                                        <ul>
                                            ${resource.articles.map(article => `<li>${article}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                                ${resource.videos?.length ? `
                                    <div class="knowledge-card__section">
                                        <h4>Educational Videos</h4>
                                        <ul>
                                            ${resource.videos.map(video => `<li>${video}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </article>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </section>
    `;
};

const renderVideoCard = (video) => `
    <div class="video-card">
        <div class="video-card__thumbnail">
            <img src="https://img.youtube.com/vi/${video.id}/mqdefault.jpg" alt="${video.title}">
            <button class="video-card__play" data-video-id="${video.id}" aria-label="Play video">
                <span class="play-icon">▶</span>
            </button>
        </div>
        <h4 class="video-card__title">${video.title}</h4>
    </div>
`;

const renderConditionCard = (condition) => {
    const severityColors = {
        'mild': 'success',
        'mild-moderate': 'info',
        'moderate': 'warning',
        'moderate-severe': 'warning',
        'severe': 'error',
    };
    
    const isEmergency = condition.severity === 'severe' || condition.category === 'Emergency';
    const matchPercentage = calculateSymptomMatch(condition);
    
    return `
        <div class="condition-card ${isEmergency ? 'emergency-card' : ''}" data-condition="${condition.id}">
            ${isEmergency ? `
                <div class="emergency-banner">
                    <div class="emergency-alert">
                        <span class="emergency-icon">🚨</span>
                        <strong>URGENT: SEEK IMMEDIATE MEDICAL ATTENTION</strong>
                    </div>
                    <div class="emergency-actions">
                        <button class="emergency-cta" onclick="window.location.href='tel:911'">
                            📞 Call 911 Now
                        </button>
                        <button class="emergency-secondary" onclick="window.location.href='tel:811'">
                            🏥 Find Hospital
                        </button>
                    </div>
                </div>
            ` : ''}
            
            <div class="condition-card__header">
                <h3>${condition.name}</h3>
                <div class="condition-meta">
                    <span class="badge badge--${severityColors[condition.severity]}">${condition.severity}</span>
                    <span class="likelihood-badge">${matchPercentage}% Match</span>
                </div>
            </div>
            
            <div class="likelihood-section">
                <div class="likelihood-bar">
                    <div class="likelihood-fill" style="width: ${matchPercentage}%; background-color: ${isEmergency ? '#e74c3c' : '#3498db'}"></div>
                </div>
                <p class="likelihood-text">
                    <strong>Likelihood Assessment:</strong> Based on your symptoms, there's a ${matchPercentage}% probability this could be ${condition.name}
                </p>
            </div>
            
            <p class="condition-card__description">${condition.description}</p>
            
            <div class="condition-card__section">
                <h4>Common Symptoms</h4>
                <ul class="symptom-list">
                    ${condition.symptoms.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
            
            <div class="condition-card__section">
                <h4>💡 Recommendations</h4>
                <ul class="recommendation-list">
                    ${condition.recommendations.map(r => `<li>${r}</li>`).join('')}
                </ul>
            </div>
            
            <div class="condition-card__section">
                <h4>⚠️ Warning Signs - Seek Medical Care If:</h4>
                <ul class="warning-list">
                    ${condition.warnings.map(w => `<li>${w}</li>`).join('')}
                </ul>
            </div>
            
            ${condition.homeRemedies ? `
                <div class="condition-card__section">
                    <h4>🏡 Home Remedies & Natural Relief</h4>
                    <ul class="remedy-list">
                        ${condition.homeRemedies.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div class="condition-card__section">
                <h4>📺 Educational Videos</h4>
                <div class="video-grid">
                    ${condition.youtubeVideos.map(video => renderVideoCard(video)).join('')}
                </div>
            </div>
            
            <div class="condition-card__actions">
                <button class="button-primary" data-route="/appointments">Schedule Appointment</button>
                <button class="button-secondary" data-route="/messages">Message Doctor</button>
            </div>
        </div>
    `;
};

const renderSearchResults = () => {
    // Check if user has entered a search query
    console.log('renderSearchResults called, searchQuery:', state.searchQuery);
    
    if (!state.searchQuery || state.searchQuery.trim() === '') {
        console.log('Showing initial empty state');
        return `
            <div class="no-results">
                <h3>Enter your symptoms above</h3>
                <p>Describe what you're experiencing, and we'll provide personalized health information.</p>
                <div class="example-searches">
                    <h4>Try searching for:</h4>
                    <div class="example-chips">
                        <button class="chip" data-example="runny nose and cough">Runny nose and cough</button>
                        <button class="chip" data-example="stomach pain and nausea">Stomach pain and nausea</button>
                        <button class="chip" data-example="headache and fever">Headache and fever</button>
                        <button class="chip" data-example="anxiety and worry">Anxiety and worry</button>
                        <button class="chip" data-example="joint pain and stiffness">Joint pain and stiffness</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Analyze symptoms from search query
    const conditions = analyzeSymptoms(state.searchQuery);
    console.log('Found conditions:', conditions.length, conditions);
    state.symptoms = conditions;
    const knowledgeMatches = getKnowledgeMatches(state.searchQuery);
    console.log('Knowledge matches:', knowledgeMatches.length);
    
    if (conditions.length === 0) {
        const knowledgeSection = renderKnowledgeSections(knowledgeMatches);
        return `
            <div class="no-results">
                <h3>No specific conditions found</h3>
                <p>We couldn't match your symptoms to our primary knowledge base. Please consult with a healthcare provider for personalized advice.</p>
                ${knowledgeSection || ''}
                <div class="general-advice">
                    <h4>General Health Tips:</h4>
                    <ul>
                        <li>Stay hydrated - drink 8-10 glasses of water daily</li>
                        <li>Get adequate rest (7-9 hours of sleep)</li>
                        <li>Monitor your symptoms over the next 24-48 hours</li>
                        <li>Seek medical attention if symptoms worsen</li>
                    </ul>
                </div>
                <button class="button-primary" data-route="/appointments">Schedule Doctor's Appointment</button>
            </div>
        `;
    }
    
    return `
        <div class="results-header">
            <h2>Possible Conditions (${conditions.length} found)</h2>
            <p>Based on your symptoms, here's what you might be experiencing. This is for informational purposes only and not a substitute for professional medical advice.</p>
        </div>
        <div class="conditions-grid">
            ${conditions.map(condition => renderConditionCard(condition)).join('')}
        </div>
        ${renderKnowledgeSections(knowledgeMatches)}
        <div class="disclaimer">
            <strong>Medical Disclaimer:</strong> This information is for educational purposes only. Always consult with a qualified healthcare professional for proper diagnosis and treatment. If you're experiencing a medical emergency, call emergency services immediately.
        </div>
    `;
};

const openYouTubeVideo = (videoId) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    showToast('Opening video in new tab', { variant: 'info', duration: 2000 });
};

export const SymptomCheckerPage = {
    isPublic: true,  // Allow access without login
    onRouteEnter() {
        state.symptoms = [];
        state.selectedCondition = null;
        state.searchQuery = '';
        console.log('SymptomCheckerPage entered, state reset');
    },
    getTitle() {
        return `${i18n.t('symptomChecker.title')} • ${i18n.t('brand.name')}`;
    },
    render() {
        return `
            <section class="new-symptom-checker">
                <header class="symptom-checker-header">
                    <h1>🩺 AI-Powered Symptom Checker</h1>
                    <p>Describe your symptoms and get instant health information, recommendations, and educational resources.</p>
                </header>
                
                <div class="symptom-search">
                    <div class="search-box">
                        <input 
                            type="text" 
                            data-symptom-input 
                            placeholder="Describe your symptoms... (e.g., 'headache, fever, and body aches')"
                            class="symptom-input"
                            value="${state.searchQuery}"
                        />
                        <button class="search-button" data-search-symptoms>
                            <span>🔍</span> Analyze Symptoms
                        </button>
                    </div>
                    <div class="search-hint">
                        💡 Be specific: Include duration, severity, and any related symptoms for better results
                    </div>
                </div>
                
                <div class="symptom-results">
                    ${renderSearchResults()}
                </div>
            </section>
        `;
    },
    afterRender() {
        const input = document.querySelector('[data-symptom-input]');
        const searchButton = document.querySelector('[data-search-symptoms]');
        
        const performSearch = () => {
            console.log('performSearch called');
            if (input) {
                state.searchQuery = input.value.trim();
                console.log('Search query set to:', state.searchQuery);
                if (state.searchQuery) {
                    const viewRoot = document.querySelector('[data-view-root]');
                    console.log('viewRoot found:', !!viewRoot);
                    if (viewRoot) {
                        viewRoot.innerHTML = SymptomCheckerPage.render();
                        SymptomCheckerPage.afterRender();
                    }
                    showToast('Analyzing your symptoms...', { variant: 'info', duration: 2000 });
                }
            }
        };
        
        searchButton?.addEventListener('click', performSearch);
        
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Example search chips
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
        
        // Video play buttons
        document.querySelectorAll('[data-video-id]').forEach(button => {
            button.addEventListener('click', () => {
                const videoId = button.getAttribute('data-video-id');
                if (videoId) {
                    openYouTubeVideo(videoId);
                }
            });
        });
    },
};
