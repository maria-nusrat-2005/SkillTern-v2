import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

let onUnauthorized = null;
export const setUnauthorizedCallback = (cb) => {
  onUnauthorized = cb;
};

// Response Interceptor to centralize API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong with the API';
    console.error(`API Error: ${message}`, error);
    
    // Auto-logout user on unauthorized requests
    if (error.response?.status === 401) {
      if (onUnauthorized) {
        onUnauthorized();
      } else if (!error.config?.url?.includes('/auth/me') && typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
