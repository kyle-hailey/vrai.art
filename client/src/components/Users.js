import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ProfilePhoto from './ProfilePhoto';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [connectionCount, setConnectionCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
    fetchConnectionCount();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionCount = async () => {
    try {
      const response = await api.get('/connections');
      setConnectionCount(response.data.length);
    } catch (err) {
      console.error('Error fetching connection count:', err);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const sendConnectionRequest = async (userId) => {
    try {
      await api.post('/connections/request', { addresseeId: userId });
      showNotification('Connection request sent successfully!');
      // Refresh users to update connection status
      fetchUsers();
    } catch (err) {
      console.error('Error sending connection request:', err);
      showNotification(err.response?.data?.error || 'Failed to send connection request', 'error');
    }
  };

  const acceptConnection = async (requesterId) => {
    try {
      await api.post('/connections/accept', { requesterId });
      showNotification('Connection accepted! You can now see each other\'s private posts.');
      fetchUsers();
      fetchConnectionCount();
    } catch (err) {
      console.error('Error accepting connection:', err);
      showNotification(err.response?.data?.error || 'Failed to accept connection', 'error');
    }
  };

  const rejectConnection = async (requesterId) => {
    try {
      await api.post('/connections/reject', { requesterId });
      showNotification('Connection request rejected.');
      fetchUsers();
    } catch (err) {
      console.error('Error rejecting connection:', err);
      showNotification(err.response?.data?.error || 'Failed to reject connection', 'error');
    }
  };

  const getConnectionButton = (user) => {
    switch (user.connection_status) {
      case 'connected':
        return (
          <div className="connection-status connected">
            <span>✓ Connected</span>
            <small>You can see each other's private posts</small>
          </div>
        );
      case 'pending_sent':
        return (
          <div className="connection-status pending">
            <span>⏳ Request Sent</span>
            <small>Waiting for response</small>
          </div>
        );
      case 'pending_received':
        return (
          <div className="connection-actions">
            <button 
              className="btn btn-success btn-sm" 
              onClick={() => acceptConnection(user.id)}
            >
              ✓ Accept
            </button>
            <button 
              className="btn btn-danger btn-sm" 
              onClick={() => rejectConnection(user.id)}
            >
              ✕ Reject
            </button>
          </div>
        );
      case 'rejected':
        return (
          <div className="connection-status rejected">
            <span>✕ Rejected</span>
            <small>Connection was declined</small>
          </div>
        );
      default:
        return (
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => sendConnectionRequest(user.id)}
          >
            + Connect
          </button>
        );
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
        <h3>Loading users...</h3>
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
        <h1>Find People to Connect With</h1>
        <p style={{ color: '#65676b', marginTop: '10px' }}>
          Discover and connect with other users on the platform. 
          {connectionCount > 0 && (
            <span style={{ marginLeft: '10px', fontWeight: '500', color: '#1877f2' }}>
              You have {connectionCount} connection{connectionCount !== 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      {notification.message && (
        <div className={`alert alert-${notification.type === 'error' ? 'error' : 'success'}`}>
          {notification.message}
        </div>
      )}

      {users.length === 0 ? (
        <div className="empty-state">
          <h3>No other users found</h3>
          <p>You're the first user on the platform!</p>
        </div>
      ) : (
        <div className="users-grid">
          {users.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-info">
                <ProfilePhoto
                  currentPhoto={user.profile_photo}
                  size="medium"
                  username={user.username}
                />
                <div className="user-details">
                  <h3 className="user-name">{user.username}</h3>
                  <p className="user-joined">Joined {formatDate(user.created_at)}</p>
                </div>
              </div>
              <div className="user-actions">
                {getConnectionButton(user)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Users; 