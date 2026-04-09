import React, { useState, useEffect } from 'react';
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
  
  // OTP Verification States
  const [step, setStep] = useState('form'); // 'form' or 'otp'
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    let interval;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!formData.email.endsWith('@iitk.ac.in')) {
      setLocalError('Email must be a valid @iitk.ac.in address');
      return;
    }

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pwdRegex.test(formData.password)) {
      setLocalError('Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setLocalError('Phone number must be exactly 10 digits.');
      return;
    }

    // Transition to OTP step and start 5-minute timer
    setStep('otp');
    setTimer(300);
    setEmailOtp('');
    setPhoneOtp('');
    // Note: In a real environment, you would call an API here to dispatch the OTPs:
    // await sendOtpToUser(formData.email, formData.phone);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (timer === 0) {
      setLocalError('OTP has expired. Please request a new one.');
      return;
    }
    if (emailOtp.length !== 6 || phoneOtp.length !== 6) {
      setLocalError('Please enter valid 6-digit OTPs.');
      return;
    }

    // Payload now uses snake_case keys
    const result = await register({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: `+91${formData.phone}`
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

        {step === 'form' && (
        <form className="mt-8 space-y-4 animate-in fade-in" onSubmit={handleSendOtp}>
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
              placeholder="username@iitk.ac.in"
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
            <div className="flex mt-1">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-600 bg-gray-800 text-gray-400 sm:text-sm font-bold">
                +91
              </span>
              <input
                name="phone"
                type="text"
                maxLength="10"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-r-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="1234567890"
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                value={formData.phone}
              />
            </div>
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
            Request OTP
          </button>
        </form>
        )}

        {step === 'otp' && (
          <div className="mt-8 space-y-6 animate-in slide-in-from-right-4 fade-in">
            <div className="text-center text-sm text-gray-400 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
              <p>We've sent a 6-digit verification code to:</p>
              <p className="font-bold text-white mt-1">{formData.email}</p>
              <p className="font-bold text-white">+91 {formData.phone}</p>
            </div>
            
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email Verification Code</label>
                <input type="text" maxLength="6" value={emailOtp} onChange={e => setEmailOtp(e.target.value.replace(/\D/g, ''))} required className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono tracking-[0.5em] text-center text-lg" placeholder="••••••" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">SMS Verification Code</label>
                <input type="text" maxLength="6" value={phoneOtp} onChange={e => setPhoneOtp(e.target.value.replace(/\D/g, ''))} required className="mt-1 w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono tracking-[0.5em] text-center text-lg" placeholder="••••••" />
              </div>

              <div className="flex justify-between items-center text-sm px-1 py-2">
                 <span className="text-gray-400">Time remaining: <span className={`font-bold ${timer < 60 ? 'text-red-400' : 'text-white'}`}>{formatTime(timer)}</span></span>
                 <button 
                  type="button" 
                  disabled={timer > 0} 
                  onClick={() => { setTimer(300); /* trigger backend resend here */ }} 
                  className={`font-bold transition-colors ${timer > 0 ? 'text-gray-600 cursor-not-allowed' : 'text-blue-400 hover:text-blue-300'}`}
                 >
                   Resend Codes
                 </button>
              </div>

              <button
                type="submit"
                disabled={loading || timer === 0}
                className={`w-full py-4 px-4 rounded-xl font-black text-white transition-all transform active:scale-[0.98] uppercase text-xs tracking-widest ${loading || timer === 0 ? 'bg-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20'}`}
              >
                 {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
              
              <button 
                type="button" 
                onClick={() => setStep('form')} 
                className="w-full text-center mt-4 text-xs font-bold text-gray-500 hover:text-white uppercase tracking-wider"
              >
                ← Back to Details
              </button>
            </form>
          </div>
        )}
        
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
