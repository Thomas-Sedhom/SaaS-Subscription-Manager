import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../features/authentication';
import Button from '../components/Button';

export default function AppShell() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <NavLink className="brand" to="/">
            SaaS Subscription Manager
          </NavLink>
          <p className="brand__tagline">Manage plans, subscriptions, payments, and admin operations.</p>
        </div>

        <nav className="topbar__nav">
          <NavLink to="/plans">Plans</NavLink>
          {isAuthenticated ? <NavLink to="/subscription">Subscription</NavLink> : null}
          {isAuthenticated ? <NavLink to="/profile">Profile</NavLink> : null}
          {user?.role === 'ADMIN' ? <NavLink to="/admin">Admin</NavLink> : null}
          {isAuthenticated ? (
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <Button onClick={() => (window.location.href = '/signup')}>Get Started</Button>
            </>
          )}
        </nav>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}