import type { ReactNode } from 'react';

export function Card({
  title,
  desc,
  action,
  children,
}: {
  title?: string;
  desc?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="adm-card">
      {(title || action) && (
        <div className="adm-card-head">
          <div>
            {title ? <h3>{title}</h3> : null}
            {desc ? <p>{desc}</p> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  full,
  children,
}: {
  label: string;
  hint?: string;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`adm-field ${full ? 'full' : ''}`}>
      <span className="adm-label">{label}</span>
      {children}
      {hint ? <span className="adm-hint">{hint}</span> : null}
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="adm-switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
