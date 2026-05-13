import type { ReactNode } from 'react';

export function Notice({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[color:var(--accent-soft)] bg-[color:var(--accent-soft)]/45 px-4 py-3 text-sm text-[color:var(--ink)] ${className}`}
    >
      {children}
    </div>
  );
}
