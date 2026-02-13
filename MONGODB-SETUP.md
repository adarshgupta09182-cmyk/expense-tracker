# MongoDB Setup Guide

## Error: "Operation buffering timed out"

This error means MongoDB is not running or not accessible.

## Solutions

### Option 1: Use Legacy Mode (No MongoDB Required)

Run the application without MongoDB using JSON file storage:

```bash
npm start
```

Or double-click: `start.bat`

This mode stores data in local JSON files instead of MongoDB.

### Option 2: Install and Run MongoDB Locally

#### Windows:

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Download the Windows MSI installer
   - Install with default settings

2. **Start MongoDB Service**
   ```bash
   # Option A: Start as Windows Service (if installed as service)
   net start MongoDB
   
   # Option B: Run manually
   "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
   ```

3. **Create data directory** (if running manually)
   ```bash
   mkdir C:\data\db
   ```

4. **Start the application**
   ```bash
   npm run start:mongodb
   ```

#### Verify MongoDB is Running:

```bash
# Check if MongoDB is listening on port 27017
netstat -ano | findstr :27017
```

### Option 3: Use MongoDB Atlas (Cloud)

1. **Create free account**: https://www.mongodb.com/cloud/atlas/register

2. **Create a cluster** (free tier available)

3. **Get connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

4. **Update .env file**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker?retryWrites=true&w=majority
   ```
   Replace `username`, `password`, and `cluster` with your values

5. **Start the application**:
   ```bash
   npm run start:mongodb
   ```

## Troubleshooting

### MongoDB not starting?

**Check if MongoDB service exists:**
```bash
sc query MongoDB
```

**Check MongoDB logs:**
```
C:\Program Files\MongoDB\Server\7.0\log\mongod.log
```

### Connection string issues?

Make sure your `.env` file has the correct format:
```
MONGODB_URI=mongodb://localhost:27017/expense-tracker
```

For Atlas:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/expense-tracker
```

### Port 27017 already in use?

Another MongoDB instance might be running:
```bash
# Kill process on port 27017
netstat -ano | findstr :27017
taskkill /F /PID <PID>
```

## Recommended Approach

For development/testing: **Use Legacy Mode** (npm start)
- No setup required
- Works immediately
- Data stored in JSON files

For production: **Use MongoDB Atlas**
- Free tier available
- No local installation needed
- Automatic backups
- Better performance

## Current Configuration

Check your `.env` file to see which MongoDB connection is configured:
```bash
type .env
```

## Quick Start Commands

**Legacy Mode (JSON files):**
```bash
npm start
```

**MongoDB Mode:**
```bash
npm run start:mongodb
```

**Development with auto-restart:**
```bash
npm run dev
```
