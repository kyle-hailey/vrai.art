import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ProfilePhoto from './ProfilePhoto';

const PostDetail = () => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/${id}`);
      setPost(response.data.post);
      setComments(response.data.comments);
      setError('');
    } catch (err) {
      setError('Failed to load post');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      return;
    }

    setSubmittingComment(true);

    try {
      const response = await api.post(`/posts/${id}/comments`, {
        content: newComment.trim()
      });
      
      // Add the new comment to the list
      const commentWithAuthor = {
        ...response.data.comment,
        author: user.username,
        created_at: new Date().toISOString()
      };
      
      setComments([...comments, commentWithAuthor]);
      setNewComment('');
    } catch (err) {
      setError('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

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

  if (loading) {
    return (
      <div className="loading">
        <h3>Loading post...</h3>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="alert alert-error">
        {error || 'Post not found'}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-secondary"
          style={{ marginBottom: '20px' }}
        >
          ← Back to Posts
        </button>
      </div>

      <div className="post-card">
        <div className="post-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ProfilePhoto
              currentPhoto={post.author_photo}
              size="small"
              username={post.author}
            />
            <div>
              <span className="post-author">{post.author}</span>
              <span className="post-time">{formatDate(post.created_at)}</span>
            </div>
          </div>
        </div>
        
        <div className="post-content">
          {post.content}
        </div>
      </div>

      <div className="card">
        <h3>Comments ({comments.length})</h3>
        
        {user ? (
          <form onSubmit={handleCommentSubmit} style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <label htmlFor="comment">Add a comment</label>
              <textarea
                id="comment"
                className="form-control"
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submittingComment || !newComment.trim()}
            >
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '6px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p>Please <button 
              onClick={() => navigate('/login')} 
              className="btn btn-primary"
              style={{ marginLeft: '10px' }}
            >
              login
            </button> to comment on this post.</p>
          </div>
        )}

        <div className="comment-section">
          {comments.length === 0 ? (
            <div className="empty-state">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <ProfilePhoto
                    currentPhoto={comment.author_photo}
                    size="small"
                    username={comment.author}
                  />
                  <div>
                    <div className="comment-author">{comment.author}</div>
                    <div className="comment-time">{formatDate(comment.created_at)}</div>
                  </div>
                </div>
                <div className="comment-content">{comment.content}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail; 