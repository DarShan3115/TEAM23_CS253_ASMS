import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const roles = [
  { id: 'student', label: 'Student',   icon: GraduationCap, description: 'Access courses, assignments, and academic progress' },
  { id: 'faculty', label: 'Professor', icon: BookOpen,       description: 'Manage courses, grade assignments, and attendance' },
  { id: 'admin',   label: 'Admin',     icon: Shield,         description: 'Full system access — manage users and settings' },
];

const inputClass = 'w-full px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition text-sm';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await login(email, password);
    if (!data.success) return;
    if (data.user.role !== selectedRole) {
      useAuthStore.getState().logout();
      useAuthStore.setState({
        error: `This account is a "${data.user.role}" account. Please select the correct role.`,
      });
      return;
    }
    navigate('/dashboard');
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
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg mb-4">
            <Shield size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-white">ASMS</h1>
          <p className="text-zinc-500 text-sm mt-1">IIT Kanpur — Academic Management System</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          {!selectedRole ? (
            /* Role Selection */
            <div>
              <h2 className="text-base font-semibold text-white mb-1">Sign In</h2>
              <p className="text-zinc-500 text-sm mb-5">Select your role to continue</p>

              <div className="space-y-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      onClick={() => { setSelectedRole(role.id); clearError(); }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 transition-colors text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                        <Icon size={17} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-100">{role.label}</p>
                        <p className="text-xs text-zinc-500">{role.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="mt-5 text-center text-sm text-zinc-500">
                No account?{' '}
                <Link to="/register" className="text-blue-400 hover:text-blue-300">Register</Link>
              </p>
            </div>
          ) : (
            /* Login Form */
            <div>
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition mb-5"
              >
                <ArrowLeft size={15} /> Back
              </button>

              <div className="flex items-center gap-2.5 mb-5">
                <activeRole.icon size={18} className="text-blue-400" />
                <h2 className="text-base font-semibold text-white">{activeRole.label} Sign In</h2>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className={inputClass} placeholder="username@iitk.ac.in" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputClass + ' pr-10'} placeholder="Enter your password" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-1.5">
                    <Link to="/forgot-password" className="text-xs text-zinc-500 hover:text-zinc-300">Forgot password?</Link>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium transition-colors">
                  {loading ? 'Signing in…' : `Sign in as ${activeRole.label}`}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-zinc-500">
                No account?{' '}
                <Link to="/register" className="text-blue-400 hover:text-blue-300">Register</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
