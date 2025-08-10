import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [connectionCount, setConnectionCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchConnectionCount();
    }
  }, [user]);

  const fetchConnectionCount = async () => {
    try {
      const response = await api.get('/connections');
      setConnectionCount(response.data.length);
    } catch (err) {
      console.error('Error fetching connection count:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            Vrai.Art Social
          </Link>
          
          <div className="navbar-nav">
            {user ? (
              <>
                <Link to="/" className="nav-link">
                  Home
                </Link>
                <Link to="/create-post" className="nav-link">
                  Create Post
                </Link>
                <Link to="/users" className="nav-link">
                  Users
                </Link>
                <Link to="/connections" className="nav-link">
                  Connections
                  {connectionCount > 0 && (
                    <span className="connection-badge">
                      {connectionCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="nav-link">
                  Profile
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 