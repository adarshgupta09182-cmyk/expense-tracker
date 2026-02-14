import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../utils/axios';
import AnimatedButton from '../components/AnimatedButton';
import './Auth.css';

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const ForgotPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [localError, setLocalError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

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

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!validatePassword(formData.newPassword)) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/auth/reset-password', {
        email: formData.email,
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        setSuccessMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Password reset failed';
      setLocalError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, navigate]);

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
    return formData.email && formData.newPassword && formData.confirmPassword && !loading;
  }, [formData, loading]);

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Left Side - Empty Hero Section */}
        <div className="auth-hero">
          {/* Floating animation elements */}
          <div className="floating-element element-1"></div>
          <div className="floating-element element-2"></div>
          <div className="floating-element element-3"></div>
        </div>

        {/* Right Side - Reset Password Card */}
        <div className="auth-form-container">
          <div className="auth-box">
            <h2>Reset Password</h2>
            
            {localError && (
              <div className="notification error-notification">
                <span className="notification-icon">✕</span>
                <span>{localError}</span>
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
                    placeholder="Enter your email"
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
                <div className={`input-wrapper ${focusedField === 'newPassword' ? 'focused' : ''} ${errors.newPassword ? 'error' : ''}`}>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    minLength="6"
                    value={formData.newPassword}
                    onChange={handleChange}
                    onFocus={() => handleFocus('newPassword')}
                    onBlur={handleBlur}
                    disabled={loading}
                    className={errors.newPassword ? 'input-error' : ''}
                    autoComplete="new-password"
                  />
                  {focusedField === 'newPassword' && <div className="input-focus-indicator"></div>}
                </div>
                {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
              </div>

              <div className="form-group">
                <div className={`input-wrapper ${focusedField === 'confirmPassword' ? 'focused' : ''} ${errors.confirmPassword ? 'error' : ''}`}>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
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
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </AnimatedButton>
            </form>
            
            <p className="auth-link">
              Remember your password? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
