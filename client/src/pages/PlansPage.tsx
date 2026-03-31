import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../components/Button';
import CardPanel from '../components/CardPanel';
import { useAuth } from '../features/authentication';
import { PlanCard, plansApi } from '../features/plans';
import { subscriptionsApi } from '../features/subscriptions';
import { formatCurrency } from '../utils/formatters';

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export default function PlansPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [previewPlan, setPreviewPlan] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSelectingPlan, setIsSelectingPlan] = useState(false);

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

    void loadPage();
  }, []);

  const handleSelectPlan = async () => {
    if (!previewPlan) {
      return;
    }

    setIsSelectingPlan(true);
    setError('');

    try {
      if (currentSubscription?.status === 'ACTIVE') {
        navigate(`/subscription?plan=${previewPlan.id}&checkout=open`);
        return;
      }

      await subscriptionsApi.selectPlan({
        planId: previewPlan.id
      });

      navigate('/subscription?checkout=open');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to prepare that plan for checkout.'));
    } finally {
      setIsSelectingPlan(false);
      setPreviewPlan(null);
    }
  };

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1>Plans</h1>
          <p>Browse active plans and choose the right subscription tier for your account.</p>
        </div>
      </div>

      {error ? <div className="alert alert--error">{error}</div> : null}

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
              onSelect={() => setPreviewPlan(plan)}
            />
          ))}
        </div>
      )}

      {user?.role === 'ADMIN' ? (
        <CardPanel title="Admin Shortcut" subtitle="You can also manage plans and review users from the dashboard.">
          <div className="helper-text">Open the admin page to create, edit, or remove plans and to inspect user activity.</div>
        </CardPanel>
      ) : null}

      {previewPlan ? (
        <div className="checkout-modal">
          <div className="checkout-modal__backdrop" onClick={() => setPreviewPlan(null)} />
          <div className="checkout-modal__dialog">
            <CardPanel
              title={previewPlan.name}
              subtitle={`${formatCurrency(previewPlan.price)} / ${previewPlan.billingCycle.toLowerCase()}`}
              actions={
                <Button type="button" variant="ghost" onClick={() => setPreviewPlan(null)}>
                  Close
                </Button>
              }
            >
              <div className="stack">
                {previewPlan.description ? <div className="helper-text">{previewPlan.description}</div> : null}
                <div className="helper-text">
                  {currentSubscription?.status === 'ACTIVE'
                    ? 'Selecting this plan will move you into the plan-change checkout flow.'
                    : 'Selecting this plan will create a pending subscription row before you complete checkout.'}
                </div>

                <div className="plan-preview-list">
                  {previewPlan.features?.map((feature) => (
                    <div key={feature} className="plan-preview-list__item">
                      {feature}
                    </div>
                  ))}
                </div>

                <Button
                  disabled={isSelectingPlan}
                  onClick={handleSelectPlan}
                  type="button"
                >
                  Select Plan
                </Button>
              </div>
            </CardPanel>
          </div>
        </div>
      ) : null}
    </div>
  );
}
