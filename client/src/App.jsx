import { 
  HashRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  useParams,
  useNavigate
} from 'react-router-dom';
import MyCoursesPage from './pages/MyCoursesPage';
import AdminControlPanel from './pages/AdminControlPanel';
import FacultyDashboard from './pages/FacultyDashboard';
import AssignmentsPage from './pages/AssignmentsPage';
import DiscussionPortalPage from './pages/DiscussionPortalPage';
import FacultyGradingPage from './pages/FacultyGradingPage';
import DashboardPage from './pages/DashboardPage';
import CourseDetailBoard from './pages/CourseDetailBoard';
import FacultyCourseBoard from './pages/FacultyCourseBoard';
import TasksPage from './pages/TasksPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import MainLayout from './layouts/MainLayout';
import { useAuthStore } from './store/authStore';

/**
 * ASMS MASTER ORCHESTRATOR
 * Consolidating your provided page logic into a resilient, production-ready shell.
 * Use this as your client/src/App.jsx for the Canvas environment.
 */

// ============================================================================
// --- SHARED UI COMPONENTS (Organisms) ---
// ============================================================================

const rolehome = { student: '/dashboard', faculty: '/faculty-hub', admin: '/admin/console' };

const ProtectedRoute = ({ children, role }) => {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    // Send them to their own home instead of /dashboard to avoid loops
    return <Navigate to={rolehome[user?.role] || '/dashboard'} replace />;
  }
  return children;
};

// ============================================================================
// --- INDIVIDUAL PAGE VIEWS (Integrated from your files) ---
// ============================================================================

/**
 * UTILITY: FacultyGradingWrapper
 * Small bridge to pass URL parameters into the modular FacultyGradingPage.
 */
const FacultyGradingWrapper = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  return <FacultyGradingPage assignmentId={assignmentId} onBack={() => navigate(-1)} />;
};

// ============================================================================
// --- MASTER APP SHELL ---
// ============================================================================

export default function App() {
  const { token, user } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/forgot-password" element={!token ? <ForgotPasswordPage /> : <Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute role="student"><MainLayout><MyCoursesPage /></MainLayout></ProtectedRoute>} />
        <Route path="/courses/:courseId" element={<ProtectedRoute role="student"><MainLayout><CourseDetailBoard /></MainLayout></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute role="student"><MainLayout><TasksPage /></MainLayout></ProtectedRoute>} />
        <Route path="/assignments" element={<ProtectedRoute role="student"><MainLayout><TasksPage /></MainLayout></ProtectedRoute>} />
        <Route path="/discussions" element={<ProtectedRoute><MainLayout><DiscussionPortalPage /></MainLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
        <Route path="/faculty/grading/:assignmentId" element={<ProtectedRoute role="faculty"><MainLayout><FacultyGradingWrapper /></MainLayout></ProtectedRoute>} />
        <Route path="/faculty-hub" element={<ProtectedRoute role="faculty"><MainLayout><FacultyDashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/faculty/courses/:courseId" element={<ProtectedRoute role="faculty"><MainLayout><FacultyCourseBoard /></MainLayout></ProtectedRoute>} />
        <Route path="/admin/console" element={<ProtectedRoute role="admin"><MainLayout><AdminControlPanel /></MainLayout></ProtectedRoute>} />

        <Route path="/" element={<RoleGate />} />
        <Route path="*" element={<RoleGate />} />
      </Routes>
    </Router>
  );
}

// Sends each user to their own landing page
function RoleGate() {
  const { token, user } = useAuthStore();
  const dest = token ? (rolehome[user?.role] || '/dashboard') : '/login';
  return <Navigate to={dest} replace />;
}