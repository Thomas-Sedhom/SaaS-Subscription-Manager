import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

interface PublicOnlyRouteProps {
  children: ReactElement;
}

export default function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isReady, isAuthenticated } = useAuth();

  if (!isReady) {
    return <div className="summary-block">Checking session...</div>;
  }

  return isAuthenticated ? <Navigate replace to="/plans" /> : children;
}
