@echo off
echo ====================================
echo  DoCare Health - Starting Services
echo ====================================
echo.

REM Check if Python is available
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [1/2] Starting Frontend on http://localhost:8000
    start "DoCare Frontend" cmd /c "cd /d %~dp0 && python -m http.server 8000"
    timeout /t 2 >nul
) else (
    echo [!] Python not found. Using file:// protocol instead.
    echo [!] CORS may have issues. Install Python for better experience.
)

echo [2/2] Backend already running on http://localhost:5000
echo.
echo ====================================
echo  Services Status
echo ====================================
echo  Frontend: http://localhost:8000/test-connection.html
echo  Backend:  http://localhost:5000/health
echo ====================================
echo.
echo Opening test page in browser...
timeout /t 2 >nul

REM Try to open in browser
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    start http://localhost:8000/test-connection.html
) else (
    start test-connection.html
)

echo.
echo Press any key to stop services...
pause >nul

REM Kill Python HTTP server if started
taskkill /FI "WINDOWTITLE eq DoCare Frontend*" /F >nul 2>nul

echo Services stopped.
