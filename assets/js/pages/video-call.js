import { i18n } from '../i18n.js';
import { showToast } from '../toast.js';

let localStream = null;
let isVideoEnabled = true;
let isAudioEnabled = true;
let isCameraReady = false;

// Mock doctor data
const doctorInfo = {
    name: 'Dr. Priya Patel',
    specialty: 'Psychiatrist',
    avatar: 'PP',
    appointmentTime: '10:30 AM',
};

const startCamera = async () => {
    try {
        const constraints = {
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true,
        };
        
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        const videoElement = document.querySelector('[data-local-video]');
        if (videoElement) {
            videoElement.srcObject = localStream;
            isCameraReady = true;
            showToast('Camera connected successfully', { variant: 'success' });
        }
    } catch (error) {
        console.error('Error accessing camera:', error);
        showToast('Unable to access camera. Please check permissions.', { variant: 'error' });
    }
};

const stopCamera = () => {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
        isCameraReady = false;
    }
};

const toggleVideo = () => {
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            isVideoEnabled = !isVideoEnabled;
            videoTrack.enabled = isVideoEnabled;
            
            const button = document.querySelector('[data-toggle-video]');
            const icon = button?.querySelector('.call-control__icon');
            if (icon) {
                icon.textContent = isVideoEnabled ? '📹' : '🚫';
            }
            
            showToast(isVideoEnabled ? 'Camera enabled' : 'Camera disabled', { variant: 'info', duration: 2000 });
        }
    }
};

const toggleAudio = () => {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            isAudioEnabled = !isAudioEnabled;
            audioTrack.enabled = isAudioEnabled;
            
            const button = document.querySelector('[data-toggle-audio]');
            const icon = button?.querySelector('.call-control__icon');
            if (icon) {
                icon.textContent = isAudioEnabled ? '🎤' : '🔇';
            }
            
            showToast(isAudioEnabled ? 'Microphone enabled' : 'Microphone muted', { variant: 'info', duration: 2000 });
        }
    }
};

const endCall = () => {
    stopCamera();
    showToast('Call ended', { variant: 'info' });
    
    // Navigate back to appointments
    setTimeout(() => {
        window.__appRouter?.navigate('/appointments');
    }, 1500);
};

const shareScreen = async () => {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        showToast('Screen sharing started', { variant: 'success' });
        
        // When user stops sharing from browser controls
        screenStream.getVideoTracks()[0].onended = () => {
            showToast('Screen sharing stopped', { variant: 'info' });
        };
    } catch (error) {
        console.error('Error sharing screen:', error);
        showToast('Screen sharing cancelled', { variant: 'info' });
    }
};

const sendMessage = () => {
    const input = document.querySelector('[data-chat-input]');
    if (input && input.value.trim()) {
        const message = input.value.trim();
        const messagesContainer = document.querySelector('[data-chat-messages]');
        
        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message chat-message--sent';
        messageEl.innerHTML = `
            <div class="chat-message__bubble">
                <p>${message}</p>
                <span class="chat-message__time">${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
            </div>
        `;
        
        messagesContainer?.appendChild(messageEl);
        input.value = '';
        messagesContainer?.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
        
        // Simulate doctor response
        setTimeout(() => {
            const responseEl = document.createElement('div');
            responseEl.className = 'chat-message chat-message--received';
            responseEl.innerHTML = `
                <div class="chat-message__avatar">${doctorInfo.avatar}</div>
                <div class="chat-message__bubble">
                    <p>Thank you for sharing. I've noted that down.</p>
                    <span class="chat-message__time">${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                </div>
            `;
            messagesContainer?.appendChild(responseEl);
            messagesContainer?.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
        }, 2000);
    }
};

