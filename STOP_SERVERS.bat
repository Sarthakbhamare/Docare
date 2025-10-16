@echo off
echo ========================================
echo    DoCare Health Platform
echo    Stopping All Services
echo ========================================
echo.

echo Stopping Backend Server (Node.js)...
taskkill /F /IM node.exe >nul 2>&1

echo Stopping Frontend Server (Python)...
taskkill /F /IM python.exe >nul 2>&1

echo.
echo ========================================
echo  All Services Stopped Successfully!
echo ========================================
echo.
pause
