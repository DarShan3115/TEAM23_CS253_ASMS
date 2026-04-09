import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Upload, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || '/api/users';
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || '';

export default function ProfilePage() {
  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('view'); // view, edit, password
  const [avatar, setAvatar] = useState(user?.avatar_url ? `${AUTH_BASE_URL}${user.avatar_url}` : null);
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
    email: user?.email || '',
    phone: user?.phone ? user.phone.replace('+91', '') : '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    verificationMethod: 'email', // email or phone
    verificationCode: ''
  });

  // Watch for the background database fetch to complete and populate the fields
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
        email: user.email || '',
        phone: user.phone ? user.phone.replace('+91', '') : '',
      });
      if (user.avatar_url) {
        setAvatar(`${AUTH_BASE_URL}${user.avatar_url}`);
      }
    }
  }, [user]);

  // Helper function to safely ensure the Auth Token is always attached
  const getAuthHeaders = (isFormData = false) => {
    let currentToken = token || localStorage.getItem('token');
    if (!currentToken) {
      try {
        // Fallback if token is inside a Zustand persist object
        const store = JSON.parse(localStorage.getItem('auth-storage'));
        currentToken = store?.state?.token;
      } catch(e) {}
    }
    const headers = { 'Authorization': `Bearer ${currentToken}`, 'x-auth-token': currentToken };
    if (!isFormData) headers['Content-Type'] = 'application/json';
    return headers;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'image/jpeg') {
        setAvatarError('Only JPG format is allowed.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setAvatarError('File size must be less than 10MB.');
        return;
      }
      setAvatarError('');
      
      const objectUrl = URL.createObjectURL(file);
      setAvatar(objectUrl); // Optimistic UI update

      const uploadData = new FormData();
      uploadData.append('avatar', file);

      try {
        const response = await fetch(`${AUTH_API_URL}/avatar`, {
          method: 'POST',
          headers: getAuthHeaders(true),
          body: uploadData
        });
        const data = await response.json();
        if (!response.ok) {
          setAvatarError(data.message || 'Failed to upload avatar.');
          setAvatar(user?.avatar_url ? `${AUTH_BASE_URL}${user.avatar_url}` : null); // Revert
        } else {
          // Update the global store so the avatar persists
          useAuthStore.setState((state) => ({
            user: { ...state.user, avatar_url: data.avatar_url }
          }));
        }
      } catch (err) {
        console.error(err);
        setAvatarError('Server error while uploading avatar.');
        setAvatar(user?.avatar_url ? `${AUTH_BASE_URL}${user.avatar_url}` : null); // Revert
      }
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!formData.email.endsWith('@iitk.ac.in')) {
      alert('Email must be a valid @iitk.ac.in address');
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }
    
    try {
      const response = await fetch(`${AUTH_API_URL}/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(false),
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('Profile updated successfully!');
        setDisplayData({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: `+91${formData.phone}`
        });
        // Update global state so the changes persist after refresh
        useAuthStore.setState((state) => ({
          user: { ...state.user, ...data.user }
        }));
        setActiveTab('view');
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      alert('Server error while updating profile.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pwdRegex.test(passwordData.newPassword)) {
      alert('Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${AUTH_API_URL}/change-password`, {
        method: 'PUT',
        headers: getAuthHeaders(false),
        body: JSON.stringify(passwordData)
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('Password changed successfully!');
        setActiveTab('view');
        // Clear sensitive inputs but keep the chosen verification method
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '', verificationMethod: passwordData.verificationMethod, verificationCode: '' });
      } else {
        alert(data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error(err);
      alert('Server error while changing password.');
    }
  };

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
            <p className="text-zinc-400 font-medium mt-1">Manage your account settings and preferences.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden flex items-center justify-center">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-zinc-500" />
                  )}
                </div>
                <label className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center rounded-full cursor-pointer transition-all backdrop-blur-sm">
                  <Upload size={20} className="text-white" />
                  <input type="file" accept=".jpg,.jpeg" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              {avatarError && <p className="text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded">{avatarError}</p>}
              <div>
                <h3 className="font-bold text-white text-lg">{displayData.first_name} {displayData.last_name}</h3>
                <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                  {user?.role || 'student'}
                </span>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              <button onClick={() => setActiveTab('view')} className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'view' ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' : 'bg-zinc-900 text-zinc-400 border border-transparent hover:bg-zinc-800'}`}>View Profile</button>
              <button onClick={() => setActiveTab('edit')} className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'edit' ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' : 'bg-zinc-900 text-zinc-400 border border-transparent hover:bg-zinc-800'}`}>Edit Profile</button>
              <button onClick={() => setActiveTab('password')} className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'password' ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' : 'bg-zinc-900 text-zinc-400 border border-transparent hover:bg-zinc-800'}`}>Change Password</button>
            </nav>
          </div>

          <div className="md:col-span-3 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl h-fit">
            {activeTab === 'view' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-4">Profile Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">First Name</p>
                    <p className="font-medium text-white text-lg">{displayData.first_name || 'N/A'}</p>
                  </div>
                  <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Last Name</p>
                    <p className="font-medium text-white text-lg">{displayData.last_name || 'N/A'}</p>
                  </div>
                  <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Email Address</p>
                    <div className="flex items-center gap-2 font-medium text-white text-lg">
                      <Mail size={18} className="text-zinc-400" /> {displayData.email || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Phone Number</p>
                    <div className="flex items-center gap-2 font-medium text-white text-lg">
                      <Phone size={18} className="text-zinc-400" /> {displayData.phone || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'edit' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-4">Edit Profile</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">First Name</label>
                    <input type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Last Name</label>
                    <input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Email Address</label>
                    <input type="email" placeholder="username@iitk.ac.in" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Phone Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 py-3 rounded-l-xl border border-r-0 border-zinc-800 bg-zinc-900 text-zinc-400 font-bold">
                        +91
                      </span>
                      <input type="text" maxLength="10" placeholder="1234567890" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} className="w-full bg-zinc-950 border border-zinc-800 rounded-r-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-6 border-t border-zinc-800">
                  <button type="submit" className="bg-brand-primary hover:opacity-90 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20">Save Changes</button>
                </div>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handlePasswordChange} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-4">Security Settings</h2>
                <div className="space-y-6">
                  <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl space-y-4">
                    <label className="text-sm font-semibold text-zinc-300">Choose Verification Method</label>
                    <div className="flex flex-wrap gap-6">
                      <label className="flex items-center gap-3 text-zinc-400 hover:text-white cursor-pointer transition-colors group">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${passwordData.verificationMethod === 'email' ? 'border-brand-primary' : 'border-zinc-600 group-hover:border-zinc-400'}`}>
                          {passwordData.verificationMethod === 'email' && <div className="w-2 h-2 rounded-full bg-brand-primary" />}
                        </div>
                        <input type="radio" name="verificationMethod" value="email" checked={passwordData.verificationMethod === 'email'} onChange={(e) => setPasswordData({...passwordData, verificationMethod: e.target.value})} className="hidden" />
                        <span className="text-sm font-medium">Email Verification</span>
                      </label>
                      <label className="flex items-center gap-3 text-zinc-400 hover:text-white cursor-pointer transition-colors group">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${passwordData.verificationMethod === 'phone' ? 'border-brand-primary' : 'border-zinc-600 group-hover:border-zinc-400'}`}>
                          {passwordData.verificationMethod === 'phone' && <div className="w-2 h-2 rounded-full bg-brand-primary" />}
                        </div>
                        <input type="radio" name="verificationMethod" value="phone" checked={passwordData.verificationMethod === 'phone'} onChange={(e) => setPasswordData({...passwordData, verificationMethod: e.target.value})} className="hidden" />
                        <span className="text-sm font-medium">SMS Verification</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Current Password</label>
                    <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">New Password</label>
                      <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">Confirm New Password</label>
                      <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} required className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Verification Code (Sent via {passwordData.verificationMethod === 'email' ? 'Email' : 'SMS'})</label>
                    <div className="flex gap-3">
                      <input type="text" placeholder="Enter 6-digit code" value={passwordData.verificationCode} onChange={(e) => setPasswordData({...passwordData, verificationCode: e.target.value})} required className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all font-mono tracking-widest" />
                      <button 
                        type="button" 
                        onClick={() => alert(`[Development Mode]\n\nA mock 6-digit OTP has been sent to your ${passwordData.verificationMethod}.\n\nUse code: 123456`)} 
                        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-white text-sm font-bold transition-all whitespace-nowrap"
                      >
                        Send Code
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-zinc-800">
                  <button type="submit" className="bg-brand-primary hover:opacity-90 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20">Update Password</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}