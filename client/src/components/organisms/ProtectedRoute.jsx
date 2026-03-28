import React, { useEffect } from 'react';
import useAuthStore from '../../store/authStore';

/**
 * MOCK STORE: useAuthStore
 * Inlined to resolve dependency resolution issues in the preview environment.
 * In your local production environment, restore: 
 * import useAuthStore from '../../store/authStore';
 */
const useAuthStore = () => {
  // Mocking the auth state for preview purposes.
  // We check localStorage to mimic actual persistence logic.
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return { token };
};

/**
 * UTILITY: ProtectedRoute
 * Higher-Order Component to wrap authenticated views.
 * Ensures only users with a valid session token can access the children.
 * * FIX: Replaced <Navigate> with window.location logic to avoid Router context dependency
 * which causes errors in standalone preview environments.
 */
export default function ProtectedRoute({ children }) {
  const { token } = useAuthStore();
  
  useEffect(() => {
    // If no token exists, manually redirect the user to the login screen.
    if (!token) {
      window.location.hash = '/login';
    }
  }, [token]);

  // If no token exists, return a placeholder instead of the <Navigate> component.
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest">
          Authenticating session...
        </p>
      </div>
    );
  }
  
  // Ensure children are wrapped in a fragment to provide a clean React node.
  return <React.Fragment>{children}</React.Fragment>;
}