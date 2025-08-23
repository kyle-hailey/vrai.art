import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../config';
import './GroupsSidebar.css';

const GroupsSidebar = ({ onCollapseChange }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  // Notify parent component of collapse state changes
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);

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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (!user || !token) {
    return null; // Don't show sidebar if not logged in
  }

  // Additional check to ensure we're not on auth pages
  const isAuthPage = location.pathname === '/login' || 
                    location.pathname === '/register' || 
                    location.pathname === '/forgot-password' || 
                    location.pathname === '/reset-password';
  
  if (isAuthPage) {
    return null; // Don't show sidebar on authentication pages
  }

  if (loading) {
    return (
      <div className={`groups-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="user-section">
          <div className="user-info">
            <div className="user-avatar">
              {user.profile_photo ? (
                <img src={`${getApiUrl()}/uploads/${user.profile_photo}`} alt={user.username} />
              ) : (
                <span>{user.username.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="user-details">
                <div className="username">{user.username}</div>
                <div className="user-status">Online</div>
              </div>
            )}
          </div>
          <button 
            className="create-group-btn"
            onClick={() => navigate('/groups')}
            title="Create or manage groups"
          >
            +
          </button>
        </div>
        <div className="sidebar-content">
          <div className="loading-groups">Loading groups...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`groups-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="user-section">
          <div className="user-info">
            <div className="user-avatar">
              {user.profile_photo ? (
                <img src={`${getApiUrl()}/uploads/${user.profile_photo}`} alt={user.username} />
              ) : (
                <span>{user.username.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="user-details">
                <div className="username">{user.username}</div>
                <div className="user-status">Online</div>
              </div>
            )}
          </div>
          <button 
            className="create-group-btn"
            onClick={() => navigate('/groups')}
            title="Create or manage groups"
          >
            +
          </button>
        </div>
        <div className="sidebar-content">
          <div className="error-message">Error loading groups</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`groups-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* User Section */}
      <div className="user-section">
        <div className="user-info">
          <div className="user-avatar">
            {user.profile_photo ? (
              <img src={`${getApiUrl()}/uploads/${user.profile_photo}`} alt={user.username} />
            ) : (
              <span>{user.username.charAt(0).toUpperCase()}</span>
            )}
          </div>
          {!isCollapsed && (
            <div className="user-details">
              <div className="username">{user.username}</div>
              <div className="user-status">Online</div>
            </div>
          )}
        </div>
        <button 
          className="create-group-btn"
          onClick={() => navigate('/groups')}
          title="Create or manage groups"
        >
          +
        </button>
      </div>
      
      {/* Groups Section */}
      <div className="groups-section">
        <div className="section-header">
          <h3>My Groups</h3>
          <div className="header-controls">
            <span className="group-count">{groups.length}</span>
            <button 
              className="collapse-btn"
              onClick={toggleSidebar}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? '◀' : '▶'}
            </button>
          </div>
        </div>
        
        <div className="groups-list">
          {groups.length === 0 ? (
            <div className="no-groups">
              <p>No groups yet</p>
              <button 
                className="join-groups-btn"
                onClick={() => navigate('/discover')}
              >
                Join Groups
              </button>
            </div>
          ) : (
            groups.map(group => (
              <div 
                key={group.id} 
                className={`group-item ${location.pathname.includes(`/groups/${group.id}`) ? 'active' : ''}`}
                onClick={() => handleGroupClick(group.id)}
              >
                <div className="group-info">
                  <span className="group-name">{group.name}</span>
                  <span className={`unread-badge ${group.unread_posts > 0 ? 'has-unread' : 'no-unread'}`}>
                    {group.unread_posts}
                  </span>
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
            ))
          )}
        </div>
      </div>
      
      {/* Footer Section */}
      {!isCollapsed && (
        <div className="sidebar-footer">
          <button 
            className="discover-btn"
            onClick={() => navigate('/discover')}
          >
            Discover More Groups
          </button>
        </div>
      )}
    </div>
  );
};

export default GroupsSidebar;
