import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../config';
import './Groups.css';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', isPublic: true });
  const { user, token } = useAuth();
  const navigate = useNavigate();

  console.log('Groups component mounted');
  console.log('Current user:', user);
  console.log('Current token:', token ? 'exists' : 'missing');
  console.log('Token length:', token ? token.length : 0);
  console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'none');
  console.log('User object keys:', user ? Object.keys(user) : 'no user');
  console.log('useAuth hook result:', { user, token });

  useEffect(() => {
    console.log('Groups useEffect triggered');
    if (user && token) {
      console.log('User and token found, fetching groups...');
      fetchUserGroups();
    } else {
      console.log('No user or token, setting loading to false');
      setLoading(false);
    }
  }, [user, token]);

  const fetchUserGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching user groups...');
      console.log('API URL:', `${getApiUrl()}/user/groups`);
      console.log('User:', user);
      console.log('Token exists:', !!token);
      
      const response = await fetch(`${getApiUrl()}/user/groups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch groups: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Groups data received:', data);
      
      setGroups(data.groups || []);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError(err.message || 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    
    if (!newGroup.name.trim()) {
      setError('Group name is required');
      return;
    }

    try {
      const response = await fetch(`${getApiUrl()}/groups`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newGroup)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create group');
      }

      const data = await response.json();
      setGroups(prev => [data.group, ...prev]);
      setNewGroup({ name: '', description: '', isPublic: true });
      setShowCreateForm(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const response = await fetch(`${getApiUrl()}/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join group');
      }

      // Refresh groups to show newly joined group
      fetchUserGroups();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to leave this group?')) {
      return;
    }

    try {
      const response = await fetch(`${getApiUrl()}/groups/${groupId}/leave`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to leave group');
      }

      // Remove group from local state
      setGroups(prev => prev.filter(g => g.id !== groupId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGroupClick = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  const handleMarkAsRead = async (groupId) => {
    try {
      await fetch(`${getApiUrl()}/groups/${groupId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update local state to clear unread count
      setGroups(prev => prev.map(g => 
        g.id === groupId ? { ...g, unread_posts: 0 } : g
      ));
    } catch (err) {
      console.error('Failed to mark group as read:', err);
    }
  };

  if (loading) {
    return <div className="groups-container"><div className="loading">Loading groups...</div></div>;
  }

  return (
    <div className="groups-container">
      <div className="groups-header">
        <h1>My Groups</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create Group'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}

      {showCreateForm && (
        <div className="create-group-form">
          <h3>Create New Group</h3>
          <form onSubmit={handleCreateGroup}>
            <div className="form-group">
              <label htmlFor="groupName">Group Name *</label>
              <input
                type="text"
                id="groupName"
                value={newGroup.name}
                onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter group name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="groupDescription">Description</label>
              <textarea
                id="groupDescription"
                value={newGroup.description}
                onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this group is about"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={newGroup.isPublic}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, isPublic: e.target.checked }))}
                />
                Public Group (anyone can join)
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Create Group</button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="groups-list">
        {groups.length === 0 ? (
          <div className="no-groups">
            <p>You haven't joined any groups yet.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Group
            </button>
          </div>
        ) : (
          groups.map(group => (
            <div key={group.id} className="group-card">
              <div className="group-header" onClick={() => handleGroupClick(group.id)}>
                <h3 className="group-name">{group.name}</h3>
                <div className="group-stats">
                  <span className="member-count">{group.total_posts} posts</span>
                  {group.unread_posts > 0 && (
                    <span className="unread-count">{group.unread_posts} new</span>
                  )}
                </div>
              </div>
              
              <div className="group-description">
                {group.description || 'No description available'}
              </div>
              
              <div className="group-meta">
                <span className="role-badge">{group.role}</span>
                <span className="joined-date">Joined {new Date(group.joined_at).toLocaleDateString()}</span>
              </div>
              
              <div className="group-actions">
                {group.unread_posts > 0 && (
                  <button 
                    className="btn btn-small btn-secondary"
                    onClick={() => handleMarkAsRead(group.id)}
                  >
                    Mark as Read
                  </button>
                )}
                
                <button 
                  className="btn btn-small btn-danger"
                  onClick={() => handleLeaveGroup(group.id)}
                >
                  Leave Group
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Groups;
