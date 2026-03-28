import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CardPanel from '../components/CardPanel';
import { useAuth } from '../features/authentication';
import { PlanCard, plansApi } from '../features/plans';
import { subscriptionsApi } from '../features/subscriptions';

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export default function PlansPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [plansResponse, subscriptionResponse] = await Promise.all([
          plansApi.getPlans(),
          subscriptionsApi.getMine()
        ]);

        setPlans(plansResponse.data || []);
        setCurrentSubscription(subscriptionResponse.data?.currentSubscription || null);
      } catch (requestError) {
        setError(getErrorMessage(requestError, 'Unable to load plans right now.'));
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, []);

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1>Plans</h1>
          <p>Browse active plans and choose the right subscription tier for your account.</p>
        </div>
      </div>

      {error ? <div className="alert alert--error">{error}</div> : null}

      <CardPanel title="Selection Guidance" subtitle="The subscription center handles both first-time checkout and plan changes.">
        <div className="helper-text">
          {currentSubscription
            ? `Your current plan is ${currentSubscription.plan?.name}. Choose another plan to open the plan-change flow.`
            : 'Choose any active plan and continue to the subscription center to complete checkout.'}
        </div>
      </CardPanel>

      {isLoading ? (
        <CardPanel title="Loading plans" subtitle="Fetching the latest plan catalog from the backend." />
      ) : (
        <div className="grid grid--three">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={currentSubscription?.planId === plan.id}
              disabled={!plan.isActive}
              onSelect={() => navigate(`/subscription?plan=${plan.id}`)}
            />
          ))}
        </div>
      )}

      {user?.role === 'ADMIN' ? (
        <CardPanel title="Admin Shortcut" subtitle="You can also manage plans and review users from the dashboard.">
          <div className="helper-text">Open the admin page to create, edit, or remove plans and to inspect user activity.</div>
        </CardPanel>
      ) : null}
    </div>
  );
}
