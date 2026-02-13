@echo off
echo Stopping all Expense Tracker servers...
echo.

taskkill /FI "WindowTitle eq Main App - Port 3000*" /T /F 2>nul
taskkill /FI "WindowTitle eq User Registration - Port 4000*" /T /F 2>nul
taskkill /FI "WindowTitle eq Admin Registration - Port 5000*" /T /F 2>nul

echo.
echo All servers stopped.
pause
