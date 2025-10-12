export const providers = [
    {
        id: 'pcp-001',
        name: 'Dr. Anika Patel',
        specialty: 'Primary Care Physician',
        nextAvailable: 'Next available today · 3:00 PM',
    },
    {
        id: 'ther-002',
        name: 'Taylor Morgan, LCSW',
        specialty: 'Behavioral Health Therapist',
        nextAvailable: 'Next available tomorrow · 11:30 AM',
    },
    {
        id: 'pharm-003',
        name: 'Jordan Kim, PharmD',
        specialty: 'Pharmacist',
        nextAvailable: 'Replies within 2 hours',
    },
];

export const initialThreads = {
    'pcp-001': [
        { id: 'm-1', sender: 'provider', text: 'Hi Jordan, your lab results look stable. Let me know if you have questions.', timestamp: 'Yesterday · 5:42 PM' },
        { id: 'm-2', sender: 'user', text: 'Thanks Dr. Patel! Feeling good today.', timestamp: 'Yesterday · 6:10 PM' },
    ],
    'ther-002': [
        { id: 'm-3', sender: 'provider', text: 'Remember to log your mood today. I’ll review before our session.', timestamp: 'Today · 9:00 AM' },
    ],
    'pharm-003': [
        { id: 'm-4', sender: 'provider', text: 'Your refill is ready for pickup. Need it delivered?', timestamp: 'Today · 7:45 AM' },
    ],
};
