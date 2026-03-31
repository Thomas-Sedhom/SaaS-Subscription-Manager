import Button from '../../../components/Button';
import CardPanel from '../../../components/CardPanel';
import { formatCardExpiry, formatPaymentMethodLabel } from '../../../utils/formatters';

export default function PaymentMethodList({ paymentMethods = [], onSetDefault, isSubmitting }) {
  return (
    <CardPanel title="Payment Methods" subtitle="Saved cards that can be reused during checkout.">
      <div className="stack">
        {paymentMethods.length === 0 ? (
          <div className="helper-text">No saved cards yet. Add one below or use a one-time card during checkout.</div>
        ) : (
          paymentMethods.map((paymentMethod) => (
            <div className="list-row" key={paymentMethod.id}>
              <div>
                <strong>{formatPaymentMethodLabel(paymentMethod)}</strong>
                <p className="helper-text">Expires {formatCardExpiry(paymentMethod.expiryMonth, paymentMethod.expiryYear)}</p>
                <p className="meta-text">
                  {paymentMethod.isDefault ? 'Default card' : 'Available for future checkout'}
                </p>
              </div>
              <Button
                variant={paymentMethod.isDefault ? 'ghost' : 'primary'}
                disabled={paymentMethod.isDefault || isSubmitting}
                onClick={() => onSetDefault(paymentMethod.id)}
              >
                {paymentMethod.isDefault ? 'Default' : 'Set Default'}
              </Button>
            </div>
          ))
        )}
      </div>
    </CardPanel>
  );
}
