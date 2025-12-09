import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to convert relative image URLs to absolute URLs
export const getImageUrl = (imageUrl: string | undefined | null): string | null => {
  if (!imageUrl) return null;
  
  // If already an absolute URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If relative URL, prepend API URL
  if (imageUrl.startsWith('/')) {
    return `${API_URL}${imageUrl}`;
  }
  
  // If just filename, construct full URL
  return `${API_URL}/api/files/${imageUrl}`;
};

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Suppress console errors for stats endpoint (expected to fail if not implemented)
    if (error.config?.url?.includes('/user/dashboard/stats') && error.response?.status === 500) {
      // Silently handle this error - it's expected if the endpoint is not implemented
      // The dashboard will use fallback calculation
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token');
      Cookies.remove('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

