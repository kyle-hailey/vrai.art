import axios from 'axios';
import { apiBaseUrl } from '../config';

<<<<<<< HEAD
// Create axios instance with configurable base URL
const api = axios.create({
  baseURL: apiBaseUrl,
=======
// Create axios instance with base configuration

const api = axios.create({
  baseURL: 'https://vraiart--vraiart-456e0.us-central1.hosted.app/api',
>>>>>>> 932e996efaa107a95f71a9bea8f852d904a54d80
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
