<<<<<<< HEAD
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import RecentResultsTable from "../components/organisms/RecentResultsTable";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {}
  };

  return (
        
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
        <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-zinc-400 text-center mb-8">Sign in to ASMS</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-brand-primary"
              placeholder="you@asms.edu"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-brand-primary"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-brand-primary hover:bg-brand-accent text-white font-medium transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-brand-primary hover:underline">
            Register
          </Link>
        </p>
=======
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, BookOpen, Shield, ArrowLeft, LogIn } from 'lucide-react';
import useAuthStore from '../store/authStore';

const roles = [
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    color: 'blue',
    description: 'Access courses, assignments, and track your academic progress',
    gradient: 'from-blue-600 to-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    hoverBg: 'hover:bg-blue-500/20',
    text: 'text-blue-400',
    ring: 'ring-blue-500/40',
  },
  {
    id: 'faculty',
    label: 'Professor',
    icon: BookOpen,
    color: 'emerald',
    description: 'Manage courses, grade assignments, and track attendance',
    gradient: 'from-emerald-600 to-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    hoverBg: 'hover:bg-emerald-500/20',
    text: 'text-emerald-400',
    ring: 'ring-emerald-500/40',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Shield,
    color: 'amber',
    description: 'Full system access — manage users, departments, and settings',
    gradient: 'from-amber-600 to-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    hoverBg: 'hover:bg-amber-500/20',
    text: 'text-amber-400',
    ring: 'ring-amber-500/40',
  },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [selectedRole, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      if (data.user.role !== selectedRole) {
        useAuthStore.getState().logout();
        useAuthStore.setState({
          error: `This account is registered as "${data.user.role}", not "${selectedRole}". Please select the correct role.`,
        });
        return;
      }
      navigate('/dashboard');
    } catch {
      // error is set in the store
    }
  };

  const handleBack = () => {
    setSelectedRole(null);
    setEmail('');
    setPassword('');
    clearError();
  };

  const activeRole = roles.find((r) => r.id === selectedRole);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
            ASMS
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">Academic System Management</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedRole ? (
            /* ── Role Selection ──────────────────────────────────────── */
            <motion.div
              key="role-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
                <h2 className="text-xl font-semibold text-center mb-2">Sign In</h2>
                <p className="text-zinc-400 text-center text-sm mb-6">
                  Select your role to continue
                </p>

                <div className="space-y-3">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border ${role.border} ${role.bg} ${role.hoverBg} transition-all duration-200 group`}
                      >
                        <div
                          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${role.gradient} flex items-center justify-center shrink-0`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-zinc-100 group-hover:text-white">
                            {role.label}
                          </p>
                          <p className="text-xs text-zinc-500">{role.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-6 text-center text-sm text-zinc-500">
                  Don&apos;t have an account?{' '}
                  <Link to="/register" className="text-brand-primary hover:underline">
                    Register
                  </Link>
                </p>
              </div>
            </motion.div>
          ) : (
            /* ── Login Form ──────────────────────────────────────────── */
            <motion.div
              key="login-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${activeRole.gradient} flex items-center justify-center`}
                  >
                    <activeRole.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {activeRole.label} Sign In
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Enter your credentials
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 ${activeRole.ring} transition`}
                      placeholder="you@asms.edu"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 ${activeRole.ring} transition`}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2.5 rounded-lg bg-gradient-to-r ${activeRole.gradient} text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50`}
                  >
                    {loading ? (
                      <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        Sign In as {activeRole.label}
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-5 text-center text-sm text-zinc-500">
                  Don&apos;t have an account?{' '}
                  <Link to="/register" className="text-brand-primary hover:underline">
                    Register
                  </Link>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
>>>>>>> 8cd2c7e252835807470fb00249b02a3b8b8c44da
      </div>
    </div>
  );
}
