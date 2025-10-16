/**
 * Backend API Integration Layer
 * Connects frontend to real backend API with JWT authentication
 */

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Token management
let accessToken = localStorage.getItem('docare.access_token');
let refreshToken = localStorage.getItem('docare.refresh_token');

export function setTokens(access, refresh) {
    accessToken = access;
    refreshToken = refresh;
    localStorage.setItem('docare.access_token', access);
    if (refresh) {
        localStorage.setItem('docare.refresh_token', refresh);
    }
}

export function clearTokens() {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem('docare.access_token');
    localStorage.removeItem('docare.refresh_token');
}

export function getAccessToken() {
    return accessToken;
}

/**
 * HTTP client with JWT authentication
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    // Add JWT token if available
    if (accessToken && !options.skipAuth) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            // Handle 401 Unauthorized - try to refresh token
            if (response.status === 401 && refreshToken && !options.skipRefresh) {
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    // Retry original request with new token
                    return apiRequest(endpoint, { ...options, skipRefresh: true });
                }
            }
            
            throw new Error(data.error || data.message || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });
        
        if (response.ok) {
            const data = await response.json();
            setTokens(data.data.access_token, data.data.refresh_token);
            return true;
        }
    } catch (error) {
        console.error('Token refresh failed:', error);
    }
    
    clearTokens();
    return false;
}

/**
 * Backend API Methods
 */
export const BackendAPI = {
    // Authentication
    async signup(userData) {
        const response = await apiRequest('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData),
            skipAuth: true,
        });
        
        if (response.success && response.data.tokens) {
            setTokens(response.data.tokens.access_token, response.data.tokens.refresh_token);
        }
        
        return response;
    },
    
    async login(email, password) {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            skipAuth: true,
        });
        
        if (response.success && response.data.tokens) {
            setTokens(response.data.tokens.access_token, response.data.tokens.refresh_token);
        }
        
        return response;
    },
    
    async logout() {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } finally {
            clearTokens();
        }
    },
    
    // User Profile
    async getProfile() {
        return await apiRequest('/users/me');
    },
    
    async updateProfile(updates) {
        return await apiRequest('/users/me', {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },
    
    async listProviders() {
        return await apiRequest('/users/providers');
    },
    
    // Appointments
    async getAppointments() {
        return await apiRequest('/appointments');
    },
    
    async createAppointment(appointmentData) {
        return await apiRequest('/appointments', {
            method: 'POST',
            body: JSON.stringify(appointmentData),
        });
    },
    
    async updateAppointment(id, updates) {
        return await apiRequest(`/appointments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },
    
    async cancelAppointment(id) {
        return await apiRequest(`/appointments/${id}`, {
            method: 'DELETE',
        });
    },
    
    async getAvailableSlots(providerId, date) {
        return await apiRequest(`/appointments/available-slots?provider_id=${providerId}&date=${date}`);
    },
    
    // Medications
    async getMedications() {
        return await apiRequest('/medications');
    },
    
    async addMedication(medicationData) {
        return await apiRequest('/medications', {
            method: 'POST',
            body: JSON.stringify(medicationData),
        });
    },
    
    async updateMedication(id, updates) {
        return await apiRequest(`/medications/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },
    
    async requestRefill(id) {
        return await apiRequest(`/medications/${id}/refill`, {
            method: 'POST',
        });
    },
    
    // Messages
    async getMessages() {
        return await apiRequest('/messages');
    },
    
    async getThreads() {
        return await apiRequest('/messages/threads');
    },
    
    async sendMessage(recipientId, content, threadId = null) {
        return await apiRequest('/messages', {
            method: 'POST',
            body: JSON.stringify({
                recipient_id: recipientId,
                content,
                thread_id: threadId,
            }),
        });
    },
    
    async markMessageRead(id) {
        return await apiRequest(`/messages/${id}/read`, {
            method: 'PUT',
        });
    },
    
    // Documents
    async getDocuments() {
        return await apiRequest('/documents');
    },
    
    async uploadDocument(formData) {
        // Note: FormData requires different headers
        const url = `${API_BASE_URL}/documents`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: formData, // Don't set Content-Type, let browser set it with boundary
        });
        
        return await response.json();
    },
    
    async deleteDocument(id) {
        return await apiRequest(`/documents/${id}`, {
            method: 'DELETE',
        });
    },
    
    // Billing
    async getTransactions() {
        return await apiRequest('/billing/transactions');
    },
    
    async getBalance() {
        return await apiRequest('/billing/balance');
    },
    
    async processPayment(paymentData) {
        return await apiRequest('/billing/payment', {
            method: 'POST',
            body: JSON.stringify(paymentData),
        });
    },
    
    // Devices
    async getDevices() {
        return await apiRequest('/devices');
    },
    
    async connectDevice(deviceData) {
        return await apiRequest('/devices', {
            method: 'POST',
            body: JSON.stringify(deviceData),
        });
    },
    
    async syncDevice(id) {
        return await apiRequest(`/devices/${id}/sync`, {
            method: 'PUT',
        });
    },
    
    async disconnectDevice(id) {
        return await apiRequest(`/devices/${id}`, {
            method: 'DELETE',
        });
    },
    
    // Emergency
    async getEmergencyContacts() {
        return await apiRequest('/emergency/contacts');
    },
    
    async triggerSOS(location) {
        return await apiRequest('/emergency/sos', {
            method: 'POST',
            body: JSON.stringify({ location }),
        });
    },
    
    // Video Calls
    async createVideoRoom(appointmentId) {
        return await apiRequest('/video/room', {
            method: 'POST',
            body: JSON.stringify({ appointment_id: appointmentId }),
        });
    },
    
    async getVideoToken(roomId) {
        return await apiRequest(`/video/token/${roomId}`);
    },
    
    // Health Journal (if backend route exists)
    async getJournalEntries() {
        return await apiRequest('/health/journal');
    },
    
    async createJournalEntry(entryData) {
        return await apiRequest('/health/journal', {
            method: 'POST',
            body: JSON.stringify(entryData),
        });
    },
};

export default BackendAPI;
