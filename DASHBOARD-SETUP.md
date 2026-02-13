# Dashboard Setup Guide

## If you see a white page:

### Step 1: Clear and Reinstall Dependencies
```bash
cd client
rm -r node_modules package-lock.json
npm install
```

### Step 2: Clear Browser Cache
- Press `Ctrl+Shift+Delete` (or Cmd+Shift+Delete on Mac)
- Clear all cache
- Or use Incognito/Private mode

### Step 3: Restart Vite Dev Server
```bash
cd client
npm run dev
```

### Step 4: Check Browser Console
- Press `F12` to open Developer Tools
- Go to Console tab
- Look for any red error messages
- Share the error if you see one

## Complete Fresh Start

If still not working, do a complete restart:

### Terminal 1 - Backend:
```bash
npm start
```

### Terminal 2 - Frontend:
```bash
cd client
npm install
npm run dev
```

### Then access:
- http://localhost:5173/login
- Login with your credentials
- You should see the dashboard

## Troubleshooting

**Issue: "Cannot find module 'chart.js'"**
Solution:
```bash
cd client
npm install chart.js react-chartjs-2
```

**Issue: "React Router not working"**
Solution:
```bash
cd client
npm install react-router-dom
```

**Issue: "Axios not found"**
Solution:
```bash
cd client
npm install axios
```

## Verify Installation

Check if all dependencies are installed:
```bash
cd client
npm list chart.js react-chartjs-2 axios react-router-dom
```

All should show versions without errors.

## Port Issues

Make sure:
- Backend runs on: http://localhost:3000
- Frontend runs on: http://localhost:5173

If ports are in use:
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Then restart
```

## Still Not Working?

1. Check terminal for error messages
2. Open browser DevTools (F12)
3. Check Console tab for errors
4. Check Network tab to see if API calls work
5. Try accessing http://localhost:5173 directly

## Quick Commands

```bash
# Install everything fresh
cd client && npm install && npm run dev

# Or use the batch file
double-click START-BOTH.bat
```
