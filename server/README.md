# DoCare Health - Backend API

## 🏥 HIPAA-Compliant Healthcare Backend Infrastructure

This is the secure backend server for DoCare Health, a comprehensive telehealth platform. Built with enterprise-grade security, HIPAA compliance, and real-time communication capabilities.

## 🔒 Security & Compliance Features

### ✅ HIPAA Compliance
- **PHI Encryption**: All Protected Health Information is encrypted at rest using AES-256-GCM
- **Audit Logging**: Complete audit trail for all PHI access and modifications
- **Access Controls**: Role-based access control (RBAC) with granular permissions
- **Data Retention**: Configurable retention policies for medical records
- **Breach Notification**: Automated breach detection and notification system

### 🛡️ Security Hardening
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Multi-Factor Authentication (MFA)**: TOTP, SMS, and email-based 2FA
- **Rate Limiting**: Protection against brute force and DDoS attacks
- **Helmet.js**: Security headers and XSS protection
- **CORS**: Strict cross-origin resource sharing policies
- **Input Validation**: Comprehensive request validation and sanitization

## 🏗️ Architecture

```
server/
├── src/
│   ├── server.js                 # Express application entry point
│   ├── database/
│   │   ├── connection.js         # PostgreSQL connection with Sequelize
│   │   └── models/               # Database models
│   │       ├── User.js           # User authentication
│   │       ├── UserProfile.js    # Patient health information (PHI)
│   │       ├── Appointment.js    # Appointments & consultations
│   │       ├── Medication.js     # Medication tracking
│   │       ├── Document.js       # Encrypted document storage
│   │       ├── Message.js        # Secure messaging
│   │       ├── Transaction.js    # Billing & payments
│   │       ├── Device.js         # Wearable device integrations
│   │       ├── AuditLog.js       # HIPAA audit trail
│   │       ├── RefreshToken.js   # JWT refresh tokens
│   │       └── MFAToken.js       # Two-factor authentication
│   ├── routes/                   # API endpoints
│   │   ├── auth.js               # Authentication (signup, login, MFA)
│   │   ├── users.js              # User management
│   │   ├── appointments.js       # Appointment scheduling
│   │   ├── medications.js        # Medication tracking
│   │   ├── documents.js          # Document upload/download
│   │   ├── messages.js           # Patient-provider messaging
│   │   ├── emergency.js          # Emergency SOS
│   │   ├── billing.js            # Payment processing
│   │   ├── devices.js            # Device integration
│   │   └── video.js              # Video consultations (Twilio)
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── rateLimiter.js        # Rate limiting
│   │   ├── auditLogger.js        # Audit trail middleware
│   │   ├── errorHandler.js       # Centralized error handling
│   │   └── validator.js          # Request validation
│   ├── utils/
│   │   ├── encryption.js         # AES-256-GCM encryption
│   │   ├── jwt.js                # JWT token utilities
│   │   └── logger.js             # Winston logging
│   └── websocket/
│       └── index.js              # Socket.IO real-time messaging
├── .env.example                  # Environment variables template
├── .gitignore
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 14.0
- **npm** >= 9.0.0

### Installation

1. **Clone the repository**
```bash
cd server
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Database credentials
- JWT secrets (minimum 32 characters)
- Encryption keys (32 bytes hex)
- AWS S3 credentials (for document storage)
- Twilio credentials (for video calls)
- SMTP settings (for email)

4. **Set up PostgreSQL database**
```bash
# Create database
createdb docare_health

# Run migrations (creates tables)
npm run migrate
```

5. **Start the development server**
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout and revoke tokens
- `POST /api/v1/auth/mfa/enable` - Enable two-factor authentication
- `POST /api/v1/auth/mfa/verify` - Verify MFA code

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/me` - Update user profile
- `DELETE /api/v1/users/me` - Delete account

### Appointments
- `GET /api/v1/appointments` - List appointments
- `POST /api/v1/appointments` - Schedule appointment
- `GET /api/v1/appointments/:id` - Get appointment details
- `PATCH /api/v1/appointments/:id` - Reschedule appointment
- `DELETE /api/v1/appointments/:id` - Cancel appointment

### Documents
- `GET /api/v1/documents` - List documents
- `POST /api/v1/documents` - Upload encrypted document
- `GET /api/v1/documents/:id` - Download document
- `DELETE /api/v1/documents/:id` - Delete document

### Messages
- `GET /api/v1/messages/threads` - List conversation threads
- `GET /api/v1/messages/threads/:id` - Get thread messages
- `POST /api/v1/messages` - Send message
- `PATCH /api/v1/messages/:id/read` - Mark as read

### Real-Time (WebSocket)
- `message:send` - Send real-time message
- `message:received` - Receive message event
- `typing:start` - User typing indicator
- `presence:update` - Online/offline status

## 🔐 Security Best Practices

### JWT Token Management
- Access tokens expire in **15 minutes**
- Refresh tokens expire in **7 days**
- Refresh token rotation on every use
- Tokens stored securely in httpOnly cookies (recommended)

### Password Security
- Minimum 8 characters
- Hashed with bcrypt (12 rounds)
- Account lockout after 5 failed attempts (30 minutes)
- Password change invalidates all tokens

### PHI Encryption
- All PHI fields encrypted with AES-256-GCM
- Unique IV per encryption
- Encryption keys rotated regularly
- Keys stored in environment variables (not in code)

### Audit Logging
- Every API request logged with user, action, timestamp
- Logs include IP address, user agent, request ID
- Audit logs are **immutable** (cannot be deleted)
- Retained for minimum 2555 days (HIPAA requirement)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong, random JWT secrets (min 32 chars)
3. Generate secure encryption keys: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. Enable database SSL
5. Configure AWS S3 for document storage
6. Set up Redis for session management (optional)
7. Configure monitoring (Sentry, New Relic)

### Database Migrations
```bash
npm run migrate
```

### Running in Production
```bash
npm start
```

### Health Check
```
GET /health
```
Returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T12:00:00.000Z",
  "environment": "production",
  "uptime": 3600
}
```

## 📊 Database Schema

### Core Tables
- **users** - Authentication and account data
- **user_profiles** - PHI and health information (encrypted)
- **appointments** - Scheduling and consultations
- **medications** - Medication tracking
- **documents** - Encrypted file metadata
- **messages** - Secure messaging (encrypted)
- **transactions** - Billing and payments
- **devices** - Wearable device integrations
- **audit_logs** - HIPAA audit trail
- **refresh_tokens** - JWT token management
- **mfa_tokens** - Two-factor authentication

## 🔧 Configuration

### Rate Limiting
- General API: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- Uploads: 20 per hour
- Sensitive operations: 10 per hour

### File Uploads
- Maximum file size: 10 MB
- Allowed types: PDF, JPG, PNG
- Virus scanning before storage
- Files encrypted before S3 upload

## 🐛 Troubleshooting

### Database Connection Error
```
Error: Unable to connect to database
```
**Solution**: Check PostgreSQL is running and credentials in `.env` are correct

### JWT Secret Not Defined
```
Error: JWT secrets must be defined
```
**Solution**: Set `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env`

### Encryption Key Error
```
Error: ENCRYPTION_KEY must be 32 bytes
```
**Solution**: Generate a 64-character hex key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 📝 License

Proprietary - DoCare Health

## 🤝 Contributing

This is a proprietary healthcare application. Contributions are managed internally.

## 📞 Support

For issues or questions:
- Email: security@docare.health (security issues)
- Email: compliance@docare.health (HIPAA compliance)
- Email: support@docare.health (general support)

---

**Built with ❤️ for secure, accessible healthcare**
