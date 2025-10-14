# 🚀 MongoDB Quick Start Guide

## Database Converted: PostgreSQL → MongoDB

Your backend has been converted from PostgreSQL/Sequelize to MongoDB/Mongoose.

---

## 📥 Installation Options

### Option 1: MongoDB Locally (Windows)

1. **Download MongoDB Community Server**
   ```
   https://www.mongodb.com/try/download/community
   ```

2. **Install MongoDB**
   - Run the installer (MSI file)
   - Choose "Complete" installation
   - Install as Windows Service (recommended)
   - Install MongoDB Compass (GUI tool)

3. **Verify Installation**
   ```powershell
   mongod --version
   ```

4. **Start MongoDB** (if not running as service)
   ```powershell
   mongod --dbpath="C:\data\db"
   ```

### Option 2: MongoDB Atlas (Cloud) - Recommended

1. **Create Free Account**
   ```
   https://www.mongodb.com/cloud/atlas/register
   ```

2. **Create Cluster**
   - Choose FREE M0 cluster
   - Select region (closest to you)
   - Cluster name: `DoCare-Health`

3. **Setup Access**
   - Add IP Address: `0.0.0.0/0` (allow all - for development)
   - Create Database User: username + password
   - Save credentials securely!

4. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy MongoDB URI
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/docare_health`

5. **Update `.env`**
   ```
   MONGODB_URI=mongodb+srv://youruser:yourpass@cluster.mongodb.net/docare_health?retryWrites=true&w=majority
   ```

### Option 3: Docker (Quick & Easy)

```powershell
docker run -d `
  --name mongodb `
  -p 27017:27017 `
  -e MONGO_INITDB_ROOT_USERNAME=admin `
  -e MONGO_INITDB_ROOT_PASSWORD=password123 `
  -v mongodb_data:/data/db `
  mongo:latest
```

Connection string:
```
MONGODB_URI=mongodb://admin:password123@localhost:27017/docare_health?authSource=admin
```

---

## ⚙️ Backend Setup

### 1. Install Dependencies

```powershell
cd E:\DoCare\server
npm install
```

### 2. Configure Environment

```powershell
cp .env.example .env
```

**Edit `.env` file:**
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/docare_health
# OR for Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/docare_health

# JWT Secrets (generate secure random strings)
JWT_ACCESS_SECRET=your_super_secure_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_min_32_chars

# Encryption Key (64 hex characters)
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Server
PORT=5000
NODE_ENV=development
```

### 3. Generate Secure Secrets

```powershell
# Generate JWT secrets (PowerShell)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Run this twice - once for ACCESS, once for REFRESH secret
```

### 4. Start Server

```powershell
npm run dev
```

**Expected Output:**
```
✅ MongoDB connection established successfully
📊 MongoDB models registered successfully
🚀 Server listening on port 5000
```

---

## 🧪 Test the API

### Test Health Endpoint

```powershell
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T10:30:00.000Z",
  "database": "connected"
}
```

### Test User Signup

```powershell
$body = @{
    email = "test@docare.com"
    password = "SecurePass123!"
    name = "Test User"
} | ConvertTo-Json

curl -Method POST `
  -Uri "http://localhost:5000/api/v1/auth/signup" `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "6720a1b2c3d4e5f6a7b8c9d0",
      "email": "test@docare.com",
      "name": "Test User",
      "role": "patient"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

### Test User Login

```powershell
$loginBody = @{
    email = "test@docare.com"
    password = "SecurePass123!"
} | ConvertTo-Json

curl -Method POST `
  -Uri "http://localhost:5000/api/v1/auth/login" `
  -ContentType "application/json" `
  -Body $loginBody
```

---

## 🔍 MongoDB GUI Tools

### MongoDB Compass (Official)
- Comes with MongoDB installation
- Visual query builder
- Performance insights
- Schema analyzer

### Studio 3T (Advanced)
```
https://studio3t.com/download/
```
- SQL-like queries
- Data import/export
- Visual aggregation pipeline

### MongoDB VS Code Extension
1. Install extension: `mongodb.mongodb-vscode`
2. Connect: Click MongoDB icon in sidebar
3. Connection string: `mongodb://localhost:27017`

---

## 📊 View Your Data

### Using MongoDB Compass

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Select database: `docare_health`
4. Browse collections:
   - `users` - User accounts
   - `userprofiles` - Patient health data
   - `appointments` - Scheduled appointments
   - `medications` - Medication tracking
   - `documents` - File metadata
   - `messages` - Secure messaging
   - `auditlogs` - HIPAA audit trail

