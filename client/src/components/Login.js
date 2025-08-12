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
    // Force console output that's harder to hide
    console.warn('🔄 Error state changed to:', error);
    console.error('🚨 ERROR STATE UPDATE:', error);
    
    // Additional debugging for error visibility
    if (error) {
      console.warn('🔍 Error is set, checking DOM in 100ms...');
      setTimeout(() => {
        const errorDiv = document.querySelector('.alert-error');
        if (errorDiv) {
          console.warn('🎯 Found error div in DOM:', errorDiv);
          console.warn('🎯 Error div is visible:', errorDiv.offsetParent !== null);
          console.warn('🎯 Error div display style:', window.getComputedStyle(errorDiv).display);
          console.warn('🎯 Error div visibility style:', window.getComputedStyle(errorDiv).visibility);
          console.warn('🎯 Error div opacity style:', window.getComputedStyle(errorDiv).opacity);
        } else {
          console.error('❌ Error div NOT found in DOM after 100ms');
        }
      }, 100);
    }
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
        
        {/* Debug info - always visible and hard to miss */}
        <div style={{ 
          backgroundColor: '#ff0000', 
          color: 'white',
          padding: '15px', 
          marginBottom: '20px', 
          fontSize: '16px', 
          fontFamily: 'monospace',
          border: '3px solid #000',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          🚨 DEBUG INFO - ALWAYS VISIBLE 🚨<br/>
          Error State: "{error || 'none'}"<br/>
          Loading: {loading ? 'true' : 'false'}<br/>
          Timestamp: {new Date().toLocaleTimeString()}
        </div>
        
        {/* Always show error state for debugging */}
        <div style={{ 
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: error ? '#ff0000' : '#00ff00',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center',
          borderRadius: '8px',
          border: '2px solid #000'
        }}>
          {error ? (
            <>
              🚨 ERROR DISPLAYED: {error} 🚨<br/>
              <small>This should be visible when there's an error</small>
            </>
          ) : (
            <>
              ✅ NO ERROR - Ready for login ✅<br/>
              <small>Error state is currently empty</small>
            </>
          )}
        </div>
        
        {/* Original error display (conditional) */}
        {error && (
          <div 
            className="alert alert-error" 
            style={{ 
              marginBottom: '20px',
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <strong>Error:</strong> {error}
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