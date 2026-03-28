import Button from '../../../components/Button';
import CardPanel from '../../../components/CardPanel';

export default function PaymentMethodList({ paymentMethods = [], onSetDefault, isSubmitting }) {
  return (
    <CardPanel title="Payment Methods" subtitle="Reuse a saved method or switch the default checkout option.">
      <div className="stack">
        {paymentMethods.length === 0 ? (
          <div className="helper-text">No payment methods saved yet.</div>
        ) : (
          paymentMethods.map((paymentMethod) => (
            <div className="list-row" key={paymentMethod.id}>
              <div>
                <strong>
                  {paymentMethod.brand || paymentMethod.methodType}
                  {paymentMethod.last4 ? ` ending in ${paymentMethod.last4}` : ''}
                </strong>
                <p className="helper-text">{paymentMethod.methodDetails}</p>
                <p className="meta-text">
                  {paymentMethod.isDefault ? 'Default method' : 'Available for future checkout'}
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
