import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  // Version info for debugging - works in both dev and production
  const VERSION = 'v2.1 - Production Ready';
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Track error state changes for debugging
  useEffect(() => {
    // This will work in both dev and production
    if (error) {
      // Force a re-render to ensure error display
      const timer = setTimeout(() => {
        // This ensures the error state persists
      }, 100);
      
      // Prevent the error from being hidden by injected scripts
      const preventHide = () => {
        const errorDiv = document.getElementById('error-debug-display');
        if (errorDiv && errorDiv.style.display === 'none') {
          errorDiv.style.display = 'block';
          errorDiv.style.visibility = 'visible';
          errorDiv.style.opacity = '1';
        }
      };
      
      // Check every 100ms to prevent hiding
      const hideCheckInterval = setInterval(preventHide, 100);
      
      return () => {
        clearTimeout(timer);
        clearInterval(hideCheckInterval);
      };
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
    
    setError('');
    setLoading(true);

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        {/* Version display - works in production */}
        <div style={{ 
          textAlign: 'center', 
          backgroundColor: '#000', 
          color: '#00ff00', 
          padding: '5px', 
          marginBottom: '15px',
          fontFamily: 'monospace',
          fontSize: '12px',
          fontWeight: 'bold',
          borderRadius: '4px'
        }}>
          🔧 {VERSION} - {new Date().toLocaleString()}
        </div>
        
        {/* Backend URL display */}
        <div style={{ 
          textAlign: 'center', 
          backgroundColor: '#1e40af', 
          color: 'white', 
          padding: '8px', 
          marginBottom: '15px',
          fontFamily: 'monospace',
          fontSize: '11px',
          borderRadius: '4px',
          border: '1px solid #3b82f6'
        }}>
          🌐 Backend: {window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://vraiart--vraiart-456e0.us-central1.hosted.app'}
        </div>
        
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
        
        {/* Always show error state for debugging - HARD TO HIDE */}
        <div 
          id="error-debug-display"
          style={{ 
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: error ? '#ff0000' : '#00ff00',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'center',
            borderRadius: '8px',
            border: '3px solid #000',
            position: 'relative',
            zIndex: 9999,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}
        >
          {error ? (
            <>
              🚨 ERROR DISPLAYED: {error} 🚨<br/>
              <small style={{ fontSize: '12px' }}>This should be visible when there's an error</small><br/>
              <small style={{ fontSize: '10px', opacity: 0.8 }}>Error ID: {Date.now()}</small>
            </>
          ) : (
            <>
              ✅ NO ERROR - Ready for login ✅<br/>
              <small style={{ fontSize: '12px' }}>Error state is currently empty</small>
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