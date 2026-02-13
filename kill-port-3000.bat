@echo off
echo Killing process on port 3000...
echo.

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Found process: %%a
    taskkill /F /PID %%a
)

echo.
echo Done!
pause
