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

const validateName = (name) => {
  return name.trim().length >= 2;
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const { register, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  // Debug: Log when localError changes
  useEffect(() => {
    console.log('localError state changed:', localError);
  }, [localError]);

  // Restore error from localStorage if it exists
  useEffect(() => {
    const storedError = localStorage.getItem('registerError');
    if (storedError) {
      console.log('Restoring error from localStorage:', storedError);
      setLocalError(storedError);
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (!validateName(formData.name)) {
      newErrors.name = 'Name must be at least 2 characters';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      console.log('Attempting registration...');
      await register(formData.name, formData.email, formData.password);
      console.log('Registration successful, navigating to login');
      // Clear any stored error on successful registration
      localStorage.removeItem('registerError');
      navigate('/login');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      console.log('Registration error caught:', errorMsg);
      console.log('Error response:', err.response);
      setLocalError(errorMsg);
      // Store error in localStorage as backup
      localStorage.setItem('registerError', errorMsg);
      console.log('Error state set to:', errorMsg);
    } finally {
      setLoading(false);
    }
  }, [formData, register, navigate, validateForm, clearError]);

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
    return formData.name && formData.email && formData.password && 
           formData.confirmPassword && !loading;
  }, [formData, loading]);

  const displayError = localError || authError;

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>💰 Expense Tracker</h1>
        <h2>Register</h2>
        
        {displayError && (
          <div className="error-message">
            <span>{displayError}</span>
            <button onClick={() => {
              console.log('Close button clicked');
              setLocalError(null);
              localStorage.removeItem('registerError');
            }} className="error-close">×</button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className={errors.name ? 'input-error' : ''}
              autoComplete="name"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

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
              minLength="6"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className={errors.password ? 'input-error' : ''}
              autoComplete="new-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              className={errors.confirmPassword ? 'input-error' : ''}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          <AnimatedButton 
            type="submit" 
            disabled={!isFormValid}
            className={loading ? 'loading' : ''}
          >
            {loading ? 'Registering...' : 'Register'}
          </AnimatedButton>
        </form>
        
        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
