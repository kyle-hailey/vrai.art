# Configuration Guide

This guide explains how to configure your backend URLs for different environments.

## Environment Setup

### Development (Local)
- **API Base URL**: `http://localhost:5000/api`
- **Uploads Base URL**: `http://localhost:5000/uploads`
- **Command**: `npm run start:dev`

### Production (Firebase Hosting)
- **API Base URL**: `https://vraiart--vraiart-456e0.us-central1.hosted.app/api`
- **Uploads Base URL**: `https://vraiart--vraiart-456e0.us-central1.hosted.app/uploads`
- **Command**: `npm run build:prod`

## How to Use

### For Local Development
1. Make sure your backend server is running on `localhost:5000`
2. Run: `npm run start:dev`
3. The app will use localhost URLs automatically

### For Production Deployment
1. Update `env.production` with your actual backend domain
2. Run: `npm run build:prod`
3. Deploy the `build` folder to Firebase Hosting

## Environment Variables

The app uses these environment variables:
- `REACT_APP_API_BASE_URL`: Base URL for API endpoints
- `REACT_APP_UPLOADS_BASE_URL`: Base URL for uploaded files

## Configuration Files

- `src/config.js`: Main configuration logic
- `env.development`: Development environment settings
- `env.production`: Production environment settings

## Backend Requirements

Your backend server should:
- Serve API endpoints at `/api/*`
- Serve uploaded files at `/uploads/*`
- Handle CORS for your Firebase domain
- Accept JWT tokens in Authorization headers

## Example Backend URLs

```
API Endpoints:
- Login: https://vraiart--vraiart-456e0.us-central1.hosted.app/api/login
- Posts: https://vraiart--vraiart-456e0.us-central1.hosted.app/api/posts
- Profile: https://vraiart--vraiart-456e0.us-central1.hosted.app/api/profile

File Uploads:
- Profile Photos: https://vraiart--vraiart-456e0.us-central1.hosted.app/uploads/profile_123.jpg
- Post Images: https://vraiart--vraiart-456e0.us-central1.hosted.app/uploads/post_456.png
```
