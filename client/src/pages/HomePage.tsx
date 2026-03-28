import { Link } from 'react-router-dom';

import Button from '../components/Button';
import CardPanel from '../components/CardPanel';
import { useAuth } from '../features/authentication';

const highlights = [
  {
    title: 'Subscription Control',
    description: 'Subscribe, change plans, and cancel from one guided workflow backed by mock payments.'
  },
  {
    title: 'Admin Oversight',
    description: 'Manage plans, review users, and watch summary metrics from the admin dashboard.'
  },
  {
    title: 'Clean Architecture',
    description: 'Frontend features map directly to the modular Express backend and its secure cookie auth flow.'
  }
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="stack">
      <section className="hero">
        <CardPanel title="Subscription management without the usual clutter" subtitle="A clean internship-ready SaaS management experience built around plans, subscriptions, mock payments, and admin tooling.">
          <div className="stack">
            <p className="helper-text">
              Explore available plans, activate a subscription with a saved payment method, update your profile,
              and monitor the full flow from a modern React client.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to={isAuthenticated ? '/plans' : '/signup'}>
                <Button>{isAuthenticated ? 'Browse Plans' : 'Create Account'}</Button>
              </Link>
              <Link to={isAuthenticated ? '/subscription' : '/login'}>
                <Button variant="ghost">{isAuthenticated ? 'Open Subscription Center' : 'Log In'}</Button>
              </Link>
            </div>
          </div>
        </CardPanel>

        <CardPanel title={isAuthenticated ? `Welcome back, ${user?.name}` : 'Project Snapshot'} subtitle={isAuthenticated ? `Signed in as ${user?.role}` : 'Built for the SaaS Subscription Manager backend already running in this repo.'}>
          <div className="stack">
            <div className="list-row">
              <span>Authentication</span>
              <strong>Cookie JWT</strong>
            </div>
            <div className="list-row">
              <span>Billing Flow</span>
              <strong>Mock Payments</strong>
            </div>
            <div className="list-row">
              <span>Admin Tools</span>
              <strong>Plans + Metrics</strong>
            </div>
          </div>
        </CardPanel>
      </section>

      <div className="grid grid--three">
        {highlights.map((item) => (
          <CardPanel key={item.title} title={item.title} subtitle={item.description}>
            <div className="helper-text">This client structure is aligned to the backend modules we already initialized.</div>
          </CardPanel>
        ))}
      </div>
    </div>
  );
}
