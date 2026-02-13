@echo off
echo ========================================
echo   Expense Tracker System Startup
echo ========================================
echo.

echo [1/4] Checking dependencies...
if not exist "node_modules" (
    echo Installing main app dependencies...
    call npm install
)

if not exist "user-registration\node_modules" (
    echo Installing user registration dependencies...
    cd user-registration
    call npm install
    cd ..
)

if not exist "admin-registration\node_modules" (
    echo Installing admin registration dependencies...
    cd admin-registration
    call npm install
    cd ..
)

echo.
echo [2/4] Starting Main Application Server (Port 3000)...
start "Main App - Port 3000" cmd /k "cd /d %~dp0 && echo ============================== && echo   MAIN APPLICATION (Port 3000) && echo ============================== && echo. && npm start"
timeout /t 3 /nobreak >nul

echo [3/4] Starting User Registration Portal (Port 4000)...
start "User Registration - Port 4000" cmd /k "cd /d %~dp0user-registration && echo ============================== && echo   USER REGISTRATION (Port 4000) && echo ============================== && echo. && npm start"
timeout /t 2 /nobreak >nul

echo [4/4] Starting Admin Registration Portal (Port 5000)...
start "Admin Registration - Port 5000" cmd /k "cd /d %~dp0admin-registration && echo ============================== && echo   ADMIN REGISTRATION (Port 5000) && echo ============================== && echo. && npm start"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   All Servers Started Successfully!
echo ========================================
echo.
echo Access Points:
echo   - Main Login:          http://localhost:3000/login.html
echo   - User Registration:   http://localhost:4000
echo   - Admin Registration:  http://localhost:5000
echo.
echo Press any key to open the login page in your browser...
pause >nul

start http://localhost:3000/login.html

echo.
echo Servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
