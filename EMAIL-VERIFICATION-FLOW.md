# Email Verification Flow - Visual Guide

## 🔄 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION FLOW                        │
└─────────────────────────────────────────────────────────────────┘

1. USER VISITS REGISTER PAGE
   ↓
   [Register Form]
   - Name: John Doe
   - Email: john@example.com
   - Password: ••••••••
   - Confirm: ••••••••
   ↓

2. USER CLICKS "REGISTER"
   ↓
   Frontend sends POST /api/auth/register
   ↓

3. BACKEND PROCESSES REGISTRATION
   ├─ Check if email already exists
   ├─ Hash password with bcrypt
   ├─ Generate verification token (crypto.randomBytes)
   ├─ Hash token (SHA256)
   ├─ Create user in database with:
   │  ├─ name: "John Doe"
   │  ├─ email: "john@example.com"
   │  ├─ password: (hashed)
   │  ├─ is_verified: false ← KEY FIELD
   │  ├─ verification_token: (hashed token)
   │  └─ verification_token_expires: (24 hours from now)
   └─ Send verification email via Resend
   ↓

4. RESEND SENDS EMAIL
   ├─ From: onboarding@resend.dev
   ├─ To: john@example.com
   ├─ Subject: Verify Your Email - Expense Tracker
   └─ Body: Contains verification link
      └─ https://yourapp.com/verify-email?token=<ORIGINAL_TOKEN>
   ↓

5. USER RECEIVES EMAIL
   ├─ Opens email
   ├─ Sees verification button
   └─ Clicks link
   ↓

6. FRONTEND VERIFICATION PAGE LOADS
   ├─ URL: /verify-email?token=abc123...
   ├─ Shows: "Verifying your email..."
   └─ Calls: GET /api/auth/verify-email?token=abc123...
   ↓

7. BACKEND VERIFIES TOKEN
   ├─ Extract token from URL
   ├─ Hash token (SHA256)
   ├─ Find user with matching hashed token
   ├─ Check if token not expired
   ├─ Update user:
   │  ├─ is_verified: true ← VERIFIED!
   │  ├─ verification_token: null
   │  └─ verification_token_expires: null
   └─ Return success message
   ↓

8. FRONTEND SHOWS SUCCESS
   ├─ Shows: "Email verified successfully"
   ├─ Shows: "Redirecting to login..."
   └─ Redirects to /login after 3 seconds
   ↓

9. USER LOGS IN
   ├─ Enters email and password
   ├─ Backend checks:
   │  ├─ Email exists? ✓
   │  ├─ Password correct? ✓
   │  └─ is_verified = true? ✓ ← REQUIRED!
   └─ Returns JWT token
   ↓

10. USER LOGGED IN ✅
    └─ Can access dashboard
```

## 🚫 What Happens If User Tries to Login Without Verifying

```
USER TRIES TO LOGIN (without verifying email)
   ↓
Backend checks:
   ├─ Email exists? ✓
   ├─ Password correct? ✓
   └─ is_verified = true? ✗ ← BLOCKED HERE!
   ↓
Backend returns:
   ├─ Status: 403 (Forbidden)
   └─ Message: "Please verify your email first. Check your inbox for the verification link."
   ↓
Frontend shows error message
   ↓
User must click verification link first
```

## 📧 Email Content Example

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Welcome to Expense Tracker!                        │
│                                                     │
│  Please verify your email address to complete      │
│  your registration.                                │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │  [Verify Email]                             │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
│  Or copy and paste this link in your browser:     │
│  https://yourapp.com/verify-email?token=...      │
│                                                     │
│  This link will expire in 24 hours.               │
│                                                     │
│  If you didn't create this account, please        │
│  ignore this email.                               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 🔐 Token Security Flow

```
REGISTRATION
   ↓
Generate random token:
   crypto.randomBytes(32).toString('hex')
   Result: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
   ↓
   ├─ ORIGINAL TOKEN (sent in email)
   │  └─ User receives: https://app.com/verify-email?token=a1b2c3d4...
   │
   └─ HASHED TOKEN (stored in database)
      └─ SHA256 hash: "7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7"
      └─ Stored in: users.verification_token

VERIFICATION
   ↓
User clicks link with original token
   ↓
Frontend sends: GET /api/auth/verify-email?token=a1b2c3d4...
   ↓
Backend:
   ├─ Receives original token
   ├─ Hashes it: SHA256(a1b2c3d4...) = 7f8e9d0c...
   ├─ Looks up user with hashed token
   ├─ Finds match ✓
   └─ Marks user as verified

SECURITY BENEFIT:
   ├─ If database is stolen, attacker gets hashed tokens
   ├─ Attacker can't use hashed tokens (they're not the original)
   ├─ Original tokens only exist in emails (user's inbox)
   └─ Even if database is compromised, emails are safe
```

## ⏱️ Token Expiration

```
REGISTRATION (Time: 0:00)
   ↓
Token created with expiration: NOW + 24 hours
   ├─ Created: 2024-02-17 10:00:00
   └─ Expires: 2024-02-18 10:00:00
   ↓

VERIFICATION (Time: 0:30 - 30 minutes later)
   ├─ Token still valid ✓
   ├─ Expires in: 23 hours 30 minutes
   └─ User verified successfully ✓
   ↓

VERIFICATION (Time: 25:00 - 25 hours later)
   ├─ Token expired ✗
   ├─ Expires in: -1 hour
   └─ Error: "Invalid or expired verification token"
   └─ User must register again
```

## 🔄 Database State Changes

```
BEFORE REGISTRATION:
   users table: (empty)

AFTER REGISTRATION:
   ┌─────────────────────────────────────────────────────────┐
   │ id │ name      │ email           │ is_verified │ token  │
   ├────┼───────────┼─────────────────┼─────────────┼────────┤
   │ 1  │ John Doe  │ john@example.com│ false       │ 7f8e9d │
   └─────────────────────────────────────────────────────────┘
   
   is_verified: false ← Can't login yet
   token: (hashed verification token)

AFTER EMAIL VERIFICATION:
   ┌─────────────────────────────────────────────────────────┐
   │ id │ name      │ email           │ is_verified │ token  │
   ├────┼───────────┼─────────────────┼─────────────┼────────┤
   │ 1  │ John Doe  │ john@example.com│ true        │ null   │
   └─────────────────────────────────────────────────────────┘
   
   is_verified: true ← Can login now!
   token: null ← Cleared after verification
```

## 🎯 Key Points

1. **Token is sent in email** - User receives original token
2. **Hashed token stored in DB** - Database stores SHA256 hash
3. **24-hour expiration** - Token expires after 24 hours
4. **Login blocked until verified** - is_verified must be true
5. **Clear error messages** - User knows what to do
6. **Secure by design** - Even if DB is compromised, tokens are safe

## 🚀 Current Status

✅ All code is implemented and working
❌ RESEND_API_KEY needs to be configured with real API key

Once you add the real API key, the entire flow will work automatically!
