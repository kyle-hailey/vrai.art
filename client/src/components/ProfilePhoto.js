import React, { useState } from 'react';
import api from '../services/api';

const ProfilePhoto = ({ 
  currentPhoto, 
  onPhotoUpdate, 
  size = 'medium', 
  showUpload = false,
  username,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await api.post('/profile/photo', formData);
      
      if (onPhotoUpdate) {
        onPhotoUpdate(response.data.profile_photo);
      }
      
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const getPhotoUrl = (photoFilename) => {
    if (!photoFilename) return null;
    return `http://localhost:5000/uploads/${photoFilename}`;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8 text-sm';
      case 'large':
        return 'w-24 h-24 text-2xl';
      case 'xlarge':
        return 'w-32 h-32 text-3xl';
      default: // medium
        return 'w-12 h-12 text-lg';
    }
  };

  const photoUrl = getPhotoUrl(currentPhoto);

  return (
    <div className={`profile-photo-container ${className}`}>
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={`${username || 'User'} profile photo`}
          className={`profile-photo ${getSizeClasses()} rounded-full object-cover`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      
      {(!photoUrl || size === 'large' || size === 'xlarge') && (
        <div 
          className={`profile-photo-placeholder ${getSizeClasses()} rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold`}
          style={{ display: photoUrl ? 'none' : 'flex' }}
        >
          {username ? username.charAt(0).toUpperCase() : 'U'}
        </div>
      )}

      {showUpload && (
        <div className="photo-upload-section mt-4">
          <input
            type="file"
            id="photo-upload"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="photo-upload"
            className={`btn ${uploading ? 'btn-disabled' : 'btn-primary'} cursor-pointer inline-block`}
          >
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </label>
          
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePhoto; 