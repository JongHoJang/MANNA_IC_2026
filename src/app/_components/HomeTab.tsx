function MiniInfo({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--line)] bg-white px-4 py-4">
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">{title}</p>
      <p className="mt-2 text-sm font-semibold leading-6">{value}</p>
    </div>
  );
}

export function HomeTab() {
  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[28px] border border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(238,202,126,0.64),rgba(255,250,240,0.98))] p-5 paper-border">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-display text-xs uppercase tracking-[0.35em] text-[color:var(--ink)]/70">manna ic</p>
            <h2 className="mt-3 text-[3rem] font-semibold leading-[0.88] tracking-[-0.07em] text-[color:var(--ink)] sm:text-[3.35rem]">
              만나IC
              <br />
              2026
              <br />
              컨퍼런스
            </h2>
            <p className="mt-4 max-w-[22rem] text-sm leading-6 text-[color:var(--ink)]/80">
              내일의 소망으로 향하는 오늘의 교회 이야기
            </p>
          </div>
          <div className="shrink-0 rounded-[18px] border border-[color:var(--ink)]/20 bg-[color:var(--paper)] px-3 py-3 text-center shadow-[0_10px_20px_rgba(36,27,22,0.08)]">
            <div className="grid grid-cols-5 gap-0.5">
              {Array.from({ length: 25 }).map((_, index) => (
                <span
                  key={index}
                  className={['h-1.5 w-1.5', index % 2 === 0 ? 'bg-[color:var(--ink)]' : 'bg-transparent'].join(' ')}
                />
              ))}
            </div>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ink)]/70">
              포스터 QR
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] border border-[color:var(--ink)]/14 bg-[color:var(--paper)] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">일시</p>
            <p className="mt-2 text-base font-semibold text-[color:var(--ink)]">2026.06.23 - 25</p>
          </div>
          <div className="rounded-[22px] border border-[color:var(--ink)]/14 bg-[color:var(--paper)] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">장소</p>
            <p className="mt-2 text-base font-semibold text-[color:var(--ink)]">만나교회</p>
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-dashed border-[color:var(--ink)]/18 bg-white/35 p-4">
          <p className="text-sm font-medium text-[color:var(--ink)]">
            참가신청 <span className="font-semibold">5월 중순 오픈 예정</span>
          </p>
          <p className="mt-2 text-xs text-[color:var(--muted)]">선착순 마감</p>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <MiniInfo title="행사명" value="만나IC 2026 컨퍼런스" />
        <MiniInfo title="부제목" value="내일의 소망으로 향하는 오늘의 교회 이야기" />
      </div>
    </div>
  );
}
