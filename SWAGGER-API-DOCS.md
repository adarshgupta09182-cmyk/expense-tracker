# Swagger API Documentation

## Overview

The Expense Tracker API uses Swagger/OpenAPI 3.0 for interactive API documentation.

### Access Documentation

- **Interactive Docs**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs/swagger.json

## Authentication

All protected endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}

Response: 201 Created
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "monthlyBudget": 0,
    "budgetWarningThreshold": 80
  }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}

Response: 200 OK
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "monthlyBudget": 0,
    "budgetWarningThreshold": 80
  }
}
```

### Expense Endpoints

#### Get All Expenses
```
GET /api/expenses
Authorization: Bearer <token>

Query Parameters:
- startDate: YYYY-MM-DD (optional)
- endDate: YYYY-MM-DD (optional)
- category: Food|Transport|Entertainment|Bills|Other (optional)

Response: 200 OK
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f191e810c19729de860ea",
      "description": "Lunch at restaurant",
      "amount": 25.50,
      "category": "Food",
      "date": "2024-01-15T00:00:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Get Single Expense
```
GET /api/expenses/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "description": "Lunch at restaurant",
    "amount": 25.50,
    "category": "Food",
    "date": "2024-01-15T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Create Expense
```
POST /api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Grocery shopping",
  "amount": 85.50,
  "category": "Food",
  "date": "2024-01-15"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "description": "Grocery shopping",
    "amount": 85.50,
    "category": "Food",
    "date": "2024-01-15T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Update Expense
```
PUT /api/expenses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Updated description",
  "amount": 90.00,
  "category": "Food",
  "date": "2024-01-15"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "description": "Updated description",
    "amount": 90.00,
    "category": "Food",
    "date": "2024-01-15T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Delete Expense
```
DELETE /api/expenses/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Expense deleted"
}
```

#### Get Monthly Summary
```
GET /api/expenses/summary/monthly
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "count": 3,
  "data": [
    {
      "year": 2024,
      "month": 1,
      "totalAmount": 1250.75,
      "totalCount": 45,
      "byCategory": [
        {
          "category": "Food",
          "amount": 450.50,
          "count": 15
        },
        {
          "category": "Transport",
          "amount": 300.25,
          "count": 12
        }
      ]
    }
  ]
}
```

### Budget Endpoints

#### Get Current Budget
```
GET /api/budget
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "budget": 50000,
    "totalSpent": 35000,
    "remaining": 15000,
    "percentageUsed": 70,
    "isExceeded": false,
    "isWarning": false,
    "warningThreshold": 80,
    "month": "February 2026"
  }
}
```

#### Set Budget
```
PUT /api/budget
Authorization: Bearer <token>
Content-Type: application/json

{
  "monthlyBudget": 50000,
  "budgetWarningThreshold": 80
}

Response: 200 OK
{
  "success": true,
  "message": "Budget updated successfully",
  "data": {
    "monthlyBudget": 50000,
    "budgetWarningThreshold": 80
  }
}
```

#### Get Budget History
```
GET /api/budget/history
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "count": 12,
  "data": [
    {
      "month": "Feb 2026",
      "budget": 50000,
      "spent": 35000,
      "remaining": 15000,
      "percentageUsed": 70,
      "isExceeded": false
    }
  ]
}
```

### Export Endpoints

#### Export Expenses as CSV
```
GET /api/export/expenses
Authorization: Bearer <token>

Query Parameters:
- startDate: YYYY-MM-DD (optional)
- endDate: YYYY-MM-DD (optional)
- category: Food|Transport|Entertainment|Bills|Other (optional)

Response: 200 OK (CSV file download)
Date,Description,Category,Amount (₹)
15/02/2026,"Lunch at restaurant",Food,25.50
...
Total,,,1250.75
```

#### Export Expenses with Budget Summary
```
GET /api/export/expenses-with-budget
Authorization: Bearer <token>

Query Parameters:
- startDate: YYYY-MM-DD (optional)
- endDate: YYYY-MM-DD (optional)
- category: Food|Transport|Entertainment|Bills|Other (optional)

Response: 200 OK (CSV file download)
EXPENSE REPORT
Generated: 15/02/2026 10:30:00
User: John Doe (john@example.com)

BUDGET SUMMARY
Monthly Budget,₹50,000.00
Total Spent,₹35,000.00
Remaining,₹15,000.00
Usage,70.00%

EXPENSES
Date,Description,Category,Amount (₹)
...
```

#### Export Monthly Summary
```
GET /api/export/monthly-summary
Authorization: Bearer <token>

Response: 200 OK (CSV file download)
MONTHLY EXPENSE SUMMARY
Generated: 15/02/2026 10:30:00

Month,Total Expenses (₹),Transaction Count
February 2026,35000.00,45
January 2026,42000.00,52
...
Total,1250000.00,500
```

### Admin Endpoints

#### Get Admin Dashboard
```
GET /api/admin/dashboard
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "success": true,
  "data": {
    "users": [...],
    "expenses": [...]
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "User role not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Expense not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: 
  - `RateLimit-Limit`: 100
  - `RateLimit-Remaining`: 99
  - `RateLimit-Reset`: 1234567890

## Validation Rules

### User Registration
- Name: 2-50 characters, required
- Email: Valid email format, unique, required
- Password: Minimum 6 characters, required
- Role: 'user' or 'admin', optional (default: 'user')

### Expense Creation
- Description: 3-200 characters, required
- Amount: Positive number (min 0.01), required
- Category: One of [Food, Transport, Entertainment, Bills, Other], required
- Date: Valid ISO8601 date, optional (default: today)

### Budget Update
- Monthly Budget: Non-negative number, required
- Warning Threshold: 0-100, optional (default: 80)

## Pagination

Expenses endpoint supports pagination:
- **Items per page**: 10
- **Sorting**: By date (descending)
- **Filtering**: By category, date range, search term

## Sorting

- Expenses: Sorted by date (newest first)
- Monthly Summary: Sorted by year and month (newest first)

## Date Format

- **Input**: YYYY-MM-DD or ISO8601
- **Output**: ISO8601 (2024-01-15T00:00:00.000Z)
- **Display**: Locale-specific (en-IN format)

## Currency

- **Symbol**: ₹ (Indian Rupee)
- **Decimal Places**: 2
- **Format**: 1,234.56

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

### Login User
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

### Get Expenses
```bash
curl -X GET http://localhost:3000/api/expenses \
  -H "Authorization: Bearer <your-token>"
```

### Export CSV
```bash
curl -X GET http://localhost:3000/api/export/expenses \
  -H "Authorization: Bearer <your-token>" \
  -o expenses.csv
```

## Webhook Support (Future)

Planned webhook events:
- expense.created
- expense.updated
- expense.deleted
- budget.warning
- budget.exceeded

## API Versioning

Current version: v1 (implicit)

Future versions will use:
- `/api/v2/expenses`
- `/api/v2/budget`

## CORS Headers

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

## Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

For more information, visit the interactive API documentation at http://localhost:3000/api-docs
