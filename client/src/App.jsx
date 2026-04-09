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
import AcademicProgressPage from './pages/AcademicProgressPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
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

const ProtectedRoute = ({ children, role }) => {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/dashboard" replace />;
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

        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute role="student"><MainLayout><MyCoursesPage /></MainLayout></ProtectedRoute>} />
        <Route path="/assignments" element={<ProtectedRoute role="student"><MainLayout><AssignmentsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute role="student"><MainLayout><AcademicProgressPage /></MainLayout></ProtectedRoute>} />
        <Route path="/discussions" element={<ProtectedRoute><MainLayout><DiscussionPortalPage /></MainLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />

        <Route path="/faculty/grading/:assignmentId" element={<ProtectedRoute role="faculty"><MainLayout><FacultyGradingWrapper /></MainLayout></ProtectedRoute>} />
        <Route path="/faculty-hub" element={<ProtectedRoute role="faculty"><MainLayout><FacultyDashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/admin/console" element={<ProtectedRoute role="admin"><MainLayout><AdminControlPanel /></MainLayout></ProtectedRoute>} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}