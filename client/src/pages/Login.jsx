import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedButton from '../components/AnimatedButton';
import './Auth.css';

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  // Debug: Log when localError changes
  useEffect(() => {
    console.log('localError state changed:', localError);
  }, [localError]);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Auto-hide error message
  useEffect(() => {
    if (localError) {
      const timer = setTimeout(() => setLocalError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [localError]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    setLocalError(null);
    clearError();

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login...');
      await login(formData.email, formData.password);
      console.log('Login successful, navigating to dashboard');
      setSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      console.log('Login error caught:', errorMsg);
      console.log('Error response:', err.response);
      setLocalError(errorMsg);
      console.log('Error state set to:', errorMsg);
    } finally {
      setLoading(false);
    }
  }, [formData, login, navigate, validateForm, clearError]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const handleFocus = useCallback((fieldName) => {
    setFocusedField(fieldName);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  const isFormValid = useMemo(() => {
    return formData.email && formData.password && !loading;
  }, [formData, loading]);

  const displayError = localError || authError;

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Left Side - Hero Section */}
        <div className="auth-hero">
          <div className="hero-content">
            <h1 className="hero-heading">Take Control of Your Finances</h1>
            <p className="hero-subheading">Track expenses, monitor spending trends, and manage your budget with clarity and confidence.</p>
            
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span className="feature-text">Real-time expense tracking</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span className="feature-text">Smart monthly analytics</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span className="feature-text">Secure & private data storage</span>
              </div>
            </div>
          </div>

          {/* Floating animation elements */}
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
                <button 
                  type="button"
                  onClick={() => setLocalError(null)} 
                  className="notification-close"
                >
                  ×
                </button>
              </div>
            )}

            {successMessage && (
              <div className="notification success-notification">
                <span className="notification-icon">✓</span>
                <span>{successMessage}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <div className={`input-wrapper ${focusedField === 'email' ? 'focused' : ''} ${errors.email ? 'error' : ''}`}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={handleBlur}
                    disabled={loading}
                    className={errors.email ? 'input-error' : ''}
                    autoComplete="email"
                  />
                  {focusedField === 'email' && <div className="input-focus-indicator"></div>}
                </div>
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <div className={`input-wrapper ${focusedField === 'password' ? 'focused' : ''} ${errors.password ? 'error' : ''}`}>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={handleBlur}
                    disabled={loading}
                    className={errors.password ? 'input-error' : ''}
                    autoComplete="current-password"
                  />
                  {focusedField === 'password' && <div className="input-focus-indicator"></div>}
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <AnimatedButton 
                type="submit" 
                disabled={!isFormValid}
                className={`${loading ? 'loading' : ''}`}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </AnimatedButton>
            </form>
            
            <p className="auth-link">
              Don't have an account? <Link to="/register">Register here</Link>
              <br />
              <Link to="/forgot-password">Forgot password?</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
