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
    config.headers['x-auth-token'] = token;
  }
  
  if (user && user.id) {
    config.headers['x-user-id'] = user.id;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;