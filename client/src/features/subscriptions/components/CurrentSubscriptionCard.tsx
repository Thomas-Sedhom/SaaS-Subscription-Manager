import Button from '../../../components/Button';
import CardPanel from '../../../components/CardPanel';
import StatusBadge from '../../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export default function CurrentSubscriptionCard({ subscription, onCancel }) {
  if (!subscription) {
    return (
      <CardPanel title="No Active Subscription" subtitle="Choose a plan to get started.">
        <div className="helper-text">You do not have an active or pending subscription yet.</div>
      </CardPanel>
    );
  }

  return (
    <CardPanel title={subscription.plan?.name ?? 'Subscription'} subtitle={`${formatCurrency(subscription.plan?.price)} / ${subscription.plan?.billingCycle?.toLowerCase()}`} actions={<StatusBadge value={subscription.status} />}>
      <div className="stack">
        <div className="meta-text">Started: {formatDate(subscription.startDate)}</div>
        <div className="meta-text">Current Period Ends: {formatDate(subscription.currentPeriodEnd)}</div>
        {onCancel && subscription.status !== 'CANCELED' ? <Button variant="danger" onClick={() => onCancel(subscription.id)}>Cancel Subscription</Button> : null}
      </div>
    </CardPanel>
  );
}