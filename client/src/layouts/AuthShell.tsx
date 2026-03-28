import { Outlet } from 'react-router-dom';

export default function AuthShell() {
  return (
    <div className="auth-shell">
      <div className="auth-shell__panel">
        <div className="auth-shell__intro">
          <span className="eyebrow">Welcome back</span>
          <h1>Build and manage SaaS subscriptions with confidence.</h1>
          <p>
            Sign in to manage plans, monitor your subscription status, review payment history, and move
            between plans with the mock payment flow.
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}