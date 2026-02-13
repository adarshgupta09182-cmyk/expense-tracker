# Quick Start Guide

## Starting the Application

### Option 1: Automatic Startup (Recommended)
Simply double-click `start-all.bat`

This will:
- Check and install all dependencies automatically
- Start all three servers in order
- Open the login page in your browser

### Option 2: Manual Startup
```bash
# Terminal 1 - Main Application
npm start

# Terminal 2 - User Registration
cd user-registration
npm start

# Terminal 3 - Admin Registration
cd admin-registration
npm start
```

## Stopping the Application

### Option 1: Automatic Stop
Double-click `stop-all.bat`

### Option 2: Manual Stop
Close each terminal window or press `Ctrl+C` in each terminal

## Access Points

- **Main Login**: http://localhost:3000/login.html
- **User Registration**: http://localhost:4000
- **Admin Registration**: http://localhost:5000 (Keep this URL private!)

## First Time Setup

1. Run `start-all.bat`
2. Register an admin at http://localhost:5000
3. Register users at http://localhost:4000
4. Login at http://localhost:3000/login.html

## Troubleshooting

**Port already in use?**
- Run `stop-all.bat` to close any existing servers
- Or manually close the terminal windows

**Registration failing?**
- Make sure the main server (port 3000) is running first
- Check that all three terminal windows are open and showing "running at http://localhost:XXXX"

**Can't connect?**
- Wait 5-10 seconds after starting for all servers to initialize
- Refresh your browser page
