import React, { useState } from 'react';
import { 
  BrowserRouter as Router,
  Routes, 
  Route, 
  Navigate,
  Link,
  useNavigate
} from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, ClipboardList, 
  BarChart3, MessageSquare, ShieldAlert, LogOut,
  Search, GraduationCap, Shield, Loader2,
  BookMarked, FileText, ExternalLink, ShieldCheck
} from 'lucide-react';
import { create } from 'zustand';

// ============================================================================
// --- API CONFIGURATION ---
// ============================================================================
// TODO: Replace with your backend API URL (e.g., 'https://api.asms.com/api')
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ============================================================================
// --- RESILIENT HELPERS ---
// ============================================================================

const getSafeStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === "undefined" || item === "null") return null;
    return JSON.parse(item);
  } catch (e) {
    localStorage.removeItem(key);
    return null;
  }
};

// ============================================================================
// --- GLOBAL STORE ---
// ============================================================================

const useAuthStore = create((set) => ({
  user: getSafeStorage('user'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      // TODO: Replace with actual backend API call
      // const response = await fetch(`${API_BASE_URL}/auth/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      // if (!response.ok) throw new Error('Login failed');
      // const data = await response.json();
      
      // Mock implementation for development
      return new Promise((resolve) => {
        setTimeout(() => {
          const role = email.includes('admin') ? 'admin' : email.includes('faculty') ? 'faculty' : 'student';
          const mockUser = { 
            id: 'u-' + Math.random().toString(36).substr(2, 4),
            first_name: email.split('@')[0], 
            last_name: 'User', 
            role: role,
            email 
          };
          localStorage.setItem('token', 'mock-jwt');
          localStorage.setItem('user', JSON.stringify(mockUser));
          set({ user: mockUser, token: 'mock-jwt', isAuthenticated: true, loading: false });
          resolve({ success: true, user: mockUser });
        }, 800);
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.clear();
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },
  
  clearError: () => set({ error: null })
}));

// ============================================================================
// --- SHARED UI COMPONENTS ---
// ============================================================================

const ProtectedRoute = ({ children, role }) => {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
};

const CourseGrid = ({ courses = [], enrollments = [], onEnroll, loadingId }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {courses.map((course) => {
      const isEnrolled = enrollments.some(e => e.course_id === course.id);
      return (
        <div key={course.id} className="bg-gray-800/40 border border-gray-700 rounded-3xl p-6 group hover:border-blue-500/50 transition-all flex flex-col h-full">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-blue-600/10 p-3 rounded-2xl"><BookOpen className="text-blue-500" size={24} /></div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-900 px-2 py-1 rounded-md border border-gray-800">{course.code}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{course.title}</h3>
            <p className="text-sm text-gray-400 line-clamp-2">Under the instruction of Dr. {course.instructor_name || 'Staff'}.</p>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <button
              onClick={() => !isEnrolled && onEnroll(course.id)}
              disabled={isEnrolled || loadingId === course.id}
              className={`w-full py-3 rounded-2xl font-black text-xs uppercase transition-all ${
                isEnrolled ? 'bg-green-600/10 text-green-500' : 'bg-white text-gray-900 hover:bg-blue-500 hover:text-white'
              }`}
            >
              {loadingId === course.id ? <Loader2 className="animate-spin" size={16} /> : isEnrolled ? 'Enrolled' : 'Enroll Now'}
            </button>
          </div>
        </div>
      );
    })}
  </div>
);

const UserTable = ({ users = [], onToggle }) => (
  <div className="bg-gray-900/40 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
    <table className="w-full text-left">
      <thead>
        <tr className="bg-gray-950/50 text-[10px] font-black text-gray-500 uppercase border-b border-gray-800">
          <th className="py-4 pl-6">Identity</th>
          <th className="py-4">Role</th>
          <th className="py-4 text-right pr-6">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-800/50">
        {users.map(u => (
          <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
            <td className="py-4 pl-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center font-bold text-xs">{u.first_name[0]}</div>
                <div><p className="text-sm font-bold text-white">{u.first_name} {u.last_name}</p><p className="text-[10px] text-gray-500">{u.email}</p></div>
              </div>
            </td>
            <td className="py-4"><span className="text-[9px] font-black uppercase text-gray-400 border border-gray-700 px-2 py-0.5 rounded">{u.role}</span></td>
            <td className="py-4 text-right pr-6"><button onClick={() => onToggle(u.id)} className={`text-[10px] font-black uppercase ${u.is_active ? 'text-green-500' : 'text-red-500'}`}>{u.is_active ? 'Active' : 'Suspended'}</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ============================================================================
// --- PAGE COMPONENTS ---
// ============================================================================

const DashboardPage = () => {
  const { user } = useAuthStore();
  const role = user?.role || 'student';
  const roleConfig = {
    student: { 
      greeting: 'Student Dashboard', 
      icon: GraduationCap, 
      stats: [
        { label: 'Enrolled', val: '4', color: 'text-blue-500' }, 
        { label: 'Tasks', val: '3', color: 'text-orange-500' }, 
        { label: 'Attendance', val: '94%', color: 'text-green-500' }
      ] 
    },
    faculty: { 
      greeting: 'Professor Dashboard', 
      icon: BookOpen, 
      stats: [
        { label: 'My Courses', val: '2', color: 'text-emerald-500' }, 
        { label: 'Grading', val: '12', color: 'text-yellow-500' }, 
        { label: 'Students', val: '84', color: 'text-blue-500' }
      ] 
    },
    admin: { 
      greeting: 'Admin Dashboard', 
      icon: Shield, 
      stats: [
        { label: 'Total Users', val: '1.2k', color: 'text-amber-500' }, 
        { label: 'Node Health', val: 'Optimal', color: 'text-green-500' }, 
        { label: 'Uptime', val: '99.9%', color: 'text-blue-500' }
      ] 
    }
  };
  const config = roleConfig[role];
  const IconComponent = config.icon;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center gap-4">
        <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-xl"><IconComponent size={28}/></div>
        <div><h1 className="text-3xl font-black text-white">Welcome, {user?.first_name}!</h1><p className="text-gray-500 text-sm">{config.greeting}</p></div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {config.stats.map(s => (
          <div key={s.label} className="bg-gray-800/40 border border-gray-700 p-6 rounded-3xl">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className={`text-3xl font-black ${s.color}`}>{s.val}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

const AssignmentsPage = () => (
  <div className="space-y-8 animate-in slide-in-from-bottom-4">
    <h1 className="text-3xl font-black text-white">Task Workspace</h1>
    <div className="grid grid-cols-1 gap-4">
       {['Algorithm Analysis', 'ML Proposal', 'DB Schema Design'].map(t => (
         <div key={t} className="p-6 bg-gray-800/40 border border-gray-700 rounded-3xl flex justify-between items-center hover:bg-gray-800/60 transition-all">
            <div className="flex items-center gap-4"><FileText className="text-blue-500" /><h4 className="font-bold text-white">{t}</h4></div>
            <ExternalLink size={18} className="text-gray-600" />
         </div>
       ))}
    </div>
  </div>
);

const MyCoursesPage = () => {
  const [courses] = useState([{ id: '1', code: 'CS101', title: 'Data Structures' }, { id: '2', code: 'EE202', title: 'Signals & Systems' }]);
  const [enrolls, setEnrolls] = useState([]);
  return (
    <div className="space-y-8 animate-in zoom-in-95">
      <div className="flex justify-between items-end border-b border-gray-800 pb-8">
        <h1 className="text-3xl font-black text-white">Academic Catalog</h1>
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18}/><input className="bg-gray-800 border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-white w-64 outline-none" placeholder="Search..." /></div>
      </div>
      <CourseGrid courses={courses} enrollments={enrolls} onEnroll={(id) => setEnrolls([...enrolls, { course_id: id }])} />
    </div>
  );
};

const DiscussionPortalPage = () => (
  <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
    <h1 className="text-3xl font-black text-white flex items-center gap-3"><ShieldCheck className="text-indigo-500" size={32}/> Discussion Portal</h1>
    <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl space-y-6">
      <textarea className="w-full bg-gray-800 border border-gray-700 rounded-2xl p-6 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" placeholder="Broadcast a question..." rows={4} />
      <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Post Inquiry</button>
    </div>
  </div>
);

const AdminControlPanel = () => {
  const [users] = useState([{ id: '1', first_name: 'Darshan', last_name: 'Tandel', email: 'admin@asms.edu', role: 'admin', is_active: true }]);
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black text-white tracking-tighter">Identity Directory</h1>
      <UserTable users={users} onToggle={() => {}} />
    </div>
  );
};

const LoginPage = () => {
  const { login, error } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const email = e.target.email.value;
      await login(email, 'pass');
      navigate('/dashboard');
    } catch (err) {
      // Error is already set in store
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-10 rounded-3xl shadow-2xl space-y-8">
        <div className="text-center"><h1 className="text-4xl font-black text-blue-500">ASMS.</h1><p className="text-gray-500 mt-2">Node Synchronization Required</p></div>
        {error && <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input name="email" className="w-full bg-gray-800 border border-gray-700 p-4 rounded-2xl text-white outline-none" placeholder="Email Address" required />
          <input type="password" name="pass" className="w-full bg-gray-800 border border-gray-700 p-4 rounded-2xl text-white outline-none" placeholder="Security Token" required />
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 py-4 rounded-2xl font-black text-white uppercase text-xs shadow-xl shadow-blue-600/20 disabled:opacity-50">{isLoading ? 'Signing In...' : 'Sign In'}</button>
        </form>
        <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest italic opacity-50">Hint: Use "admin@asms.edu" for admin role.</p>
      </div>
    </div>
  );
};

const RegisterPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
     <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-10 rounded-3xl text-center space-y-6">
        <h2 className="text-3xl font-black text-white">Join ASMS</h2>
        <p className="text-gray-500">Registration is currently restricted to verified institutional emails.</p>
        <Link to="/login" className="block text-blue-500 font-bold uppercase text-xs underline">Return to Login</Link>
     </div>
  </div>
);

// ============================================================================
// --- LAYOUT COMPONENT ---
// ============================================================================

const Layout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const role = (user?.role || 'student').toLowerCase();
  
  const menu = {
    student: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }, 
      { path: '/courses', label: 'Catalog', icon: BookMarked }, 
      { path: '/assignments', label: 'Tasks', icon: ClipboardList }, 
      { path: '/progress', label: 'Standing', icon: BarChart3 }, 
      { path: '/discussions', label: 'Portal', icon: MessageSquare }
    ],
    faculty: [
      { path: '/dashboard', label: 'Hub', icon: LayoutDashboard }, 
      { path: '/discussions', label: 'Portal', icon: MessageSquare }
    ],
    admin: [{ path: '/admin/console', label: 'Control', icon: ShieldAlert }]
  }[role] || [];

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100 selection:bg-blue-500/30">
      <aside className="w-64 bg-gray-950 border-r border-gray-900 flex flex-col h-screen sticky top-0 hidden md:flex shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10"><div className="bg-blue-600 p-2 rounded-xl shadow-lg"><Shield className="text-white" size={20} /></div><span className="text-xl font-black text-white tracking-tighter">ASMS.</span></div>
          <nav className="space-y-1">
            {menu.map((item) => (
              <Link key={item.path} to={item.path} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-gray-500 hover:text-white hover:bg-gray-900 transition-all font-bold text-sm">
                <item.icon size={18} /> {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-gray-900">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center font-black text-xs border border-gray-700">{user?.first_name?.[0]}</div>
            <div className="truncate"><p className="text-xs font-bold text-white truncate">{user?.first_name}</p><p className="text-[9px] text-blue-500 uppercase font-black">{role}</p></div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-4 py-3.5 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all font-black text-xs uppercase tracking-widest"><LogOut size={18} /> Logout</button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto relative">
        <header className="h-16 border-b border-gray-900 px-8 flex items-center justify-between sticky top-0 bg-gray-950/80 backdrop-blur-md z-10"><h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">NODE // ENCRYPTED_ACTIVE</h2></header>
        <div className="p-10 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

// ============================================================================
// --- APP ROOT ---
// ============================================================================

export default function App() {
  const { token, user } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute role="student"><Layout><MyCoursesPage /></Layout></ProtectedRoute>} />
        <Route path="/assignments" element={<ProtectedRoute role="student"><Layout><AssignmentsPage /></Layout></ProtectedRoute>} />
        <Route path="/discussions" element={<ProtectedRoute><Layout><DiscussionPortalPage /></Layout></ProtectedRoute>} />
        <Route path="/admin/console" element={<ProtectedRoute role="admin"><Layout><AdminControlPanel /></Layout></ProtectedRoute>} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
