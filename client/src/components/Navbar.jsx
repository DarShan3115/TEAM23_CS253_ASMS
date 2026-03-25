import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-6">
        <Link to="/dashboard" className="text-lg font-bold text-brand-primary">
          ASMS
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <>
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
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
