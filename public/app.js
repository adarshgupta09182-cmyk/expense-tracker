// Check authentication
const user = JSON.parse(localStorage.getItem('user') || '{}');
const token = localStorage.getItem('token');

if (!token || user.role !== 'user') {
  window.location.href = 'login.html';
}

document.getElementById('userName').textContent = user.name;

let expenses = [];

// Set today's date as default
document.getElementById('date').valueAsDate = new Date();

// Load expenses
async function loadExpenses() {
  try {
    const res = await fetch('/api/expenses', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        logout();
        return;
      }
      throw new Error('Failed to load expenses');
    }
    
    const response = await res.json();
    expenses = response.data || response;
    renderExpenses();
  } catch (error) {
    console.error('Error loading expenses:', error);
    alert('Failed to load expenses. Please try again.');
  }
}

// Add expense
document.getElementById('expenseForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const expense = {
    description: document.getElementById('description').value,
    amount: parseFloat(document.getElementById('amount').value),
    category: document.getElementById('category').value,
    date: document.getElementById('date').value
  };

  try {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(expense)
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to add expense');
    }

    e.target.reset();
    document.getElementById('date').valueAsDate = new Date();
    loadExpenses();
  } catch (error) {
    console.error('Error adding expense:', error);
    alert(error.message);
  }
});

// Delete expense
async function deleteExpense(id) {
  if (!confirm('Are you sure you want to delete this expense?')) {
    return;
  }
  
  try {
    const res = await fetch(`/api/expenses/${id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) {
      throw new Error('Failed to delete expense');
    }
    
    loadExpenses();
  } catch (error) {
    console.error('Error deleting expense:', error);
    alert('Failed to delete expense. Please try again.');
  }
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

// Filter expenses
document.getElementById('filterCategory').addEventListener('change', renderExpenses);

// Render expenses
function renderExpenses() {
  const filter = document.getElementById('filterCategory').value;
  const filtered = filter ? expenses.filter(e => e.category === filter) : expenses;
  
  const total = filtered.reduce((sum, e) => sum + (e.amount || 0), 0);
  document.getElementById('totalAmount').textContent = `₹${total.toFixed(2)}`;

  const list = document.getElementById('expenseList');
  list.innerHTML = filtered.map(e => `
    <div class="expense-item">
      <div class="expense-info">
        <div class="expense-description">
          ${e.description}
          <span class="category-badge">${e.category}</span>
        </div>
        <div class="expense-meta">${new Date(e.date).toLocaleDateString()}</div>
      </div>
      <div class="expense-amount">₹${e.amount.toFixed(2)}</div>
      <button class="delete-btn" onclick="deleteExpense('${e._id}')">Delete</button>
    </div>
  `).join('');
}

loadExpenses();
