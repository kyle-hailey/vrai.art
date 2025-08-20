// Frontend configuration file
const config = {
  // Backend configuration
  backend: {
    host: process.env.REACT_APP_BACKEND_HOST || '3.142.69.98',
    port: process.env.REACT_APP_BACKEND_PORT || 8000,
    get baseURL() {
      return `http://${this.host}:${this.port}`;
    },
    get apiURL() {
      return `${this.baseURL}/api`;
    },
    get uploadsURL() {
      return `${this.baseURL}/uploads`;
    }
  },
  
  // Frontend configuration
  frontend: {
    host: process.env.REACT_APP_FRONTEND_HOST || '0.0.0.0',
    port: process.env.REACT_APP_FRONTEND_PORT || 3000,
    get baseURL() {
      return `http://${this.host}:${this.port}`;
    }
  }
};

// Helper functions for common URL operations
export const getApiUrl = (endpoint = '') => {
  return `${config.backend.apiURL}${endpoint}`;
};

export const getUploadsUrl = (filename = '') => {
  return `${config.backend.uploadsURL}/${filename}`;
};

export const getBackendUrl = (path = '') => {
  return `${config.backend.baseURL}${path}`;
};

export default config;
