@echo off
echo ========================================
echo   Starting Expense Tracker (Legacy Mode)
echo ========================================
echo.

echo Checking for existing server on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Stopping old server (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting server on port 3000 (JSON file storage)...
echo.
echo NOTE: This uses JSON files instead of MongoDB
echo.
npm start

pause
