import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function ForgotPasswordPage() {
  const { requestPasswordReset, resetPassword, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState('request'); // 'request' or 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [localError, setLocalError] = useState('');

  const handleRequestClick = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email) {
      setLocalError('Please enter your email.');
      return;
    }

    const result = await requestPasswordReset(email);
    if (result.success) {
      setStep('reset');
      setSuccessMessage(result.message);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (otp.length !== 6) {
      setLocalError('Please enter a valid 6-digit OTP.');
      return;
    }

    if (newPassword.length < 8) {
      setLocalError('Password must be at least 8 characters long.');
      return;
    }

    const result = await resetPassword(email, otp, newPassword);
    if (result.success) {
      setSuccessMessage('Password reset successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 font-sans">
      <div className="max-w-md w-full space-y-8 p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-800 rounded-xl mb-4 border border-zinc-700">
            <ShieldAlert className="w-6 h-6 text-brand-primary" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Recover Password</h2>
          <p className="text-zinc-500 mt-2 text-sm">Regain access to your account</p>
        </div>

        {(error || localError) && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
            {error || localError}
          </div>
        )}

        {successMessage && !error && !localError && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg text-sm text-center">
            {successMessage}
          </div>
        )}

        {step === 'request' && (
          <form className="mt-8 space-y-5 animate-in fade-in" onSubmit={handleRequestClick}>
            <div>
              <label className="text-sm font-medium text-zinc-400">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition"
                placeholder="you@asms.edu"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset OTP'}
            </button>
            <div className="text-center">
              <Link to="/login" className="text-sm text-zinc-500 hover:text-white transition">
                ← Back to Login
              </Link>
            </div>
          </form>
        )}

        {step === 'reset' && (
          <form className="mt-8 space-y-5 animate-in fade-in" onSubmit={handleResetSubmit}>
            <div className="text-center text-sm text-zinc-400 mb-6 bg-zinc-800/50 p-4 rounded-lg border border-zinc-800">
              <p>We've sent a 6-digit verification code to</p>
              <p className="font-bold text-white mt-1">{email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-400">Verification Code</label>
              <input
                type="text"
                maxLength="6"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="mt-1.5 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono tracking-[0.5em] text-center text-lg"
                placeholder="••••••"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-400">New Password</label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition disabled:opacity-50 mt-2"
            >
              {loading ? 'Resetting...' : 'Set New Password'}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('request')}
                className="text-sm text-zinc-500 hover:text-white transition"
              >
                ← Back to Email Change
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
