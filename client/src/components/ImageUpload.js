import React, { useState, useRef } from 'react';

const ImageUpload = ({ onImageSelect, onImageRemove, selectedImage }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState(selectedImage ? URL.createObjectURL(selectedImage) : null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      
      onImageSelect(file);
      setPreview(URL.createObjectURL(file));
    } else {
      alert('Please select a valid image file');
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    onImageRemove();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
      
      {!preview ? (
        <div
          className={`image-upload-area ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="upload-content">
            <div className="upload-icon">📷</div>
            <p>Drag and drop an image here, or click to select</p>
            <p className="upload-hint">Supports: JPG, PNG, GIF (Max: 5MB)</p>
          </div>
        </div>
      ) : (
        <div className="image-preview-container">
          <img src={preview} alt="Preview" className="image-preview" />
          <button
            type="button"
            className="remove-image-btn"
            onClick={handleRemoveImage}
            title="Remove image"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 