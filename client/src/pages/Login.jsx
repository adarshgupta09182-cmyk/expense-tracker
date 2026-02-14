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
  const [showPassword, setShowPassword] = useState(false);
  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  // Debug: Log when localError changes
  useEffect(() => {
    console.log('localError state changed:', localError);
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
      navigate('/dashboard');
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

  const isFormValid = useMemo(() => {
    return formData.email && formData.password && !loading;
  }, [formData, loading]);

  const displayError = localError || authError;

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>💰 Expense Tracker</h1>
        <h2>Login</h2>
        
        {displayError && (
          <div className="error-message">
            <span>{displayError}</span>
            <button 
              type="button"
              onClick={() => {
                console.log('Close button clicked');
                setLocalError(null);
              }} 
              className="error-close"
            >
              ×
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className={errors.email ? 'input-error' : ''}
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className={errors.password ? 'input-error' : ''}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <AnimatedButton 
            type="submit" 
            disabled={!isFormValid}
            className={loading ? 'loading' : ''}
          >
            {loading ? 'Logging in...' : 'Login'}
          </AnimatedButton>
        </form>
        
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
          <br />
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
