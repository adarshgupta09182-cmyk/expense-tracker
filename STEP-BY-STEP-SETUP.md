# Step-by-Step Email Verification Setup

## 🎯 Goal
Get your Resend API key and configure it so emails are sent during registration.

---

## STEP 1: Get Resend API Key (5 minutes)

### 1.1 Go to Resend Website
- Open: https://resend.com
- You should see the Resend homepage

### 1.2 Sign Up or Login
- If you don't have account: Click "Sign Up"
- If you have account: Click "Sign In"
- Complete email verification if needed

### 1.3 Navigate to API Keys
- After login, you're on Dashboard
- Look for left sidebar menu
- Click "API Keys"

### 1.4 Create New API Key
- Click "Create API Key" button
- A new key will be generated
- It looks like: `re_abc123def456ghi789jkl012mno345pqr`

### 1.5 Copy the Key
- Click the copy icon next to the key
- Or select and copy manually
- **Save it somewhere safe** (notepad, password manager, etc.)

### 1.6 Verify Key Format
- Should start with `re_`
- Should be about 40+ characters long
- Example: `re_abc123def456ghi789jkl012mno345pqr`

---

## STEP 2: Update Local .env File (1 minute)

### 2.1 Open .env File
- In your project root, find `.env` file
- Open it with any text editor (VS Code, Notepad, etc.)

### 2.2 Find RESEND_API_KEY Line
Look for:
```
RESEND_API_KEY=re_your_api_key_here
```

### 2.3 Replace with Real Key
Change from:
```
RESEND_API_KEY=re_your_api_key_here
```

To:
```
RESEND_API_KEY=re_abc123def456ghi789jkl012mno345pqr
```

(Use YOUR actual key from Step 1.5)

### 2.4 Save File
- Press Ctrl+S (or Cmd+S on Mac)
- File is saved

### 2.5 Restart Local Server (if running)
- Stop the server (Ctrl+C in terminal)
- Run: `npm start` or `npm run dev`
- Server will use new API key

---

## STEP 3: Update Railway Configuration (2 minutes)

### 3.1 Go to Railway Dashboard
- Open: https://railway.app
- Login with your account

### 3.2 Open Backend Service
- Click on your project
- Click on the backend service (usually named "server" or "api")

### 3.3 Go to Variables Tab
- Click "Variables" tab at the top
- You'll see list of environment variables

### 3.4 Find or Create RESEND_API_KEY
- Look for `RESEND_API_KEY` in the list
- If it exists: Click to edit
- If it doesn't exist: Click "Add Variable"

### 3.5 Set the Value
- Key: `RESEND_API_KEY`
- Value: `re_abc123def456ghi789jkl012mno345pqr` (your real key)
- **Important:** No spaces before or after the key

### 3.6 Save Changes
- Click "Save" or "Update"
- You should see confirmation

### 3.7 Redeploy Backend
- Go to "Deployments" tab
- Find the latest deployment
- Click the three dots (...) menu
- Click "Redeploy"
- Wait for deployment to complete (2-3 minutes)
- You'll see status change from "Building" → "Deploying" → "Success"

---

## STEP 4: Test Email Verification (5 minutes)

### 4.1 Go to Your App
- Open your app in browser
- Go to register page

### 4.2 Register with Test Email
- Name: Test User
- Email: your-real-email@gmail.com (use YOUR email)
- Password: Test123456
- Confirm: Test123456
- Click "Register"

### 4.3 Check for Success Message
- You should see: "Registration successful. Check your email to verify your account."
- This means registration worked

### 4.4 Check Your Email
- Open your email inbox
- Look for email from: `onboarding@resend.dev`
- Subject: "Verify Your Email - Expense Tracker"
- **If you don't see it:**
  - Check spam/junk folder
  - Wait 1-2 minutes (email can be slow)
  - Check server logs on Railway

### 4.5 Click Verification Link
- Open the email
- Click the "Verify Email" button
- Or copy the link and paste in browser

### 4.6 See Verification Success
- You should see: "Email verified successfully"
- Then: "Redirecting to login..."
- You'll be taken to login page

### 4.7 Login with Your Credentials
- Email: your-real-email@gmail.com
- Password: Test123456
- Click "Login"
- **You should now be logged in!** ✅

### 4.8 Test Verification Requirement
- Logout
- Register with a NEW email address
- **Don't click the verification link**
- Try to login with that email
- You should get error: "Please verify your email first"
- Now click the verification link
- Try login again - it should work

---

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
- [ ] Tried login without verifying (got error)
- [ ] Verified email and logged in (worked)

---

## 🆘 Troubleshooting

### Problem: "No email received"

**Check 1: Is API key correct?**
```
Go to Railway → Variables
Check RESEND_API_KEY value
Should start with: re_
Should be 40+ characters
No spaces before/after
```

**Check 2: Did you redeploy?**
```
Go to Railway → Deployments
Click "..." on latest deployment
Click "Redeploy"
Wait for completion
```

**Check 3: Check server logs**
```
Go to Railway → Logs
Look for:
✅ "Verification email sent successfully" = working
❌ "Email sending failed" = API key issue
❌ "RESEND_API_KEY not configured" = missing key
```

### Problem: "Can login without verifying"

This means emails aren't being sent. Follow Check 1-3 above.

### Problem: "Invalid or expired token"

- Token expires after 24 hours
- Register again to get new token
- Make sure you're using link from email

### Problem: "Email verification failed"

- Check browser console (F12 → Console)
- Look for error messages
- Check Railway logs

---

## 🎉 Success!

Once you complete all 4 steps, your email verification system will be fully working:

1. ✅ Users register
2. ✅ Receive verification email
3. ✅ Click link to verify
4. ✅ Can login

**Congratulations!** 🚀

---

## 📞 Need Help?

- **Resend Docs:** https://resend.com/docs
- **Railway Docs:** https://docs.railway.app
- **Check logs:** Railway → Logs tab
- **Test endpoint:** POST /api/auth/test-email (for debugging)

---

## 🔒 Security Notes

- Never share your Resend API key
- Don't commit `.env` file to git
- Use different keys for dev/production
- Rotate keys periodically
- Check Railway logs for suspicious activity

---

## 🚀 Next Steps (Optional)

After testing, you can:

1. **Add custom domain** (for production)
   - Go to Resend → Domains
   - Add your domain
   - Update sender email

2. **Remove test endpoints** (before production)
   - Remove `/api/auth/test-verify`
   - Remove `/api/auth/test-email`

3. **Monitor email delivery**
   - Go to Resend → Emails
   - Check delivery status
   - Review bounce/failure rates

---

**You're all set! Happy coding!** 💻
