import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'store_admin' | 'user')[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectTo
}) => {
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to appropriate login page
  if (!isAuthenticated || !user) {
    // Determine which login page to redirect to based on the current path
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    if (location.pathname.startsWith('/store-admin')) {
      return <Navigate to="/store-admin/login" state={{ from: location }} replace />;
    }
    // For user routes, redirect to home (auth modal will handle login)
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (!allowedRoles.includes(user.role as 'admin' | 'store_admin' | 'user')) {
    // Redirect based on user's actual role
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // Default redirects based on role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'store_admin':
        return <Navigate to="/store-admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;