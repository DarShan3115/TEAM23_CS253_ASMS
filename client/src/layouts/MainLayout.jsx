import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore'; 

export default function MainLayout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const role = (user?.role || 'student').toLowerCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100 selection:bg-blue-500/30">
      {/* Sidebar logic from App.jsx Layout */}
      <aside className="w-64 bg-gray-950 border-r border-gray-900 flex flex-col h-screen sticky top-0 hidden md:flex shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg"><Shield className="text-white" size={20} /></div>
            <span className="text-xl font-black text-white tracking-tighter">ASMS.</span>
          </div>
          {/* Navigation items would typically go here, but we'll use Outlet for the main content */}
        </div>
        <div className="mt-auto p-6 border-t border-gray-900">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center font-black text-xs border border-gray-700">{user?.first_name?.[0]}</div>
            <div className="truncate"><p className="text-xs font-bold text-white truncate">{user?.first_name}</p><p className="text-[9px] text-blue-500 uppercase font-black">{role}</p></div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"><LogOut size={18} /> Logout</button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto relative">
        <header className="h-16 border-b border-gray-900 px-8 flex items-center justify-between sticky top-0 bg-gray-950/80 backdrop-blur-md z-10"><h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">NODE // ENCRYPTED_ACTIVE</h2></header>
        <div className="p-10 max-w-7xl mx-auto">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}
