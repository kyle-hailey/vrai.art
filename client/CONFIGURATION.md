# Configuration Guide

## Backend URL Configuration

To make the backend URL configurable, you can use environment variables. Here's how to set it up:

### Option 1: Create a .env file

Create a `.env` file in the `client` directory with the following content:

```bash
# Backend Configuration
REACT_APP_BACKEND_URL=http://localhost:5000

# Frontend Configuration (optional)
REACT_APP_FRONTEND_URL=http://localhost:3000
```

### Option 2: Set environment variables directly

You can set the environment variables when starting your application:

```bash
# For development
REACT_APP_BACKEND_URL=http://localhost:5000 npm start

# For production build
REACT_APP_BACKEND_URL=https://your-production-backend.com npm run build
```

### Option 3: Update package.json proxy (for development)

For development, you can also update the proxy setting in `package.json`:

```json
{
  "proxy": "http://localhost:5000"
}
```

## How it works

The application now uses a centralized configuration system:

1. **`src/config.js`** - Contains all configuration values and helper functions
2. **Environment variables** - Allow you to override default values without changing code
3. **Helper functions** - Provide easy ways to construct URLs:
   - `getApiUrl()` - For API endpoints
   - `getUploadsUrl()` - For file uploads
   - `getBackendUrl()` - For general backend URLs

## Benefits

- **Easy to change**: Update one environment variable to change the backend URL everywhere
- **Environment-specific**: Different URLs for development, staging, and production
- **No code changes**: Switch between different backend servers without modifying source code
- **Centralized**: All URL construction logic is in one place

## Example Usage

```javascript
import { getApiUrl, getUploadsUrl } from '../config';

// API calls
const response = await fetch(getApiUrl('/users'));

// File uploads
const imageUrl = getUploadsUrl('profile-photo.jpg');
```
