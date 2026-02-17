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
  const [successMessage, setSuccessMessage] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const { register, error: authError, clearError } = useAuth();
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
      console.log('Registration successful');
      setSuccessMessage('Registration successful! Check your email to verify your account.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      console.log('Registration error caught:', errorMsg);
      console.log('Error response:', err.response);
      setLocalError(errorMsg);
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

  const handleFocus = useCallback((fieldName) => {
    setFocusedField(fieldName);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  const isFormValid = useMemo(() => {
    return formData.name && formData.email && formData.password && 
           formData.confirmPassword && !loading;
  }, [formData, loading]);

  const displayError = localError || authError;

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Left Side - Hero Section */}
        <div className="auth-hero" style={{ opacity: loading ? 0 : 1, pointerEvents: loading ? 'none' : 'auto', transition: 'opacity 0.3s ease' }}>
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

        {/* Right Side - Register Card */}
        <div className="auth-form-container">
          <div className="auth-box">
            <h2>Register</h2>
            
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
                <div className={`input-wrapper ${focusedField === 'name' ? 'focused' : ''} ${errors.name ? 'error' : ''}`}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => handleFocus('name')}
                    onBlur={handleBlur}
                    disabled={loading}
                    className={errors.name ? 'input-error' : ''}
                    autoComplete="name"
                  />
                  {focusedField === 'name' && <div className="input-focus-indicator"></div>}
                </div>
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

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
                    minLength="6"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={handleBlur}
                    disabled={loading}
                    className={errors.password ? 'input-error' : ''}
                    autoComplete="new-password"
                  />
                  {focusedField === 'password' && <div className="input-focus-indicator"></div>}
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className="form-group">
                <div className={`input-wrapper ${focusedField === 'confirmPassword' ? 'focused' : ''} ${errors.confirmPassword ? 'error' : ''}`}>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => handleFocus('confirmPassword')}
                    onBlur={handleBlur}
                    disabled={loading}
                    className={errors.confirmPassword ? 'input-error' : ''}
                    autoComplete="new-password"
                  />
                  {focusedField === 'confirmPassword' && <div className="input-focus-indicator"></div>}
                </div>
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>

              <AnimatedButton 
                type="submit" 
                disabled={!isFormValid}
                className={`${loading ? 'loading' : ''}`}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Registering...
                  </>
                ) : (
                  'Register'
                )}
              </AnimatedButton>
            </form>
            
            <p className="auth-link">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
