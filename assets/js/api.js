/**
 * API Abstraction Layer
 * Centralized API client with error handling, loading states, and retry logic
 */

const API_BASE_URL = 'https://api.docare.health'; // Future backend endpoint
const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

class APIError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

// Request state management
const requestStates = new Map();

export const getRequestState = (requestId) => {
    return requestStates.get(requestId) || { loading: false, error: null, data: null };
};

const setRequestState = (requestId, state) => {
    requestStates.set(requestId, { ...getRequestState(requestId), ...state });
};

/**
 * Core HTTP client with timeout and retry logic
 */
async function httpClient(url, options = {}, retryCount = 0) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new APIError(
                errorData.message || `HTTP Error: ${response.status}`,
                response.status,
                errorData
            );
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeout);

        // Retry on network errors
        if (retryCount < MAX_RETRIES && (error.name === 'AbortError' || error.name === 'TypeError')) {
            console.warn(`Retrying request (${retryCount + 1}/${MAX_RETRIES}):`, url);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            return httpClient(url, options, retryCount + 1);
        }

        throw error;
    }
}

/**
 * Wrapper for API calls with loading states and error handling
 */
async function apiCall(requestId, apiFunction) {
    setRequestState(requestId, { loading: true, error: null });

    try {
        const data = await apiFunction();
        setRequestState(requestId, { loading: false, data, error: null });
        return { success: true, data };
    } catch (error) {
        console.error(`[API Error] ${requestId}:`, error);
        const errorMessage = error instanceof APIError ? error.message : 'Network error. Please try again.';
        setRequestState(requestId, { loading: false, error: errorMessage, data: null });
        return { success: false, error: errorMessage };
    }
}

/**
 * Authentication APIs
 */
export const AuthAPI = {
    async login(email, password) {
        return apiCall('auth.login', async () => {
            // TODO: Replace with real API call
            // return await httpClient(`${API_BASE_URL}/auth/login`, {
            //     method: 'POST',
            //     body: JSON.stringify({ email, password }),
            // });
            
            // Mock implementation (current)
            await new Promise(resolve => setTimeout(resolve, 500));
            const users = JSON.parse(localStorage.getItem('docare.auth.users') || '{}');
            const user = users[email.toLowerCase()];
            
            if (!user || user.password !== password) {
                throw new APIError('Invalid credentials', 401, {});
            }
            
            return { user: { ...user, password: undefined } };
        });
    },

    async signup(userData) {
        return apiCall('auth.signup', async () => {
            // TODO: Replace with real API call
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const users = JSON.parse(localStorage.getItem('docare.auth.users') || '{}');
            if (users[userData.email.toLowerCase()]) {
                throw new APIError('Email already registered', 409, {});
            }
            
            const newUser = {
                id: crypto.randomUUID(),
                ...userData,
                createdAt: new Date().toISOString(),
            };
            
            users[userData.email.toLowerCase()] = newUser;
            localStorage.setItem('docare.auth.users', JSON.stringify(users));
            
            return { user: { ...newUser, password: undefined } };
        });
    },

    async logout() {
        return apiCall('auth.logout', async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            return { success: true };
        });
    },
};

/**
 * Appointments APIs
 */
export const AppointmentsAPI = {
    async getAppointments() {
        return apiCall('appointments.list', async () => {
            await new Promise(resolve => setTimeout(resolve, 600));
            // TODO: Replace with real API call
            return { appointments: [] };
        });
    },

    async scheduleAppointment(appointmentData) {
        return apiCall('appointments.schedule', async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            // TODO: Replace with real API call
            return { appointment: { id: crypto.randomUUID(), ...appointmentData } };
        });
    },

    async cancelAppointment(appointmentId) {
        return apiCall('appointments.cancel', async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            // TODO: Replace with real API call
            return { success: true };
        });
    },
};

/**
 * Medications APIs
 */
export const MedicationsAPI = {
    async getMedications() {
        return apiCall('medications.list', async () => {
            await new Promise(resolve => setTimeout(resolve, 400));
            // TODO: Replace with real API call
            return { medications: [] };
        });
    },

    async requestRefill(medicationId) {
        return apiCall('medications.refill', async () => {
            await new Promise(resolve => setTimeout(resolve, 700));
            // TODO: Replace with real API call
            return { success: true };
        });
    },
};

/**
 * Emergency APIs
 */
export const EmergencyAPI = {
    async triggerSOS(location) {
        return apiCall('emergency.sos', async () => {
            await new Promise(resolve => setTimeout(resolve, 1500));
            // TODO: Replace with real API call that contacts emergency services
            console.log('[Emergency] SOS triggered at location:', location);
            return { 
                success: true, 
                emergencyId: crypto.randomUUID(),
                responders: ['911', 'Emergency Contact'],
            };
        });
    },

    async notifyEmergencyContacts(userId, location) {
        return apiCall('emergency.notify', async () => {
            await new Promise(resolve => setTimeout(resolve, 800));
            // TODO: Replace with real API call
            console.log('[Emergency] Notifying emergency contacts for user:', userId);
            return { success: true, notified: ['contact1', 'contact2'] };
        });
    },

    async shareLocation(location) {
        return apiCall('emergency.location', async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
            // TODO: Replace with real API call
            return { success: true, location };
        });
    },
};

/**
 * Billing APIs
 */
export const BillingAPI = {
    async getTransactions() {
        return apiCall('billing.transactions', async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            // TODO: Replace with real API call
            return { transactions: [] };
        });
    },

    async processPayment(paymentData) {
        return apiCall('billing.payment', async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            // TODO: Replace with Stripe/Payment Gateway API
            return { 
                success: true, 
                transactionId: crypto.randomUUID(),
                receipt: 'mock-receipt-url',
            };
        });
    },
};

/**
 * Devices APIs
 */
export const DevicesAPI = {
    async connectDevice(deviceId) {
        return apiCall('devices.connect', async () => {
            await new Promise(resolve => setTimeout(resolve, 1500));
            // TODO: Replace with OAuth flow for device integration
            return { success: true, device: { id: deviceId, status: 'connected' } };
        });
    },

    async syncDevice(deviceId) {
        return apiCall('devices.sync', async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            // TODO: Replace with real device API
            return { success: true, dataPoints: Math.floor(Math.random() * 100) };
        });
    },
};

/**
 * Messages APIs
 */
export const MessagesAPI = {
    async sendMessage(providerId, message) {
        return apiCall('messages.send', async () => {
            await new Promise(resolve => setTimeout(resolve, 600));
            // TODO: Replace with real API call
            return { 
                message: { 
                    id: crypto.randomUUID(), 
                    text: message, 
                    timestamp: new Date().toISOString(),
                },
            };
        });
    },

    async getThread(providerId) {
        return apiCall('messages.thread', async () => {
            await new Promise(resolve => setTimeout(resolve, 400));
            // TODO: Replace with real API call
            return { messages: [] };
        });
    },
};

/**
 * Utility: Get current location
 */
export async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
            },
            (error) => {
                console.error('[Geolocation Error]:', error);
                reject(error);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });
}

/**
 * Export centralized API client
 */
export default {
    Auth: AuthAPI,
    Appointments: AppointmentsAPI,
    Medications: MedicationsAPI,
    Emergency: EmergencyAPI,
    Billing: BillingAPI,
    Devices: DevicesAPI,
    Messages: MessagesAPI,
    getRequestState,
};
