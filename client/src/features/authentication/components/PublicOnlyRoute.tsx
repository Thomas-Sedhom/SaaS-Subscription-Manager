import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

interface PublicOnlyRouteProps {
  children: ReactElement;
}

export default function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isReady, isAuthenticated, user } = useAuth();

  if (!isReady) {
    return <div className="summary-block">Checking session...</div>;
  }

  if (!isAuthenticated) {
    return children;
  }

  return <Navigate replace to={user?.role === 'ADMIN' ? '/admin' : '/plans'} />;
}
