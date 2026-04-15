import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Upload, ArrowLeft, ShieldCheck, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import api from '../services/api';

const inputClass = "w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all";
const labelClass = "text-sm font-semibold text-zinc-400 mb-1 block";

const PasswordInput = ({ value, onChange, show, onToggle, placeholder = '' }) => (
  <div className="relative">
    <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder}
      className={inputClass + ' pr-12'} required />
    <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
);

const Feedback = ({ msg }) => {
  if (!msg.text) return null;
  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
      msg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
    }`}>
      {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {msg.text}
    </div>
  );
};

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('view');
  const [avatar, setAvatar] = useState(user?.avatar_url || null);
  const [avatarError, setAvatarError] = useState('');

  const [displayData, setDisplayData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone ? user.phone.replace('+91', '') : '',
  });

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    verificationCode: ''
  });

  // Password visibility states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Password strength rules checked live
  const pwdRules = [
    { label: 'At least 8 characters', pass: passwordData.newPassword.length >= 8 },
    { label: 'Contains uppercase letter', pass: /[A-Z]/.test(passwordData.newPassword) },
    { label: 'Contains lowercase letter', pass: /[a-z]/.test(passwordData.newPassword) },
    { label: 'Contains a number', pass: /\d/.test(passwordData.newPassword) },
    { label: 'Contains special character (@$!%*?&)', pass: /[@$!%*?&]/.test(passwordData.newPassword) },
    { label: 'New password differs from current', pass: passwordData.currentPassword !== '' && passwordData.newPassword !== passwordData.currentPassword },
  ];

  useEffect(() => {
    if (user) {
      setDisplayData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone ? user.phone.replace('+91', '') : '',
      });
      if (user.avatar_url) setAvatar(user.avatar_url);
    }
  }, [user]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'image/jpeg') { setAvatarError('Only JPG format is allowed.'); return; }
    if (file.size > 10 * 1024 * 1024) { setAvatarError('File size must be less than 10MB.'); return; }
    setAvatarError('');
    setAvatar(URL.createObjectURL(file));

    const uploadData = new FormData();
    uploadData.append('avatar', file);
    try {
      const res = await api.post('/api/users/avatar', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      useAuthStore.setState(s => ({ user: { ...s.user, avatar_url: res.data.avatar_url } }));
    } catch (err) {
      setAvatarError('Failed to upload avatar.');
      setAvatar(user?.avatar_url || null);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setProfileMsg({ type: 'error', text: 'Phone number must be exactly 10 digits.' });
      return;
    }
    setProfileLoading(true);
    try {
      const res = await api.put('/api/users/profile', formData);
      setDisplayData({ ...displayData, ...res.data.user });
      useAuthStore.setState(s => ({ user: { ...s.user, ...res.data.user } }));
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setActiveTab('view'), 1200);
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const sendOtp = async () => {
    setOtpLoading(true);
    setPwdMsg({ type: '', text: '' });
    try {
      await api.post('/api/users/send-change-otp');
      setOtpSent(true);
      setPwdMsg({ type: 'success', text: 'OTP sent to your registered email address.' });
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send OTP.' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: '', text: '' });

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPwdMsg({ type: 'error', text: 'New password cannot be the same as your current password.' });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (!pwdRules.every(r => r.pass)) {
      setPwdMsg({ type: 'error', text: 'Please meet all password requirements.' });
      return;
    }
    if (!passwordData.verificationCode) {
      setPwdMsg({ type: 'error', text: 'Please enter the OTP sent to your email.' });
      return;
    }

    setPwdLoading(true);
    try {
      await api.put('/api/users/change-password', passwordData);
      setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '', verificationCode: '' });
      setOtpSent(false);
      setTimeout(() => setActiveTab('view'), 1500);
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setPwdLoading(false);
    }
  };

  const tabClass = (id) => `text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
    activeTab === id ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30' : 'bg-zinc-900 text-zinc-500 border border-transparent hover:bg-zinc-800 hover:text-white'
  }`;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition text-zinc-400 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              My Profile
              {user?.role === 'admin' && <ShieldCheck className="text-amber-500" size={24} />}
            </h1>
            <p className="text-zinc-400 font-medium mt-1">Manage your account settings and security.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-zinc-800 border-4 border-zinc-700 overflow-hidden flex items-center justify-center shadow-xl">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-zinc-400">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </span>
                  )}
                </div>
                <label className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center rounded-full cursor-pointer backdrop-blur-sm">
                  <Upload size={20} className="text-white" />
                  <input type="file" accept=".jpg,.jpeg" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              {avatarError && <p className="text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded-lg">{avatarError}</p>}
              <div>
                <h3 className="font-bold text-white text-lg">{displayData.first_name} {displayData.last_name}</h3>
                <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  {user?.role || 'student'}
                </span>
              </div>
            </div>
            <nav className="flex flex-col gap-2">
              <button onClick={() => setActiveTab('view')} className={tabClass('view')}>View Profile</button>
              <button onClick={() => setActiveTab('edit')} className={tabClass('edit')}>Edit Profile</button>
              <button onClick={() => setActiveTab('password')} className={tabClass('password')}>Change Password</button>
            </nav>
          </div>

          {/* Main Panel */}
          <div className="md:col-span-3 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl h-fit">
            {/* VIEW TAB */}
            {activeTab === 'view' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-4">Profile Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { label: 'First Name', value: displayData.first_name },
                    { label: 'Last Name', value: displayData.last_name },
                    { label: 'Email Address', value: displayData.email, icon: <Mail size={15} className="text-blue-400" /> },
                    { label: 'Phone Number', value: displayData.phone, icon: <Phone size={15} className="text-blue-400" /> },
                    { label: 'Account Role', value: user?.role, icon: <User size={15} className="text-blue-400" /> }
                  ].map(item => (
                    <div key={item.label} className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/60">
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">{item.label}</p>
                      <div className="flex items-center gap-2 text-white font-semibold text-base">
                        {item.icon}{item.value || 'Not set'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EDIT TAB */}
            {activeTab === 'edit' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-4">Edit Profile</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>First Name</label>
                    <input className={inputClass} type="text" value={formData.first_name}
                      onChange={e => setFormData({ ...formData, first_name: e.target.value })} required />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input className={inputClass} type="text" value={formData.last_name}
                      onChange={e => setFormData({ ...formData, last_name: e.target.value })} required />
                  </div>
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input className={inputClass + ' opacity-60 cursor-not-allowed'} type="email"
                      value={displayData.email} disabled title="Email cannot be changed" />
                    <p className="text-xs text-zinc-600 mt-1">Institutional email cannot be changed.</p>
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 py-3 rounded-l-xl border border-r-0 border-zinc-800 bg-zinc-900 text-zinc-400 font-bold">+91</span>
                      <input className={inputClass + ' rounded-l-none'} type="text" maxLength="10"
                        placeholder="10-digit number" value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })} />
                    </div>
                  </div>
                </div>
                <Feedback msg={profileMsg} />
                <div className="flex justify-end pt-4 border-t border-zinc-800">
                  <button type="submit" disabled={profileLoading}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* PASSWORD TAB */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-4">Security Settings</h2>

                <div className="space-y-2">
                  <label className={labelClass}>Current Password</label>
                  <PasswordInput value={passwordData.currentPassword}
                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelClass}>New Password</label>
                    <PasswordInput value={passwordData.newPassword}
                      onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      show={showNew} onToggle={() => setShowNew(!showNew)} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Confirm New Password</label>
                    <PasswordInput value={passwordData.confirmPassword}
                      onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
                  </div>
                </div>

                {/* Live Password Rules */}
                {passwordData.newPassword && (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Password Requirements</p>
                    {pwdRules.map(rule => (
                      <div key={rule.label} className={`flex items-center gap-2 text-xs font-medium ${rule.pass ? 'text-green-400' : 'text-zinc-500'}`}>
                        <CheckCircle size={13} className={rule.pass ? 'text-green-400' : 'text-zinc-700'} />
                        {rule.label}
                      </div>
                    ))}
                  </div>
                )}

                {/* OTP Section */}
                <div className="space-y-2">
                  <label className={labelClass}>Email Verification Code</label>
                  <div className="flex gap-3">
                    <input type="text" inputMode="numeric" maxLength={6} placeholder="Enter 6-digit OTP"
                      value={passwordData.verificationCode}
                      onChange={e => setPasswordData({ ...passwordData, verificationCode: e.target.value.replace(/\D/g, '') })}
                      className={inputClass + ' font-mono tracking-widest'} />
                    <button type="button" onClick={sendOtp} disabled={otpLoading}
                      className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 border border-zinc-700 rounded-xl text-white text-sm font-bold transition-all whitespace-nowrap">
                      {otpLoading ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                  {otpSent && <p className="text-xs text-zinc-500">OTP sent to: <span className="text-blue-400 font-bold">{displayData.email}</span></p>}
                </div>

                <Feedback msg={pwdMsg} />

                <div className="flex justify-end pt-4 border-t border-zinc-800">
                  <button type="submit" disabled={pwdLoading || !otpSent}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
                    {pwdLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
