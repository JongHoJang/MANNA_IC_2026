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
    <main className="mx-auto flex h-[100dvh] w-full max-w-[460px] items-center bg-[color:var(--accent)] px-4 py-8">
      <section className="w-full space-y-5">
        <div className="px-2 text-center">
          <p className="font-display text-[0.85rem] font-semibold uppercase tracking-[0.28em] text-[color:var(--ink)]/58">
            manna-ic 2026
          </p>
          <h1 className="mt-3 text-[2.5rem] font-black leading-[1.04] tracking-[-0.07em] text-[color:var(--ink)]">
            만나IC 2026 컨퍼런스
          </h1>
        </div>

        <section className="overflow-hidden rounded-[2px] border-[2px] border-[color:var(--ink)] bg-[#f3efe8] shadow-[4px_4px_0_rgba(36,27,22,0.14)]">
          <div className="border-b border-[color:var(--ink)]/10 bg-[rgba(255,255,255,0.34)] px-5 py-5">
            <p className="text-[0.78rem] font-black uppercase tracking-[0.24em] text-[#8a6800]">Login</p>
            <p className="mt-2 text-[1.1rem] font-semibold leading-7 text-[color:var(--ink)]">
              티켓 구매 시 사용한 이름과
              <br />
              휴대폰 번호를 입력한 후 입장해 주세요.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5 px-5 py-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[color:var(--ink)]">이름</label>
              <input
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="예: 김만나"
                className="w-full rounded-[2px] border-[2px] border-[color:var(--ink)]/14 bg-white px-4 py-3 text-base text-[color:var(--ink)] outline-none transition placeholder:text-[color:var(--muted)]/55 focus:border-[color:var(--ink)]/42"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[color:var(--ink)]">휴대폰 번호</label>
              <input
                value={phone}
                onChange={(event) => onPhoneChange(event.target.value)}
                placeholder="01011112222 (- 없이 입력)"
                className="w-full rounded-[2px] border-[2px] border-[color:var(--ink)]/14 bg-white px-4 py-3 text-base text-[color:var(--ink)] outline-none transition placeholder:text-[color:var(--muted)]/55 focus:border-[color:var(--ink)]/42"
              />
            </div>

            <button
              type="submit"
              className="mt-1 flex h-14 w-full items-center justify-center gap-2 rounded-[2px] border-[2px] border-[color:var(--ink)] bg-[color:var(--ink)] px-4 text-sm font-semibold text-[color:var(--paper)] shadow-[4px_4px_0_rgba(36,27,22,0.16)] transition hover:translate-y-[1px] hover:shadow-[3px_3px_0_rgba(36,27,22,0.16)]"
            >
              <span>입장하기</span>
              <span aria-hidden="true">→</span>
            </button>
          </form>
        </section>

        {message ? <Notice>{message}</Notice> : null}
      </section>
    </main>
  );
}
