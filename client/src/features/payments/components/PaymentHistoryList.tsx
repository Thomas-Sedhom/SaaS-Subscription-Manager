import CardPanel from '../../../components/CardPanel';
import StatusBadge from '../../../components/StatusBadge';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';

export default function PaymentHistoryList({ payments = [] }) {
  return (
    <CardPanel
      title="Payment History"
      subtitle="Track subscription purchases and plan change attempts."
    >
      <div className="stack">
        {payments.length === 0 ? (
          <div className="helper-text">No payments have been recorded yet.</div>
        ) : (
          payments.map((payment) => (
            <div className="list-row" key={payment.id}>
              <div>
                <strong>{payment.type?.replaceAll('_', ' ') || 'Payment'}</strong>
                <p className="helper-text">
                  {formatCurrency(payment.amount)} {payment.currency} via {payment.brand || payment.provider}
                </p>
                <p className="meta-text">{formatDateTime(payment.createdAt)}</p>
                {payment.failureReason ? <p className="field__error">{payment.failureReason}</p> : null}
              </div>
              <StatusBadge value={payment.status} />
            </div>
          ))
        )}
      </div>
    </CardPanel>
  );
}
