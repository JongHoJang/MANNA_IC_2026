export function PinMiniMark() {
  return <DotMark />;
}

export function ClockMark() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[color:var(--ink)]/40">
      <span className="block h-1.5 w-1.5 rounded-full bg-[color:var(--ink)]" />
    </span>
  );
}

export function PersonMark() {
  return <DotMark />;
}

export function PinMark() {
  return <DotMark />;
}

export function PencilMark() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center">
      <span className="block h-3 w-3 rotate-45 border-r border-t border-[color:var(--ink)]" />
    </span>
  );
}

function DotMark() {
  return <span className="mt-[0.38em] inline-block h-[0.45rem] w-[0.45rem] shrink-0 rounded-full bg-black/40" />;
}
