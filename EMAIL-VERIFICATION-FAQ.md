# Email Verification - Frequently Asked Questions

## ❓ General Questions

### Q: Is the email verification system implemented?
**A:** Yes, 100% implemented. All code is done and working. You just need to configure the Resend API key.

### Q: Why aren't emails being sent?
**A:** The `RESEND_API_KEY` in your `.env` file is set to a placeholder value (`re_your_api_key_here`). You need to replace it with your real API key from resend.com.

### Q: How long does it take to set up?
**A:** About 15 minutes total:
- Get API key: 5 minutes
- Update config: 1 minute
- Redeploy: 3 minutes
- Test: 5 minutes

### Q: Do I need to change any code?
**A:** No, the code is already complete. You only need to update the configuration.

### Q: Is this secure?
**A:** Yes, very secure:
- Tokens are generated with `crypto.randomBytes(32)`
- Tokens are hashed with SHA256 before storage
- Tokens expire after 24 hours
- Even if database is compromised, tokens are safe

---

## 🔑 API Key Questions

### Q: Where do I get the Resend API key?
**A:** 
1. Go to https://resend.com
2. Sign up or login
3. Click "API Keys" in sidebar
4. Click "Create API Key"
5. Copy the key (starts with `re_`)

### Q: What does the API key look like?
**A:** It looks like: `re_abc123def456ghi789jkl012mno345pqr`
- Starts with `re_`
- About 40+ characters long
- Alphanumeric

### Q: Can I use the same API key for dev and production?
**A:** Yes, you can. But for security, it's better to create separate keys for each environment.

### Q: What if I lose my API key?
**A:** You can create a new one anytime:
1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Use the new key

### Q: Is my API key visible in the code?
**A:** No, it's stored in `.env` file which is not committed to git. It's only used on the server.

---

## ⚙️ Configuration Questions

### Q: Where do I update the API key for local testing?
**A:** Edit `.env` file in your project root:
```
RESEND_API_KEY=re_your_real_key_here
```

### Q: Where do I update the API key for production (Railway)?
**A:** 
1. Go to https://railway.app
2. Open backend service
3. Click "Variables" tab
4. Set `RESEND_API_KEY=re_your_real_key_here`
5. Click "Save"
6. Redeploy

### Q: Do I need to restart the server after updating .env?
**A:** Yes, for local development:
1. Stop server (Ctrl+C)
2. Run `npm start` or `npm run dev`

### Q: Do I need to redeploy after updating Railway variables?
**A:** Yes:
1. Go to Railway → Deployments
2. Click "..." on latest deployment
3. Click "Redeploy"

### Q: How long does Railway redeploy take?
**A:** Usually 2-3 minutes. You'll see status: Building → Deploying → Success

---

## 📧 Email Questions

