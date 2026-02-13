@echo off
echo ========================================
echo   Starting React Frontend (Vite)
echo ========================================
echo.

cd /d %~dp0

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting Vite dev server on port 5173...
echo.
npm run dev

pause
