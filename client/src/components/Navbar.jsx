import { Link, useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import useAuthStore from '../store/authStore';

=======
import { LogOut, GraduationCap, BookOpen, Shield } from 'lucide-react';
import useAuthStore from '../store/authStore';

const roleBadge = {
  student: { label: 'Student', icon: GraduationCap, bg: 'bg-blue-500/20', text: 'text-blue-400' },
  faculty: { label: 'Professor', icon: BookOpen, bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  admin: { label: 'Admin', icon: Shield, bg: 'bg-amber-500/20', text: 'text-amber-400' },
};

>>>>>>> 8cd2c7e252835807470fb00249b02a3b8b8c44da
export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

<<<<<<< HEAD
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-6">
        <Link to="/dashboard" className="text-lg font-bold text-brand-primary">
=======
  const badge = roleBadge[user?.role] || roleBadge.student;
  const BadgeIcon = badge.icon;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-6">
        <Link
          to="/dashboard"
          className="text-lg font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent"
        >
>>>>>>> 8cd2c7e252835807470fb00249b02a3b8b8c44da
          ASMS
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <>
<<<<<<< HEAD
              <span className="text-sm text-zinc-400">
                {user.first_name} {user.last_name}
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-brand-primary/20 text-brand-primary">
                  {user.role}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-zinc-400 hover:text-zinc-100 transition"
              >
                Logout
=======
              <span className="text-sm text-zinc-400 hidden sm:inline">
                {user.first_name} {user.last_name}
              </span>
              <span
                className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-full ${badge.bg} ${badge.text}`}
              >
                <BadgeIcon className="w-3 h-3" />
                {badge.label}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-100 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
>>>>>>> 8cd2c7e252835807470fb00249b02a3b8b8c44da
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
