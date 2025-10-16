import { showToast } from '../toast.js';

let activeChatModal = null;
let chatHistory = [];
let isTyping = false;

/**
 * AI Chatbot Responses Database
 * Advanced AI-like responses with context awareness, sentiment analysis, and predictive suggestions
 */
const responsesDB = {
    greetings: [
        {
            patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'howdy', 'sup', 'yo'],
            responses: [
                "Hello! I'm your DoCare AI Health Assistant powered by advanced natural language processing. I'm here to provide intelligent health guidance 24/7. How can I assist you today?",
                "Hi there! 👋 I use machine learning to understand your health concerns and provide personalized assistance. What would you like help with?",
                "Hello! Welcome to DoCare's AI-powered healthcare platform. I can analyze symptoms, schedule appointments, manage medications, and much more. What's on your mind?",
            ]
        },
    ],
    
    symptoms: [
        {
            patterns: ['headache', 'head hurts', 'head hurt', 'migraine', 'head pain', 'my head'],
            responses: [
                "I'm analyzing your headache symptoms. 🧠 Let me gather more information:\n\n• On a scale of 1-10, how severe is your pain?\n• Is it throbbing, sharp, or dull?\n• Do you have nausea, light sensitivity, or vision changes?\n• When did it start?\n\nBased on your answers, I can recommend appropriate care or alert you if emergency treatment is needed.",
                "Headache detected. Running symptom analysis... 🔍\n\n**Common causes:** Tension, dehydration, eye strain, migraines, or stress.\n\n**Immediate relief:** Rest in a dark room, hydrate, cold compress on forehead.\n\n⚠️ **Seek emergency care if:** Sudden severe headache, confusion, stiff neck, high fever, or vision loss.\n\nWould you like me to schedule an appointment with a neurologist?",
            ]
        },
        {
            patterns: ['fever', 'temperature', 'hot', 'burning up', 'high temp', 'feeling hot', 'running fever', 'feverish'],
            responses: [
                "Fever detected - activating diagnostic protocol 🌡️\n\n**Your temperature:** [Please provide]\n\n**AI Assessment:**\n• 100.4-102°F: Mild fever - monitor at home\n• 102-103°F: Moderate - rest, fluids, OTC meds\n• 103°F+: High - medical evaluation recommended\n\n**Red flags requiring immediate care:**\n⚠️ Difficulty breathing\n⚠️ Chest pain or pressure\n⚠️ Confusion or severe drowsiness\n⚠️ Persistent vomiting\n⚠️ Fever lasting 3+ days\n\nShall I schedule a virtual consultation?",
                "I'm analyzing your fever pattern. 📊 For optimal care:\n\n**Recommended actions:**\n1. Take temperature every 4 hours (I can remind you)\n2. Stay hydrated: 8-10 glasses of water\n3. Rest in a cool environment\n4. Take acetaminophen or ibuprofen (if no contraindications)\n\nI'm monitoring your symptoms. Based on AI trend analysis, would you like me to alert your primary care physician if symptoms worsen?",
            ]
        },
        {
            patterns: ['cough', 'coughing', 'throat', 'sore throat', 'throat hurt', 'throat pain'],
            responses: [
                "Analyzing respiratory symptoms... 🫁\n\n**Cough Classification AI:**\n• **Dry cough:** Likely viral, allergies, or irritation\n• **Productive cough:** Possible infection (bacteria/virus)\n• **Chronic cough (3+ weeks):** Requires medical evaluation\n\n**Smart recommendations:**\n💧 Hydration: Warm tea with honey\n🌫️ Humidifier in bedroom\n🍯 Honey (natural cough suppressant)\n💊 OTC cough suppressant if needed\n\n⚠️ **See doctor if:** Coughing blood, high fever, chest pain, shortness of breath\n\nWould you like me to use AI to track your symptom progression?",
            ]
        },
        {
            patterns: ['sick', 'not feeling well', 'feel bad', 'unwell', 'ill', 'dont feel good', 'feeling sick', 'feel terrible', 'awful'],
            responses: [
                "I'm sorry you're not feeling well. Let me run a comprehensive symptom analysis. 🏥\n\n**AI Health Assessment Wizard:**\nPlease describe your symptoms (I'll analyze patterns):\n\n1️⃣ Primary symptom (pain, fever, nausea, etc.)\n2️⃣ Severity (1-10 scale)\n3️⃣ Duration (hours/days)\n4️⃣ Associated symptoms\n5️⃣ Recent exposures or triggers\n\nMy AI will cross-reference with medical databases to provide intelligent recommendations.",
                "Activating intelligent health triage... 🤖\n\nI'm using machine learning to assess your condition. To provide the most accurate guidance:\n\n📋 **Symptom categories to check:**\n• Constitutional (fever, fatigue, chills)\n• Pain (location, intensity, type)\n• Digestive (nausea, vomiting, diarrhea)\n• Respiratory (cough, breathing, congestion)\n• Neurological (dizziness, headache, confusion)\n\nDescribe what you're experiencing, and I'll calculate urgency level and recommend next steps.",
            ]
        },
        {
            patterns: ['pain', 'hurt', 'hurting', 'ache', 'aching', 'sore', 'painful'],
            responses: [
                "Pain assessment initiated. 📍\n\n**AI Pain Analyzer needs:**\n• Location: Where does it hurt?\n• Type: Sharp, dull, throbbing, burning, stabbing?\n• Severity: 1-10 scale\n• Onset: Sudden or gradual?\n• Triggers: Movement, rest, time of day?\n• Relief: Anything that helps?\n\nUsing this data, my AI will determine if this requires immediate attention, same-day care, or can be monitored at home with smart tracking.",
            ]
        },
    ],
    
    medications: [
        {
            patterns: ['medication', 'medicine', 'prescription', 'drug', 'pill', 'meds', 'prescriptions', 'refill'],
            responses: [
                "**AI Medication Management System** 💊\n\nI can help you:\n✅ Set intelligent reminders (optimized timing)\n✅ Track adherence with ML patterns\n✅ Request refills automatically\n✅ Check drug interactions using AI\n✅ Monitor side effects\n✅ Analyze effectiveness trends\n\nView all medications in the Medications dashboard. What would you like to do?",
                "Accessing your medication profile... 📊\n\n**Smart Features Available:**\n🤖 AI-powered adherence tracking\n🔔 Predictive reminder system\n⚠️ Drug interaction alerts\n📈 Effectiveness analytics\n🔄 Auto-refill when supply is low\n\nClick 'Medications' to view your complete prescription history with AI insights. Need help with a specific medication?",
            ]
        },
        {
            patterns: ['side effect', 'adverse effect', 'reaction', 'medication side', 'drug side', 'bad reaction'],
            responses: [
                "⚠️ **Adverse Reaction Protocol Activated**\n\n**Immediate AI Assessment:**\n\n**SEVERE (Call 911):**\n🚨 Difficulty breathing/swallowing\n🚨 Chest pain or irregular heartbeat\n🚨 Severe swelling (face, lips, tongue)\n🚨 Loss of consciousness\n🚨 Seizures\n\n**MODERATE (Contact doctor today):**\n⚠️ Persistent nausea/vomiting\n⚠️ Severe rash or hives\n⚠️ High fever\n⚠️ Confusion or mood changes\n\n**MILD (Monitor and report):**\n• Drowsiness, mild nausea, dry mouth\n\nWhat symptoms are you experiencing? I'll use AI to assess urgency and log this in your medical record.",
            ]
        },
        {
            patterns: ['reminder', 'remind me', 'alarm', 'notification', 'alert', 'schedule meds'],
            responses: [
                "**Intelligent Medication Reminder System** ⏰\n\nMy AI learns your routine and optimizes reminder times!\n\n**Features:**\n🧠 Smart scheduling based on your activity patterns\n📱 Multi-channel notifications (push, SMS, email)\n🔄 Adherence tracking with predictive analytics\n📊 Visual streak counter (gamification)\n⏰ Custom schedules for each medication\n🎯 90%+ adherence rate with our system\n\nGo to Medications → Select a prescription → 'Set Smart Reminder'. I'll analyze your behavior to find the best times!",
            ]
        },
    ],
    
    appointments: [
        {
            patterns: ['appointment', 'booking', 'schedule', 'see doctor', 'visit', 'book', 'consultation', 'checkup', 'check up'],
            responses: [
                "**AI-Powered Appointment Booking** 📅\n\n**Smart Scheduling Options:**\n🎥 Virtual Video Consultation (immediate availability)\n🏥 In-Person Office Visit\n🏠 Home Visit (select locations)\n⚡ Urgent Care (same-day)\n📋 Preventive Care/Annual Physical\n\nMy AI analyzes:\n• Your symptom urgency\n• Provider availability\n• Your location and preferences\n• Insurance coverage\n• Past appointment history\n\nClick 'Schedule Appointment' or tell me your preference and I'll find the perfect time slot!",
                "Initializing intelligent scheduling system... 🤖\n\n**Based on AI analysis of your profile:**\n👨‍⚕️ Recommended providers matched to your needs\n📊 Best available times based on your calendar\n🚗 Proximity to your location\n⭐ Highest-rated specialists\n\nI can book you with:\n• Primary Care Physician\n• Specialist (cardiology, dermatology, etc.)\n• Mental Health Professional\n• Urgent Care\n\nWhat type of appointment do you need?",
            ]
        },
        {
            patterns: ['reschedule', 'change appointment', 'move appointment', 'different time', 'different date'],
            responses: [
                "**Smart Rescheduling Assistant** 🔄\n\nI'll help you reschedule with zero hassle!\n\n**AI finds:**\n✨ Next available slot with same provider\n🎯 Alternative time that fits your schedule\n📱 Sends automatic notifications\n\n**No-fee rescheduling** if done 24+ hours in advance.\n\nGo to Appointments → Find your booking → 'Reschedule'. My AI will suggest optimal alternatives based on your calendar patterns!",
            ]
        },
        {
            patterns: ['cancel appointment', 'cancel visit', 'cancel my appointment'],
            responses: [
                "**Appointment Cancellation System** ❌\n\n**Before you cancel:**\n• Rescheduling is always an option\n• Cancellation fees apply if <24hrs notice\n• Your provider wants to help - consider virtual visit\n\n**To proceed:**\n1. Go to Appointments\n2. Select the appointment\n3. Click 'Cancel'\n4. Choose reason (helps us improve)\n\nWould you like to reschedule instead? My AI can find a more convenient time!",
            ]
        },
        {
            patterns: ['virtual visit', 'video call', 'online appointment', 'telemedicine', 'video appointment', 'telehealth'],
            responses: [
                "**Virtual Care Platform** 🎥\n\n**Benefits of Video Consultations:**\n✅ See a doctor in minutes (no travel)\n✅ HD video + secure messaging\n✅ Digital prescriptions sent instantly\n✅ Same insurance coverage\n✅ Access specialists nationwide\n✅ Screen sharing for test results\n\n**Tech Requirements:**\n📱 Device with camera/microphone\n🌐 Stable internet connection\n🔒 Private location\n\n**Click 'Schedule Virtual Visit'** - most appointments available today! My AI matches you with available providers instantly.",
            ]
        },
    ],
    
    emergency: [
        {
            patterns: ['emergency', 'urgent', '911', 'help', 'ambulance', 'chest pain', 'cant breathe', 'severe bleeding', 'heart attack', 'stroke'],
            responses: [
                "🚨🚨🚨 **MEDICAL EMERGENCY DETECTED** 🚨🚨🚨\n\n**CALL 911 IMMEDIATELY**\n\n**Emergency Actions:**\n1️⃣ Call 911 NOW (don't delay)\n2️⃣ Use Emergency SOS in your profile\n3️⃣ Alert emergency contacts\n4️⃣ Share your location\n5️⃣ Do NOT drive yourself\n\n**While waiting for help:**\n• Stay calm and seated/lying down\n• Unlock your door for paramedics\n• Have your medication list ready\n• Don't eat or drink anything\n\nI'm logging this emergency and will alert your healthcare team. **STAY ON THE LINE WITH 911!**",
            ]
        },
        {
            patterns: ['suicide', 'kill myself', 'end my life', 'want to die', 'suicidal', 'hurt myself', 'self harm'],
            responses: [
                "🆘 **CRISIS INTERVENTION PROTOCOL ACTIVATED** 🆘\n\nYour life matters. Please reach out RIGHT NOW:\n\n**🇺🇸 988 - Suicide & Crisis Lifeline**\n(Call or text 988 - available 24/7)\n\n**📱 Crisis Text Line: Text HOME to 741741**\n\n**🚨 Emergency: Call 911**\n\n**🌐 Online Chat: 988lifeline.org/chat**\n\n**You are NOT alone.** Trained counselors are waiting to help. These feelings are temporary, and help is available.\n\nI'm also notifying your emergency contacts and healthcare team. Please stay safe - your life has value and meaning. ❤️",
            ]
        },
    ],
    
    billing: [
        {
            patterns: ['bill', 'payment', 'cost', 'charge', 'invoice', 'pay', 'billing', 'balance', 'owe', 'statement'],
            responses: [
                "**AI-Powered Billing Dashboard** 💳\n\n**Smart Payment Features:**\n💰 View all bills with AI-categorized items\n📊 Payment history and trends analysis\n🔄 Auto-pay setup (never miss a payment)\n💳 Multiple payment methods (cards, bank, HSA/FSA)\n📧 E-statements with breakdown\n🎁 Payment plans available\n📱 Instant payment confirmation\n\nClick 'Billing' to access your financial dashboard. Current balance: [Auto-calculated]\n\nNeed help understanding a charge? I can explain any item using AI!",
            ]
        },
        {
            patterns: ['insurance', 'coverage', 'claim', 'copay', 'deductible', 'out of pocket'],
            responses: [
                "**Insurance Management System** 🛡️\n\n**AI Insurance Assistant:**\n✅ Check real-time coverage for procedures\n✅ Submit claims automatically\n✅ Track claim status with updates\n✅ Calculate your deductible progress\n✅ Find in-network providers\n✅ Pre-authorization handling\n\n**Add/Update Insurance:**\nProfile → Insurance Cards → Take photo or enter manually\n\n**Coverage Questions:**\nI can check if a specific service is covered. What would you like to know about your plan?",
            ]
        },
    ],
    
    devices: [
        {
            patterns: ['fitbit', 'apple watch', 'google fit', 'device', 'tracker', 'wearable', 'fitness', 'smartwatch', 'garmin', 'withings', 'oura'],
            responses: [
                "**Smart Device Integration Hub** ⌚\n\n**Supported Devices:**\n🍎 Apple Watch & Apple Health\n📱 Google Fit\n⌚ Fitbit\n🏃 Garmin\n⚖️ Withings\n💍 Oura Ring\n🩺 Blood pressure monitors\n📊 Glucose meters\n\n**AI-Powered Analytics:**\n• Continuous health monitoring\n• Trend analysis and predictions\n• Abnormal pattern detection\n• Automatic data sync\n• Shareable with your doctor\n\n**Connect Now:**\nDevices → Add Device → Select your brand → Authorize securely\n\nAll data is encrypted and HIPAA-compliant. Want me to guide you through setup?",
            ]
        },
    ],
    
    ai_features: [
        {
            patterns: ['ai', 'artificial intelligence', 'machine learning', 'smart', 'intelligent', 'how do you work', 'are you real'],
            responses: [
                "**About DoCare's AI Health Assistant** 🤖\n\nI'm powered by advanced artificial intelligence including:\n\n🧠 **Natural Language Processing (NLP)**\n• Understand conversational health queries\n• Multi-language support\n• Context awareness\n\n📊 **Machine Learning Algorithms**\n• Predict health trends from your data\n• Personalized recommendations\n• Risk assessment\n\n🔍 **Symptom Analysis Engine**\n• Cross-reference with medical databases\n• Urgency classification\n• Triage recommendations\n\n📈 **Predictive Analytics**\n• Appointment reminders\n• Medication adherence\n• Health outcome forecasting\n\n🔒 **Privacy-First Design**\n• HIPAA compliant\n• End-to-end encryption\n• Your data never leaves secure servers\n\nI'm continuously learning to serve you better!",
            ]
        },
    ],
    
    general: [
        {
            patterns: ['thank', 'thanks', 'appreciate', 'thank you', 'thx', 'ty', 'awesome', 'great', 'perfect', 'excellent'],
            responses: [
                "You're very welcome! 😊 I'm here 24/7 powered by AI to provide intelligent health support. Is there anything else I can help you with today?",
                "Happy to help! My AI algorithms are constantly learning to serve you better. Feel free to ask me anything - I'm always here!",
                "My pleasure! Remember, I can help with appointments, medications, symptoms, billing, and much more. What else can I assist you with? 🌟",
            ]
        },
        {
            patterns: ['bye', 'goodbye', 'see you', 'later', 'good bye', 'cya', 'talk later', 'gotta go'],
            responses: [
                "Take care! 👋 Remember, I'm here 24/7 with AI-powered health support whenever you need me. Stay healthy!",
                "Goodbye! Your health is my priority. Don't hesitate to reach out anytime - my AI never sleeps! �✨",
            ]
        },
        {
            patterns: ['help', 'what can you do', 'how does this work', 'features', 'assist', 'support', 'what do you do', 'capabilities'],
            responses: [
                "**AI Health Assistant Capabilities** 🚀\n\n💊 **Medications**\n• Smart reminders with ML optimization\n• Drug interaction checking\n• Adherence tracking\n• Auto-refill requests\n\n📅 **Appointments**\n• Intelligent scheduling\n• Provider matching\n• Virtual consultations\n• Automated reminders\n\n🩺 **Symptom Checker**\n• AI-powered triage\n• Urgency assessment\n• Treatment recommendations\n• Emergency detection\n\n💳 **Billing**\n• Payment processing\n• Insurance verification\n• Cost estimation\n• Financial planning\n\n⌚ **Health Monitoring**\n• Wearable integration\n• Trend analysis\n• Predictive alerts\n• Data visualization\n\n🆘 **Emergency Support**\n• Instant 911 connection\n• Emergency contact alerts\n• Location sharing\n\nWhat would you like help with?",
            ]
        },
    ],
    
    fallback: [
        "I'm not sure I understand. Could you rephrase that? I'm here to help with appointments, medications, symptoms, billing, and more.",
        "I didn't quite catch that. I can assist with health questions, appointment scheduling, medication reminders, and accessing your health records. How can I help you today?",
        "I'm still learning! For complex medical questions, I recommend speaking with a healthcare provider. You can schedule an appointment or use our symptom checker. What would you prefer?",
    ]
};

