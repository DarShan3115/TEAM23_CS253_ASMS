import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { LogOut, Shield, LayoutDashboard, BookOpen, ClipboardList, BarChart3, User, ShieldAlert, Moon, Sun, CalendarCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const navConfig = {
  student: [
    { label: 'Dashboard',         path: '/dashboard',   icon: LayoutDashboard },
    { label: 'My Courses',        path: '/courses',     icon: BookOpen },
    { label: 'Timetable',         path: '/timetable',   icon: CalendarCheck },
    { label: 'Task Management',   path: '/tasks',       icon: ClipboardList },
    { label: 'Academic Progress', path: '/progress',    icon: BarChart3 },
    { label: 'My Profile',        path: '/profile',     icon: User },
  ],
  faculty: [
    { label: 'Dashboard',  path: '/dashboard',    icon: LayoutDashboard },
    { label: 'My Courses', path: '/faculty-hub',  icon: BookOpen },
    { label: 'Timetable',  path: '/timetable',    icon: CalendarCheck },
    { label: 'My Profile', path: '/profile',      icon: User },
  ],
  admin: [
    { label: 'Dashboard',     path: '/dashboard',     icon: LayoutDashboard },
    { label: 'Admin Console', path: '/admin/console', icon: ShieldAlert },
    { label: 'My Profile',    path: '/profile',       icon: User },
  ],
};

export default function MainLayout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const role = (user?.role || 'student').toLowerCase();
  const navItems = navConfig[role] || navConfig.student;

  const [isLightMode, setIsLightMode] = useState(false);

  const toggleTheme = () => {
    if (isLightMode) {
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
    }
    setIsLightMode(!isLightMode);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      {/* ── Sidebar ── */}
      <aside className="w-60 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen sticky top-0 hidden md:flex shrink-0">
        {/* Brand */}
        <div className="px-5 py-6 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <img src="/LogoASMS.png" alt="ASMS" className="h-6 w-auto" />
            <span className="text-base font-semibold text-white">ASMS</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">IIT Kanpur</p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-3 flex-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-xs font-semibold text-zinc-300">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-white truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-zinc-500 capitalize">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-14 border-b border-zinc-800 px-6 flex items-center justify-between sticky top-0 bg-zinc-950 z-10">
          <span className="text-sm font-medium text-zinc-400">Academic School Management System</span>
          <div className="flex items-center gap-4 ml-auto">
            <button onClick={toggleTheme} className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors" title="Toggle Theme">
              {isLightMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-blue-500" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Online</span>
            </div>
          </div>
        </header>
        <div className="p-8 max-w-6xl mx-auto">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}
