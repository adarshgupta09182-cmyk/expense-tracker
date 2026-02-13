# Expense Tracker API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All expense routes require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Auth Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"  // or "admin"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

---

## Expense Endpoints

### Get All Expenses (with filtering)
```http
GET /api/expenses
Authorization: Bearer <token>

Query Parameters:
- startDate: YYYY-MM-DD (optional)
- endDate: YYYY-MM-DD (optional)
- category: Food|Transport|Entertainment|Bills|Other (optional)
```

**Examples:**
```
GET /api/expenses
GET /api/expenses?category=Food
GET /api/expenses?startDate=2024-01-01&endDate=2024-01-31
GET /api/expenses?category=Transport&startDate=2024-01-01
```

**Response:**
```json
[
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
```

### Get Single Expense
```http
GET /api/expenses/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea",
  "description": "Lunch at restaurant",
  "amount": 25.50,
  "category": "Food",
  "date": "2024-01-15T00:00:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Create Expense
```http
POST /api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Grocery shopping",
  "amount": 85.50,
  "category": "Food",
  "date": "2024-01-15"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea",
  "description": "Grocery shopping",
  "amount": 85.50,
  "category": "Food",
  "date": "2024-01-15T00:00:00.000Z",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Update Expense
```http
PUT /api/expenses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Updated description",
  "amount": 90.00,
  "category": "Food",
  "date": "2024-01-15"
}
```

### Delete Expense
```http
DELETE /api/expenses/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Expense deleted"
}
```

### Monthly Summary
```http
GET /api/expenses/summary/monthly
Authorization: Bearer <token>
```

**Response:**
```json
[
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
      },
      {
        "category": "Entertainment",
        "amount": 200.00,
        "count": 8
      },
      {
        "category": "Bills",
        "amount": 250.00,
        "count": 5
      },
      {
        "category": "Other",
        "amount": 50.00,
        "count": 5
      }
    ]
  }
]
```

---

## Admin Endpoints

### Get Dashboard Data
```http
GET /api/admin/dashboard
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "users": [...],
  "expenses": [...]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "message": "User role not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "message": "Expense not found"
}
```

---

## Security Rules

1. All expense routes require valid JWT token
2. Users can only access their own expenses
3. Admin routes require admin role
4. Passwords are hashed using bcrypt
5. JWT tokens expire after 7 days (configurable)

---

## MongoDB Aggregation Pipeline (Monthly Summary)

The monthly summary uses MongoDB aggregation:

1. **$match**: Filter expenses by userId
2. **$group** (first): Group by year, month, and category
3. **$group** (second): Group by year and month, aggregate categories
4. **$sort**: Sort by year and month descending
5. **$project**: Format output fields
