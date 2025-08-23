import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../config';
import './GroupDetail.css';

const GroupDetail = () => {
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { groupId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (groupId && user && token) {
      fetchGroupDetails();
      fetchGroupPosts();
    }
  }, [groupId, user, token]);

  const fetchGroupDetails = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/groups/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch group details');
      }

      const data = await response.json();
      setGroup(data.group);
    } catch (err) {
      console.error('Error fetching group details:', err);
      setError(err.message);
    }
  };

  const fetchGroupPosts = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/groups/${groupId}/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch group posts');
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Error fetching group posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    navigate('/create-post');
  };

  if (loading) {
    return (
      <div className="group-detail">
        <div className="loading">Loading group...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="group-detail">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/groups')} className="btn btn-secondary">
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="group-detail">
        <div className="error-message">
          <h2>Group Not Found</h2>
          <p>The group you're looking for doesn't exist or you don't have access to it.</p>
          <button onClick={() => navigate('/groups')} className="btn btn-secondary">
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group-detail">
      {/* Group Header */}
      <div className="group-header">
        <div className="group-info">
          <h1 className="group-name">{group.name}</h1>
          {group.description && (
            <p className="group-description">{group.description}</p>
          )}
          <div className="group-meta">
            <span className="group-stats">
              {posts.length} post{posts.length !== 1 ? 's' : ''}
            </span>
            <span className="group-privacy">
              {group.is_public ? 'Public Group' : 'Private Group'}
            </span>
          </div>
        </div>
        
        <div className="group-actions">
          <button 
            className="btn btn-primary"
            onClick={handleCreatePost}
          >
            Create Post
          </button>
        </div>
      </div>

      {/* Group Posts */}
      <div className="group-posts">
        {posts.length === 0 ? (
          <div className="no-posts">
            <div className="no-posts-icon">📝</div>
            <h3>No posts yet</h3>
            <p>Be the first to share something in this group!</p>
            <button 
              className="btn btn-primary"
              onClick={handleCreatePost}
            >
              Create First Post
            </button>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-author">
                    <span className="author-name">{post.username}</span>
                    <span className="post-date">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="post-content">
                  <p>{post.content}</p>
                  {post.image_filename && (
                    <div className="post-image">
                      <img 
                        src={`${getApiUrl()}/uploads/${post.image_filename}`} 
                        alt="Post content" 
                      />
                    </div>
                  )}
                </div>
                
                <div className="post-footer">
                  <span className="comment-count">
                    {post.comment_count || 0} comment{post.comment_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;
