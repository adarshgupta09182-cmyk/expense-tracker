import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import '../pages/Auth.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await axios.get(`/api/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Email Verification</h1>
        
        <div className={`verification-status ${status}`}>
          {status === 'verifying' && (
            <>
              <div className="spinner"></div>
              <p>{message}</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="success-icon">✓</div>
              <p>{message}</p>
              <p style={{ fontSize: '14px', marginTop: '10px' }}>
                Redirecting to login...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="error-icon">✕</div>
              <p>{message}</p>
              <button 
                onClick={() => navigate('/register')}
                className="btn-primary"
              >
                Back to Register
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        .verification-status {
          text-align: center;
          padding: 20px;
        }

        .verification-status.verifying {
          color: #6366F1;
        }

        .verification-status.success {
          color: #10B981;
        }

        .verification-status.error {
          color: #EF4444;
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #6366F1;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .success-icon,
        .error-icon {
          font-size: 48px;
          margin: 20px 0;
        }

        .success-icon {
          color: #10B981;
        }

        .error-icon {
          color: #EF4444;
        }
      `}</style>
    </div>
  );
};

export default VerifyEmail;
