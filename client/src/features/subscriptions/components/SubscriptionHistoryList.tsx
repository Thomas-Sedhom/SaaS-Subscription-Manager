import CardPanel from '../../../components/CardPanel';
import StatusBadge from '../../../components/StatusBadge';
import { formatCurrency, formatDate } from '../../../utils/formatters';

function formatBillingCycle(billingCycle) {
  if (!billingCycle) {
    return 'billing cycle';
  }

  return billingCycle === 'MONTHLY' ? 'monthly' : 'yearly';
}

function HistoryMetaItem({ label, value }) {
  return (
    <div className="subscription-history-item__meta-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function SubscriptionHistoryList({ subscriptions }) {
  return (
    <CardPanel
      title="Subscription History"
      subtitle="Review every subscription record tied to your account."
    >
      {subscriptions.length === 0 ? (
        <div className="helper-text">No subscription history is available yet.</div>
      ) : (
        <div className="subscription-history-list">
          {subscriptions.map((subscription) => (
            <article key={subscription.id} className="subscription-history-item">
              <div className="subscription-history-item__top">
                <div className="subscription-history-item__identity">
                  <strong>{subscription.plan?.name ?? 'Subscription record'}</strong>
                  <p>
                    {subscription.plan?.description || 'Subscription activity for your account.'}
                  </p>
                </div>
                <StatusBadge value={subscription.status} />
              </div>

              <div className="subscription-history-item__price-row">
                <span className="subscription-history-item__price">
                  {formatCurrency(subscription.plan?.price)}
                </span>
                <span className="subscription-history-item__cycle">
                  / {formatBillingCycle(subscription.plan?.billingCycle)}
                </span>
              </div>

              <div className="subscription-history-item__meta">
                <HistoryMetaItem label="Started" value={formatDate(subscription.startDate)} />
                <HistoryMetaItem label="Ended" value={formatDate(subscription.endDate)} />
                <HistoryMetaItem label="Period Ends" value={formatDate(subscription.currentPeriodEnd)} />
              </div>
            </article>
          ))}
        </div>
      )}
    </CardPanel>
  );
}
