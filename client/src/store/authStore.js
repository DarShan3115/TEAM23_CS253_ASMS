import { create } from 'zustand';
import api from '../services/api';

const getSafeStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === "undefined" || item === "null") return null;
    return JSON.parse(item);
  } catch (e) {
    localStorage.removeItem(key);
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getSafeStorage('user'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true, user };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  requestOtp: async (email, phone) => {
    set({ loading: true, error: null });
    try {
      await api.post('/api/auth/send-otp', { email, phone });
      set({ loading: false });
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to send OTP';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/api/auth/register', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true, user };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch(e) {
      console.warn("Logout ping failed");
    }
    localStorage.clear();
    set({ user: null, token: null, isAuthenticated: false });
  },

  requestPasswordReset: async (email) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/api/auth/forgot-password/request', { email });
      set({ loading: false });
      return { success: true, message: response.data.message };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to request password reset';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/api/auth/forgot-password/reset', { email, otp, newPassword });
      set({ loading: false });
      return { success: true, message: response.data.message };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to reset password';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },
  
  clearError: () => set({ error: null })
}));