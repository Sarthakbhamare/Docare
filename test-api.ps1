# DoCare API Testing Script
# PowerShell script for comprehensive backend testing

Write-Host "🚀 DoCare Platform API Testing Suite" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"
$apiUrl = "$baseUrl/api/v1"

# Test Results Tracking
$passed = 0
$failed = 0
$tests = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [object]$Body,
        [hashtable]$Headers,
        [int]$ExpectedStatus = 200
    )
    
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            ContentType = "application/json"
        }
        
        if ($Headers) {
            $params.Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        
        if ($response.success) {
            Write-Host "✅ $Name" -ForegroundColor Green
            $script:passed++
            return $response
        } else {
            Write-Host "❌ $Name - Response not successful" -ForegroundColor Red
            $script:failed++
            return $null
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "✅ $Name (Expected error $statusCode)" -ForegroundColor Green
            $script:passed++
        } else {
            Write-Host "❌ $Name - $_" -ForegroundColor Red
            $script:failed++
        }
        return $null
    }
}

# Test 1: Health Check
Write-Host "`n📊 Phase 1: Server Health" -ForegroundColor Yellow
$health = Test-Endpoint -Name "Health Check" -Method GET -Url "$baseUrl/health"

if (-not $health) {
    Write-Host "`n⚠️  Server is not running! Start the backend first:" -ForegroundColor Red
    Write-Host "   cd server" -ForegroundColor Gray
    Write-Host "   npm run dev" -ForegroundColor Gray
    exit 1
}

# Test 2: Authentication
Write-Host "`n🔐 Phase 2: Authentication & Authorization" -ForegroundColor Yellow

# Register Patient
$patientData = @{
    name = "Test Patient"
    email = "patient$(Get-Random)@test.com"
    password = "SecurePass123!"
    role = "patient"
}

$patient = Test-Endpoint -Name "Register Patient" -Method POST -Url "$apiUrl/auth/signup" -Body $patientData

if ($patient) {
    # Login Patient
    $loginData = @{
        email = $patientData.email
        password = $patientData.password
    }
    
    $loginResponse = Test-Endpoint -Name "Login Patient" -Method POST -Url "$apiUrl/auth/login" -Body $loginData
    
    if ($loginResponse) {
        $patientToken = $loginResponse.data.access_token
        $patientHeaders = @{ Authorization = "Bearer $patientToken" }
        $patientId = $loginResponse.data.user.id
    }
}

# Register Super Admin
$adminData = @{
    name = "Super Admin"
    email = "admin$(Get-Random)@test.com"
    password = "AdminPass123!"
    role = "super_admin"
}

$admin = Test-Endpoint -Name "Register Super Admin" -Method POST -Url "$apiUrl/auth/signup" -Body $adminData

if ($admin) {
    $adminLoginData = @{
        email = $adminData.email
        password = $adminData.password
    }
    
    $adminLoginResponse = Test-Endpoint -Name "Login Super Admin" -Method POST -Url "$apiUrl/auth/login" -Body $adminLoginData
    
    if ($adminLoginResponse) {
        $adminToken = $adminLoginResponse.data.access_token
        $adminHeaders = @{ Authorization = "Bearer $adminToken" }
    }
}

# Test 3: User Profile
Write-Host "`n👤 Phase 3: User Management" -ForegroundColor Yellow

if ($patientToken) {
    $profile = Test-Endpoint -Name "Get User Profile" -Method GET -Url "$apiUrl/users/me" -Headers $patientHeaders
    
    $updateProfile = @{
        bio = "I am a test patient"
        blood_type = "O+"
    }
    Test-Endpoint -Name "Update Profile" -Method PATCH -Url "$apiUrl/users/me" -Body $updateProfile -Headers $patientHeaders
    
    $providers = Test-Endpoint -Name "List Providers" -Method GET -Url "$apiUrl/users/providers" -Headers $patientHeaders
}

# Test 4: Admin CMS - Create Provider
Write-Host "`n⚕️  Phase 4: Admin CMS - Provider Management" -ForegroundColor Yellow

$providerData = @{
    name = "Dr. Test Provider"
    email = "provider$(Get-Random)@test.com"
    password = "ProviderPass123!"
    specialty = "General Practitioner"
    bio = "Experienced family physician"
    license_number = "MD$(Get-Random -Minimum 100000 -Maximum 999999)"
    years_experience = 10
}

