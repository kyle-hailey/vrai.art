import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  console.log('🔍 Login component loaded - version 2.0 with improved error handling');
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Debug: Log when error state changes
  useEffect(() => {
    console.log('🔄 Error state changed to:', error);
  }, [error]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Login form submitted with username:', formData.username);
    
    setError('');
    setLoading(true);

    if (!formData.username || !formData.password) {
      console.log('❌ Form validation failed - missing fields');
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      console.log('📡 Calling login function...');
      const result = await login(formData.username, formData.password);
      console.log('📥 Login result received:', result);
      
      if (result.success) {
        console.log('✅ Login successful, navigating to home');
        navigate('/');
      } else {
        console.log('❌ Login failed with error:', result.error);
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('💥 Login submission error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      console.log('🏁 Login process completed, setting loading to false');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">Login</h2>
        <p style={{ textAlign: 'center', color: '#65676b', marginBottom: '20px' }}>
          Sign in to view posts and interact with the community
        </p>
        
        {error && (
          <div className="alert alert-error" style={{ 
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <strong>Error:</strong> {error}
            <br />
            <small style={{ fontSize: '12px', opacity: 0.8 }}>
              Debug: Error state is set to: "{error}"
            </small>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1877f2' }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 