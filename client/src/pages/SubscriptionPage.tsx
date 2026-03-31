import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Button from '../components/Button';
import CardPanel from '../components/CardPanel';
import InputField from '../components/InputField';
import { PaymentHistoryList, paymentsApi } from '../features/payments';
import { PaymentMethodList, paymentMethodsApi } from '../features/payment-methods';
import { plansApi } from '../features/plans';
import { CurrentSubscriptionCard, SubscriptionHistoryList, subscriptionsApi } from '../features/subscriptions';
import { formatCardExpiry, formatCurrency, formatPaymentMethodLabel } from '../utils/formatters';

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

const emptyPaymentMethodForm = {
  cardNumber: '',
  cardholderName: '',
  expiryDate: '',
  cvv: '',
  isDefault: true,
  saveForFuture: true
};

function normalizeCardNumberInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function normalizeExpiryDateInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

function normalizeCvvInput(value) {
  return value.replace(/\D/g, '').slice(0, 4);
}

function validatePaymentMethodForm(paymentMethodForm) {
  const cardDigits = paymentMethodForm.cardNumber.replace(/\D/g, '');
  const expiryDigits = paymentMethodForm.expiryDate.replace(/\D/g, '');
  const expiryMonth = Number(expiryDigits.slice(0, 2));

  if (cardDigits.length < 12 || cardDigits.length > 19) {
    return 'Card number must be between 12 and 19 digits.';
  }

  if (paymentMethodForm.cardholderName.trim().length < 2) {
    return 'Cardholder name must be at least 2 characters.';
  }

  if (expiryDigits.length !== 4 || Number.isNaN(expiryMonth) || expiryMonth < 1 || expiryMonth > 12) {
    return 'Expiration date must be in MM / YY format.';
  }

  if (!/^\d{3,4}$/.test(paymentMethodForm.cvv)) {
    return 'Security code must be 3 or 4 digits.';
  }

  return '';
}

function buildPaymentMethodPayload(paymentMethodForm) {
  const expiryDigits = paymentMethodForm.expiryDate.replace(/\D/g, '');

  if (expiryDigits.length !== 4) {
    throw new Error('Expiration date must be in MM / YY format.');
  }

  const expiryMonth = Number(expiryDigits.slice(0, 2));
  const expiryYear = Number(`20${expiryDigits.slice(2)}`);

  return {
    cardNumber: paymentMethodForm.cardNumber,
    cardholderName: paymentMethodForm.cardholderName,
    expiryMonth,
    expiryYear,
    cvv: paymentMethodForm.cvv,
    isDefault: paymentMethodForm.isDefault,
    saveForFuture: paymentMethodForm.saveForFuture
  };
}

