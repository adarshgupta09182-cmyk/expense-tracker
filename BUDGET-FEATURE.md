# Budget Feature Documentation

## Overview
The Budget Feature allows users to set a monthly spending limit and track their expenses against it. The system provides visual feedback with progress bars, warnings at 80% threshold, and alerts when budget is exceeded.

## Features

### 1. Set Monthly Budget
- Users can set their monthly spending limit
- Configurable warning threshold (default: 80%)
- Budget persists in the database
- Can be updated anytime

### 2. Budget Tracking
- Real-time calculation of current month spending
- Visual progress bar showing budget usage
- Remaining budget amount displayed
- Percentage of budget used shown

### 3. Budget Status Indicators
- **On Track (Green)**: Spending is below warning threshold
- **Warning (Yellow)**: Spending is between 80-100% of budget
- **Exceeded (Red)**: Spending exceeds the monthly budget

### 4. Budget History
- View last 12 months of budget vs actual spending
- Track spending patterns over time
- Identify trends and adjust budget accordingly

## Backend Implementation

### Database Schema (User Model)
```javascript
monthlyBudget: {
  type: Number,
  default: 0,
  min: [0, 'Budget cannot be negative']
}

budgetWarningThreshold: {
  type: Number,
  default: 80,
  min: [0, 'Threshold must be between 0 and 100'],
  max: [100, 'Threshold must be between 0 and 100']
}
```

### API Endpoints

#### GET /api/budget
Get current month budget and spending status

**Response:**
```json
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

#### PUT /api/budget
Update user's monthly budget and warning threshold

**Request Body:**
```json
{
  "monthlyBudget": 50000,
  "budgetWarningThreshold": 80
}
```

**Response:**
```json
{
  "success": true,
  "message": "Budget updated successfully",
  "data": {
    "monthlyBudget": 50000,
    "budgetWarningThreshold": 80
  }
}
```

#### GET /api/budget/history
Get budget history for last 12 months

**Response:**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "month": "Mar 2025",
      "budget": 50000,
      "spent": 42000,
      "remaining": 8000,
      "percentageUsed": 84,
      "isExceeded": false
    },
    ...
  ]
}
```

### Budget Controller Methods

#### getBudget()
- Calculates current month expenses
- Compares against user's budget
- Determines warning and exceeded status
- Returns budget data with status

#### setBudget()
- Validates budget amount (non-negative)
- Validates warning threshold (0-100)
- Updates user's budget settings
- Returns updated budget data

#### getBudgetHistory()
- Retrieves last 12 months of data
- Calculates spending for each month
- Compares against budget
- Returns historical data for analysis

## Frontend Implementation

### Components

#### BudgetCard Component
Displays current budget status with visual indicators

**Props:**
- `budget` (number): Monthly budget amount
- `totalSpent` (number): Amount spent this month
- `isWarning` (boolean): Whether spending is in warning range
- `isExceeded` (boolean): Whether budget is exceeded

**Features:**
- Color-coded status (green/yellow/red)
- Progress bar showing budget usage
- Remaining amount calculation
- Status message with actionable text

**Usage:**
```jsx
<BudgetCard 
  budget={budgetData.budget}
  totalSpent={budgetData.totalSpent}
  isWarning={budgetData.isWarning}
  isExceeded={budgetData.isExceeded}
/>
```

#### BudgetSettings Component
Modal for setting and updating budget

**Props:**
- `currentBudget` (number): Current monthly budget
- `currentThreshold` (number): Current warning threshold
- `onBudgetUpdate` (function): Callback when budget is updated

**Features:**
- Input field for monthly budget
- Slider for warning threshold
- Form validation
- Error handling
- Success feedback

**Usage:**
```jsx
<BudgetSettings 
  currentBudget={budgetData?.budget}
  currentThreshold={budgetData?.warningThreshold}
  onBudgetUpdate={handleBudgetUpdate}
/>
```

### Dashboard Integration

The Dashboard component now includes:
1. Budget Settings button in header
2. BudgetCard displaying current status
3. Automatic budget refresh when expenses change
4. Budget data fetched on component mount

**Key Changes:**
- Added `budgetData` state
- Added `fetchBudget()` function
- Updated `handleAddExpense()` to refresh budget
- Updated `handleDeleteExpense()` to refresh budget
- Added `handleBudgetUpdate()` callback

