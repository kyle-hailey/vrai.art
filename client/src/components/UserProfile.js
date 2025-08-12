import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ProfilePhoto from './ProfilePhoto';
import { uploadsBaseUrl } from '../config';

const UserProfile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${username}/posts`);
      setUser(response.data.user);
      setPosts(response.data.posts);
      setError('');
    } catch (err) {
      setError('Failed to load user profile');
      console.error('Error fetching user posts:', err);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <h3>Loading...</h3>
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

  if (!user) {
    return (
      <div className="empty-state">
        <h3>User not found</h3>
        <p>The user you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <Link to="/" className="btn btn-secondary">
            ← Back to Home
          </Link>
        </div>
        
        <div className="user-profile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <ProfilePhoto
              currentPhoto={user.profile_photo}
              size="large"
              username={user.username}
            />
            <div>
              <h1>{user.username}'s Profile</h1>
              <p style={{ color: '#65676b', marginTop: '10px' }}>
                {posts.length} post{posts.length !== 1 ? 's' : ''} • Member since {formatDate(user.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <h3>No posts yet</h3>
          <p>{user.username} hasn't shared anything yet.</p>
          {currentUser && currentUser.id === user.id && (
            <Link to="/create-post" className="btn btn-primary" style={{ marginTop: '20px' }}>
              Create Your First Post
            </Link>
          )}
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ProfilePhoto
                    currentPhoto={post.author_photo}
                    size="small"
                    username={post.author}
                  />
                  <div>
                    <span className="post-author">{post.author}</span>
                    <span className={`post-visibility ${post.visibility}`}>
                      {post.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                    </span>
                  </div>
                </div>
                <span className="post-time">{formatDate(post.created_at)}</span>
              </div>
              
              <div className="post-content">
                {post.content.length > 200 
                  ? `${post.content.substring(0, 200)}...` 
                  : post.content
                }
              </div>
              
              {post.image_filename && (
                <div className="post-image">
                  <img 
                    src={`${uploadsBaseUrl}/${post.image_filename}`}
                    alt="Post content"
                    className="post-image-content"
                  />
                </div>
              )}
              
              <div className="post-actions">
                <Link to={`/posts/${post.id}`} style={{ color: '#1877f2', textDecoration: 'none', fontWeight: '500' }}>
                  View Post →
                </Link>
                <span style={{ color: '#65676b', fontSize: '14px' }}>
                  {post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfile;