import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const inputClass = 'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 placeholder-zinc-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition';

export default function RegisterPage() {
  const { register, requestOtp, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    password: '', confirmPassword: '', phone: '', role: 'student',
  });
  const [localError, setLocalError]     = useState('');
  const [step, setStep]                 = useState('form'); // 'form' | 'otp'
  const [emailOtp, setEmailOtp]         = useState('');
  const [phoneOtp, setPhoneOtp]         = useState('');
  const [timer, setTimer]               = useState(300);
  const [showPass, setShowPass]         = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  useEffect(() => {
    let t;
    if (step === 'otp' && timer > 0) t = setInterval(() => setTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [step, timer]);

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!form.email.endsWith('@iitk.ac.in')) {
      return setLocalError('Email must be a valid @iitk.ac.in address.');
    }
    const pwdRx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pwdRx.test(form.password)) {
      return setLocalError('Password needs 8+ chars, uppercase, lowercase, number, and special character.');
    }
    if (form.password !== form.confirmPassword) return setLocalError('Passwords do not match.');
    if (!/^\d{10}$/.test(form.phone))           return setLocalError('Enter a valid 10-digit phone number.');

    const res = await requestOtp(form.email, `+91${form.phone}`);
    if (res.success) { setStep('otp'); setTimer(300); setEmailOtp(''); setPhoneOtp(''); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (timer === 0)                               return setLocalError('OTP expired. Request a new one.');
    if (emailOtp.length !== 6 || phoneOtp.length !== 6) return setLocalError('Enter valid 6-digit OTPs.');
    const res = await register({ ...form, phone: `+91${form.phone}`, emailOtp, phoneOtp });
    if (res.success) navigate('/dashboard');
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-white">Create Account</h1>
          <p className="text-zinc-500 text-sm mt-1">Join ASMS — IIT Kanpur</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
          {/* Role Toggle */}
          <div className="flex bg-zinc-800 p-0.5 rounded-lg">
            {['student', 'faculty'].map(r => (
              <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm transition-colors ${form.role === r ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {r === 'student' ? <GraduationCap size={15} /> : <BookOpen size={15} />}
                {r === 'student' ? 'Student' : 'Professor'}
              </button>
            ))}
          </div>

          {displayError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{displayError}</div>
          )}

          {step === 'form' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">First Name</label>
                  <input name="first_name" className={inputClass} placeholder="Jane" required onChange={handleChange} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Last Name</label>
                  <input name="last_name" className={inputClass} placeholder="Doe" required onChange={handleChange} />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Email</label>
                <input name="email" type="email" className={inputClass} placeholder="username@iitk.ac.in" required onChange={handleChange} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Password</label>
                  <div className="relative">
                    <input name="password" type={showPass ? 'text' : 'password'} className={inputClass + ' pr-9'}
                      placeholder="Min 8 chars" required onChange={handleChange} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Confirm</label>
                  <div className="relative">
                    <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} className={inputClass + ' pr-9'}
                      placeholder="Repeat" required onChange={handleChange} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-zinc-700 bg-zinc-800 text-zinc-400 text-sm">+91</span>
                  <input name="phone" type="text" maxLength="10" className={inputClass + ' rounded-l-none'}
                    placeholder="10-digit number" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                {loading ? 'Sending…' : 'Send Verification Codes'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-400">
                Codes sent to <span className="text-white">{form.email}</span> and <span className="text-white">+91 {form.phone}</span>
              </div>

              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Email OTP</label>
                <input type="text" maxLength="6" value={emailOtp}
                  onChange={e => setEmailOtp(e.target.value.replace(/\D/g, ''))} required
                  className={inputClass + ' font-mono tracking-[0.4em] text-center text-lg'} placeholder="000000" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">SMS OTP</label>
                <input type="text" maxLength="6" value={phoneOtp}
                  onChange={e => setPhoneOtp(e.target.value.replace(/\D/g, ''))} required
                  className={inputClass + ' font-mono tracking-[0.4em] text-center text-lg'} placeholder="000000" />
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className={`text-zinc-500 ${timer < 60 ? 'text-red-400' : ''}`}>Expires in {fmt(timer)}</span>
                <button type="button" disabled={timer > 0}
                  onClick={() => { setTimer(300); requestOtp(form.email, `+91${form.phone}`); }}
                  className="text-blue-400 hover:text-blue-300 disabled:text-zinc-600 disabled:cursor-not-allowed text-xs">
                  Resend codes
                </button>
              </div>

              <button type="submit" disabled={loading || timer === 0}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                {loading ? 'Verifying…' : 'Verify & Create Account'}
              </button>
              <button type="button" onClick={() => setStep('form')}
                className="w-full text-sm text-zinc-500 hover:text-zinc-300 py-1 transition-colors">
                ← Back to details
              </button>
            </form>
          )}

          <p className="text-center text-sm text-zinc-500 pt-1 border-t border-zinc-800">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
