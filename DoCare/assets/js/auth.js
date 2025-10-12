const STORAGE_KEY = 'docare.auth';
const USERS_KEY = 'docare.auth.users';

const listeners = new Set();

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
    const { password, ...rest } = userRecord;
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
        return new Promise((resolve, reject) => {
            if (!email || !password) {
                reject(new Error('Email and password are required.'));
                return;
            }

            const normalizedEmail = email.toString().trim().toLowerCase();
            const users = state.users || {};
            const record = users[normalizedEmail];

            if (!record || record.password !== password) {
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
        return new Promise((resolve, reject) => {
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

            const record = {
                id: createId(),
                name,
                email,
                password,
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
