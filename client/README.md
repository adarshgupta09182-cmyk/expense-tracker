# Expense Tracker - React Frontend

Modern React frontend built with Vite for the Expense Tracker application.

## Features

- User authentication (Login/Register)
- Protected routes with React Router
- Dashboard with expense management
- Add/Edit/Delete expenses
- Summary cards showing statistics
- Interactive charts (Pie & Bar charts)
- Responsive design
- JWT token management with Axios interceptors

## Tech Stack

- React 18
- Vite
- React Router v6
- Axios
- Recharts (for data visualization)

## Setup

1. Install dependencies:
```bash
cd client
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will run on http://localhost:5173

## Build for Production

```bash
npm run build
```

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ExpenseForm.jsx
│   │   ├── ExpenseTable.jsx
│   │   ├── SummaryCards.jsx
│   │   ├── ChartsSection.jsx
│   │   └── PrivateRoute.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Dashboard.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── utils/
│   │   └── axios.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

## API Integration

The frontend connects to the backend API running on http://localhost:3000

Vite proxy configuration handles API requests automatically.

## Features Implemented

✅ User Registration & Login
✅ JWT Token Management
✅ Protected Routes
✅ Expense CRUD Operations
✅ Real-time Statistics
✅ Data Visualization (Charts)
✅ Responsive Design
✅ Error Handling
✅ Loading States
