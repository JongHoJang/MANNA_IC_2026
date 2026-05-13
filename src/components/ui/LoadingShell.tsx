export function LoadingShell({
  message = '불러오는 중입니다.',
  outerClassName = 'h-[100dvh] max-w-[460px]',
}: {
  message?: string;
  outerClassName?: string;
}) {
  return (
    <main className={`mx-auto flex w-full items-center justify-center px-4 ${outerClassName}`}>
      <div className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--panel)] px-5 py-6 shadow-frame">
        <p className="font-display text-xs uppercase tracking-[0.35em] text-[color:var(--muted)]">manna IC</p>
        <p className="mt-3 text-lg font-semibold">{message}</p>
      </div>
    </main>
  );
}
