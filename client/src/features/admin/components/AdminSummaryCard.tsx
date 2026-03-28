import type { ReactNode } from 'react';

import CardPanel from '../../../components/CardPanel';

interface AdminSummaryCardProps {
  label: ReactNode;
  value: ReactNode;
  detail?: ReactNode;
}

export default function AdminSummaryCard({ label, value, detail }: AdminSummaryCardProps) {
  return (
    <CardPanel title={label} subtitle={detail}>
      <div style={{ fontSize: '2rem', fontWeight: 800 }}>{value}</div>
    </CardPanel>
  );
}
