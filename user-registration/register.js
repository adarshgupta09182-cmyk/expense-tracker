document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (password !== confirmPassword) {
    showMessage('Passwords do not match!', 'error');
    return;
  }
  
  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role: 'user' })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      showMessage('Registration successful! Redirecting to login...', 'success');
      setTimeout(() => {
        window.location.href = 'http://localhost:3000/login.html';
      }, 2000);
    } else {
      showMessage(data.message, 'error');
    }
  } catch (error) {
    console.error('Registration error:', error);
    showMessage('Cannot connect to server. Make sure the main server is running on port 3000.', 'error');
  }
});

function showMessage(text, type) {
  const msg = document.getElementById('message');
  msg.textContent = text;
  msg.className = `message ${type}`;
}
