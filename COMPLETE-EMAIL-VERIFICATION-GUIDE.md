# Complete Email Verification Implementation Guide

## 📋 Summary

Your email verification system is **100% implemented and working** in the code. The only issue is that **RESEND_API_KEY is not configured with a real API key**, so emails aren't being sent.

## 🎯 What You Need to Do

### 1. Get Resend API Key (5 minutes)

**Visit:** https://resend.com

**Steps:**
1. Click "Sign Up" (or login if you have account)
2. Complete email verification
3. Go to Dashboard
4. Click "API Keys" in left sidebar
5. Click "Create API Key"
6. Copy the key (looks like: `re_abc123def456...`)
7. **Save it somewhere safe**

### 2. Update Local Configuration (1 minute)

**File:** `.env` (in project root)

**Find this line:**
```
RESEND_API_KEY=re_your_api_key_here
```

**Replace with your real key:**
```
RESEND_API_KEY=re_abc123def456ghi789jkl012mno345pqr
```

**Save the file.**

### 3. Update Railway Configuration (2 minutes)

**Go to:** https://railway.app

**Steps:**
1. Open your backend service
2. Click "Variables" tab
3. Find `RESEND_API_KEY` (or create it if missing)
4. Set value to your real Resend API key
5. **Make sure NO extra spaces** before or after the key
6. Click "Save"
7. Go to "Deployments" tab
8. Click the three dots (...) on the latest deployment
9. Click "Redeploy"
10. Wait for deployment to complete (2-3 minutes)

### 4. Test It Works (5 minutes)

**Test Registration:**
1. Go to your app's register page
2. Fill in form:
   - Name: Test User
   - Email: your-test-email@gmail.com
   - Password: Test123456
   - Confirm: Test123456
3. Click "Register"
4. You should see: "Registration successful. Check your email..."
5. **Check your email inbox** for verification email
6. Click the verification link in the email
7. You should see: "Email verified successfully"
8. Click "Redirecting to login..."
9. Login with your credentials - **it should work now!**

**Test Verification Requirement:**
1. Register with a NEW email address
2. **Don't click the verification link**
3. Try to login with that email
4. You should get error: "Please verify your email first"
5. Now click the verification link
6. Try login again - **it should work now**

## 🔍 Troubleshooting

### Problem: "No email received"

**Check 1: Is API key correct?**
- Go to Railway → Variables
- Check RESEND_API_KEY value
- Should start with `re_`
- Should be 40+ characters
- No spaces before/after

**Check 2: Did you redeploy?**
- Go to Railway → Deployments
- Click "..." on latest deployment
- Click "Redeploy"
- Wait for it to complete

**Check 3: Check server logs**
- Go to Railway → Logs
- Look for messages:
  - ✅ "Verification email sent successfully" = working
  - ❌ "Email sending failed" = API key issue
  - ❌ "RESEND_API_KEY not configured" = missing key

### Problem: "Can login without verifying"

This means emails aren't being sent. Check:
1. RESEND_API_KEY is set in Railway variables
2. Backend was redeployed after setting the key
3. Check server logs for errors

### Problem: "Invalid or expired token"

- Token expires after 24 hours
- Register again to get a new token
- Make sure you're using the link from the email

### Problem: "Email verification failed"

- Check browser console (F12 → Console tab)
- Look for error messages
- Check server logs on Railway

## 📧 Email Details

**Sender:** `onboarding@resend.dev` (Resend's test domain)

**Subject:** "Verify Your Email - Expense Tracker"

**Email Content:**
- Welcome message
- Verification button
- Backup link (in case button doesn't work)
- 24-hour expiration notice

**Link Format:**
```
https://your-app.com/verify-email?token=<VERIFICATION_TOKEN>
```

## 🔐 Security Details

**Token Generation:**
- Uses `crypto.randomBytes(32)` for randomness
- Converted to hex string (64 characters)
- Only sent in email (not stored in database)

**Token Storage:**
- Original token is hashed using SHA256
- Only hashed version stored in database
- If database is compromised, tokens can't be used

**Token Expiration:**
- Expires 24 hours after registration
- Stored in `verification_token_expires` field
- Checked during verification

**Login Protection:**
- Users can't login until `is_verified = true`
- Returns 403 error if not verified
- Clear error message: "Please verify your email first"

## 📊 Implementation Details

### Database Fields (PostgreSQL)
```sql
is_verified BOOLEAN DEFAULT false
verification_token VARCHAR(255)
verification_token_expires TIMESTAMP
```

### API Endpoints

**Register:**
```
POST /api/auth/register
Body: { name, email, password }
Response: { success, message, user }
```

**Verify Email:**
```
GET /api/auth/verify-email?token=<TOKEN>
Response: { success, message }
```

**Login:**
```
POST /api/auth/login
Body: { email, password }
Response: { success, token, user } or 403 if not verified
```

### Frontend Routes
```
/register - Registration page
/verify-email?token=<TOKEN> - Verification page
/login - Login page
/dashboard - Main app (protected)
```

## 🚀 Production Setup (Optional)

After testing with `onboarding@resend.dev`, you can set up a custom domain:

### Step 1: Add Domain to Resend
1. Go to https://resend.com/domains
2. Click "Add Domain"
3. Enter your domain (e.g., expensetracker.com)
4. Add DNS records (Resend will show you which)
5. Wait for verification

### Step 2: Update Email Sender
In `server.js`, change line ~315:
```javascript
// Before (testing):
from: 'onboarding@resend.dev',

// After (production):
from: 'noreply@yourdomain.com',
```

### Step 3: Remove Test Endpoints
Before deploying to production, remove these from `server.js`:
- `/api/auth/test-verify` endpoint
- `/api/auth/test-email` endpoint

## ✅ Verification Checklist

- [ ] Got Resend API key from resend.com
- [ ] Updated `.env` file with real key
- [ ] Updated Railway variables with real key
- [ ] Redeployed backend on Railway
- [ ] Registered with test email
- [ ] Received verification email
- [ ] Clicked verification link
- [ ] Saw success message
- [ ] Logged in successfully
- [ ] Tried login without verifying (got 403 error)
- [ ] Verified email and logged in again (worked)

## 📞 Support

**Resend Documentation:** https://resend.com/docs

**Common Issues:**
- Invalid API key format → Check it starts with `re_`
- Emails not sent → Check Railway logs
- Token expired → Register again
- Can't verify → Check browser console for errors

## 🎉 You're All Set!

Once you complete the 4 steps above, your email verification system will be fully functional. Users will:
1. Register with email
2. Receive verification email
3. Click link to verify
4. Be able to login

Good luck! 🚀
