import type { ReactNode } from 'react';

import CardPanel from '../../../components/CardPanel';

interface AdminSummaryCardProps {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
}

export default function AdminSummaryCard({ label, value, detail }: AdminSummaryCardProps) {
  return (
    <CardPanel>
      <div className="admin-summary-card">
        <span className="admin-summary-card__label">{label}</span>
        <strong className="admin-summary-card__value">{value}</strong>
        {detail ? <p className="admin-summary-card__detail">{detail}</p> : null}
      </div>
    </CardPanel>
  );
}
