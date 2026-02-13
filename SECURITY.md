# Security Features

## Implemented Security Measures

### 1. Helmet.js
- Sets various HTTP headers to protect against common vulnerabilities
- Content Security Policy (CSP) configured
- XSS protection enabled
- Prevents clickjacking with X-Frame-Options

### 2. CORS (Cross-Origin Resource Sharing)
- Properly configured CORS with specific origins
- Credentials support enabled
- Preflight caching for 24 hours
- Configurable via environment variable

### 3. Rate Limiting
- 100 requests per 15 minutes per IP
- Prevents brute force attacks
- Protects against DDoS
- Applied to all API routes

### 4. Input Validation
- All inputs validated using express-validator
- Sanitization of user inputs
- Type checking and format validation
- Custom error messages for validation failures

### 5. Data Sanitization
- NoSQL injection prevention with express-mongo-sanitize
- XSS protection through input escaping
- Request body size limited to 10kb

### 6. Authentication & Authorization
- JWT-based authentication
- Password hashing with bcryptjs (12 rounds)
- Token expiration (7 days default)
- Role-based access control (RBAC)

### 7. Error Handling
- Centralized error handling middleware
- No sensitive information in error responses
- Stack traces only in development mode
- Proper HTTP status codes

### 8. Database Security
- Mongoose schema validation
- Indexes for performance and security
- Password field excluded from queries by default
- Proper error handling for database operations

### 9. Process Management
- Graceful shutdown on errors
- Unhandled rejection handling
- Uncaught exception handling
- Proper logging

## Best Practices Implemented

1. **Environment Variables**: Sensitive data stored in .env file
2. **Async Error Handling**: All async operations wrapped with error handler
3. **Controller Pattern**: Separation of concerns (routes, controllers, models)
4. **Middleware Organization**: Reusable middleware functions
5. **Validation Layer**: Input validation before processing
6. **Response Standardization**: Consistent API response format

## Security Checklist for Production

- [ ] Change JWT_SECRET to a strong random string
- [ ] Set NODE_ENV to 'production'
- [ ] Configure CORS_ORIGIN to specific domain(s)
- [ ] Use HTTPS/TLS
- [ ] Enable MongoDB authentication
- [ ] Use connection string with credentials
- [ ] Set up proper logging (Winston, Morgan)
- [ ] Implement request logging
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Regular security audits (npm audit)
- [ ] Keep dependencies updated
- [ ] Implement API versioning
- [ ] Add request ID tracking
- [ ] Set up backup strategy

## Rate Limiting Configuration

Current settings:
- Window: 15 minutes
- Max requests: 100
- Applies to: All /api/* routes

Adjust in `server-mongodb.js` based on your needs.

## Validation Rules

### User Registration
- Name: 2-50 characters, trimmed, escaped
- Email: Valid email format, normalized
- Password: Minimum 6 characters
- Role: 'user' or 'admin' only

### Expense Creation
- Description: 3-200 characters, trimmed, escaped
- Amount: Positive number, minimum 0.01
- Category: One of predefined categories
- Date: Valid ISO8601 date format

## Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error"
    }
  ]
}
```

## Reporting Security Issues

If you discover a security vulnerability, please email: security@example.com

Do not create public GitHub issues for security vulnerabilities.
