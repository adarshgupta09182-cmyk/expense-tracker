# Email Verification System - Complete Fix Guide

## Current Status
✅ Email verification system is **fully implemented** in the code
❌ Emails are **NOT being sent** because `RESEND_API_KEY` is not configured

## The Problem
Your `.env` file has:
```
RESEND_API_KEY=re_your_api_key_here
```

This is a **placeholder**, not a real API key. Resend silently fails when given an invalid key.

## Solution: Get Your Real Resend API Key

### Step 1: Sign Up for Resend (if you haven't already)
1. Go to https://resend.com
2. Click "Sign Up"
3. Create an account with your email

### Step 2: Get Your API Key
1. After signing up, go to your dashboard
2. Click on "API Keys" in the left sidebar
3. Click "Create API Key"
4. Copy the key (it starts with `re_`)
5. **Keep this key safe** - don't share it publicly

### Step 3: Update Local .env File
Edit `.env` in your project root:

**BEFORE:**
```
RESEND_API_KEY=re_your_api_key_here
```

**AFTER:**
```
RESEND_API_KEY=re_your_actual_key_from_resend
```

Example (with a fake key for reference):
```
RESEND_API_KEY=re_abc123def456ghi789jkl012mno345pqr
```

### Step 4: Update Railway Environment Variables
1. Go to https://railway.app
2. Open your backend service
3. Go to "Variables" tab
4. Find or create `RESEND_API_KEY`
5. Set it to your actual Resend API key
6. **Important:** Make sure there are NO extra spaces before or after the key
7. Click "Save"

### Step 5: Restart Your Backend
After updating Railway variables:
1. Go to "Deployments" tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

## Testing Email Verification

### Test 1: Register a New Account
1. Go to your app's register page
2. Fill in the form with a test email
3. Click "Register"
4. Check your email inbox for the verification link
5. Click the link to verify

### Test 2: Try to Login Without Verifying
1. Register with a new email
2. Try to login WITHOUT clicking the verification link
3. You should get error: "Please verify your email first"

### Test 3: Login After Verifying
1. Register with a new email
2. Click the verification link in the email
3. You should see "Email verified successfully"
4. Now try to login - it should work

## If Emails Still Don't Arrive

### Check 1: Verify API Key Format
- Your key should start with `re_`
- It should be about 40+ characters long
- No spaces before or after

### Check 2: Check Resend Dashboard
1. Go to https://resend.com/emails
2. Look for failed emails
3. Check the error message

### Check 3: Check Server Logs
1. Go to Railway dashboard
2. Open your backend service
3. Click "Logs" tab
4. Look for messages like:
   - "Verification email sent successfully" ✅
   - "Email sending failed" ❌
   - "RESEND_API_KEY not configured" ❌

### Check 4: Use Test Endpoint (for debugging)
If you want to test if Resend is working:

**Using PowerShell (Windows):**
```powershell
$body = @{
    email = "your-test-email@gmail.com"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://your-railway-url/api/auth/test-email" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Using curl (if available):**
```bash
curl -X POST https://your-railway-url/api/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@gmail.com"}'
```

## Production Setup (After Testing)

### Step 1: Add Custom Domain to Resend
1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain (e.g., expensetracker.com)
4. Add DNS records (Resend will show you which ones)
5. Wait for verification (usually 5-10 minutes)

### Step 2: Update Email Sender
In `server.js`, change:
```javascript
from: 'onboarding@resend.dev',  // Testing only
```

To:
```javascript
from: 'noreply@yourdomain.com',  // Production
```

### Step 3: Remove Test Endpoints
Before deploying to production, remove these endpoints from `server.js`:
- `/api/auth/test-verify` (line ~500)
- `/api/auth/test-email` (line ~530)

## Email Verification Flow (How It Works)

1. **User registers** → Backend generates verification token
2. **Token is hashed** → Stored in database (original token sent in email)
3. **Email is sent** → User receives link with token
4. **User clicks link** → Frontend calls `/api/auth/verify-email?token=...`
5. **Token is verified** → Backend marks user as verified
6. **User can login** → Login now works

## Verification Token Details
- **Generated:** `crypto.randomBytes(32).toString('hex')`
- **Stored:** SHA256 hashed version
- **Expires:** 24 hours after registration
- **Format:** Sent in email as: `https://yourapp.com/verify-email?token=<TOKEN>`

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "No verification email received" | Check RESEND_API_KEY is set correctly in Railway |
| "Invalid or expired token" | Token expired (24 hours) - register again |
| "Can login without verifying" | RESEND_API_KEY not configured - emails not sent |
| "Email verification failed" | Check browser console for error details |
| "RESEND_API_KEY not configured" | Add RESEND_API_KEY to .env and Railway variables |

## Files Modified for Email Verification
- ✅ `server.js` - Registration, verification, email sending
- ✅ `client/src/pages/Register.jsx` - Registration form
- ✅ `client/src/pages/VerifyEmail.jsx` - Verification page
- ✅ `client/src/App.jsx` - Added /verify-email route
- ✅ `package.json` - Added resend dependency

## Next Steps
1. ✅ Get Resend API key from resend.com
2. ✅ Update .env file with real key
3. ✅ Update Railway variables with real key
4. ✅ Redeploy backend on Railway
5. ✅ Test registration and email verification
6. ✅ (Optional) Add custom domain for production