### Styling

#### BudgetCard.css
- Status-based color coding
- Progress bar styling
- Responsive grid layout
- Mobile-friendly design

#### BudgetSettings.css
- Modal overlay styling
- Form input styling
- Range slider customization
- Button states and transitions

## User Workflow

### Setting a Budget
1. Click "⚙️ Budget Settings" button on dashboard
2. Enter monthly budget amount
3. Adjust warning threshold (optional)
4. Click "Save Budget"
5. Budget card appears on dashboard

### Monitoring Budget
1. View BudgetCard on dashboard
2. Check current spending vs budget
3. See remaining amount
4. Monitor progress bar
5. Receive visual warnings at 80%

### Updating Budget
1. Click "⚙️ Budget Settings" button
2. Modify budget amount or threshold
3. Click "Save Budget"
4. Changes take effect immediately

## Validation Rules

### Budget Amount
- Must be non-negative
- Can be 0 (no budget set)
- Accepts decimal values
- No maximum limit

### Warning Threshold
- Must be between 0 and 100
- Represents percentage of budget
- Default: 80%
- Can be customized per user

## Status Determination Logic

```javascript
const percentageUsed = (totalSpent / budget) * 100;

if (totalSpent > budget) {
  status = 'exceeded';
} else if (percentageUsed >= warningThreshold) {
  status = 'warning';
} else {
  status = 'normal';
}
```

## Color Scheme

| Status | Color | Hex Code | Meaning |
|--------|-------|----------|---------|
| Normal | Green | #28a745 | On track |
| Warning | Yellow | #ffc107 | Approaching limit |
| Exceeded | Red | #dc3545 | Over budget |
| No Budget | Gray | #667eea | Not set |

## Performance Considerations

### Optimization Techniques
- useMemo for budget calculations
- useCallback for event handlers
- Lazy loading of budget history
- Efficient MongoDB aggregation queries

### Database Queries
- Indexed queries on userId and date
- Aggregation pipeline for monthly calculations
- Minimal data transfer

## Error Handling

### Frontend
- Form validation before submission
- Error messages displayed to user
- Graceful fallback if budget not set
- Network error handling

### Backend
- Input validation on all endpoints
- Proper HTTP status codes
- Descriptive error messages
- Transaction safety

## Testing Checklist

### Budget Setting
- [ ] Set budget successfully
- [ ] Update budget successfully
- [ ] Validate negative budget rejected
- [ ] Validate threshold range (0-100)
- [ ] Budget persists after refresh

### Budget Display
- [ ] BudgetCard shows correct amounts
- [ ] Progress bar displays correctly
- [ ] Status color changes appropriately
- [ ] Remaining amount calculated correctly
- [ ] Percentage shown accurately

### Budget Status
- [ ] Normal status when under threshold
- [ ] Warning status at 80%
- [ ] Exceeded status when over budget
- [ ] Status updates when expense added
- [ ] Status updates when expense deleted

### Budget History
- [ ] Last 12 months displayed
- [ ] Correct spending calculated
- [ ] Correct budget shown
- [ ] Exceeded flag accurate
- [ ] Sorted chronologically

## Future Enhancements

- [ ] Category-specific budgets
- [ ] Budget alerts via email/SMS
- [ ] Budget forecasting
- [ ] Recurring budget templates
- [ ] Budget comparison with previous months
- [ ] Budget export to CSV/PDF
- [ ] Budget sharing with family members
- [ ] Spending recommendations based on budget

## API Documentation

See `API-DOCUMENTATION.md` for complete API reference including:
- Request/response examples
- Error codes
- Rate limiting
- Authentication requirements

## Troubleshooting

### Budget Not Showing
- Verify backend is running
- Check browser console for errors
- Ensure user is authenticated
- Verify API endpoint is accessible

### Budget Not Updating
- Refresh page to reload data
- Check network tab for failed requests
- Verify budget amount is valid
- Check for validation errors

### Progress Bar Not Displaying
- Verify budget is set (not 0)
- Check CSS is loaded
- Verify browser supports CSS Grid
- Check for JavaScript errors

## Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Check network requests in DevTools
4. Verify backend is running
5. Check database connection
