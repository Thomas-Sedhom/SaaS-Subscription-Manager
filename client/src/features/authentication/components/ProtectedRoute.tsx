import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import type { UserRole } from '../../../types/app';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactElement;
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isReady, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return <div className="summary-block">Checking session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate replace to="/" />;
  }

  return children;
}