export default function SubscriptionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [subscriptionData, setSubscriptionData] = useState({
    currentSubscription: null,
    history: []
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
  const [paymentMethodForm, setPaymentMethodForm] = useState(emptyPaymentMethodForm);
  const [paymentFormError, setPaymentFormError] = useState('');
  const [showCardSavedModal, setShowCardSavedModal] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSelectedPlanLoading, setIsSelectedPlanLoading] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const selectedPlanId = searchParams.get('plan') || '';
  const shouldOpenCheckout = searchParams.get('checkout') === 'open';

  const loadData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [subscriptionResponse, paymentMethodsResponse, paymentsResponse] = await Promise.all([
        subscriptionsApi.getMine(),
        paymentMethodsApi.getMine(),
        paymentsApi.getMine()
      ]);

      const nextSubscriptionData = subscriptionResponse.data || { currentSubscription: null, history: [] };
      const nextPaymentMethods = paymentMethodsResponse.data || [];
      const nextPayments = paymentsResponse.data || [];

      setSubscriptionData(nextSubscriptionData);
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
    void loadData();
  }, []);

  const currentSubscription = subscriptionData.currentSubscription;
  const isPendingSubscription = currentSubscription?.status === 'PENDING';

  useEffect(() => {
    const loadSelectedPlan = async () => {
      if (!selectedPlanId) {
        setSelectedPlan(null);
        return;
      }

      setIsSelectedPlanLoading(true);

      try {
        const response = await plansApi.getPlanById(selectedPlanId);
        setSelectedPlan(response.data || null);
      } catch (requestError) {
        setSelectedPlan(null);
        setError(getErrorMessage(requestError, 'Unable to load the selected plan.'));
      } finally {
        setIsSelectedPlanLoading(false);
      }
    };

    void loadSelectedPlan();
  }, [selectedPlanId]);

  useEffect(() => {
    setIsCheckoutModalOpen(shouldOpenCheckout);
  }, [shouldOpenCheckout]);

  const updateSearchParams = (nextValues: Record<string, string>) => {
    const nextSearchParams = new URLSearchParams();

    Object.entries(nextValues).forEach(([key, value]) => {
      if (value) {
        nextSearchParams.set(key, value);
      }
    });

    setSearchParams(nextSearchParams);
  };

  const closeCheckoutModal = () => {
    if (selectedPlanId) {
      updateSearchParams({ plan: selectedPlanId });
      return;
    }

    updateSearchParams({});
  };

  const clearPendingPlan = () => {
    updateSearchParams({});
    setSelectedPlan(null);
  };

  const resetPaymentMethodForm = () => {
    setPaymentMethodForm(emptyPaymentMethodForm);
    setPaymentFormError('');
  };

  const handleCheckout = async () => {
    if (!selectedPaymentMethodId) {
      setError('Add or select a payment method before continuing.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setInfoMessage('');

    try {
      if (isPendingSubscription && currentSubscription) {
        await subscriptionsApi.checkoutPending(currentSubscription.id, {
          paymentMethodId: selectedPaymentMethodId
        });
        setInfoMessage('Subscription checkout completed successfully.');
      } else {
        if (!selectedPlanId) {
          setError('Choose a plan before continuing.');
          setIsSubmitting(false);
          return;
        }

        if (!currentSubscription) {
          setError('Pending subscription not found. Select the plan again.');
          setIsSubmitting(false);
          return;
        }

        if (currentSubscription.planId === selectedPlanId) {
          setInfoMessage('This plan is already active on your current subscription.');
          setIsSubmitting(false);
          return;
        }

        await subscriptionsApi.changePlan(currentSubscription.id, {
          newPlanId: selectedPlanId,
          paymentMethodId: selectedPaymentMethodId
        });
        setInfoMessage('Plan change completed successfully.');
      }

      await loadData();
      clearPendingPlan();
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
      clearPendingPlan();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to cancel the subscription.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentMethodChange = (event) => {
    const { name, type, value, checked } = event.target;
    setPaymentFormError('');

    setPaymentMethodForm((current) => {
      if (type === 'checkbox') {
        return {
          ...current,
          [name]: checked
        };
      }

      if (name === 'cardNumber') {
        return {
          ...current,
          cardNumber: normalizeCardNumberInput(value)
        };
      }

      if (name === 'expiryDate') {
        return {
          ...current,
          expiryDate: normalizeExpiryDateInput(value)
        };
      }

      if (name === 'cvv') {
        return {
          ...current,
          cvv: normalizeCvvInput(value)
        };
      }

      return {
        ...current,
        [name]: value
      };
    });
  };

  const handleCreatePaymentMethod = async (event) => {
    event.preventDefault();
    setError('');
    setInfoMessage('');

    const validationMessage = validatePaymentMethodForm(paymentMethodForm);
    if (validationMessage) {
      setPaymentFormError(validationMessage);
      return;
    }

    setIsSubmitting(true);
    setPaymentFormError('');

    try {
      const payload = buildPaymentMethodPayload(paymentMethodForm);

      if (paymentMethodForm.saveForFuture) {
        await paymentMethodsApi.create(payload);
        setShowCardSavedModal(true);
      } else if (isPendingSubscription && currentSubscription) {
        await subscriptionsApi.checkoutPending(currentSubscription.id, {
          newPaymentMethod: payload
        });
        setInfoMessage('Checkout completed with a one-time card.');
        clearPendingPlan();
      } else if (selectedPlanId && currentSubscription) {
        if (currentSubscription.planId === selectedPlanId) {
          setInfoMessage('This plan is already active on your current subscription.');
          setIsSubmitting(false);
          return;
        }

        await subscriptionsApi.changePlan(currentSubscription.id, {
          newPlanId: selectedPlanId,
          newPaymentMethod: payload
        });
        setInfoMessage('Plan change completed with a one-time card.');
        clearPendingPlan();
      } else {
        setPaymentFormError('Choose a plan or continue checkout before using a one-time card.');
        setIsSubmitting(false);
        return;
      }

      resetPaymentMethodForm();
      await loadData();
    } catch (requestError) {
      const fallback = paymentMethodForm.saveForFuture
        ? 'Unable to save that payment method.'
        : 'Unable to use that card for checkout.';
      const message = requestError instanceof Error
        ? requestError.message
        : getErrorMessage(requestError, fallback);
      setPaymentFormError(message);
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

  const pendingPlanForCard = selectedPlanId ? selectedPlan : null;
  const canShowCheckoutModal = isCheckoutModalOpen && (isPendingSubscription || Boolean(selectedPlanId));
  const checkoutSubtitle = isPendingSubscription && currentSubscription?.plan
    ? `Selected plan: ${currentSubscription.plan.name} at ${formatCurrency(currentSubscription.plan.price)} / ${currentSubscription.plan.billingCycle.toLowerCase()}.`
    : selectedPlan
      ? `Selected plan: ${selectedPlan.name} at ${formatCurrency(selectedPlan.price)} / ${selectedPlan.billingCycle.toLowerCase()}.`
      : 'Selected plan could not be loaded.';

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

      <CurrentSubscriptionCard
        subscription={currentSubscription}
        pendingPlan={pendingPlanForCard}
        onCancel={handleCancelSubscription}
        onContinueCheckout={
          isPendingSubscription || pendingPlanForCard
            ? () => updateSearchParams(selectedPlanId ? { plan: selectedPlanId, checkout: 'open' } : { checkout: 'open' })
            : undefined
        }
      />

      <div className="grid grid--two subscription-management-grid">
        <PaymentMethodList
          paymentMethods={paymentMethods}
          onSetDefault={handleSetDefaultMethod}
          isSubmitting={isSubmitting}
        />

        <CardPanel title="Payment Settings" subtitle="Enter card details for a reusable saved card or a one-time checkout.">
          <form className="payment-settings" onSubmit={handleCreatePaymentMethod} autoComplete="off">
            <div className="payment-settings__chip-row">
              <button className="payment-settings__chip payment-settings__chip--active" type="button">
                Credit Card
              </button>
            </div>

            {paymentFormError ? <div className="payment-settings__error">{paymentFormError}</div> : null}

            <div className="payment-settings__surface">
              <InputField
                label="Card Number"
                name="cardNumber"
                placeholder="3721 8456 9012 3456"
                value={paymentMethodForm.cardNumber}
                onChange={handlePaymentMethodChange}
                autoComplete="off"
                inputMode="numeric"
                spellCheck={false}
              />
              <InputField
                label="Cardholder Name"
                name="cardholderName"
                placeholder="As shown on card"
                value={paymentMethodForm.cardholderName}
                onChange={handlePaymentMethodChange}
                autoComplete="off"
                spellCheck={false}
              />
              <div className="payment-settings__grid">
                <InputField
                  label="Expiration Date"
                  name="expiryDate"
                  placeholder="MM / YY"
                  value={paymentMethodForm.expiryDate}
                  onChange={handlePaymentMethodChange}
                  autoComplete="off"
                  inputMode="numeric"
                  spellCheck={false}
                />
                <InputField
                  label="Security Code"
                  name="cvv"
                  placeholder="CVV"
                  value={paymentMethodForm.cvv}
                  onChange={handlePaymentMethodChange}
                  autoComplete="off"
                  inputMode="numeric"
                  spellCheck={false}
                />
              </div>
              <label className="payment-settings__toggle" htmlFor="saveForFuture">
                <input
                  id="saveForFuture"
                  type="checkbox"
                  name="saveForFuture"
                  checked={paymentMethodForm.saveForFuture}
                  onChange={handlePaymentMethodChange}
                />
                <span>Save card for future payments</span>
              </label>
              {paymentMethodForm.saveForFuture ? (
                <label className="payment-settings__toggle payment-settings__toggle--secondary" htmlFor="isDefault">
                  <input
                    id="isDefault"
                    type="checkbox"
                    name="isDefault"
                    checked={paymentMethodForm.isDefault}
                    onChange={handlePaymentMethodChange}
                  />
                  <span>Make this the default saved card</span>
                </label>
              ) : null}
            </div>

            <div className="payment-settings__actions">
              <Button type="button" variant="ghost" onClick={resetPaymentMethodForm}>
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {paymentMethodForm.saveForFuture ? 'Save' : 'Use For Checkout'}
              </Button>
            </div>
          </form>
        </CardPanel>
      </div>

      <PaymentHistoryList payments={payments} />

      <SubscriptionHistoryList subscriptions={subscriptionData.history} />

      {canShowCheckoutModal ? (
        <div className="checkout-modal">
          <div className="checkout-modal__backdrop" onClick={closeCheckoutModal} />
          <div className="checkout-modal__dialog">
            <CardPanel
              title="Checkout Setup"
              subtitle={
                isSelectedPlanLoading
                  ? 'Loading selected plan...'
                  : checkoutSubtitle
              }
              actions={
                <Button type="button" variant="ghost" onClick={closeCheckoutModal}>
                  Close
                </Button>
              }
            >
              <div className="stack checkout-setup-stack">
                <label className="field">
                  <span className="field__label">Saved payment method</span>
                  <select
                    className="field__input checkout-setup-select"
                    value={selectedPaymentMethodId}
                    onChange={(event) => setSelectedPaymentMethodId(event.target.value)}
                    disabled={(Boolean(selectedPlanId) && !selectedPlan) || isSelectedPlanLoading}
                  >
                    <option value="">Select a payment method</option>
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {`${formatPaymentMethodLabel(method)}${method.expiryMonth && method.expiryYear ? ` • Expires ${formatCardExpiry(method.expiryMonth, method.expiryYear)}` : ''}${method.isDefault ? ' (Default)' : ''}`}
                      </option>
                    ))}
                  </select>
                </label>

                {paymentMethods.length === 0 ? (
                  <div className="helper-text">
                    Save a card below or use the payment settings form as a one-time checkout card.
                  </div>
                ) : null}

                <Button
                  className="checkout-setup-button"
                  disabled={
                    isSubmitting ||
                    isLoading ||
                    isSelectedPlanLoading ||
                    (Boolean(selectedPlanId) && !selectedPlan) ||
                    (!isPendingSubscription && !selectedPlanId)
                  }
                  onClick={handleCheckout}
                >
                  {isPendingSubscription ? 'Start Subscription' : 'Apply Plan Change'}
                </Button>
              </div>
            </CardPanel>
          </div>
        </div>
      ) : null}

      {showCardSavedModal ? (
        <div className="checkout-modal">
          <div className="checkout-modal__backdrop" onClick={() => setShowCardSavedModal(false)} />
          <div className="checkout-modal__dialog success-dialog">
            <CardPanel title="Card Added" subtitle="Your new card was saved successfully and is ready for future checkout.">
              <div className="success-dialog__actions">
                <Button type="button" onClick={() => setShowCardSavedModal(false)}>
                  Close
                </Button>
              </div>
            </CardPanel>
          </div>
        </div>
      ) : null}
    </div>
  );
}

