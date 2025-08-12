// Configuration file for different environments
const config = {
  // Development environment (localhost)
  development: {
    apiBaseUrl: 'http://localhost:5000/api',
    uploadsBaseUrl: 'http://localhost:5000/uploads'
  },
  // Production environment (Firebase hosting)
  production: {
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'https://your-backend-domain.com/api',
    uploadsBaseUrl: process.env.REACT_APP_UPLOADS_BASE_URL || 'https://your-backend-domain.com/uploads'
  }
};

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Export the configuration for the current environment
export const currentConfig = config[environment];

// Export individual values for convenience
export const apiBaseUrl = currentConfig.apiBaseUrl;
export const uploadsBaseUrl = currentConfig.uploadsBaseUrl;

// Export the full config object
export default currentConfig;
