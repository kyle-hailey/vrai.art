import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid reset link');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      });
      
      setMessage(response.data.message);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Invalid Reset Link</h2>
          <div className="alert alert-error">
            This password reset link is invalid or has expired.
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <a href="/forgot-password" className="btn btn-primary">
              Request New Reset Link
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p style={{ color: '#65676b', marginBottom: '20px', textAlign: 'center' }}>
          Enter your new password below.
        </p>

        {message && (
          <div className="alert alert-success">
            {message}
            <br />
            <small>Redirecting to login page...</small>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              disabled={loading}
              minLength="6"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !newPassword || !confirmPassword}
            style={{ width: '100%', marginTop: '20px' }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <a href="/login" style={{ color: '#1877f2', textDecoration: 'none' }}>
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
