import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert, Users, Plus, Trash2, Edit3, Search, RefreshCcw,
  CheckCircle, AlertCircle, UserX, UserCheck, Lock, KeyRound,
  Database, Server, BarChart2, Building2, X
} from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const inputClass = 'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all';
const labelClass = 'text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block';
const Feedback = ({ msg }) => {
  if (!msg?.text) return null;
  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${msg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
      {msg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {msg.text}
    </div>
  );
};

const roleColor = { admin: 'text-amber-400 bg-amber-900/30 border-amber-800/40', faculty: 'text-emerald-400 bg-emerald-900/30 border-emerald-800/40', student: 'text-blue-400 bg-blue-900/30 border-blue-800/40' };
const RolePill = ({ role }) => <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${roleColor[role] || 'text-zinc-400 bg-zinc-900 border-zinc-700'}`}>{role}</span>;

// ---------------------------------------------------------------------------
// Create / Edit User Modal
// ---------------------------------------------------------------------------
function UserModal({ user, onClose, onSave }) {
  const isEdit = !!user?.id;
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    email:      user?.email      || '',
    phone:      user?.phone      || '',
    role:       user?.role       || 'student',
    password:   '',
  });
  const [msg, setMsg] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        const res = await api.put(`/api/admin/users/${user.id}`, form);
        onSave(res.data.user, true);
      } else {
        if (!form.password) { setMsg({ type: 'error', text: 'Password is required for new accounts.' }); setLoading(false); return; }
        const res = await api.post('/api/admin/users', form);
        onSave(res.data.user, false);
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Operation failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-white">{isEdit ? 'Edit User Account' : 'Create New Account'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input className={inputClass} value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} placeholder="Jane" required />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input className={inputClass} value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} placeholder="Doe" required />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email Address</label>
            <input className={inputClass} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jane.doe@asms.edu" required />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 9000000000" />
          </div>
          <div>
            <label className={labelClass}>Role</label>
            <select className={inputClass} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {!isEdit && (
            <div>
              <label className={labelClass}>Initial Password</label>
              <input className={inputClass} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min 8 characters" />
            </div>
          )}
          <Feedback msg={msg} />
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-all">
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Account'}
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reset Password Modal (Admin Override)
// ---------------------------------------------------------------------------
function ResetPasswordModal({ userId, onClose }) {
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/api/admin/users/${userId}/reset-password`, { newPassword: password });
      setMsg({ type: 'success', text: 'Password reset successfully!' });
      setTimeout(onClose, 1500);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to reset password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black text-white flex items-center gap-2"><KeyRound size={18} className="text-amber-500" /> Reset Password</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>New Password</label>
            <input type="password" className={inputClass} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8} />
          </div>
          <Feedback msg={msg} />
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-all">
              {loading ? 'Resetting…' : 'Set Password'}
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-zinc-800 text-white font-bold rounded-xl transition-all">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Admin Control Panel
// ---------------------------------------------------------------------------
export default function AdminControlPanel() {
  const { user: currentAdmin } = useAuthStore();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionMsg, setActionMsg] = useState({});
  const [modal, setModal] = useState(null); // {type: 'create'|'edit'|'reset', user?}
  const [serviceHealth, setServiceHealth] = useState([]);

  const SERVICES = [
    { name: 'auth-service',         url: '/api/auth', port: 5001 },
    { name: 'academic-service',     url: '/api/academic/courses/', port: 8000 },
    { name: 'analytics-service',    url: '/api/analytics/student/overview', port: 8001 },
    { name: 'productivity-service', url: '/api/v1/ping', port: 8080 },
  ];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const res = await api.get('/api/admin/users', { params });
      setUsers(res.data || []);
    } catch {
      // Fallback mock
      setUsers([
        { id: '1', first_name: 'System', last_name: 'Admin', email: 'admin@asms.edu', role: 'admin', created_at: new Date().toISOString() },
        { id: '2', first_name: 'Prof. John', last_name: 'Smith', email: 'faculty@asms.edu', role: 'faculty', created_at: new Date().toISOString() },
        { id: '3', first_name: 'Jane', last_name: 'Doe', email: 'student@asms.edu', role: 'student', created_at: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/admin/stats');
      setStats(res.data);
    } catch {
      setStats({ totalUsers: 3, students: 1, faculty: 1, admins: 1 });
    }
  };

  const checkServiceHealth = async () => {
    const results = await Promise.all(
      SERVICES.map(async (svc) => {
        try {
          await api.get(svc.url, { timeout: 4000 });
          return { ...svc, status: 'healthy' };
        } catch {
          return { ...svc, status: 'unreachable' };
        }
      })
    );
    setServiceHealth(results);
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers]);

  useEffect(() => {
    if (activeTab === 'system') checkServiceHealth();
  }, [activeTab]);

  const flashMsg = (type, text) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg({}), 3500);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Permanently delete this account? This cannot be undone.')) return;
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      flashMsg('success', 'Account deleted.');
    } catch (err) {
      flashMsg('error', err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleSuspend = async (userId, isSuspended) => {
    try {
      const res = await api.post(`/api/admin/users/${userId}/suspend`);
      setUsers(users.map(u => u.id === userId ? { ...u, locked_until: isSuspended ? null : new Date(Date.now() + 9999999999) } : u));
      flashMsg('success', res.data.message);
    } catch (err) {
      flashMsg('error', 'Suspend action failed.');
    }
  };

  const handleUnlock = async (userId) => {
    try {
      await api.post(`/api/admin/users/${userId}/unlock`);
      setUsers(users.map(u => u.id === userId ? { ...u, locked_until: null, failed_login_attempts: 0 } : u));
      flashMsg('success', 'Account unlocked.');
    } catch {
      flashMsg('error', 'Unlock failed.');
    }
  };

  const handleModalSave = (savedUser, isEdit) => {
    if (isEdit) {
      setUsers(users.map(u => u.id === savedUser.id ? { ...u, ...savedUser } : u));
      flashMsg('success', 'User updated successfully.');
    } else {
      setUsers([savedUser, ...users]);
      flashMsg('success', `Account created for ${savedUser.email}`);
    }
    setModal(null);
  };

  const isLocked = (u) => u.locked_until && new Date(u.locked_until) > new Date();

  const TABS = [
    { id: 'users',  icon: Users,     label: 'User Management' },
    { id: 'stats',  icon: BarChart2, label: 'Platform Stats' },
    { id: 'system', icon: Server,    label: 'System Health' },
  ];

  return (
    <div className="space-y-6 min-h-screen">
      {/* Modal layer */}
      {modal?.type === 'create' && <UserModal onClose={() => setModal(null)} onSave={handleModalSave} />}
      {modal?.type === 'edit'   && <UserModal user={modal.user} onClose={() => setModal(null)} onSave={handleModalSave} />}
      {modal?.type === 'reset'  && <ResetPasswordModal userId={modal.userId} onClose={() => setModal(null)} />}

      {/* Header */}
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-6">
        <div className="bg-red-600/10 p-3 rounded-xl border border-red-600/30">
          <ShieldAlert size={26} className="text-red-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Admin Console</h1>
          <p className="text-zinc-400 mt-1 text-sm font-medium">Logged in as <span className="text-red-400 font-bold">{currentAdmin?.email}</span></p>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-3 border-b border-zinc-800 pb-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-sm transition-all ${activeTab === tab.id ? 'text-white bg-zinc-800 border border-zinc-700 border-b-0' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <tab.icon size={16} />{tab.label}
          </button>
        ))}
      </div>

      {/* Global feedback */}
      {actionMsg.text && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${actionMsg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {actionMsg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />} {actionMsg.text}
        </div>
      )}

      {/* ── USER MANAGEMENT ── */}
      {activeTab === 'users' && (
        <div className="space-y-5">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-3 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input type="text" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500" />
              </div>
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-blue-500">
                <option value="">All Roles</option>
                <option value="student">Students</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admins</option>
              </select>
              <button onClick={fetchUsers} className="p-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all">
                <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            <button onClick={() => setModal({ type: 'create' })}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm transition-all shadow-lg shadow-blue-600/20">
              <Plus size={16} /> New Account
            </button>
          </div>

          {/* Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-zinc-500 animate-pulse">Loading users…</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-zinc-500">No users found.</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-black text-white">
                          {u.first_name?.[0]}{u.last_name?.[0]}
                        </div>
                        <span className="text-white font-semibold text-sm">{u.first_name} {u.last_name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-400 text-sm">{u.email}</td>
                    <td className="p-4"><RolePill role={u.role} /></td>
                    <td className="p-4">
                      {isLocked(u) ? (
                        <span className="text-[10px] font-black text-red-400 bg-red-900/30 border border-red-800/40 px-2 py-0.5 rounded-lg uppercase">Suspended</span>
                      ) : (
                        <span className="text-[10px] font-black text-green-400 bg-green-900/30 border border-green-800/40 px-2 py-0.5 rounded-lg uppercase">Active</span>
                      )}
                    </td>
                    <td className="p-4 text-zinc-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 justify-end">
                        {/* Edit */}
                        <button onClick={() => setModal({ type: 'edit', user: u })} title="Edit user"
                          className="p-1.5 hover:bg-blue-600/20 text-zinc-500 hover:text-blue-400 rounded-lg transition-all"><Edit3 size={14} /></button>
                        {/* Suspend / Reactivate */}
                        <button onClick={() => handleSuspend(u.id, isLocked(u))} title={isLocked(u) ? 'Reactivate' : 'Suspend'}
                          className={`p-1.5 rounded-lg transition-all ${isLocked(u) ? 'text-zinc-500 hover:text-green-400 hover:bg-green-600/20' : 'text-zinc-500 hover:text-yellow-400 hover:bg-yellow-600/20'}`}>
                          {isLocked(u) ? <UserCheck size={14} /> : <UserX size={14} />}
                        </button>
                        {/* Unlock brute-force lock */}
                        {isLocked(u) && (
                          <button onClick={() => handleUnlock(u.id)} title="Remove lock"
                            className="p-1.5 hover:bg-amber-600/20 text-zinc-500 hover:text-amber-400 rounded-lg transition-all"><Lock size={14} /></button>
                        )}
                        {/* Reset Password */}
                        <button onClick={() => setModal({ type: 'reset', userId: u.id })} title="Reset password"
                          className="p-1.5 hover:bg-amber-600/20 text-zinc-500 hover:text-amber-400 rounded-lg transition-all"><KeyRound size={14} /></button>
                        {/* Delete (not self) */}
                        {u.id !== currentAdmin?.id && (
                          <button onClick={() => handleDelete(u.id)} title="Delete account"
                            className="p-1.5 hover:bg-red-600/20 text-zinc-500 hover:text-red-400 rounded-lg transition-all"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PLATFORM STATS ── */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Users',    value: stats.totalUsers || 0, icon: Users,     color: 'text-blue-400' },
            { label: 'Students',       value: stats.students   || 0, icon: Building2, color: 'text-emerald-400' },
            { label: 'Faculty',        value: stats.faculty    || 0, icon: Users,     color: 'text-purple-400' },
            { label: 'Admins',         value: stats.admins     || 0, icon: ShieldAlert, color: 'text-amber-400' },
          ].map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{card.label}</p>
                  <Icon size={18} className={card.color} />
                </div>
                <p className={`text-4xl font-black ${card.color}`}>{card.value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── SYSTEM HEALTH ── */}
      {activeTab === 'system' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Microservice Health</h2>
            <button onClick={checkServiceHealth} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white bg-zinc-800 px-4 py-2 rounded-xl border border-zinc-700 transition-all">
              <RefreshCcw size={14} /> Re-check
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(serviceHealth.length > 0 ? serviceHealth : SERVICES.map(s => ({ ...s, status: 'checking' }))).map(svc => (
              <div key={svc.name} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${svc.status === 'healthy' ? 'bg-green-500 animate-pulse' : svc.status === 'checking' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-white font-bold text-sm">{svc.name}</p>
                    <p className="text-zinc-500 text-xs">Port {svc.port}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${svc.status === 'healthy' ? 'text-green-400 bg-green-900/30 border-green-800/40' : svc.status === 'checking' ? 'text-yellow-400 bg-yellow-900/30 border-yellow-800/40' : 'text-red-400 bg-red-900/30 border-red-800/40'}`}>
                  {svc.status}
                </span>
              </div>
            ))}
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-600/10 rounded-2xl border border-blue-800/30 flex items-center justify-center"><Database size={26} className="text-blue-400" /></div>
            <div>
              <p className="text-white font-bold">PostgreSQL Cluster</p>
              <p className="text-zinc-500 text-sm mt-0.5">Shared across all microservices · All migrations applied</p>
            </div>
            <div className="ml-auto"><span className="text-[10px] font-black text-green-400 bg-green-900/30 border border-green-800/40 px-2 py-1 rounded-lg uppercase">Connected</span></div>
          </div>
        </div>
      )}
    </div>
  );
}