const API_URL = localStorage.getItem('apiUrl') || 'http://localhost:3000';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const res = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      localStorage.setItem('adminToken', data.token);
      showMessage('Login successful! Redirecting to dashboard...', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    } else {
      showMessage(data.message || 'Login failed', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showMessage('Cannot connect to server. Make sure the backend is running.', 'error');
  }
});

function showMessage(text, type) {
  const msg = document.getElementById('message');
  msg.textContent = text;
  msg.className = `message ${type}`;
}
