@echo off
echo Restarting Main Server...
echo.

echo Stopping old server...
taskkill /FI "WindowTitle eq Main App - Port 3000*" /T /F 2>nul
timeout /t 2 /nobreak >nul

echo Starting new server...
start "Main App - Port 3000" cmd /k "cd /d %~dp0 && echo ============================== && echo   MAIN APPLICATION (Port 3000) && echo ============================== && echo. && npm start"

echo.
echo Main server restarted!
echo Access at: http://localhost:3000/login.html
echo.
pause