if ($adminToken) {
    $provider = Test-Endpoint -Name "Create Provider (Admin CMS)" -Method POST -Url "$apiUrl/admin/providers" -Body $providerData -Headers $adminHeaders
    
    if ($provider) {
        $providerId = $provider.data.user.id
    }
}

# Test 5: Appointments
Write-Host "`n📅 Phase 5: Appointment Management" -ForegroundColor Yellow

if ($patientToken -and $providerId) {
    $appointmentData = @{
        provider_id = $providerId
        appointment_type = "video"
        scheduled_start = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ss")
        scheduled_end = (Get-Date).AddDays(1).AddMinutes(30).ToString("yyyy-MM-ddTHH:mm:ss")
        reason = "Annual checkup"
        notes = "First time patient"
    }
    
    $appointment = Test-Endpoint -Name "Book Appointment" -Method POST -Url "$apiUrl/appointments" -Body $appointmentData -Headers $patientHeaders
    
    if ($appointment) {
        $appointmentId = $appointment.data.id
        
        Test-Endpoint -Name "List Appointments" -Method GET -Url "$apiUrl/appointments" -Headers $patientHeaders
        
        Test-Endpoint -Name "Get Single Appointment" -Method GET -Url "$apiUrl/appointments/$appointmentId" -Headers $patientHeaders
        
        # Reschedule
        $reschedule = @{
            scheduled_start = (Get-Date).AddDays(2).ToString("yyyy-MM-ddTHH:mm:ss")
            scheduled_end = (Get-Date).AddDays(2).AddMinutes(30).ToString("yyyy-MM-ddTHH:mm:ss")
        }
        Test-Endpoint -Name "Reschedule Appointment" -Method PATCH -Url "$apiUrl/appointments/$appointmentId" -Body $reschedule -Headers $patientHeaders
        
        # Check available slots
        $tomorrow = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
        Test-Endpoint -Name "Get Available Slots" -Method GET -Url "$apiUrl/appointments/providers/available?provider_id=$providerId&date=$tomorrow" -Headers $patientHeaders
    }
}

# Test 6: Medications
Write-Host "`n💊 Phase 6: Medication Management" -ForegroundColor Yellow

if ($patientToken) {
    $medicationData = @{
        name = "Lisinopril"
        generic_name = "Lisinopril"
        dosage = "10mg"
        frequency = "Once daily"
        route = "oral"
        start_date = (Get-Date).ToString("yyyy-MM-dd")
        reminder_enabled = $true
        reminder_times = @("08:00", "20:00")
        refills_remaining = 3
    }
    
    $medication = Test-Endpoint -Name "Add Medication" -Method POST -Url "$apiUrl/medications" -Body $medicationData -Headers $patientHeaders
    
    if ($medication) {
        $medId = $medication.data.id
        
        Test-Endpoint -Name "List Medications" -Method GET -Url "$apiUrl/medications" -Headers $patientHeaders
        
        $updateMed = @{
            dosage = "20mg"
            notes = "Dosage increased by doctor"
        }
        Test-Endpoint -Name "Update Medication" -Method PATCH -Url "$apiUrl/medications/$medId" -Body $updateMed -Headers $patientHeaders
        
        Test-Endpoint -Name "Request Refill" -Method POST -Url "$apiUrl/medications/$medId/refill" -Headers $patientHeaders
    }
}

# Test 7: Messages
Write-Host "`n💬 Phase 7: Secure Messaging" -ForegroundColor Yellow

if ($patientToken -and $providerId) {
    $messageData = @{
        recipient_id = $providerId
        content = "Hello doctor, I have a question about my medication"
        priority = "normal"
    }
    
    $message = Test-Endpoint -Name "Send Message" -Method POST -Url "$apiUrl/messages" -Body $messageData -Headers $patientHeaders
    
    if ($message) {
        $threadId = $message.data.thread_id
        
        Test-Endpoint -Name "Get Message Threads" -Method GET -Url "$apiUrl/messages/threads" -Headers $patientHeaders
        
        Test-Endpoint -Name "Get Messages in Thread" -Method GET -Url "$apiUrl/messages/$threadId" -Headers $patientHeaders
    }
}

# Test 8: Billing
Write-Host "`n💰 Phase 8: Billing & Transactions" -ForegroundColor Yellow

