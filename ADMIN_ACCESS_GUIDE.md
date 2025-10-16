# 🔐 Admin Access Guide - DoCare Health Platform

## Quick Start

### 1. Access the Admin Page
Open in your browser:
```
http://localhost:8000/admin.html
```

### 2. Backend Requirements
Make sure your backend server is running:
```powershell
cd e:\DoCare\server
node src/server.js
```

## Creating Super Admin Account

### Option A: Using PowerShell

```powershell
# Create Super Admin Account
$adminBody = @{
    name = "Super Administrator"
    email = "admin@docare.com"
    password = "AdminPass123!"
    role = "super_admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/signup" `
    -Method POST `
    -ContentType "application/json" `
    -Body $adminBody
```

### Option B: Using cURL

```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Administrator",
    "email": "admin@docare.com",
    "password": "AdminPass123!",
    "role": "super_admin"
  }'
```

### Option C: Using Postman/Insomnia

**Endpoint:** `POST http://localhost:5000/api/v1/auth/signup`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Super Administrator",
  "email": "admin@docare.com",
  "password": "AdminPass123!",
  "role": "super_admin"
}
```

## Logging In as Admin

### Step 1: Get Your Admin Token

```powershell
# PowerShell - Login
$loginBody = @{
    email = "admin@docare.com"
    password = "AdminPass123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

# Save your token
$token = $response.data.access_token
Write-Host "Your Admin Token: $token"
```

### Step 2: Use the Token for Admin Operations

```powershell
# Set authorization header
$headers = @{
    Authorization = "Bearer $token"
}

# Example: Get dashboard metrics
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/admin/dashboard" `
    -Method GET `
    -Headers $headers
```

## Available Admin Endpoints

### 📊 Dashboard
```http
GET /api/v1/admin/dashboard
Authorization: Bearer YOUR_TOKEN
```
**Returns:** System metrics (users, appointments, revenue, activity)

### 👥 User Management
```http
# Search/List Users
GET /api/v1/admin/users?search=john&role=patient&page=1&limit=20
Authorization: Bearer YOUR_TOKEN

# Update User
PATCH /api/v1/admin/users/:userId
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "verified": true,
  "role": "provider"
}

# Delete User
DELETE /api/v1/admin/users/:userId
Authorization: Bearer YOUR_TOKEN
```

### 👨‍⚕️ Provider Management
```http
# Create Provider Account
POST /api/v1/admin/providers
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Dr. John Smith",
  "email": "dr.smith@docare.com",
  "password": "SecurePass123!",
  "specialty": "Cardiology",
  "license": "MD-123456",
  "phone": "+1234567890"
}

# List Providers
GET /api/v1/admin/providers?specialty=Cardiology&status=active
Authorization: Bearer YOUR_TOKEN

# Update Provider
PATCH /api/v1/admin/providers/:providerId
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "verified": true,
  "specialties": ["Cardiology", "Internal Medicine"]
}
```

### 📝 Audit Logs
```http
GET /api/v1/admin/audit-logs?action=login&userId=xxx&startDate=2024-01-01&page=1
Authorization: Bearer YOUR_TOKEN
```
**Returns:** Immutable audit trail (HIPAA compliance)

### ⚙️ System Settings
```http
# Get Settings
GET /api/v1/admin/settings
Authorization: Bearer YOUR_TOKEN

# Update Settings
PUT /api/v1/admin/settings
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "maxAppointmentsPerDay": 16,
  "defaultAppointmentDuration": 30,
  "emergencyThreshold": 8
}
```

### 📚 Library Management
```http
# Get Library Stats
GET /api/v1/admin/library/stats
Authorization: Bearer YOUR_TOKEN

# Manage Articles
GET /api/v1/admin/library/articles?category=covid&status=draft
POST /api/v1/admin/library/articles
PATCH /api/v1/admin/library/articles/:articleId
DELETE /api/v1/admin/library/articles/:articleId
```

### 🏥 System Health
```http
GET /api/v1/admin/system/health
Authorization: Bearer YOUR_TOKEN
```
**Returns:** Database status, server uptime, API response times, error rates

## Default Test Credentials

**Note:** These are documented in `server/docs/BACKEND_COMPLETION_REPORT.md`

### Super Admin
```
Email: admin@docare.com
Password: AdminPass123!
Role: super_admin
```

### Test Provider
```
Email: dr.smith@docare.com
Password: Provider123!
Role: provider
```

### Test Patient
```
Email: john.doe@example.com
Password: SecurePass123!
Role: patient
```

## Security Notes

### 🔒 HIPAA Compliance
- All admin actions are immutably logged in audit trails
- PHI access is tracked and reported
- Encryption at rest (AES-256) and in transit (TLS)
- Multi-factor authentication enabled (TOTP)

### 🛡️ Access Control
- Only users with `role: "super_admin"` can access admin endpoints
- JWT tokens expire after 15 minutes (access) and 7 days (refresh)
- Failed login attempts are rate-limited
- IP-based access control available in production

### 🔑 Token Management
```powershell
# Refresh your token (when expired)
$refreshBody = @{
    refreshToken = $response.data.refresh_token
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/refresh-token" `
    -Method POST `
    -ContentType "application/json" `
    -Body $refreshBody
```

## Admin Page Features

### 📊 Dashboard Tab
- Real-time system metrics
- User/provider/appointment counts
- Revenue tracking
- Recent activity feed

### 👥 Users Tab
- Search and filter users
- View user details
- Update roles and permissions
- Deactivate/delete accounts

### 👨‍⚕️ Providers Tab
- Create provider accounts
- Manage specialties and licenses
- Verify credentials
- Approve/reject applications

### 📝 Audit Logs Tab
- View all system actions
- Filter by user, action, date
- Export compliance reports
- HIPAA audit trail

### ⚙️ Settings Tab
- Configure system parameters
- Manage appointment settings
- Set emergency thresholds
- Control file upload limits

### 🔑 Access Guide Tab
- Step-by-step instructions
- Code examples
- API documentation
- Troubleshooting tips

## Troubleshooting

### Backend Not Connected
```powershell
# Check if backend is running
curl http://localhost:5000/health

# If not running, start it
cd e:\DoCare\server
node src/server.js
```

### Authentication Failed
```powershell
# Verify your credentials
$loginBody = @{
    email = "admin@docare.com"
    password = "AdminPass123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

# Check response
$response.data
```

### Token Expired
```powershell
# Use refresh token to get new access token
$refreshBody = @{
    refreshToken = "YOUR_REFRESH_TOKEN"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/refresh-token" `
    -Method POST `
    -ContentType "application/json" `
    -Body $refreshBody
```

### CORS Errors
The backend is configured to allow all origins in development mode:
```javascript
// server/src/server.js
cors({ origin: NODE_ENV === 'development' ? '*' : process.env.CORS_ORIGIN })
```

If you still see CORS errors, make sure:
1. Backend server is running
2. You're accessing via HTTP server (not file://)
3. Port 5000 is not blocked by firewall

## Next Steps

### Building Web-Based Admin Dashboard
To fully integrate the admin page with backend APIs:

1. **Create Admin Authentication Module**
   ```javascript
   // assets/js/pages/admin-auth.js
   class AdminAuth {
     async login(email, password) { /* ... */ }
     async getToken() { /* ... */ }
     async refreshToken() { /* ... */ }
     isAuthenticated() { /* ... */ }
   }
   ```

2. **Create Admin Dashboard Components**
   ```javascript
   // assets/js/pages/admin-dashboard.js
   class AdminDashboard {
     async loadMetrics() { /* ... */ }
     async loadUsers() { /* ... */ }
     async createProvider() { /* ... */ }
   }
   ```

3. **Add Route in App**
   ```javascript
   // app.js or home.js
   routes: {
     '/admin': AdminDashboardPage,
     '/admin/login': AdminLoginPage
   }
   ```

4. **Implement Real-Time Updates**
   ```javascript
   // Use WebSocket for live dashboard updates
   socket.on('system:metrics', (data) => {
     updateDashboard(data);
   });
   ```

## Support

For questions or issues:
1. Check `server/docs/BACKEND_COMPLETION_REPORT.md`
2. Review `COMPREHENSIVE_FEATURE_AUDIT.md`
3. Check backend logs: `server/logs/`
4. Review API documentation: `server/docs/API_DOCUMENTATION.md`

---

**Last Updated:** 2024
**Version:** 1.0.0
**Platform:** DoCare Health - Super Admin CMS