### Q: What email address will users see as sender?
**A:** `onboarding@resend.dev` (Resend's test domain)

For production, you can add your own domain and change it to `noreply@yourdomain.com`

### Q: What's in the verification email?
**A:** 
- Welcome message
- Verification button
- Backup link (in case button doesn't work)
- 24-hour expiration notice

### Q: How long is the verification link valid?
**A:** 24 hours. After that, user must register again.

### Q: Can I customize the email template?
**A:** Yes, edit the HTML in `server.js` in the `sendVerificationEmail` function (around line 315).

### Q: Where do I check if emails were sent?
**A:** 
1. Go to https://resend.com/emails
2. You'll see list of all sent emails
3. Check delivery status

### Q: Why is my email going to spam?
**A:** 
- Using `onboarding@resend.dev` (test domain) can trigger spam filters
- Solution: Add custom domain to Resend for production

---

## 🧪 Testing Questions

### Q: How do I test email verification?
**A:**
1. Register with your real email
2. Check inbox for verification email
3. Click link to verify
4. Try to login

### Q: Can I test without sending real emails?
**A:** Yes, use the test endpoint:
```
POST /api/auth/test-verify
Body: { "email": "user@example.com" }
```
This manually marks user as verified without sending email.

### Q: How do I test if Resend is working?
**A:** Use the debug endpoint:
```
POST /api/auth/test-email
Body: { "email": "your-email@gmail.com" }
```
This sends a test email via Resend.

### Q: What if I don't receive the verification email?
**A:**
1. Check spam/junk folder
2. Wait 1-2 minutes (email can be slow)
3. Check server logs on Railway
4. Verify API key is correct

---

## 🔒 Security Questions

### Q: Is my password sent in the verification email?
**A:** No, only the verification token is sent. Password is never sent via email.

### Q: What if someone intercepts the verification email?
**A:** They can only verify that email address. They can't login without the password.

### Q: What if the database is compromised?
**A:** Tokens are hashed, so they can't be used even if database is stolen. Original tokens only exist in user emails.

### Q: How are tokens generated?
**A:** Using `crypto.randomBytes(32)` which is cryptographically secure.

### Q: How are tokens stored?
**A:** Hashed with SHA256. Only the hash is stored in database.

---

## ❌ Troubleshooting Questions

### Q: "No email received" - What should I do?
**A:**
1. Check API key is correct in Railway variables
2. Check server logs on Railway
3. Verify backend was redeployed
4. Check spam folder
5. Wait 1-2 minutes

### Q: "Can login without verifying" - What's wrong?
**A:** Emails aren't being sent. Check:
1. RESEND_API_KEY is set in Railway
2. Backend was redeployed
3. Check server logs for errors

### Q: "Invalid or expired token" - What should I do?
**A:** Token expired (24 hours). Register again to get new token.

### Q: "Email verification failed" - What's the error?
**A:** Check browser console (F12 → Console tab) for error details.

### Q: How do I check server logs?
**A:** 
1. Go to Railway dashboard
2. Open backend service
3. Click "Logs" tab
4. Look for error messages

---

## 🚀 Production Questions

### Q: Should I remove test endpoints before production?
**A:** Yes, remove these endpoints:
- `/api/auth/test-verify`
- `/api/auth/test-email`

### Q: Should I add a custom domain?
**A:** Yes, for production:
1. Go to Resend → Domains
2. Add your domain
3. Add DNS records
4. Update sender email

### Q: What's the difference between test and production?
**A:**
- **Test:** Uses `onboarding@resend.dev` (Resend's domain)
- **Production:** Uses your custom domain (e.g., `noreply@yourdomain.com`)

### Q: How do I monitor email delivery?
**A:** 
1. Go to https://resend.com/emails
2. Check delivery status
3. Review bounce/failure rates

---

## 📊 Monitoring Questions

### Q: How do I know if emails are being sent?
**A:** Check server logs:
```
✅ "Verification email sent successfully" = working
❌ "Email sending failed" = API key issue
❌ "RESEND_API_KEY not configured" = missing key
```

### Q: How do I track email delivery?
**A:** 
1. Go to https://resend.com/emails
2. See list of all sent emails
3. Check delivery status for each

### Q: Can I see failed emails?
**A:** Yes, on Resend dashboard:
1. Go to https://resend.com/emails
2. Filter by status
3. See failure reasons

---

## 💡 Best Practices

### Q: Should I commit .env to git?
**A:** No, add it to `.gitignore`. Never commit API keys.

### Q: Should I use same API key for all environments?
**A:** No, create separate keys for dev/staging/production.

### Q: How often should I rotate API keys?
**A:** Every 3-6 months for security.

### Q: Should I log API key in console?
**A:** No, never log sensitive data.

### Q: Should I share API key with team?
**A:** No, keep it private. Use environment variables.

---

## 🎯 Quick Answers

| Question | Answer |
|----------|--------|
| Is it implemented? | Yes ✅ |
| Why no emails? | API key not configured ❌ |
| How to fix? | Get API key, update config, redeploy |
| How long? | ~15 minutes |
| Is it secure? | Yes, very secure ✅ |
| Need code changes? | No, just config |
| Can I test locally? | Yes, update .env |
| Can I test on Railway? | Yes, update variables |
| How to debug? | Check server logs |
| Is it production-ready? | Yes, after API key setup |

---

## 📞 Still Have Questions?

- **Resend Docs:** https://resend.com/docs
- **Railway Docs:** https://docs.railway.app
- **Check Logs:** Railway → Logs tab
- **Test Endpoint:** POST /api/auth/test-email

---

**You've got this!** 🚀
