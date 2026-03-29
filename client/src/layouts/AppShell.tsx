import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../features/authentication';
import Button from '../components/Button';

const getNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `topbar__link ${isActive ? 'topbar__link--active' : ''}`.trim();

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
          <NavLink className={getNavLinkClassName} to="/plans">Plans</NavLink>
          {isAuthenticated ? <NavLink className={getNavLinkClassName} to="/subscription">Subscription</NavLink> : null}
          {isAuthenticated ? <NavLink className={getNavLinkClassName} to="/profile">Profile</NavLink> : null}
          {user?.role === 'ADMIN' ? <NavLink className={getNavLinkClassName} to="/admin">Admin</NavLink> : null}
          {isAuthenticated ? (
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          ) : (
            <>
              <NavLink className={getNavLinkClassName} to="/login">Login</NavLink>
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
