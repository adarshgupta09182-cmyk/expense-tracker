# Email Verification Setup Guide

## Overview
Email verification has been implemented to prevent fake registrations. Users must verify their email before they can login.

## Environment Variables Required

Add these to your Railway environment variables:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@expensetracker.com
FRONTEND_URL=https://expense-tracker-rho-brown.vercel.app
```

## Setup Instructions

### 1. Gmail Configuration (Recommended)

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Windows Computer" (or your device)
5. Google will generate a 16-character password
6. Use this password as `SMTP_PASS`

### 2. Add to Railway

1. Go to your Railway project dashboard
2. Select your backend service
3. Go to "Variables" tab
4. Add the following environment variables:
   - `SMTP_HOST`: smtp.gmail.com
   - `SMTP_PORT`: 587
   - `SMTP_USER`: your-gmail@gmail.com
   - `SMTP_PASS`: your-16-char-app-password
   - `EMAIL_FROM`: noreply@expensetracker.com
   - `FRONTEND_URL`: https://expense-tracker-rho-brown.vercel.app

5. Click "Deploy" to apply changes

### 3. Test Email Verification

1. Register a new account with a valid email
2. Check your email inbox for verification link
3. Click the link to verify
4. You should now be able to login

## How It Works

**Registration Flow:**
1. User fills registration form
2. Backend creates user with `isVerified: false`
3. Generates secure verification token
4. Sends email with verification link
5. User clicks link → email verified
6. User can now login

**Login Flow:**
1. User enters credentials
2. Backend checks if `isVerified: true`
3. If not verified → shows error message
4. If verified → generates JWT token and allows login

## Verification Link Format

The verification link sent in email looks like:
```
https://expense-tracker-rho-brown.vercel.app/verify-email?token=<UNIQUE_TOKEN>
```

## Token Details

- **Token Type**: SHA256 hashed random bytes
- **Expiration**: 24 hours
- **Storage**: Hashed in database (original token only in email)

## Troubleshooting

### Emails not sending?
- Check SMTP credentials are correct
- Verify Gmail app password (not regular password)
- Check 2-Step Verification is enabled on Gmail
- Check firewall/network allows SMTP port 587

### Verification link not working?
- Token may have expired (24 hour limit)
- User should register again to get new token
- Check FRONTEND_URL matches your deployed frontend URL

### User locked out?
- They can register again with same email
- Previous unverified account will be replaced

## Alternative Email Providers

If not using Gmail, you can use:
- **SendGrid**: SMTP_HOST=smtp.sendgrid.net, SMTP_PORT=587
- **Resend**: SMTP_HOST=smtp.resend.com, SMTP_PORT=587
- **AWS SES**: SMTP_HOST=email-smtp.region.amazonaws.com, SMTP_PORT=587

## Security Notes

- Never commit .env file to git
- Use app-specific passwords, not main account password
- Tokens are hashed before storage
- Verification links expire after 24 hours
- Email addresses are case-insensitive and normalized
