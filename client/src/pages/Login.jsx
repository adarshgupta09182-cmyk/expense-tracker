import { useState, useCallback, useMemo } from 'react';
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
  const { login, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

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
    setLocalError(null);
    clearError();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setLocalError(errorMsg);
      console.log('Login error set:', errorMsg);
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
            <button onClick={() => setLocalError(null)} className="error-close">×</button>
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
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className={errors.password ? 'input-error' : ''}
              autoComplete="current-password"
            />
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
