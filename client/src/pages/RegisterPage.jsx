import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, BookOpen, UserCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// --- REGISTER PAGE COMPONENT ---
export default function RegisterPage() {
  const { register, loading, error } = useAuthStore();
  const navigate = useNavigate();
  
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
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-lg w-full space-y-8 p-8 bg-gray-800 rounded-3xl shadow-2xl border border-gray-700">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-600/20">
            {formData.role === 'faculty' ? (
              <BookOpen className="w-8 h-8 text-white" />
            ) : (
              <GraduationCap className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {formData.role === 'faculty' ? 'Faculty' : 'Student'} Registration
          </h2>
          <p className="text-gray-400 mt-2 font-medium">Join the Academic Management System</p>
        </div>
        
        {/* Role Selector Toggle */}
        <div className="flex bg-gray-900/50 p-1 rounded-xl border border-gray-700">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'student' })}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition-all ${
              formData.role === 'student' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <GraduationCap size={14} /> Student
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'faculty' })}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase transition-all ${
              formData.role === 'faculty' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <BookOpen size={14} /> Professor
          </button>
        </div>

        {(error || localError) && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
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
            className={`w-full py-4 px-4 mt-4 rounded-xl font-black text-white transition-all transform active:scale-[0.98] uppercase text-xs tracking-widest ${
              loading 
                ? 'bg-gray-700 cursor-not-allowed' 
                : formData.role === 'faculty' 
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20' 
                  : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20'
            }`}
          >
            {loading ? 'Creating Account...' : `Register as ${formData.role === 'faculty' ? 'Professor' : 'Student'}`}
          </button>
        </form>
        
        <div className="text-center mt-6 pt-6 border-t border-gray-700/50">
          <button 
            onClick={() => navigate('/login')}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            Already have an account? Log in
          </button>
        </div>
      </div>
    </div>
  )};