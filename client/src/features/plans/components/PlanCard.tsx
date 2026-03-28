import Button from '../../../components/Button';
import CardPanel from '../../../components/CardPanel';
import StatusBadge from '../../../components/StatusBadge';
import { formatCurrency } from '../../../utils/formatters';

export default function PlanCard({ plan, isCurrent, onSelect, disabled }) {
  return (
    <CardPanel title={plan.name} subtitle={`${formatCurrency(plan.price)} / ${plan.billingCycle.toLowerCase()}`} actions={isCurrent ? <StatusBadge value="ACTIVE" /> : null}>
      <div className="stack">
        <div className="stack">
          {plan.features?.map((feature) => (
            <div key={feature} className="meta-text">• {feature}</div>
          ))}
        </div>
        <Button disabled={disabled} onClick={onSelect}>{isCurrent ? 'Current Plan' : 'Choose Plan'}</Button>
      </div>
    </CardPanel>
  );
}