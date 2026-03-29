import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/authStore';
<<<<<<< HEAD
import RecentResultsTable from "./components/organisms/RecentResultsTable";
=======
>>>>>>> 8cd2c7e252835807470fb00249b02a3b8b8c44da

export default function App() {
  const { token, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token) fetchMe();
  }, [token, fetchMe]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* Redirects & fallback */}
<<<<<<< HEAD
        <Route path="/" element={<Navigate to="/dashboard" />} />
=======
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
>>>>>>> 8cd2c7e252835807470fb00249b02a3b8b8c44da
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