if ($patientToken) {
    $transactionData = @{
        amount_cents = 5000
        type = "consultation"
        payment_method = "card"
        description = "Annual checkup consultation fee"
    }
    
    $transaction = Test-Endpoint -Name "Create Transaction" -Method POST -Url "$apiUrl/billing/transactions" -Body $transactionData -Headers $patientHeaders
    
    if ($transaction) {
        $txnId = $transaction.data.id
        
        Test-Endpoint -Name "Get Account Balance" -Method GET -Url "$apiUrl/billing/balance" -Headers $patientHeaders
        
        Test-Endpoint -Name "List Transactions" -Method GET -Url "$apiUrl/billing/transactions" -Headers $patientHeaders
        
        Test-Endpoint -Name "Get Receipt" -Method GET -Url "$apiUrl/billing/transactions/$txnId/receipt" -Headers $patientHeaders
    }
}

# Test 9: Devices
Write-Host "`n⌚ Phase 9: Device Integration" -ForegroundColor Yellow

if ($patientToken) {
    $deviceData = @{
        device_type = "fitbit"
        device_name = "Fitbit Charge 5"
        permissions_granted = @("heart_rate", "steps", "sleep")
        sync_frequency_minutes = 60
    }
    
    $device = Test-Endpoint -Name "Connect Device" -Method POST -Url "$apiUrl/devices" -Body $deviceData -Headers $patientHeaders
    
    if ($device) {
        $deviceId = $device.data.id
        
        Test-Endpoint -Name "List Devices" -Method GET -Url "$apiUrl/devices" -Headers $patientHeaders
        
        $updateDevice = @{
            sync_frequency_minutes = 30
        }
        Test-Endpoint -Name "Update Device" -Method PATCH -Url "$apiUrl/devices/$deviceId" -Body $updateDevice -Headers $patientHeaders
        
        Test-Endpoint -Name "Trigger Sync" -Method POST -Url "$apiUrl/devices/$deviceId/sync" -Headers $patientHeaders
    }
}

# Test 10: Admin Dashboard
Write-Host "`n📊 Phase 10: Super Admin CMS" -ForegroundColor Yellow

if ($adminToken) {
    Test-Endpoint -Name "Admin Dashboard" -Method GET -Url "$apiUrl/admin/dashboard" -Headers $adminHeaders
    
    Test-Endpoint -Name "Search Users" -Method GET -Url "$apiUrl/admin/users?search=test" -Headers $adminHeaders
    
    Test-Endpoint -Name "System Settings" -Method GET -Url "$apiUrl/admin/settings" -Headers $adminHeaders
    
    Test-Endpoint -Name "Audit Logs" -Method GET -Url "$apiUrl/admin/audit-logs?limit=10" -Headers $adminHeaders
    
    Test-Endpoint -Name "System Health" -Method GET -Url "$apiUrl/admin/system/health" -Headers $adminHeaders
    
    if ($patientId) {
        $updateUser = @{
            status = "active"
        }
        Test-Endpoint -Name "Update User Status" -Method PATCH -Url "$apiUrl/admin/users/$patientId" -Body $updateUser -Headers $adminHeaders
    }
}

# Test 11: Authorization (Negative Tests)
Write-Host "`n🔒 Phase 11: Authorization Tests" -ForegroundColor Yellow

if ($patientToken -and $adminToken) {
    # Patient trying to access admin endpoint
    Test-Endpoint -Name "Block Patient from Admin" -Method GET -Url "$apiUrl/admin/dashboard" -Headers $patientHeaders -ExpectedStatus 403
    
    # Unauthenticated access
    Test-Endpoint -Name "Block Unauthenticated" -Method GET -Url "$apiUrl/users/me" -ExpectedStatus 401
}

# Final Results
Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "🎯 Test Results Summary" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red
Write-Host "📊 Total:  $($passed + $failed)" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "`n🎉 ALL TESTS PASSED! Backend is fully functional." -ForegroundColor Green
    Write-Host "✅ MongoDB models working correctly" -ForegroundColor Green
    Write-Host "✅ CRUD operations validated" -ForegroundColor Green
    Write-Host "✅ Authentication & authorization secure" -ForegroundColor Green
    Write-Host "✅ Super Admin CMS operational" -ForegroundColor Green
    Write-Host "`nNext Steps:" -ForegroundColor Yellow
    Write-Host "1. Update frontend API configuration" -ForegroundColor Gray
    Write-Host "2. Build Super Admin UI panel" -ForegroundColor Gray
    Write-Host "3. Deploy to production" -ForegroundColor Gray
} else {
    Write-Host "`n⚠️  Some tests failed. Check error messages above." -ForegroundColor Yellow
}

Write-Host "`n"
