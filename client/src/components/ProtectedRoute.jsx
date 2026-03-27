import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute({ children }) {
  const { token } = useAuthStore();
<<<<<<< HEAD
if (!token) return <Navigate to="/login" />;
=======
  if (!token) return <Navigate to="/login" replace />;
  return children;
>>>>>>> 8cd2c7e252835807470fb00249b02a3b8b8c44da
}
