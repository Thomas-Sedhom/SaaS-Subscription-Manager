import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Button from '../components/Button';
import CardPanel from '../components/CardPanel';
import InputField from '../components/InputField';
import { PaymentHistoryList, paymentsApi } from '../features/payments';
import { PaymentMethodList, paymentMethodsApi } from '../features/payment-methods';
import { PlanCard, plansApi } from '../features/plans';
import { CurrentSubscriptionCard, subscriptionsApi } from '../features/subscriptions';

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

const emptyPaymentMethodForm = {
  brand: '',
  last4: '',
  methodDetails: '',
  methodType: 'CARD',
  isDefault: true
};

export default function SubscriptionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [subscriptionData, setSubscriptionData] = useState({
    currentSubscription: null,
    history: []
  });
  const [plans, setPlans] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [paymentMethodForm, setPaymentMethodForm] = useState(emptyPaymentMethodForm);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [subscriptionResponse, plansResponse, paymentMethodsResponse, paymentsResponse] = await Promise.all([
        subscriptionsApi.getMine(),
        plansApi.getPlans(),
        paymentMethodsApi.getMine(),
        paymentsApi.getMine()
      ]);

      const nextSubscriptionData = subscriptionResponse.data || { currentSubscription: null, history: [] };
      const nextPlans = plansResponse.data || [];
      const nextPaymentMethods = paymentMethodsResponse.data || [];
      const nextPayments = paymentsResponse.data || [];

      setSubscriptionData(nextSubscriptionData);
      setPlans(nextPlans);
      setPaymentMethods(nextPaymentMethods);
      setPayments(nextPayments);

      const preferredMethod = nextPaymentMethods.find((item) => item.isDefault) || nextPaymentMethods[0];
      setSelectedPaymentMethodId((current) => current || preferredMethod?.id || '');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to load subscription workspace.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentSubscription = subscriptionData.currentSubscription;
  const activePlans = useMemo(() => plans.filter((plan) => plan.isActive), [plans]);
  const selectedPlanId = searchParams.get('plan') || currentSubscription?.planId || activePlans[0]?.id || '';

  const handleChoosePlan = (planId) => {
    setSearchParams({ plan: planId });
  };

  const handleCheckout = async () => {
    if (!selectedPlanId) {
      setError('Choose a plan before continuing.');
      return;
    }

    if (!selectedPaymentMethodId) {
      setError('Add or select a payment method before continuing.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setInfoMessage('');

    try {
      if (!currentSubscription) {
        await subscriptionsApi.subscribe({
          planId: selectedPlanId,
          paymentMethodId: selectedPaymentMethodId,
          simulateFailure
        });
        setInfoMessage('Subscription checkout completed successfully.');
      } else {
        if (currentSubscription.planId === selectedPlanId) {
          setInfoMessage('This plan is already active on your current subscription.');
          setIsSubmitting(false);
          return;
        }

        await subscriptionsApi.changePlan(currentSubscription.id, {
          newPlanId: selectedPlanId,
          paymentMethodId: selectedPaymentMethodId,
          simulateFailure
        });
        setInfoMessage('Plan change completed successfully.');
      }

      await loadData();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to complete checkout.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    setIsSubmitting(true);
    setError('');
    setInfoMessage('');

    try {
      await subscriptionsApi.cancel(subscriptionId);
      setInfoMessage('Subscription canceled successfully.');
      await loadData();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to cancel the subscription.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentMethodChange = (event) => {
    const { name, type, value, checked } = event.target;
    setPaymentMethodForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreatePaymentMethod = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setInfoMessage('');

    try {
      await paymentMethodsApi.create(paymentMethodForm);
      setPaymentMethodForm(emptyPaymentMethodForm);
      setInfoMessage('Payment method saved successfully.');
      await loadData();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to save that payment method.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefaultMethod = async (paymentMethodId) => {
    setIsSubmitting(true);
    setError('');
    setInfoMessage('');

    try {
      await paymentMethodsApi.setDefault(paymentMethodId);
      setInfoMessage('Default payment method updated successfully.');
      await loadData();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to update the default payment method.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h1>Subscription Center</h1>
          <p>Handle first-time checkout, change plans, save payment methods, and review payment history.</p>
        </div>
      </div>

      {error ? <div className="alert alert--error">{error}</div> : null}
      {infoMessage ? <div className="alert alert--info">{infoMessage}</div> : null}

      <CurrentSubscriptionCard subscription={currentSubscription} onCancel={handleCancelSubscription} />

      <div className="grid grid--two">
        <CardPanel title="Checkout Setup" subtitle="Pick the target plan and the payment method that will be used for the mock transaction.">
          <div className="stack">
            <label className="field">
              <span className="field__label">Saved payment method</span>
              <select
                className="field__input"
                value={selectedPaymentMethodId}
                onChange={(event) => setSelectedPaymentMethodId(event.target.value)}
              >
                <option value="">Select a payment method</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {(method.brand || method.methodType) + (method.last4 ? ` ending in ${method.last4}` : '')}
                    {method.isDefault ? ' (Default)' : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="field" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(event) => setSimulateFailure(event.target.checked)}
              />
              <span className="field__label">Simulate payment failure for demo testing</span>
            </label>

            <Button disabled={isSubmitting || isLoading} onClick={handleCheckout}>
              {currentSubscription ? 'Apply Plan Change' : 'Start Subscription'}
            </Button>
          </div>
        </CardPanel>

        <CardPanel title="Save a New Payment Method" subtitle="Create a reusable checkout option for this account.">
          <form className="form-grid" onSubmit={handleCreatePaymentMethod}>
            <InputField label="Brand" name="brand" placeholder="Visa" value={paymentMethodForm.brand} onChange={handlePaymentMethodChange} />
            <InputField label="Last 4" name="last4" placeholder="4242" value={paymentMethodForm.last4} onChange={handlePaymentMethodChange} />
            <InputField label="Method type" name="methodType" placeholder="CARD" value={paymentMethodForm.methodType} onChange={handlePaymentMethodChange} />
            <InputField label="Method details" name="methodDetails" placeholder="Visa card for team billing" value={paymentMethodForm.methodDetails} onChange={handlePaymentMethodChange} />
            <label className="field" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <input type="checkbox" name="isDefault" checked={paymentMethodForm.isDefault} onChange={handlePaymentMethodChange} />
              <span className="field__label">Make this the default method</span>
            </label>
            <Button disabled={isSubmitting} type="submit">Save Payment Method</Button>
          </form>
        </CardPanel>
      </div>

      <div className="stack">
        <div className="page-header">
          <div>
            <h2>Available Plans</h2>
            <p>Choose a target plan for initial checkout or for an immediate plan change.</p>
          </div>
        </div>

        <div className="grid grid--three">
          {activePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={currentSubscription?.planId === plan.id}
              onSelect={() => handleChoosePlan(plan.id)}
              disabled={false}
            />
          ))}
        </div>
      </div>

      <div className="grid grid--two">
        <PaymentMethodList
          paymentMethods={paymentMethods}
          onSetDefault={handleSetDefaultMethod}
          isSubmitting={isSubmitting}
        />
        <PaymentHistoryList payments={payments} />
      </div>
    </div>
  );
}
