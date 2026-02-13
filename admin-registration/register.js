const API_URL = localStorage.getItem('apiUrl') || 'http://localhost:3000';

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const adminSecret = document.getElementById('adminSecret').value;
  
  if (password !== confirmPassword) {
    showMessage('Passwords do not match!', 'error');
    return;
  }
  
  if (!adminSecret) {
    showMessage('Admin Secret is required!', 'error');
    return;
  }
  
  try {
    const res = await fetch(`${API_URL}/api/admin/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, adminSecret })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      showMessage('Admin registration successful! Redirecting to login...', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      showMessage(data.message || 'Registration failed', 'error');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showMessage('Cannot connect to server. Make sure the backend is running.', 'error');
  }
});

function showMessage(text, type) {
  const msg = document.getElementById('message');
  msg.textContent = text;
  msg.className = `message ${type}`;
}
