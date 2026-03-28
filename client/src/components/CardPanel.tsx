import type { ReactNode } from 'react';

interface CardPanelProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}

export default function CardPanel({ title, subtitle, children, actions }: CardPanelProps) {
  return (
    <section className="card-panel">
      {(title || subtitle || actions) && (
        <div className="card-panel__header">
          <div>
            {title ? <h3>{title}</h3> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {actions ? <div className="card-panel__actions">{actions}</div> : null}
        </div>
      )}
      <div className="card-panel__body">{children}</div>
    </section>
  );
}
