<<<<<<< HEAD
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', role: 'student',
  });
  const { register, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/dashboard');
    } catch {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
        <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-zinc-400 text-center mb-8">Join ASMS today</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">First Name</label>
              <input name="first_name" value={form.first_name} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-brand-primary"
                required />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Last Name</label>
              <input name="last_name" value={form.last_name} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-brand-primary"
                required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-brand-primary"
              placeholder="you@asms.edu" required />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-brand-primary"
              placeholder="Min 6 characters" required minLength={6} />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Role</label>
            <select name="role" value={form.role} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-brand-primary">
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg bg-brand-primary hover:bg-brand-accent text-white font-medium transition disabled:opacity-50">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-primary hover:underline">Sign In</Link>
        </p>
=======
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Shield,
  ArrowLeft,
  UserPlus,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const roles = [
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    description: 'Join as a student to access courses and track progress',
    gradient: 'from-blue-600 to-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    hoverBg: 'hover:bg-blue-500/20',
    ring: 'ring-blue-500/40',
    fields: [
      { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 9876543210', required: false },
    ],
  },
  {
    id: 'faculty',
    label: 'Professor',
    icon: BookOpen,
    description: 'Register as faculty to manage courses and students',
    gradient: 'from-emerald-600 to-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    hoverBg: 'hover:bg-emerald-500/20',
    ring: 'ring-emerald-500/40',
    fields: [
      { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 9876543210', required: false },
      { name: 'department', label: 'Department', type: 'text', placeholder: 'e.g. Computer Science', required: false },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Shield,
    description: 'Administrative access — requires approval',
    gradient: 'from-amber-600 to-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    hoverBg: 'hover:bg-amber-500/20',
    ring: 'ring-amber-500/40',
    fields: [
      { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 9876543210', required: false },
      { name: 'admin_code', label: 'Admin Access Code', type: 'text', placeholder: 'Enter access code', required: true },
    ],
  },
];

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    department: '',
    admin_code: '',
  });
  const [formError, setFormError] = useState('');
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
    setFormError('');
  }, [selectedRole, clearError]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    if (form.password !== form.confirm_password) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        role: selectedRole,
        phone: form.phone || undefined,
      });
      navigate('/dashboard');
    } catch {
      // error is set in the store
    }
  };

  const handleBack = () => {
    setSelectedRole(null);
    setForm({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirm_password: '',
      phone: '',
      department: '',
      admin_code: '',
    });
    setFormError('');
    clearError();
  };

  const activeRole = roles.find((r) => r.id === selectedRole);
  const displayError = formError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 py-8">
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
                <h2 className="text-xl font-semibold text-center mb-2">
                  Create Account
                </h2>
                <p className="text-zinc-400 text-center text-sm mb-6">
                  Select your role to get started
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
                          <p className="text-xs text-zinc-500">
                            {role.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-6 text-center text-sm text-zinc-500">
                  Already have an account?{' '}
                  <Link to="/login" className="text-brand-primary hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </motion.div>
          ) : (
            /* ── Registration Form ───────────────────────────────────── */
            <motion.div
              key="register-form"
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
                      {activeRole.label} Registration
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Fill in your details below
                    </p>
                  </div>
                </div>

                {displayError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {displayError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">
                        First Name
                      </label>
                      <input
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 ${activeRole.ring} transition`}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1.5">
                        Last Name
                      </label>
                      <input
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 ${activeRole.ring} transition`}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 ${activeRole.ring} transition`}
                      placeholder="you@asms.edu"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">
                      Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 ${activeRole.ring} transition`}
                      placeholder="Min 6 characters"
                      required
                      minLength={6}
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      name="confirm_password"
                      type="password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 ${activeRole.ring} transition`}
                      placeholder="Re-enter password"
                      required
                      minLength={6}
                    />
                  </div>

                  {/* Role-specific fields */}
                  {activeRole.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm text-zinc-400 mb-1.5">
                        {field.label}
                      </label>
                      <input
                        name={field.name}
                        type={field.type}
                        value={form[field.name]}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 ${activeRole.ring} transition`}
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2.5 rounded-lg bg-gradient-to-r ${activeRole.gradient} text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50`}
                  >
                    {loading ? (
                      <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Register as {activeRole.label}
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-5 text-center text-sm text-zinc-500">
                  Already have an account?{' '}
                  <Link to="/login" className="text-brand-primary hover:underline">
                    Sign In
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
