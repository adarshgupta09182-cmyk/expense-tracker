# Resend API Key Setup - Quick Reference

## 🚀 3-Step Fix

### Step 1: Get API Key (2 minutes)
```
1. Go to https://resend.com
2. Sign up or login
3. Click "API Keys" → "Create API Key"
4. Copy the key (starts with re_)
```

### Step 2: Update Local .env (1 minute)
Edit `.env` file in project root:
```
RESEND_API_KEY=re_your_actual_key_here
```

### Step 3: Update Railway (2 minutes)
```
1. Go to https://railway.app
2. Open backend service
3. Go to "Variables" tab
4. Set RESEND_API_KEY=re_your_actual_key_here
5. Click "Save"
6. Go to "Deployments" → Click "..." → "Redeploy"
```

## ✅ Test It Works

### Register a new account:
1. Go to register page
2. Fill form with test email
3. Click "Register"
4. Check email for verification link
5. Click link to verify
6. Login should now work

## 🔍 If It Still Doesn't Work

**Check 1:** Is the key correct?
- Should start with `re_`
- Should be 40+ characters
- No spaces before/after

**Check 2:** Did you redeploy on Railway?
- Go to Deployments tab
- Click "..." on latest deployment
- Click "Redeploy"

**Check 3:** Check server logs
- Railway → Logs tab
- Look for "Verification email sent successfully" ✅
- Or "Email sending failed" ❌

## 📧 Current Email Sender
Testing: `onboarding@resend.dev` (pre-verified by Resend)

For production, add your domain to Resend and change to: `noreply@yourdomain.com`

## 🆘 Need Help?
- Resend docs: https://resend.com/docs
- Check Railway logs for error messages
- Verify API key format in Railway variables
