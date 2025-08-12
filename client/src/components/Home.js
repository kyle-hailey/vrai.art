import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ProfilePhoto from './ProfilePhoto';
import { uploadsBaseUrl } from '../config';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, loading: authLoading } = useAuth();

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Debug: Check if authorization header is set
      console.log('Authorization header:', api.defaults.headers.common['Authorization']);
      console.log('User:', user);
      
      const response = await api.get('/posts');
      setPosts(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="loading">
        <h3>Loading...</h3>
      </div>
    );
  }

  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <div className="empty-state">
        <h3>Welcome to Vrai.Art Social</h3>
        <p>Please log in or create an account to view and interact with posts.</p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Register
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading">
        <h3>Loading posts...</h3>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Recent Posts</h1>
        <Link to="/create-post" className="btn btn-primary">
          Create New Post
        </Link>
      </div>

      <div style={{ 
        background: '#e7f3ff', 
        border: '1px solid #b3d9ff', 
        borderRadius: '8px', 
        padding: '15px', 
        marginBottom: '20px',
        fontSize: '14px',
        color: '#1877f2'
      }}>
        <strong>💡 How it works:</strong> Public posts are visible to everyone. Private posts are only visible to users you're connected with. 
        <Link to="/users" style={{ marginLeft: '10px', color: '#1877f2', textDecoration: 'underline' }}>
          Connect with other users
        </Link> to see their private posts and share yours with them.
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <h3>No posts yet</h3>
          <p>Be the first to share something!</p>
          <Link to="/create-post" className="btn btn-primary" style={{ marginTop: '20px' }}>
            Create Your First Post
          </Link>
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
                    <Link to={`/users/${post.author}`} className="post-author-link">
                      {post.author}
                    </Link>
                    <span className={`post-visibility ${post.visibility}`}>
                      {post.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                    </span>
                    {post.visibility === 'private' && (
                      <small style={{ color: '#65676b', marginLeft: '10px', fontSize: '12px' }}>
                        Only visible to connections
                      </small>
                    )}
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

export default Home; 