# Budget Feature - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Start the Application
```bash
# Terminal 1: Backend
npm run start:mongodb

# Terminal 2: Frontend
cd client
npm run dev
```

### Step 2: Login to Dashboard
- Go to http://localhost:5173
- Login with your credentials
- You'll see the dashboard

### Step 3: Set Your Budget
1. Click **"⚙️ Budget Settings"** button (top right)
2. Enter your monthly budget (e.g., 50000)
3. Adjust warning threshold if needed (default: 80%)
4. Click **"Save Budget"**

### Step 4: Add Expenses
1. Use the expense form to add expenses
2. Watch the **BudgetCard** update in real-time
3. See the progress bar fill as you spend

### Step 5: Monitor Status
- **Green** = On track (under 80%)
- **Yellow** = Warning (80-100%)
- **Red** = Exceeded (over 100%)

## 📊 Budget Card Explained

```
┌─────────────────────────────────┐
│ Monthly Budget          ✓ On Track │
├─────────────────────────────────┤
│ Budget:    ₹50,000               │
│ Spent:     ₹35,000               │
│ Remaining: ₹15,000               │
├─────────────────────────────────┤
│ [████████░░░░░░░░░░░░░░░░░░░░░] │
│ 70% used                         │
├─────────────────────────────────┤
│ On Track: ₹15,000 remaining      │
└─────────────────────────────────┘
```

## 🎯 Key Features

### Set Budget
- Click settings button
- Enter amount
- Save

### Track Spending
- Real-time updates
- Progress bar
- Remaining amount

### Get Alerts
- 80% warning (yellow)
- 100% exceeded (red)
- Status messages

### View History
- Last 12 months
- Spending trends
- Budget comparison

## 🔧 API Quick Reference

### Get Budget
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/api/budget
```

### Set Budget
```bash
curl -X PUT \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"monthlyBudget": 50000, "budgetWarningThreshold": 80}' \
  http://localhost:3000/api/budget
```

### Get History
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/api/budget/history
```

## 📱 Mobile Responsive

- Works on all screen sizes
- Touch-friendly buttons
- Responsive layout
- Mobile-optimized modals

## ⚡ Performance

- Real-time updates
- Smooth animations
- Optimized calculations
- Efficient database queries

## 🔒 Security

- Requires authentication
- User data isolated
- Input validation
- Secure API endpoints

## 🐛 Troubleshooting

### Budget not showing?
1. Refresh page
2. Check browser console
3. Verify backend running
4. Check network tab

### Settings modal not opening?
1. Check console for errors
2. Verify CSS loaded
3. Try hard refresh (Ctrl+Shift+R)

### Budget not updating?
1. Add an expense
2. Check network requests
3. Verify API response
4. Refresh page

## 📚 Documentation

- `BUDGET-FEATURE.md` - Full documentation
- `BUDGET-SETUP.md` - Setup guide
- `BUDGET-SUMMARY.md` - Implementation summary

## 💡 Tips & Tricks

### Set Realistic Budget
- Review past spending
- Add 10-20% buffer
- Adjust monthly as needed

### Use Warning Threshold
- Default 80% is good
- Lower for stricter control
- Higher for flexibility

### Monitor Regularly
- Check dashboard daily
- Review spending patterns
- Adjust budget quarterly

### Plan Ahead
- Set budget before month starts
- Review history for trends
- Forecast next month

## 🎓 Example Scenarios

### Scenario 1: New User
1. Set budget: ₹50,000
2. Add expenses: ₹10,000
3. Status: Green (20% used)
4. Continue tracking

### Scenario 2: Approaching Limit
1. Budget: ₹50,000
2. Spent: ₹40,000
3. Status: Yellow (80% used)
4. Reduce spending

### Scenario 3: Over Budget
1. Budget: ₹50,000
2. Spent: ₹55,000
3. Status: Red (110% used)
4. Review expenses

## 🔄 Workflow

```
1. Set Budget
   ↓
2. Add Expenses
   ↓
3. Monitor Progress
   ↓
4. Get Alerts
   ↓
5. Adjust Spending
   ↓
6. Review History
   ↓
7. Plan Next Month
```

## 📊 Status Colors

| Color | Status | Action |
|-------|--------|--------|
| 🟢 Green | On Track | Continue |
| 🟡 Yellow | Warning | Reduce |
| 🔴 Red | Exceeded | Review |
| ⚪ Gray | No Budget | Set Budget |

## ✅ Checklist

- [ ] Backend running
- [ ] Frontend running
- [ ] Logged in
- [ ] Budget set
- [ ] Expenses added
- [ ] Status showing
- [ ] Progress bar visible
- [ ] Alerts working

## 🚀 Next Steps

1. Set your budget
2. Add some expenses
3. Watch the progress bar
4. Adjust as needed
5. Review history
6. Plan next month

## 📞 Support

- Check documentation
- Review browser console
- Check network requests
- Verify backend running
- Try refreshing page

## 🎉 You're Ready!

Your budget feature is now active. Start tracking your spending and stay within your budget!

---

**Happy Budgeting! 💰**