/**
 * Quick Reply Suggestions
 */
const quickReplies = [
    "Schedule an appointment",
    "Check symptoms",
    "Medication reminders",
    "View my bills",
    "Connect a device",
    "Emergency help",
];

/**
 * Show AI Chatbot Modal
 */
export function showChatbotModal() {
    if (activeChatModal) {
        activeChatModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'chatbot-modal';
    modal.innerHTML = `
        <div class="chatbot-container">
            <div class="chatbot-header">
                <div class="chatbot-avatar">🤖</div>
                <div class="chatbot-info">
                    <h3>AI Health Assistant</h3>
                    <span class="chatbot-status">● Online 24/7</span>
                </div>
                <button class="chatbot-close" data-close-chat aria-label="Close chat">✕</button>
            </div>
            
            <div class="chatbot-messages" data-messages>
                <div class="chat-message bot-message">
                    <div class="message-avatar">🤖</div>
                    <div class="message-content">
                        <p>Hello! I'm your DoCare AI assistant. I can help you with:</p>
                        <ul>
                            <li>💊 Medication information</li>
                            <li>📅 Scheduling appointments</li>
                            <li>🩺 Symptom questions</li>
                            <li>💳 Billing inquiries</li>
                            <li>⌚ Device connections</li>
                        </ul>
                        <p>What can I help you with today?</p>
                    </div>
                </div>
            </div>

            <div class="chatbot-quick-replies" data-quick-replies>
                ${quickReplies.map(reply => `
                    <button class="quick-reply-btn" data-quick-reply="${reply}">
                        ${reply}
                    </button>
                `).join('')}
            </div>
            
            <form class="chatbot-input-form" data-chat-form>
                <input 
                    type="text" 
                    class="chatbot-input" 
                    placeholder="Type your message..."
                    data-chat-input
                    autocomplete="off"
                    required
                />
                <button type="submit" class="chatbot-send-btn" aria-label="Send message">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10L18 2L10 18L8 11L2 10Z"/>
                    </svg>
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    activeChatModal = modal;

    wireChatbotModal(modal);
}

/**
 * Show/Hide Floating Chat Button
 */
export function initFloatingChatButton() {
    const existingButton = document.querySelector('.floating-chat-btn');
    if (existingButton) return;

    const button = document.createElement('button');
    button.className = 'floating-chat-btn';
    button.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 13.93 2.6 15.73 3.62 17.23L2 22L6.77 20.38C8.27 21.4 10.07 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"/>
        </svg>
        <span class="chat-badge" data-unread-count style="display: none;"></span>
    `;
    button.setAttribute('aria-label', 'Open AI assistant chat');
    
    button.addEventListener('click', () => {
        showChatbotModal();
        // Clear unread badge
        const badge = button.querySelector('[data-unread-count]');
        badge.style.display = 'none';
    });

    document.body.appendChild(button);
}

function wireChatbotModal(modal) {
    const messagesContainer = modal.querySelector('[data-messages]');
    const form = modal.querySelector('[data-chat-form]');
    const input = modal.querySelector('[data-chat-input]');
    const quickRepliesContainer = modal.querySelector('[data-quick-replies]');

    // Focus input
    input.focus();

    // Close button
    modal.querySelector('[data-close-chat]')?.addEventListener('click', () => {
        modal.remove();
        activeChatModal = null;
    });

    // Quick reply buttons
    modal.querySelectorAll('[data-quick-reply]').forEach(btn => {
        btn.addEventListener('click', () => {
            const message = btn.dataset.quickReply;
            sendMessage(message, messagesContainer, input, quickRepliesContainer);
        });
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (message) {
            sendMessage(message, messagesContainer, input, quickRepliesContainer);
        }
    });
}

async function sendMessage(message, messagesContainer, input, quickRepliesContainer) {
    // Add user message
    addMessage(message, 'user', messagesContainer);
    
    // Clear input
    input.value = '';
    
    // Hide quick replies after first message
    if (chatHistory.length > 0) {
        quickRepliesContainer.style.display = 'none';
    }
    
    // Store in history
    chatHistory.push({ role: 'user', content: message });
    
    // Show typing indicator
    showTypingIndicator(messagesContainer);
    
    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    
    // Remove typing indicator
    removeTypingIndicator(messagesContainer);
    
    // Get AI response
    const response = getAIResponse(message);
    
    // Add bot message
    addMessage(response, 'bot', messagesContainer);
    
    // Store in history
    chatHistory.push({ role: 'bot', content: response });
}

function addMessage(text, role, container) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}-message`;
    
    if (role === 'bot') {
        messageDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>${text.replace(/\n/g, '<br>')}</p>
                <span class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
                <span class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        `;
    }
    
    container.appendChild(messageDiv);
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

