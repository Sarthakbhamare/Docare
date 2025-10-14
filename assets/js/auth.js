const STORAGE_KEY = 'docare.auth';
const USERS_KEY = 'docare.auth.users';

const listeners = new Set();

/**
 * Simple password hashing using Web Crypto API
 * In production, use bcrypt or similar on the backend
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function verifyPassword(password, hashedPassword) {
    const hash = await hashPassword(password);
    return hash === hashedPassword;
}

const createId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `user-${Date.now()}`;
};

let state = {
    user: null,
    users: {},
};

const initialsFromName = name => {
    if (!name) return 'ME';
    const parts = name.trim().split(/\s+/);
    const letters = parts.slice(0, 2).map(part => part[0]?.toUpperCase() ?? '');
    return letters.join('') || 'ME';
};

const persistActiveUser = () => {
    if (state.user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.user));
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
};

const persistUsers = () => {
    localStorage.setItem(USERS_KEY, JSON.stringify(state.users));
};

const notify = () => {
    listeners.forEach(listener => listener(state.user));
};

const loadFromStorage = () => {
    try {
        const rawUsers = localStorage.getItem(USERS_KEY);
        if (rawUsers) {
            state.users = JSON.parse(rawUsers);
        }
        const rawSession = localStorage.getItem(STORAGE_KEY);
        if (rawSession) {
            const parsed = JSON.parse(rawSession);
            state.user = parsed ? {
                ...parsed,
                avatarInitials: initialsFromName(parsed.name),
            } : null;
        }
    } catch (error) {
        console.warn('Failed to parse auth state', error);
        state.users = {};
        state.user = null;
    }
};

const sanitizeUser = userRecord => {
    if (!userRecord) return null;
    const { password, passwordHash, ...rest } = userRecord;
    return {
        ...rest,
        avatarInitials: initialsFromName(rest.name),
    };
};

const upsertUserRecord = record => {
    const normalizedEmail = record.email.toLowerCase();
    state.users[normalizedEmail] = record;
    persistUsers();
};

loadFromStorage();

export const auth = {
    init() {
        loadFromStorage();
        return state.user;
    },
    isAuthenticated() {
        return Boolean(state.user);
    },
    getUser() {
        return state.user;
    },
    login({ email, password }) {
        return new Promise(async (resolve, reject) => {
            if (!email || !password) {
                reject(new Error('Email and password are required.'));
                return;
            }

            const normalizedEmail = email.toString().trim().toLowerCase();
            const users = state.users || {};
            const record = users[normalizedEmail];

            if (!record) {
                reject(new Error('We could not verify those credentials.'));
                return;
            }

            // Verify password (supports both hashed and legacy plain passwords)
            let isValid = false;
            if (record.passwordHash) {
                // New hashed password
                isValid = await verifyPassword(password, record.passwordHash);
            } else if (record.password === password) {
                // Legacy plain password - hash it now
                isValid = true;
                const hashedPassword = await hashPassword(password);
                record.passwordHash = hashedPassword;
                delete record.password;
                upsertUserRecord(record);
            }

            if (!isValid) {
                reject(new Error('We could not verify those credentials.'));
                return;
            }

            const sessionUser = sanitizeUser(record);
            state.user = sessionUser;
            persistActiveUser();
            notify();
            resolve(state.user);
        });
    },
    signup(payload) {
        return new Promise(async (resolve, reject) => {
            const email = payload.email?.toString().trim().toLowerCase();
            const password = payload.password;

            if (!email || !password) {
                reject(new Error('Email and password are required.'));
                return;
            }

            if (state.users[email]) {
                reject(new Error('An account with this email already exists.'));
                return;
            }

            const name = payload.name?.toString().trim() || 'DoCare Member';

            // Hash the password
            const passwordHash = await hashPassword(password);

            const record = {
                id: createId(),
                name,
                email,
                passwordHash, // Store hashed password
                locale: payload.locale || 'en',
                avatarInitials: initialsFromName(name),
                profile: payload.profile || null,
                integrations: {
                    devices: [],
                    nutrition: null,
                },
                wellness: {
                    points: 0,
                    badges: [],
                    challenges: [],
                },
                billing: {
                    outstandingBalance: 0,
                    transactions: [],
                },
            };

            upsertUserRecord(record);

            const sessionUser = sanitizeUser(record);
            state.user = sessionUser;
            persistActiveUser();
            notify();
            resolve(state.user);
        });
    },
    updateActiveUser(updates) {
        if (!state.user) return;
        const nextUser = {
            ...state.user,
            ...updates,
        };
        state.user = nextUser;
        persistActiveUser();
        const existing = state.users[nextUser.email?.toLowerCase()];
        if (existing) {
            upsertUserRecord({
                ...existing,
                ...updates,
            });
        }
        notify();
    },
    logout() {
        state.user = null;
        persistActiveUser();
        notify();
    },
    onAuthChange(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};
