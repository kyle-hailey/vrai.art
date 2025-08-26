import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ImageUpload from './ImageUpload';
import { useAuth } from '../contexts/AuthContext';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [visibility, setVisibility] = useState('public');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingGroups, setLoadingGroups] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && token) {
      fetchUserGroups();
    }
  }, [user, token]);

  const fetchUserGroups = async () => {
    try {
      setLoadingGroups(true);
      const response = await fetch(`${api.defaults.baseURL}/user/groups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    } finally {
      setLoadingGroups(false);
    }
  };

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
      if (selectedGroup) {
        formData.append('group_id', selectedGroup);
      }
      if (selectedImage) {
        formData.append('image', selectedImage);
      }
      
      await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Navigate to the appropriate page based on where the post was created
      if (selectedGroup) {
        navigate(`/groups/${selectedGroup}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleVisibilityChange = (newVisibility) => {
    setVisibility(newVisibility);
    if (newVisibility === 'group' && !selectedGroup) {
      // If switching to group visibility but no group selected, select first group
      if (groups.length > 0) {
        setSelectedGroup(groups[0].id);
      }
    }
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
              onChange={(e) => handleVisibilityChange(e.target.value)}
            >
              <option value="public">Public - Visible to everyone</option>
              <option value="private">Private - Only visible to connections</option>
              <option value="group" disabled={groups.length === 0}>
                Group - Post to a specific group
              </option>
            </select>
            <small style={{ color: '#65676b', marginTop: '5px', display: 'block' }}>
              {visibility === 'public' 
                ? 'This post will be visible to all users on the platform.'
                : visibility === 'private'
                ? 'This post will only be visible to users you are connected with.'
                : 'This post will be visible to members of the selected group.'
              }
            </small>
          </div>

          {visibility === 'group' && (
            <div className="form-group">
              <label htmlFor="group">Select Group</label>
              {loadingGroups ? (
                <div style={{ color: '#65676b' }}>Loading your groups...</div>
              ) : groups.length === 0 ? (
                <div style={{ color: '#c33' }}>
                  You haven't joined any groups yet. 
                  <a href="/groups" style={{ marginLeft: '10px', color: '#1877f2' }}>
                    Join a group first
                  </a>
                </div>
              ) : (
                <select
                  id="group"
                  className="form-control"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  required
                >
                  <option value="">Choose a group...</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

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
              disabled={loading || !content.trim() || (visibility === 'group' && !selectedGroup)}
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