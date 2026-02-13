@echo off
echo ========================================
echo   FORCE RESTART - Expense Tracker
echo ========================================
echo.

echo [1/3] Killing ALL Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/3] Verifying port 3000 is free...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Killing remaining process: %%a
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

echo [3/3] Starting MongoDB server...
echo.
echo Server starting... Press Ctrl+C to stop.
echo.
npm run start:mongodb
