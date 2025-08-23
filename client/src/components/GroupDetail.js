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
    const fetchData = async () => {
      if (!groupId || !user || !token) {
        console.log('Missing required data:', { groupId, hasUser: !!user, hasToken: !!token });
        setLoading(false);
        return;
      }

      console.log('Fetching group data for:', groupId);
      setLoading(true);
      setError(null);

      try {
        // Use Promise.all to wait for both group details and posts to load
        const [groupResponse, postsResponse] = await Promise.all([
          fetch(`${getApiUrl()}/groups/${groupId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`${getApiUrl()}/groups/${groupId}/posts`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        console.log('API responses received:', {
          groupStatus: groupResponse.status,
          postsStatus: postsResponse.status
        });

        // Process group details response
        if (!groupResponse.ok) {
          const errorText = await groupResponse.text();
          console.error('Group details error response:', errorText);
          throw new Error(`Failed to fetch group details: ${groupResponse.status} - ${errorText}`);
        }
        const groupData = await groupResponse.json();
        console.log('Group data received:', groupData);
        setGroup(groupData.group);

        // Process group posts response
        if (!postsResponse.ok) {
          const errorText = await postsResponse.text();
          console.error('Group posts error response:', errorText);
          throw new Error(`Failed to fetch group posts: ${postsResponse.status} - ${errorText}`);
        }
        const postsData = await postsResponse.json();
        console.log('Posts data received:', postsData);
        setPosts(postsData.posts || []);

      } catch (err) {
        console.error('Error fetching group data:', err);
        setError(err.message || 'Failed to load group data. Please try again.');
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId, user, token]);

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
