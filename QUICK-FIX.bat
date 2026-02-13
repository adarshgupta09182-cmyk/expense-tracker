@echo off
echo ========================================
echo   Quick Fix - Dashboard White Page
echo ========================================
echo.

echo [1/4] Killing all Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/4] Clearing client node_modules...
cd /d %~dp0client
if exist node_modules (
    rmdir /s /q node_modules >nul 2>&1
)
if exist package-lock.json (
    del package-lock.json >nul 2>&1
)

echo [3/4] Installing dependencies...
call npm install

echo [4/4] Starting servers...
echo.
echo Starting Backend (Port 3000)...
start "Backend" cmd /k "cd /d %~dp0 && npm start"
timeout /t 3 /nobreak >nul

echo Starting Frontend (Port 5173)...
start "Frontend" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo.
echo Wait 10 seconds, then:
echo 1. Open http://localhost:5173/login
echo 2. Login with your credentials
echo 3. Dashboard should load
echo.
timeout /t 10 /nobreak >nul
start http://localhost:5173/login

pause
