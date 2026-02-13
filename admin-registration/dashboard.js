const API_URL = localStorage.getItem('apiUrl') || 'http://localhost:3000';
let adminToken = localStorage.getItem('adminToken');
let currentUserId = null;
let allUsers = [];
let allExpenses = [];

// Check authentication
if (!adminToken) {
  window.location.href = 'login.html';
}

// Tab switching
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    switchTab(tab);
  });
});

function switchTab(tab) {
  // Update active button
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

  // Update active content
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  document.getElementById(`${tab}Tab`).classList.add('active');

  // Update page title
  const titles = {
    users: 'Users Management',
    expenses: 'Expenses Management',
    stats: 'Dashboard Statistics'
  };
  document.getElementById('pageTitle').textContent = titles[tab];

  // Load data
  if (tab === 'users') loadUsers();
  else if (tab === 'expenses') loadExpenses();
  else if (tab === 'stats') loadStats();
}

// Load users
async function loadUsers() {
  try {
    const res = await fetch(`${API_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    if (res.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = 'login.html';
      return;
    }

    const data = await res.json();
    allUsers = data.data || [];

    document.getElementById('userCount').textContent = allUsers.length;

    const container = document.getElementById('usersContainer');
    if (allUsers.length === 0) {
      container.innerHTML = '<p class="loading">No users found</p>';
      return;
    }

    container.innerHTML = allUsers.map(user => `
      <div class="user-card" onclick="openUserModal(${user.id})">
        <div class="user-card-header">
          <div class="user-info">
            <h4>${user.name}</h4>
            <p>${user.email}</p>
          </div>
          <span class="count-badge">${user.role}</span>
        </div>
        <div class="user-stats">
          <div class="stat">
            <span class="stat-label">Expenses</span>
            <span class="stat-value">${user.expenseCount || 0}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Total Spent</span>
            <span class="stat-value">₹${(user.totalSpent || 0).toFixed(2)}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Budget</span>
            <span class="stat-value">₹${(user.monthlyBudget || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading users:', error);
    document.getElementById('usersContainer').innerHTML = '<p class="loading">Error loading users</p>';
  }
}

// Load expenses
async function loadExpenses() {
  try {
    const res = await fetch(`${API_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    if (res.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = 'login.html';
      return;
    }

    const data = await res.json();
    allExpenses = [];

    // Collect all expenses from all users
    for (const user of (data.data || [])) {
      const userRes = await fetch(`${API_URL}/api/admin/users/${user.id}`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const userData = await userRes.json();
      if (userData.data && userData.data.expenses) {
        allExpenses.push(...userData.data.expenses.map(exp => ({ ...exp, userName: user.name })));
      }
    }

    document.getElementById('expenseCount').textContent = allExpenses.length;

    const container = document.getElementById('expensesContainer');
    if (allExpenses.length === 0) {
      container.innerHTML = '<p class="loading">No expenses found</p>';
      return;
    }

    container.innerHTML = allExpenses.map(expense => `
      <div class="expense-card">
        <div class="expense-info">
          <h4>${expense.description}</h4>
          <p>By: ${expense.userName}</p>
          <span class="expense-category">${expense.category}</span>
        </div>
        <div style="text-align: right;">
          <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
          <p style="font-size: 12px; color: #999; margin-top: 5px;">${new Date(expense.date).toLocaleDateString()}</p>
          <button class="btn btn-danger" style="margin-top: 10px;" onclick="deleteExpense(${expense.id})">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading expenses:', error);
    document.getElementById('expensesContainer').innerHTML = '<p class="loading">Error loading expenses</p>';
  }
}

// Load statistics
async function loadStats() {
  try {
    const res = await fetch(`${API_URL}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    if (res.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = 'login.html';
      return;
    }

    const stats = await res.json();
    const data = stats.data || {};

    const container = document.getElementById('statsContainer');
    container.innerHTML = `
      <div class="stat-card">
        <h4>Total Users</h4>
        <div class="value">${data.totalUsers || 0}</div>
      </div>
      <div class="stat-card">
        <h4>Total Expenses</h4>
        <div class="value">${data.totalExpenses || 0}</div>
      </div>
      <div class="stat-card">
        <h4>Total Amount Spent</h4>
        <div class="value">₹${(data.totalAmount || 0)}</div>
      </div>
      <div class="stat-card">
        <h4>Average Expense</h4>
        <div class="value">₹${(data.avgExpense || 0)}</div>
      </div>
      <div class="stat-card">
        <h4>Admin Count</h4>
        <div class="value">${data.adminCount || 0}</div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading stats:', error);
    document.getElementById('statsContainer').innerHTML = '<p class="loading">Error loading statistics</p>';
  }
}

// Open user modal
function openUserModal(userId) {
  currentUserId = userId;
  const user = allUsers.find(u => u.id === userId);

  if (!user) return;

  const details = document.getElementById('userDetails');
  details.innerHTML = `
    <div class="detail-row">
      <span class="detail-label">Name:</span>
      <span class="detail-value">${user.name}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Email:</span>
      <span class="detail-value">${user.email}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Role:</span>
      <span class="detail-value">${user.role}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Total Expenses:</span>
      <span class="detail-value">${user.expenseCount || 0}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Total Spent:</span>
      <span class="detail-value">₹${(user.totalSpent || 0).toFixed(2)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Budget:</span>
      <span class="detail-value">₹${(user.monthlyBudget || 0).toFixed(2)}</span>
    </div>
  `;

  document.getElementById('userModal').classList.add('show');
}

// Delete user
async function deleteUser() {
  if (!currentUserId) return;

  if (!confirm('Are you sure you want to delete this user and all their expenses?')) {
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/admin/users/${currentUserId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    if (res.ok) {
      alert('User deleted successfully');
      document.getElementById('userModal').classList.remove('show');
      loadUsers();
    } else {
      alert('Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Error deleting user');
  }
}

// Delete expense
async function deleteExpense(expenseId) {
  if (!confirm('Are you sure you want to delete this expense?')) {
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/admin/expenses/${expenseId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    if (res.ok) {
      alert('Expense deleted successfully');
      loadExpenses();
    } else {
      alert('Failed to delete expense');
    }
  } catch (error) {
    console.error('Error deleting expense:', error);
    alert('Error deleting expense');
  }
}

// Modal controls
document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('userModal').classList.remove('show');
});

document.querySelector('.close-modal').addEventListener('click', () => {
  document.getElementById('userModal').classList.remove('show');
});

document.getElementById('deleteUserBtn').addEventListener('click', deleteUser);

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('adminToken');
  window.location.href = 'login.html';
});

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const cards = document.querySelectorAll('.user-card');
  
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(query) ? 'block' : 'none';
  });
});

// Get admin name
async function loadAdminName() {
  try {
    const res = await fetch(`${API_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    if (res.ok) {
      // For now, just show "Admin"
      document.getElementById('adminName').textContent = 'Admin';
    }
  } catch (error) {
    console.error('Error loading admin name:', error);
  }
}

// Initialize
loadAdminName();
loadUsers();
