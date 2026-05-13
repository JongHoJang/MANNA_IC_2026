import type { FormEvent } from 'react';
import { Notice } from '@/components/ui/Notice';

export function HomeLogin({
  name,
  phone,
  message,
  onNameChange,
  onPhoneChange,
  onSubmit,
}: {
  name: string;
  phone: string;
  message: string | null;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="mx-auto flex h-[100dvh] w-full max-w-[460px] items-center px-4 py-8">
      <section className="paper-border relative w-full rotate-[-0.8deg] rounded-[22px] border-[2px] border-[color:var(--ink)] bg-[linear-gradient(180deg,rgba(238,202,126,0.98),rgba(232,188,92,0.98))] px-5 py-6 shadow-[6px_8px_0_rgba(36,27,22,0.16)]">
        <div className="relative mb-8">
          <p className="font-display text-xs uppercase tracking-[0.35em] text-[color:var(--muted)]">manna IC 2026</p>
          <h1 className="mt-3 text-[2.1rem] font-semibold leading-[0.96] tracking-[-0.06em] text-[color:var(--ink)]">
            만나IC 2026 컨퍼런스
          </h1>
          <p className="mt-4 max-w-[18ch] text-sm leading-6 text-[color:var(--ink)]/78">
            강의 신청과 일정을
            <br />
            한곳에서 볼 수 있는 안내 페이지입니다.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[color:var(--ink)]">이름</label>
            <input
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="예: 김하늘"
              className="w-full border-0 border-b-2 border-[color:var(--ink)]/70 bg-transparent px-0 py-3 text-base outline-none transition placeholder:text-[color:var(--muted)]/55 focus:border-[color:var(--ink)]"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[color:var(--ink)]">핸드폰 번호</label>
            <input
              value={phone}
              onChange={(event) => onPhoneChange(event.target.value)}
              placeholder="010-1111-2222"
              className="w-full border-0 border-b-2 border-[color:var(--ink)]/70 bg-transparent px-0 py-3 text-base outline-none transition placeholder:text-[color:var(--muted)]/55 focus:border-[color:var(--ink)]"
            />
          </div>
          <button
            type="submit"
            className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-[2px] border-[2px] border-[color:var(--ink)] bg-[color:var(--ink)] px-4 text-sm font-semibold text-[color:var(--paper)] shadow-[4px_4px_0_rgba(36,27,22,0.16)] transition hover:translate-y-[1px] hover:shadow-[3px_3px_0_rgba(36,27,22,0.16)]"
          >
            <span>로그인</span>
            <span aria-hidden="true">→</span>
          </button>
        </form>

        {message ? <Notice className="mt-4">{message}</Notice> : null}

        <p className="mt-5 text-center text-xs font-medium text-[color:var(--muted)]">
          Need help? <span className="underline decoration-[color:var(--ink)]/45 underline-offset-2">Contact Support</span>
        </p>
      </section>
    </main>
  );
}