### Using MongoDB Shell

```powershell
mongosh mongodb://localhost:27017/docare_health
```

**Useful Commands:**
```javascript
// Show all users
db.users.find().pretty()

// Count users
db.users.countDocuments()

// Find specific user
db.users.findOne({ email: "test@docare.com" })

// Show recent audit logs
db.auditlogs.find().sort({ createdAt: -1 }).limit(10).pretty()

// Clear all data (CAREFUL!)
db.users.deleteMany({})
```

---

## 🎨 Key Differences: PostgreSQL vs MongoDB

### ID Format
| PostgreSQL | MongoDB |
|------------|---------|
| UUID (36 chars) | ObjectId (24 chars) |
| `550e8400-e29b-41d4-a716-446655440000` | `6720a1b2c3d4e5f6a7b8c9d0` |

### Timestamps
| PostgreSQL (Sequelize) | MongoDB (Mongoose) |
|------------------------|---------------------|
| `created_at`, `updated_at` | `createdAt`, `updatedAt` |
| Snake case | Camel case |

### Relationships
| PostgreSQL | MongoDB |
|------------|---------|
| Foreign keys with CASCADE | ObjectId references |
| `user_id UUID REFERENCES users(id)` | `user_id: ObjectId ref: 'User'` |

### Queries
```javascript
// PostgreSQL/Sequelize
User.findOne({ where: { email: 'test@test.com' } })
User.findAll({ where: { role: 'patient' }, limit: 10 })

// MongoDB/Mongoose
User.findOne({ email: 'test@test.com' })
User.find({ role: 'patient' }).limit(10)
```

---

## ✅ Model Conversion Status

| Model | Status | Features |
|-------|--------|----------|
| ✅ User | Converted | bcrypt hashing, MFA, account locking |
| ✅ UserProfile | Converted | Encrypted PHI fields |
| ✅ Appointment | Converted | Video rooms, scheduling |
| ⏳ Medication | Pending | Prescription tracking |
| ⏳ Document | Pending | Encrypted file metadata |
| ⏳ Message | Pending | Encrypted messaging |
| ⏳ EmergencyContact | Pending | Encrypted phone |
| ⏳ Transaction | Pending | Billing/payments |
| ⏳ Device | Pending | Wearable integration |
| ⏳ AuditLog | Pending | Immutable HIPAA logs |
| ⏳ RefreshToken | Pending | JWT rotation |
| ⏳ MFAToken | Pending | 2FA codes |

**Note:** All Mongoose model schemas are ready in `ALL_MONGOOSE_MODELS.js`.  
Copy each section to the respective model file to complete conversion.

---

## 🐛 Troubleshooting

### Error: "MongoServerError: Authentication failed"
**Solution:** Check MongoDB connection string username/password

### Error: "MongooseServerSelectionError: connect ECONNREFUSED"
**Solution:** 
- MongoDB not running: `mongod --dbpath="C:\data\db"`
- Or check if MongoDB service is running: `services.msc`

### Error: "Illegal arguments: undefined, string"
**Solution:** Check ENCRYPTION_KEY is set in `.env` and is 64 hex characters

### Port 5000 already in use
**Solution:** Change PORT in `.env` or kill process:
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
```

### Cannot find module 'mongoose'
**Solution:** Run `npm install` in server directory

---

## 📚 Next Steps

1. ✅ **Complete Model Conversion**
   - Copy remaining models from `ALL_MONGOOSE_MODELS.js`
   - Update 9 remaining model files

2. 🔄 **Update Route Handlers**
   - Replace Sequelize queries with Mongoose
   - Update `src/routes/*.js` files

3. 🧪 **Test All Endpoints**
   - Test authentication flow
   - Test CRUD operations
   - Test WebSocket connections

4. 🚀 **Deploy to Production**
   - Set up MongoDB Atlas production cluster
   - Configure environment variables
   - Deploy to cloud (Heroku, AWS, Azure)

---

## 📖 Resources

- **MongoDB Docs:** https://www.mongodb.com/docs/
- **Mongoose Docs:** https://mongoosejs.com/docs/
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **HIPAA on MongoDB:** https://www.mongodb.com/solutions/hipaa

---

**Need Help?** Check `server/README.md` for detailed API documentation!
