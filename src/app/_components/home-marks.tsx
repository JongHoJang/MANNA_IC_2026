export function PinMiniMark() {
  return (
    <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[color:var(--ink)]/22">
      <span className="block h-1.5 w-1.5 rounded-full bg-[color:var(--ink)]/45" />
    </span>
  );
}

export function ClockMark() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[color:var(--ink)]/40">
      <span className="block h-1.5 w-1.5 rounded-full bg-[color:var(--ink)]" />
    </span>
  );
}

export function PersonMark() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center">
      <span className="block h-3 w-3 rounded-full border border-[color:var(--muted)]" />
    </span>
  );
}

export function PinMark() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center">
      <span className="block h-2.5 w-2.5 rounded-full border border-[color:var(--muted)]" />
    </span>
  );
}

export function PencilMark() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center">
      <span className="block h-3 w-3 rotate-45 border-r border-t border-[color:var(--ink)]" />
    </span>
  );
}
