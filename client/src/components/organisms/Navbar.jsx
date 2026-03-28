import React from 'react';
import { LogOut, GraduationCap, BookOpen, Shield } from 'lucide-react';
import useAuthStore from '../../store/authStore';
/**
 * MOCK STORE: useAuthStore
 * Inlined to resolve dependency resolution issues in the preview environment.
 */
const useAuthStore = () => {
  return {
    user: {
      first_name: 'Demo',
      last_name: 'User',
      email: 'demo@asms.edu',
      role: 'admin'
    },
    logout: () => console.log('Logout triggered')
  };
};

const roleBadge = {
  student: { label: 'Student', icon: GraduationCap, bg: 'bg-blue-500/20', text: 'text-blue-400' },
  faculty: { label: 'Professor', icon: BookOpen, bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  admin: { label: 'Admin', icon: Shield, bg: 'bg-amber-500/20', text: 'text-amber-400' },
};

/**
 * ORGANISM: Navbar
 * Standard top header for the application.
 * * FIX: Removed 'react-router-dom' dependencies (Link, useNavigate) to prevent 
 * "useNavigate() may be used only in the context of a <Router> component" errors 
 * in standalone preview environments.
 */
export default function Navbar() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    // Use window.location for navigation to avoid Router context dependency
    window.location.hash = '/login';
  };

  const badge = (user && roleBadge[user.role]) || roleBadge.student;
  const BadgeIcon = badge.icon;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-6 py-3">
      <div className="flex h-14 items-center justify-between max-w-7xl mx-auto">
        <a
          href="#/dashboard"
          className="text-xl font-black bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent tracking-tighter hover:opacity-80 transition-opacity"
        >
          ASMS.
        </a>
        
        <div className="flex items-center gap-6">
          {user && (
            <>
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-zinc-100 hidden sm:inline">
                  {String(user.first_name || '')} {String(user.last_name || '')}
                </span>
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter hidden sm:inline">
                  {String(user.email || '')}
                </span>
              </div>

              <span
                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase rounded-full border ${badge.bg} ${badge.text} border-current/20`}
              >
                {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
                {badge.label}
              </span>

              <div className="w-px h-6 bg-zinc-800 mx-1 hidden sm:block" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-black uppercase text-zinc-500 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}