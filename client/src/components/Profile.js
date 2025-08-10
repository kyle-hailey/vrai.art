import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ProfilePhoto from './ProfilePhoto';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser, logout } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile');
      setProfile(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <h3>Loading profile...</h3>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="alert alert-error">
        {error || 'Failed to load profile'}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1>Profile</h1>
        <p style={{ color: '#65676b', marginTop: '10px' }}>
          Manage your account and view your information
        </p>
      </div>

      <div className="card">
        <h3>Account Information</h3>
        
        <div style={{ marginTop: '20px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '120px 1fr', 
            gap: '15px', 
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <strong>Profile Photo:</strong>
            <div>
              <ProfilePhoto
                currentPhoto={profile.profile_photo}
                onPhotoUpdate={(newPhoto) => setProfile({...profile, profile_photo: newPhoto})}
                size="large"
                showUpload={true}
                username={profile.username}
              />
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '120px 1fr', 
            gap: '15px', 
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <strong>Username:</strong>
            <span>{profile.username}</span>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '120px 1fr', 
            gap: '15px', 
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <strong>Email:</strong>
            <span>{profile.email}</span>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '120px 1fr', 
            gap: '15px', 
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <strong>Member since:</strong>
            <span>{formatDate(profile.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Account Actions</h3>
        
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={logout} 
            className="btn btn-danger"
          >
            Logout
          </button>
        </div>
        
        <div style={{ 
          marginTop: '15px', 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '6px',
          fontSize: '14px',
          color: '#65676b'
        }}>
          <p><strong>Note:</strong> This is a simplified social media platform. In a production environment, you would have additional features like:</p>
          <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
            <li>Profile picture upload</li>
            <li>Password change functionality</li>
            <li>Account deletion</li>
            <li>Privacy settings</li>
            <li>Email verification</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Profile; 