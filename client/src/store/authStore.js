import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
<<<<<<< HEAD
  user: null,
=======
  user: JSON.parse(localStorage.getItem('user')) || null,
>>>>>>> 8cd2c7e252835807470fb00249b02a3b8b8c44da
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', data.token);
<<<<<<< HEAD
=======
      localStorage.setItem('user', JSON.stringify(data.user));
>>>>>>> 8cd2c7e252835807470fb00249b02a3b8b8c44da
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      set({ error: msg, loading: false });
      throw err;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/api/auth/register', userData);
      localStorage.setItem('token', data.token);
<<<<<<< HEAD
=======
      localStorage.setItem('user', JSON.stringify(data.user));
>>>>>>> 8cd2c7e252835807470fb00249b02a3b8b8c44da
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed';
      set({ error: msg, loading: false });
      throw err;
    }
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/api/auth/me');
<<<<<<< HEAD
=======
      localStorage.setItem('user', JSON.stringify(data.user));
>>>>>>> 8cd2c7e252835807470fb00249b02a3b8b8c44da
      set({ user: data.user });
    } catch {
      set({ user: null, token: null });
      localStorage.removeItem('token');
<<<<<<< HEAD
=======
      localStorage.removeItem('user');
>>>>>>> 8cd2c7e252835807470fb00249b02a3b8b8c44da
    }
  },

  logout: () => {
    localStorage.removeItem('token');
<<<<<<< HEAD
    set({ user: null, token: null });
  },
=======
    localStorage.removeItem('user');
    set({ user: null, token: null, error: null });
  },

  clearError: () => set({ error: null }),
>>>>>>> 8cd2c7e252835807470fb00249b02a3b8b8c44da
}));

export default useAuthStore;
