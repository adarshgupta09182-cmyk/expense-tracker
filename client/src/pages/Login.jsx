import { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedButton from '../components/AnimatedButton';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  // Force dark theme on the html element while on login page
  // This prevents browser autofill from using light-mode colors
  useEffect(() => {
    const html = document.documentElement;
    const previousTheme = html.getAttribute('data-theme');
    html.setAttribute('data-theme', 'dark');
    return () => {
      // Restore previous theme when leaving login page
      if (previousTheme) {
        html.setAttribute('data-theme', previousTheme);
      }
    };
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLocalError(null);
    clearError?.();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }, [formData, login, navigate, clearError]);

  const displayError = localError || authError;

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Left Side - Hero */}
        <div className="auth-hero">
          <div className="hero-content">
            <h1 className="hero-heading">Take Control of Your Finances</h1>
            <p className="hero-subheading">Track expenses, monitor spending trends, and manage your budget with clarity and confidence.</p>
            <div className="features-list">
              <div className="feature-item"><span className="feature-icon">⚡</span><span className="feature-text">Real-time expense tracking</span></div>
              <div className="feature-item"><span className="feature-icon">📊</span><span className="feature-text">Smart monthly analytics</span></div>
              <div className="feature-item"><span className="feature-icon">🔒</span><span className="feature-text">Secure & private data storage</span></div>
            </div>
          </div>
          <div className="floating-element element-1"></div>
          <div className="floating-element element-2"></div>
          <div className="floating-element element-3"></div>
        </div>

        {/* Right Side - Login Card */}
        <div className="auth-form-container">
          <div className="auth-box">
            <h2>Login</h2>

            {displayError && (
              <div className="notification error-notification">
                <span className="notification-icon">✕</span>
                <span>{displayError}</span>
                <button type="button" onClick={() => setLocalError(null)} className="notification-close">×</button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <div className={`input-wrapper ${focusedField === 'email' ? 'focused' : ''}`}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    disabled={loading}
                    autoComplete="email"
                    required
                  />
                  {focusedField === 'email' && <div className="input-focus-indicator"></div>}
                </div>
              </div>

              <div className="form-group">
                <div className={`input-wrapper ${focusedField === 'password' ? 'focused' : ''}`}>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    disabled={loading}
                    autoComplete="current-password"
                    required
                  />
                  {focusedField === 'password' && <div className="input-focus-indicator"></div>}
                </div>
              </div>

              <AnimatedButton type="submit" disabled={loading || !formData.email || !formData.password}>
                {loading ? <><span className="spinner"></span>Logging in...</> : 'Login'}
              </AnimatedButton>
            </form>

            <p className="auth-link">
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
            <p className="auth-link">
              <Link to="/forgot-password">Forgot password?</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
