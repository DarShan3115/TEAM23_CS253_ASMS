import React, { useState, useEffect } from 'react';
import { create } from 'zustand';
import axios from 'axios';

// --- API CONFIGURATION ---
const VITE_API_AUTH_URL = 'http://localhost:5001/api';

const authApi = axios.create({
  baseURL: VITE_API_AUTH_URL,
});

authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

// --- AUTH STORE ---
const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      // userData now contains first_name and last_name
      const res = await authApi.post('/auth/register', userData);
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed', loading: false });
      return { success: false };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));

// --- REGISTER PAGE COMPONENT ---
const RegisterPage = ({ onNavigate }) => {
  const { register, loading, error } = useAuthStore();
  
  const [formData, setFormData] = useState({
    first_name: '', // Aligned with DB
    last_name: '',  // Aligned with DB
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'student'
  });

  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    // Payload now uses snake_case keys
    const result = await register({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone
    });

    if (result.success) {
      if (onNavigate) onNavigate('dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-600/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Student Registration</h2>
          <p className="text-gray-400 mt-2">Academic System Management</p>
        </div>
        
        {(error || localError) && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
            {error || localError}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">First Name</label>
              <input
                name="first_name" // Aligned
                type="text"
                required
                className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Darshan"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Last Name</label>
              <input
                name="last_name" // Aligned
                type="text"
                required
                className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Tandel"
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="email@example.com"
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Password</label>
              <input
                name="password"
                type="password"
                required
                className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Confirm</label>
              <input
                name="confirmPassword"
                type="password"
                required
                className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Phone Number</label>
            <input
              name="phone"
              type="text"
              className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="+91 00000 00000"
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 mt-4 rounded-lg font-bold text-white transition-all transform active:scale-[0.98] ${
              loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30'
            }`}
          >
            {loading ? 'Creating Account...' : 'Register as Student'}
          </button>
        </form>
        
        <div className="text-center mt-6 pt-6 border-t border-gray-700/50">
          <button 
            onClick={() => onNavigate && onNavigate('login')}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            Already have an account? Log in
          </button>
        </div>
      </div>
    </div>
  );
};

// --- APP ENTRY POINT ---
export default function App() {
  const [view, setView] = useState('register');

  const renderView = () => {
    switch (view) {
      case 'register':
        return <RegisterPage onNavigate={setView} />;
      case 'login':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Login Page Placeholder</h1>
              <button onClick={() => setView('register')} className="text-blue-400 hover:underline">Back to Register</button>
            </div>
          </div>
        );
      case 'dashboard':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Welcome!</h1>
              <p className="text-gray-400 mb-4">You have registered successfully.</p>
              <button onClick={() => setView('register')} className="text-blue-400 hover:underline">Sign Out</button>
            </div>
          </div>
        );
      default:
        return <RegisterPage onNavigate={setView} />;
    }
  };

  return (
    <div className="app-container">
      {renderView()}
    </div>
  );
}