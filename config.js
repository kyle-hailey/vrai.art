// Root configuration file - shared between frontend and backend
const config = {
  // Backend configuration
  backend: {
    host: process.env.BACKEND_HOST || '3.142.69.98',
    port: process.env.BACKEND_PORT || 8000,
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
    host: process.env.FRONTEND_HOST || '3.142.69.98',
    port: process.env.FRONTEND_PORT || 3000,
    get baseURL() {
      return `http://${this.host}:${this.port}`;
    }
  },
  
  // Database configuration
  database: {
    path: process.env.DATABASE_PATH || './social.db'
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  }
};

module.exports = config;
