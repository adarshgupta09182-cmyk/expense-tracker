# Email Verification Setup Guide

## Overview
Email verification has been implemented to prevent fake registrations. Users must verify their email before they can login.

## Using Resend (Recommended)

Resend is a modern email API that's simpler and more reliable than SMTP.

### Setup Instructions

1. **Create Resend Account**
   - Go to [resend.com](https://resend.com)
   - Sign up for a free account
   - Verify your email

2. **Get API Key**
   - Go to [Resend Dashboard](https://dashboard.resend.com)
   - Click "API Keys" in the sidebar
   - Copy your API key (starts with `re_`)

3. **Verify Sender Email**
   - In Resend Dashboard, go to "Domains"
   - Add your domain or use the default Resend domain
   - For development, you can use `onboarding@resend.dev` (test email)
   - For production, verify your domain

4. **Add to Railway**
   - Go to your Railway project dashboard
   - Select your backend service
   - Go to "Variables" tab
   - Add these environment variables:
     - `RESEND_API_KEY`: your-api-key-from-resend
     - `EMAIL_FROM`: noreply@expensetracker.com (or your verified domain)
     - `FRONTEND_URL`: https://expense-tracker-rho-brown.vercel.app
   - Click "Deploy" to apply changes

5. **Test Email Verification**
   - Register a new account with a valid email
   - Check your email inbox for verification link
   - Click the link to verify
   - You should now be able to login

## Environment Variables

```
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@expensetracker.com
FRONTEND_URL=https://expense-tracker-rho-brown.vercel.app
```

## How It Works

**Registration Flow:**
1. User fills registration form
2. Backend creates user with `isVerified: false`
3. Generates secure verification token
4. Sends email via Resend with verification link
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
- Check RESEND_API_KEY is correct
- Verify EMAIL_FROM domain is verified in Resend
- Check Resend dashboard for email logs
- For development, use `onboarding@resend.dev` as EMAIL_FROM

### Verification link not working?
- Token may have expired (24 hour limit)
- User should register again to get new token
- Check FRONTEND_URL matches your deployed frontend URL

### User locked out?
- They can register again with same email
- Previous unverified account will be replaced

## Resend Benefits

✅ No SMTP configuration needed
✅ Better deliverability
✅ Free tier: 100 emails/day
✅ Simple API
✅ Built-in email templates
✅ Detailed analytics
✅ Webhook support

## Security Notes

- Never commit .env file to git
- Keep RESEND_API_KEY secret
- Tokens are hashed before storage
- Verification links expire after 24 hours
- Email addresses are case-insensitive and normalized

