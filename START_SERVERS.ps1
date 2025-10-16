# DoCare Health Platform Startup Script
# PowerShell version for better control

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DoCare Health Platform" -ForegroundColor White
Write-Host "   Starting Backend + Frontend" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing processes
Write-Host "[Step 1/4] Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "python" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start Backend Server
Write-Host "[Step 2/4] Starting Backend Server (Port 5000)..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'DoCare Health Backend API' -ForegroundColor Green; Write-Host 'Running on http://localhost:5000' -ForegroundColor Cyan; Write-Host ''; node src/server.js" -WindowStyle Normal
Start-Sleep -Seconds 4

# Start Frontend Server
Write-Host "[Step 3/4] Starting Frontend Server (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host 'DoCare Health Frontend' -ForegroundColor Green; Write-Host 'Running on http://localhost:8000' -ForegroundColor Cyan; Write-Host ''; python -m http.server 8000" -WindowStyle Normal
Start-Sleep -Seconds 3

# Open Test Page
Write-Host "[Step 4/4] Opening Connection Test Page..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:8000/test-connection.html"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Services Started Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host " Backend API:  http://localhost:5000" -ForegroundColor Cyan
Write-Host " Frontend:     http://localhost:8000" -ForegroundColor Cyan
Write-Host " Test Page:    http://localhost:8000/test-connection.html" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Two PowerShell windows have opened:" -ForegroundColor White
Write-Host " 1. DoCare Backend  (Node.js on port 5000)" -ForegroundColor Gray
Write-Host " 2. DoCare Frontend (Python on port 8000)" -ForegroundColor Gray
Write-Host ""
Write-Host "Close those windows to stop the servers." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
