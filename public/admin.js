// Check authentication
const user = JSON.parse(localStorage.getItem('user') || '{}');
const token = localStorage.getItem('token');

if (!token || user.role !== 'admin') {
  window.location.href = 'login.html';
}

document.getElementById('userName').textContent = user.name;

async function loadDashboard() {
  try {
    const res = await fetch('/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      throw new Error('Failed to load dashboard');
    }
    
    const response = await res.json();
    const data = response.data || response;
    
    const users = data.users || [];
    const expenses = data.expenses || [];
    
    document.getElementById('totalUsers').textContent = users.length;
    
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    document.getElementById('totalExpenses').textContent = `₹${totalExpenses.toFixed(2)}`;
    
    // Render users
    document.getElementById('userList').innerHTML = users.map(u => `
      <div class="expense-item">
        <div class="expense-info">
          <div class="expense-description">${u.name}</div>
          <div class="expense-meta">${u.email} - ${u.role}</div>
        </div>
      </div>
    `).join('');
    
    // Render expenses
    document.getElementById('expenseList').innerHTML = expenses.map(e => `
      <div class="expense-item">
        <div class="expense-info">
          <div class="expense-description">
            ${e.description}
            <span class="category-badge">${e.category}</span>
          </div>
          <div class="expense-meta">${new Date(e.date).toLocaleDateString()} - User: ${e.userId?.name || 'Unknown'}</div>
        </div>
        <div class="expense-amount">₹${e.amount.toFixed(2)}</div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading dashboard:', error);
    alert('Failed to load dashboard. Please try again.');
  }
}

function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

loadDashboard();
