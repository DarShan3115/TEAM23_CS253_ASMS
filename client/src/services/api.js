import axios from 'axios';

/**
 * AXIOS INTERCEPTOR CONFIGURATION
 * This file ensures that every request sent to any microservice
 * automatically includes the required Auth Headers.
 */

const api = axios.create();

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (token) {
    // Standard Bearer header — required by academic-service and productivity-service JWT middleware
    config.headers['Authorization'] = `Bearer ${token}`;
    // Legacy header kept for auth-service compatibility
    config.headers['x-auth-token'] = token;
  }
  
  if (user && user.id) {
    config.headers['x-user-id'] = user.id;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Refresh token concurrency control
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Ignore refresh loop if it's the login/refresh hitting it
    if (originalRequest.url?.includes('/login') || originalRequest.url?.includes('/refresh-token')) {
        return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['x-auth-token'] = token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post('/api/auth/refresh-token', {}, { withCredentials: true });
        const newToken = data.token;
        localStorage.setItem('token', newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['x-auth-token'] = newToken;
        processQueue(null, newToken);
        isRefreshing = false;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        localStorage.clear();
        window.location.href = '/#/login';  // HashRouter compatible redirect
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;