import Button from '../../../components/Button';
import CardPanel from '../../../components/CardPanel';
import StatusBadge from '../../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../../utils/formatters';

function MetaCard({ label, value }) {
  return (
    <div className="subscription-overview__meta-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function CurrentSubscriptionCard({ subscription, pendingPlan, onCancel, onContinueCheckout }) {
  if (pendingPlan) {
    return (
      <CardPanel
        className="subscription-overview subscription-overview--pending"
        title={pendingPlan.name}
        subtitle={pendingPlan.description || 'Review the selected plan and finish checkout to continue.'}
        actions={<StatusBadge value="PENDING" />}
      >
        <div className="subscription-overview__body">
          <div className="subscription-overview__price-row">
            <strong>{formatCurrency(pendingPlan.price)}</strong>
            <span>/ {pendingPlan.billingCycle.toLowerCase()}</span>
          </div>

          <div className="subscription-overview__meta-grid">
            <MetaCard
              label="Stage"
              value={subscription ? 'Plan change waiting for payment' : 'New subscription waiting for payment'}
            />
            <MetaCard
              label="Next Step"
              value={subscription ? 'Confirm checkout to apply the new plan' : 'Confirm checkout to activate access'}
            />
          </div>

          {onContinueCheckout ? (
            <div className="subscription-overview__actions-row">
              <Button onClick={onContinueCheckout}>Continue To Checkout</Button>
            </div>
          ) : null}
        </div>
      </CardPanel>
    );
  }

  if (!subscription) {
    return (
      <CardPanel
        className="subscription-overview subscription-overview--empty"
        title="Subscription Dashboard"
        subtitle="Choose a plan to activate your workspace and begin managing billing from one place."
      >
        <div className="subscription-overview__body">
          <div className="subscription-overview__empty-state">
            <div className="subscription-overview__empty-mark">No active plan</div>
            <p>Your account does not have an active or pending subscription yet.</p>
          </div>
        </div>
      </CardPanel>
    );
  }

  return (
    <CardPanel
      className="subscription-overview"
      title={subscription.plan?.name ?? 'Subscription'}
      subtitle={subscription.plan?.description || 'Manage your current plan, billing period, and renewal details.'}
      actions={<StatusBadge value={subscription.status} />}
    >
      <div className="subscription-overview__body">
        <div className="subscription-overview__price-row">
          <strong>{formatCurrency(subscription.plan?.price)}</strong>
          <span>/ {subscription.plan?.billingCycle?.toLowerCase()}</span>
        </div>

        <div className="subscription-overview__meta-grid">
          <MetaCard label="Started" value={formatDate(subscription.startDate)} />
          <MetaCard label="Current Period Ends" value={formatDate(subscription.currentPeriodEnd)} />
          <MetaCard label="Renewal Status" value={subscription.cancelAtPeriodEnd ? 'Ends at period close' : 'Auto-renews'} />
        </div>

        <div className="subscription-overview__actions-row">
          {subscription.status === 'PENDING' && onContinueCheckout ? (
            <Button onClick={onContinueCheckout}>Continue To Pay</Button>
          ) : null}
          {onCancel && subscription.status !== 'CANCELED' ? (
            <Button className="subscription-overview__cancel" variant="danger" onClick={() => onCancel(subscription.id)}>
              Cancel Subscription
            </Button>
          ) : null}
        </div>
      </div>
    </CardPanel>
  );
}
