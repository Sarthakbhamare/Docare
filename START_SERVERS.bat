@echo off
cls
echo ========================================
echo    DoCare Health Platform
echo    Starting Backend + Frontend
echo ========================================
echo.

REM Kill any existing processes
echo [Step 1/4] Cleaning up existing processes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Start Backend Server
echo [Step 2/4] Starting Backend Server (Port 5000)...
start "DoCare Backend" cmd /k "cd /d %~dp0server && echo Starting DoCare Health API... && node src/server.js"
timeout /t 3 /nobreak >nul

REM Start Frontend Server
echo [Step 3/4] Starting Frontend Server (Port 8000)...
start "DoCare Frontend" cmd /k "cd /d %~dp0 && echo Starting Frontend Web Server... && python -m http.server 8000"
timeout /t 2 /nobreak >nul

REM Open Test Page
echo [Step 4/4] Opening Connection Test Page...
timeout /t 2 /nobreak >nul
start http://localhost:8000/test-connection.html

echo.
echo ========================================
echo  Services Started Successfully!
echo ========================================
echo  Backend API:  http://localhost:5000
echo  Frontend:     http://localhost:8000
echo  Test Page:    http://localhost:8000/test-connection.html
echo ========================================
echo.
echo Two terminal windows have opened:
echo  1. DoCare Backend  (Node.js on port 5000)
echo  2. DoCare Frontend (Python on port 8000)
echo.
echo Close those windows to stop the servers.
echo.
pause
