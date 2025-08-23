import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../config';
import './GroupsSidebar.css';

const GroupsSidebar = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && token) {
      fetchUserGroups();
    }
  }, [user, token]);

  // Refresh groups when location changes (user navigates)
  useEffect(() => {
    if (user && token) {
      fetchUserGroups();
    }
  }, [location.pathname]);

  const fetchUserGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/user/groups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }

      const data = await response.json();
      setGroups(data.groups || []);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupClick = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  const handleMarkAsRead = async (groupId, e) => {
    e.stopPropagation(); // Prevent group navigation
    
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

  if (!user || !token) {
    return null; // Don't show sidebar if not logged in
  }

  if (loading) {
    return (
      <div className="groups-sidebar">
        <div className="sidebar-header">
          <h3>My Groups</h3>
        </div>
        <div className="sidebar-content">
          <div className="loading-groups">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="groups-sidebar">
        <div className="sidebar-header">
          <h3>My Groups</h3>
        </div>
        <div className="sidebar-content">
          <div className="error-message">Error loading groups</div>
        </div>
      </div>
    );
  }

  return (
    <div className="groups-sidebar">
      <div className="sidebar-header">
        <h3>My Groups</h3>
        <button 
          className="create-group-btn"
          onClick={() => navigate('/groups')}
          title="Create or manage groups"
        >
          +
        </button>
      </div>
      
      <div className="sidebar-content">
        {groups.length === 0 ? (
          <div className="no-groups">
            <p>No groups yet</p>
            <button 
              className="join-groups-btn"
              onClick={() => navigate('/discover')}
            >
              Discover Groups
            </button>
          </div>
        ) : (
          <div className="groups-list">
            {groups.map(group => (
              <div 
                key={group.id} 
                className={`group-item ${location.pathname.includes(`/groups/${group.id}`) ? 'active' : ''}`}
                onClick={() => handleGroupClick(group.id)}
              >
                <div className="group-info">
                  <span className="group-name">{group.name}</span>
                  {group.unread_posts > 0 && (
                    <span className="unread-badge">
                      {group.unread_posts}
                    </span>
                  )}
                </div>
                
                {group.unread_posts > 0 && (
                  <button 
                    className="mark-read-btn"
                    onClick={(e) => handleMarkAsRead(group.id, e)}
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="sidebar-footer">
          <button 
            className="discover-btn"
            onClick={() => navigate('/discover')}
          >
            Discover More Groups
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupsSidebar;