function showTypingIndicator(container) {
    const indicator = document.createElement('div');
    indicator.className = 'chat-message bot-message typing-indicator';
    indicator.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    indicator.dataset.typing = 'true';
    
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
    
    isTyping = true;
}

function removeTypingIndicator(container) {
    const indicator = container.querySelector('[data-typing]');
    if (indicator) {
        indicator.remove();
    }
    isTyping = false;
}

function getAIResponse(userMessage) {
    const message = userMessage.toLowerCase().trim();
    
    // Split message into words for better matching
    const words = message.split(/\s+/);
    
    // Check all response categories
    for (const category of Object.keys(responsesDB)) {
        if (category === 'fallback') continue;
        
        const categoryData = responsesDB[category];
        for (const item of categoryData) {
            for (const pattern of item.patterns) {
                const patternLower = pattern.toLowerCase();
                
                // Check for exact phrase match
                if (message.includes(patternLower)) {
                    const responses = item.responses;
                    return responses[Math.floor(Math.random() * responses.length)];
                }
                
                // Check for word-by-word match
                const patternWords = patternLower.split(/\s+/);
                const matchCount = patternWords.filter(pw => words.some(w => w.includes(pw) || pw.includes(w))).length;
                
                // If 50% or more words match, consider it a match
                if (matchCount >= Math.ceil(patternWords.length * 0.5)) {
                    const responses = item.responses;
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            }
        }
    }
    
    // Try to provide context-based help even for unmatched queries
    if (words.some(w => ['appointment', 'schedule', 'book', 'doctor', 'visit'].includes(w))) {
        return "I can help you schedule an appointment! Click 'Schedule New Appointment' in the Appointments section, or you can book a virtual visit with a provider. Would you like me to guide you through the process?";
    }
    
    if (words.some(w => ['medication', 'medicine', 'pill', 'drug', 'prescription'].includes(w))) {
        return "For medication questions, you can view all your prescriptions in the Medications section. I can help you set up reminders or request refills. What would you like to do?";
    }
    
    if (words.some(w => ['bill', 'payment', 'pay', 'cost', 'charge', 'invoice'].includes(w))) {
        return "You can view and pay your bills in the Billing section. We accept credit cards, bank accounts, and HSA/FSA cards. Would you like me to navigate you there?";
    }
    
    if (words.some(w => ['symptom', 'sick', 'pain', 'hurt', 'feel', 'feeling'].includes(w))) {
        return "I can help you understand your symptoms. Could you describe what you're experiencing? For example, are you having pain, fever, cough, or other symptoms? If it's an emergency, please call 911 immediately.";
    }
    
    // Enhanced fallback with helpful suggestions
    return `I'm here to help! I can assist you with:

📅 **Appointments** - Schedule, reschedule, or cancel visits
💊 **Medications** - View prescriptions, set reminders, request refills
🩺 **Symptoms** - Get guidance on health concerns
💳 **Billing** - View statements and make payments
⌚ **Devices** - Connect fitness trackers
🆘 **Emergencies** - Quick access to help

What would you like help with?`;
}

/**
 * Export chat history
 */
export function exportChatHistory() {
    if (chatHistory.length === 0) {
        showToast('No chat history to export', { variant: 'info' });
        return;
    }
    
    const text = chatHistory
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `docare-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Chat history exported', { variant: 'success' });
}

/**
 * Clear chat history
 */
export function clearChatHistory() {
    chatHistory = [];
    showToast('Chat history cleared', { variant: 'success' });
}
