import { showToast } from '../toast.js';

let activeChatModal = null;
let chatHistory = [];
let isTyping = false;

/**
 * AI Chatbot Responses Database
 * Context-aware responses for common health questions
 */
const responsesDB = {
    greetings: [
        {
            patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
            responses: [
                "Hello! I'm your DoCare AI assistant. How can I help you with your health today?",
                "Hi there! I'm here to answer your health questions. What can I assist you with?",
                "Hello! Welcome to DoCare. I'm here 24/7 to help with your health concerns. What's on your mind?",
            ]
        },
    ],
    
    symptoms: [
        {
            patterns: ['headache', 'head hurts', 'migraine'],
            responses: [
                "Headaches can have many causes. On a scale of 1-10, how severe is your pain? Do you have any other symptoms like nausea, sensitivity to light, or visual changes?",
                "I understand you're experiencing a headache. Have you tried resting in a dark, quiet room? If the headache is severe or accompanied by fever, confusion, or stiff neck, please seek immediate medical attention.",
            ]
        },
        {
            patterns: ['fever', 'temperature', 'hot', 'burning up'],
            responses: [
                "A fever is usually a sign your body is fighting an infection. What's your temperature? For adults, a fever above 103°F (39.4°C) or lasting more than 3 days should be evaluated by a doctor.",
                "Fever can be managed with rest, fluids, and over-the-counter medications like acetaminophen. However, if you have difficulty breathing, chest pain, or persistent vomiting, seek immediate care.",
            ]
        },
        {
            patterns: ['cough', 'coughing', 'throat'],
            responses: [
                "Is your cough dry or producing mucus? How long have you had it? A persistent cough lasting more than 3 weeks should be evaluated by a healthcare provider.",
                "Coughs can be caused by many things - from common colds to allergies. Stay hydrated, use a humidifier, and consider honey (if you're over 1 year old). If you have fever, shortness of breath, or chest pain, please see a doctor.",
            ]
        },
    ],
    
    medications: [
        {
            patterns: ['medication', 'medicine', 'prescription', 'drug', 'pill'],
            responses: [
                "I can help you with medication information. You can view all your medications in the Medications page. Would you like me to help you set up reminders?",
                "For medication-related questions, you can check the Medications section in your dashboard. If you need a refill, click 'Request Refill' on your medication card.",
            ]
        },
        {
            patterns: ['side effect', 'adverse effect', 'reaction'],
            responses: [
                "If you're experiencing concerning side effects from a medication, please contact your healthcare provider immediately. For severe reactions like difficulty breathing, swelling, or chest pain, call 911.",
                "Medication side effects should be reported to your doctor. In the meantime, document what you're experiencing, when it started, and how severe it is.",
            ]
        },
    ],
    
    appointments: [
        {
            patterns: ['appointment', 'booking', 'schedule', 'see doctor', 'visit'],
            responses: [
                "I can help you schedule an appointment! Would you like to book a virtual or in-person visit? You can also do this directly from the Appointments page.",
                "To schedule an appointment, click 'Schedule New Appointment' in the Appointments section. You can choose your preferred provider, date, and time. Would you like me to navigate you there?",
            ]
        },
        {
            patterns: ['reschedule', 'change appointment', 'move appointment'],
            responses: [
                "You can reschedule your appointment by going to the Appointments page and clicking 'Reschedule' on your appointment card. Would you like me to show you how?",
                "To reschedule, visit the Appointments section, find your upcoming appointment, and select 'Reschedule'. You'll see available time slots with your current provider.",
            ]
        },
        {
            patterns: ['cancel appointment', 'cancel visit'],
            responses: [
                "To cancel an appointment, go to the Appointments page and click 'Cancel' on the appointment you want to cancel. Please note our cancellation policy requires 24 hours notice to avoid fees.",
                "You can cancel your appointment in the Appointments section. Just click 'Cancel' and select your reason. If this is urgent, you can also call our office directly.",
            ]
        },
    ],
    
    emergency: [
        {
            patterns: ['emergency', 'urgent', '911', 'help', 'ambulance', 'chest pain', 'can\'t breathe', 'severe bleeding'],
            responses: [
                "⚠️ THIS IS AN EMERGENCY! Please call 911 immediately or go to the nearest emergency room. You can also use the Emergency SOS button in your profile. Stay calm and don't hang up until help arrives.",
                "🚨 EMERGENCY: If you're experiencing a life-threatening situation, CALL 911 NOW. For immediate help, use the Emergency SOS feature in your DoCare profile to alert emergency contacts and share your location.",
            ]
        },
        {
            patterns: ['suicide', 'kill myself', 'end my life', 'want to die'],
            responses: [
                "🆘 I'm very concerned about you. Please reach out for immediate help:\n\n🇺🇸 National Suicide Prevention Lifeline: 988\n📱 Crisis Text Line: Text HOME to 741741\n🚨 Or call 911\n\nYou're not alone. Help is available 24/7, and people care about you.",
            ]
        },
    ],
    
    billing: [
        {
            patterns: ['bill', 'payment', 'cost', 'charge', 'invoice', 'pay'],
            responses: [
                "You can view all your bills and make payments in the Billing section. We accept credit cards, bank accounts, and HSA/FSA cards. Would you like me to navigate you there?",
                "For billing questions, check the Billing page where you can view statements, make payments, and download receipts. If you have insurance questions, contact our billing department at billing@docare.health.",
            ]
        },
        {
            patterns: ['insurance', 'coverage', 'claim'],
            responses: [
                "Insurance information can be updated in your Profile > Insurance section. For coverage questions, please contact your insurance provider directly or call our billing team.",
                "You can add or update insurance cards in your profile. If you're unsure about coverage for a specific service, we recommend calling your insurance provider before your visit.",
            ]
        },
    ],
    
    devices: [
        {
            patterns: ['fitbit', 'apple watch', 'google fit', 'device', 'tracker', 'wearable'],
            responses: [
                "You can connect your fitness tracker in the Devices section! We support Fitbit, Apple Health, Google Fit, Withings, Garmin, and Oura Ring. Would you like help connecting a device?",
                "To sync your fitness data, go to Devices > Connect Device. You'll be guided through a secure authorization process to link your wearable. All data is encrypted and private.",
            ]
        },
    ],
    
    general: [
        {
            patterns: ['thank', 'thanks', 'appreciate'],
            responses: [
                "You're very welcome! Is there anything else I can help you with today?",
                "Happy to help! Let me know if you have any other questions. I'm here 24/7!",
                "My pleasure! Feel free to reach out anytime you need assistance. Take care! 😊",
            ]
        },
        {
            patterns: ['bye', 'goodbye', 'see you', 'later'],
            responses: [
                "Take care! Remember, I'm here 24/7 if you need anything. Stay healthy! 👋",
                "Goodbye! Don't hesitate to reach out if you have more questions. Wishing you good health! 🌟",
            ]
        },
        {
            patterns: ['help', 'what can you do', 'how does this work', 'features'],
            responses: [
                "I can help you with:\n\n💊 Medication information & reminders\n📅 Scheduling appointments\n🩺 Symptom checking & health questions\n💳 Billing & payments\n⌚ Connecting fitness devices\n🆘 Emergency assistance\n\nWhat would you like help with?",
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
    const message = userMessage.toLowerCase();
    
    // Check all response categories
    for (const category of Object.keys(responsesDB)) {
        if (category === 'fallback') continue;
        
        const categoryData = responsesDB[category];
        for (const item of categoryData) {
            for (const pattern of item.patterns) {
                if (message.includes(pattern)) {
                    // Return random response from matching pattern
                    const responses = item.responses;
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            }
        }
    }
    
    // Fallback response
    const fallbackResponses = responsesDB.fallback;
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
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
