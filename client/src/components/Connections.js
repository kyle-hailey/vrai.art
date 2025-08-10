import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProfilePhoto from './ProfilePhoto';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/connections');
      setConnections(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load connections');
      console.error('Error fetching connections:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const removeConnection = async (connectionId) => {
    if (!window.confirm('Are you sure you want to remove this connection? You will no longer see each other\'s private posts.')) {
      return;
    }

    try {
      await api.delete(`/connections/${connectionId}`);
      showNotification('Connection removed successfully');
      fetchConnections();
    } catch (err) {
      console.error('Error removing connection:', err);
      showNotification(err.response?.data?.error || 'Failed to remove connection', 'error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <h3>Loading connections...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1>My Connections</h1>
        <p style={{ color: '#65676b', marginTop: '10px' }}>
          Manage your connections and see who you're connected with
        </p>
      </div>

      {notification.message && (
        <div className={`alert alert-${notification.type === 'error' ? 'error' : 'success'}`}>
          {notification.message}
        </div>
      )}

      {connections.length === 0 ? (
        <div className="empty-state">
          <h3>No connections yet</h3>
          <p>Start connecting with other users to see their private posts and share yours with them.</p>
          <Link to="/users" className="btn btn-primary" style={{ marginTop: '20px' }}>
            Find People to Connect With
          </Link>
        </div>
      ) : (
        <div>
          <div className="connections-header">
            <p style={{ color: '#65676b', marginBottom: '20px' }}>
              You have {connections.length} connection{connections.length !== 1 ? 's' : ''}. 
              Connected users can see each other's private posts.
            </p>
          </div>
          
          <div className="connections-grid">
            {connections.map((connection) => (
              <div key={connection.connection_id} className="connection-card">
                <div className="connection-info">
                  <ProfilePhoto
                    currentPhoto={connection.profile_photo}
                    size="medium"
                    username={connection.username}
                  />
                  <div className="user-details">
                    <h3 className="user-name">
                      <Link to={`/users/${connection.username}`} className="user-link">
                        {connection.username}
                      </Link>
                    </h3>
                    <p className="connection-date">
                      Connected since {formatDate(connection.connection_date)}
                    </p>
                  </div>
                </div>
                <div className="connection-actions">
                  <Link 
                    to={`/users/${connection.username}`} 
                    className="btn btn-secondary btn-sm"
                  >
                    View Profile
                  </Link>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => removeConnection(connection.connection_id)}
                    title="Remove connection"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Connections; 