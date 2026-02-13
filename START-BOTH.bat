@echo off
echo ========================================
echo   Starting Full Stack Application
echo ========================================
echo.

echo [1/3] Killing any existing Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/3] Starting Backend Server (Port 3000)...
start "Backend - Port 3000" cmd /k "cd /d %~dp0 && npm start"
timeout /t 3 /nobreak >nul

echo [3/3] Starting React Frontend (Port 5173)...
start "Frontend - Port 5173" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo ========================================
echo   All Servers Started!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Press any key to open the frontend...
pause >nul

start http://localhost:5173

echo.
echo Servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
