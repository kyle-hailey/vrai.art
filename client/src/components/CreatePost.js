import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ImageUpload from './ImageUpload';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [visibility, setVisibility] = useState('public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter some content for your post');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      formData.append('visibility', visibility);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1>Create New Post</h1>
        <p style={{ color: '#65676b', marginTop: '10px' }}>
          Share your thoughts with the community
        </p>
      </div>

      <div className="card">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="content">What's on your mind?</label>
            <textarea
              id="content"
              className="form-control"
              rows="6"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, ideas, or experiences..."
              required
            />
          </div>

          <div className="form-group">
            <label>Add an image (optional)</label>
            <ImageUpload
              onImageSelect={setSelectedImage}
              onImageRemove={() => setSelectedImage(null)}
              selectedImage={selectedImage}
            />
          </div>

          <div className="form-group">
            <label htmlFor="visibility">Post Visibility</label>
            <select
              id="visibility"
              className="form-control"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="public">Public - Visible to everyone</option>
              <option value="private">Private - Only visible to connections</option>
            </select>
            <small style={{ color: '#65676b', marginTop: '5px', display: 'block' }}>
              {visibility === 'public' 
                ? 'This post will be visible to all users on the platform.'
                : 'This post will only be visible to users you are connected with.'
              }
            </small>
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !content.trim()}
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost; 