export const VideoCallPage = {
    isPublic: false,
    getTitle() {
        return `Video Call with ${doctorInfo.name} • ${i18n.t('brand.name')}`;
    },
    onRouteEnter() {
        // Reset state when entering
        isVideoEnabled = true;
        isAudioEnabled = true;
        isCameraReady = false;
    },
    render() {
        const callDuration = '00:00';
        
        return `
            <div class="video-call">
                <!-- Main video area -->
                <div class="video-call__main">
                    <!-- Doctor's video (simulated) -->
                    <div class="video-call__remote" data-remote-video>
                        <div class="video-call__placeholder">
                            <div class="doctor-avatar">
                                <div class="doctor-avatar__circle">${doctorInfo.avatar}</div>
                                <h3>${doctorInfo.name}</h3>
                                <p>${doctorInfo.specialty}</p>
                            </div>
                            <div class="connection-status">
                                <span class="connection-status__dot"></span>
                                <span>Connected • HD Quality</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Local video (user's camera) -->
                    <div class="video-call__local">
                        <video data-local-video autoplay muted playsinline></video>
                        <div class="video-call__local-label">You</div>
                    </div>
                    
                    <!-- Call info overlay -->
                    <div class="video-call__info">
                        <div class="call-timer">
                            <span class="call-timer__dot"></span>
                            <span data-call-duration>${callDuration}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Control bar -->
                <div class="video-call__controls">
                    <div class="call-controls">
                        <button class="call-control" data-toggle-audio title="Toggle microphone">
                            <span class="call-control__icon">🎤</span>
                            <span class="call-control__label">Microphone</span>
                        </button>
                        
                        <button class="call-control" data-toggle-video title="Toggle camera">
                            <span class="call-control__icon">📹</span>
                            <span class="call-control__label">Camera</span>
                        </button>
                        
                        <button class="call-control" data-share-screen title="Share screen">
                            <span class="call-control__icon">🖥️</span>
                            <span class="call-control__label">Share</span>
                        </button>
                        
                        <button class="call-control" data-toggle-chat title="Toggle chat">
                            <span class="call-control__icon">💬</span>
                            <span class="call-control__label">Chat</span>
                        </button>
                        
                        <button class="call-control call-control--danger" data-end-call title="End call">
                            <span class="call-control__icon">📞</span>
                            <span class="call-control__label">End Call</span>
                        </button>
                    </div>
                </div>
                
                <!-- Chat sidebar (hidden by default) -->
                <div class="video-call__chat" data-chat-panel>
                    <div class="chat-panel">
                        <div class="chat-panel__header">
                            <h3>Chat</h3>
                            <button class="chat-panel__close" data-close-chat aria-label="Close chat">✕</button>
                        </div>
                        <div class="chat-panel__messages" data-chat-messages>
                            <div class="chat-message chat-message--received">
                                <div class="chat-message__avatar">${doctorInfo.avatar}</div>
                                <div class="chat-message__bubble">
                                    <p>Hello! I can see and hear you clearly. How are you feeling today?</p>
                                    <span class="chat-message__time">10:30 AM</span>
                                </div>
                            </div>
                        </div>
                        <div class="chat-panel__input">
                            <input 
                                type="text" 
                                data-chat-input 
                                placeholder="Type a message..." 
                                class="chat-input"
                            />
                            <button class="chat-send" data-send-message aria-label="Send message">
                                <span>📤</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Waiting room (before call starts) -->
                <div class="video-call__waiting" data-waiting-room style="display: none;">
                    <div class="waiting-room">
                        <h2>Waiting Room</h2>
                        <p>Preparing your video call with ${doctorInfo.name}</p>
                        <div class="waiting-room__preview">
                            <video data-preview-video autoplay muted playsinline></video>
                        </div>
                        <p class="waiting-room__hint">Check your camera and microphone before joining</p>
                        <button class="button-primary" data-join-call>Join Call</button>
                    </div>
                </div>
            </div>
        `;
    },
    afterRender() {
        // Start camera automatically
        startCamera();
        
        // Start call timer
        let seconds = 0;
        const timerInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            const duration = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            const timerEl = document.querySelector('[data-call-duration]');
            if (timerEl) {
                timerEl.textContent = duration;
            }
        }, 1000);
        
        // Wire up controls
        const toggleAudioBtn = document.querySelector('[data-toggle-audio]');
        toggleAudioBtn?.addEventListener('click', toggleAudio);
        
        const toggleVideoBtn = document.querySelector('[data-toggle-video]');
        toggleVideoBtn?.addEventListener('click', toggleVideo);
        
        const shareScreenBtn = document.querySelector('[data-share-screen]');
        shareScreenBtn?.addEventListener('click', shareScreen);
        
        const endCallBtn = document.querySelector('[data-end-call]');
        endCallBtn?.addEventListener('click', () => {
            clearInterval(timerInterval);
            endCall();
        });
        
        // Chat functionality
        const toggleChatBtn = document.querySelector('[data-toggle-chat]');
        const chatPanel = document.querySelector('[data-chat-panel]');
        const closeChatBtn = document.querySelector('[data-close-chat]');
        
        toggleChatBtn?.addEventListener('click', () => {
            chatPanel?.classList.toggle('video-call__chat--visible');
        });
        
        closeChatBtn?.addEventListener('click', () => {
            chatPanel?.classList.remove('video-call__chat--visible');
        });
        
        const sendMessageBtn = document.querySelector('[data-send-message]');
        sendMessageBtn?.addEventListener('click', sendMessage);
        
        const chatInput = document.querySelector('[data-chat-input]');
        chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Cleanup on navigation away
        window.addEventListener('beforeunload', stopCamera);
    },
};
