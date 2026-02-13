@echo off
echo ========================================
echo   Starting Expense Tracker (MongoDB)
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

echo Starting MongoDB server on port 3000...
echo.
echo IMPORTANT: Make sure MongoDB is running!
echo.
npm run start:mongodb

pause
