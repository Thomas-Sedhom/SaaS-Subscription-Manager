export default function StatusBadge({ value }) {
  const normalized = String(value ?? 'unknown').toLowerCase();

  return <span className={`status-badge status-badge--${normalized}`}>{value}</span>;
}