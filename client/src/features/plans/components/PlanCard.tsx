import Button from '../../../components/Button';
import { formatCurrency } from '../../../utils/formatters';

function getBillingLabel(billingCycle: string) {
  return billingCycle === 'MONTHLY' ? '/mo' : '/yr';
}

export default function PlanCard({ plan, isCurrent, onSelect, disabled }) {
  return (
    <article className="plan-card">
      <div className="plan-card__content">
        <header className="plan-card__header">
          <h3>{plan.name}</h3>
          {plan.description ? <p className="plan-card__description">{plan.description}</p> : null}
        </header>

        <div className="plan-card__price-row">
          <strong>{formatCurrency(plan.price)}</strong>
          <span>{getBillingLabel(plan.billingCycle)}</span>
        </div>

        <Button
          className={`plan-card__button ${isCurrent ? 'plan-card__button--current' : ''}`.trim()}
          disabled={disabled || isCurrent}
          onClick={onSelect}
          variant={isCurrent ? 'ghost' : 'primary'}
        >
          {isCurrent ? 'Current Plan' : 'Choose Plan'}
        </Button>

        <div className="plan-card__features">
          <h4>This plan includes:</h4>
          <div className="plan-card__feature-list">
            {plan.features?.map((feature) => (
              <div key={feature} className="plan-card__feature-item">
                <span className="plan-card__feature-dot" aria-hidden="true" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
