import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getApiUrl } from '../config';
import './GroupsDiscovery.css';

const GroupsDiscovery = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, popular, recent
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicGroups();
  }, [filter]);

  const fetchPublicGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/groups`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch groups');
      }

      const data = await response.json();
      let sortedGroups = [...data.groups];

      // Apply sorting based on filter
      switch (filter) {
        case 'popular':
          sortedGroups.sort((a, b) => (b.member_count || 0) - (a.member_count || 0));
          break;
        case 'recent':
          sortedGroups.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        default:
          // Keep default order (already sorted by creation date)
          break;
      }

      setGroups(sortedGroups);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    if (!user || !token) {
      setError('You must be logged in to join groups');
      return;
    }

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

      // Update local state to show joined status
      setGroups(prev => prev.map(g => 
        g.id === groupId ? { ...g, isMember: true } : g
      ));

      // Show success message
      setError(null);
      // You could add a success toast here
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGroupClick = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return <div className="groups-discovery-container"><div className="loading">Discovering groups...</div></div>;
  }

  return (
    <div className="groups-discovery-container">
      <div className="discovery-header">
        <h1>Discover Groups</h1>
        <p>Find and join groups that interest you</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}

      <div className="discovery-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Groups
          </button>
          <button
            className={`filter-btn ${filter === 'popular' ? 'active' : ''}`}
            onClick={() => setFilter('popular')}
          >
            Most Popular
          </button>
          <button
            className={`filter-btn ${filter === 'recent' ? 'active' : ''}`}
            onClick={() => setFilter('recent')}
          >
            Recently Created
          </button>
        </div>
      </div>

      <div className="groups-grid">
        {filteredGroups.length === 0 ? (
          <div className="no-results">
            {searchTerm ? (
              <>
                <p>No groups found matching "{searchTerm}"</p>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </button>
              </>
            ) : (
              <p>No public groups available at the moment.</p>
            )}
          </div>
        ) : (
          filteredGroups.map(group => (
            <div key={group.id} className="discovery-group-card">
              <div className="group-header" onClick={() => handleGroupClick(group.id)}>
                <h3 className="group-name">{group.name}</h3>
                <div className="group-stats">
                  <span className="member-count">{group.member_count || 0} members</span>
                  <span className="created-date">
                    {new Date(group.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="group-description">
                {group.description || 'No description available'}
              </div>
              
              <div className="group-meta">
                <span className="creator-name">by {group.creator_name}</span>
                <span className={`privacy-badge ${group.is_public ? 'public' : 'private'}`}>
                  {group.is_public ? 'Public' : 'Private'}
                </span>
              </div>
              
              <div className="group-actions">
                {group.isMember ? (
                  <span className="member-badge">Already a member</span>
                ) : (
                  <button 
                    className="btn btn-primary btn-join"
                    onClick={() => handleJoinGroup(group.id)}
                  >
                    Join Group
                  </button>
                )}
                
                <button 
                  className="btn btn-secondary btn-view"
                  onClick={() => handleGroupClick(group.id)}
                >
                  View Group
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredGroups.length > 0 && (
        <div className="results-summary">
          <p>Showing {filteredGroups.length} of {groups.length} groups</p>
        </div>
      )}
    </div>
  );
};

export default GroupsDiscovery;
