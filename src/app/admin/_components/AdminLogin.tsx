import type { FormEvent } from 'react';
import Link from 'next/link';
import type { Participant } from '@/types';
import { Notice } from '@/components/ui/Notice';

export function AdminLogin({
  name,
  phone,
  message,
  adminParticipant,
  onNameChange,
  onPhoneChange,
  onFillSample,
  onSubmit,
}: {
  name: string;
  phone: string;
  message: string | null;
  adminParticipant?: Participant;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onFillSample: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[560px] items-center px-4 py-8">
      <section className="w-full rounded-[28px] border border-[color:var(--line)] bg-[color:var(--panel)] p-6 shadow-frame">
        <p className="font-display text-xs uppercase tracking-[0.35em] text-[color:var(--muted)]">manna IC</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">어드민 로그인</h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
          참가자 데이터와 신청 현황을 확인하는 운영 대시보드입니다. mock data 계정으로 먼저 접속하세요.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">이름</label>
            <input
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="운영자"
              className="w-full rounded-2xl border border-[color:var(--line)] bg-white/85 px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)]"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">휴대폰 번호</label>
            <input
              value={phone}
              onChange={(event) => onPhoneChange(event.target.value)}
              placeholder="010-0000-0000"
              className="w-full rounded-2xl border border-[color:var(--line)] bg-white/85 px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)]"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-2xl bg-[color:var(--ink)] px-4 py-3 text-sm font-semibold text-[color:var(--paper)] transition hover:bg-[#372922]"
          >
            어드민 로그인
          </button>
        </form>

        <div className="mt-5 rounded-2xl border border-dashed border-[color:var(--line)] bg-white/55 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--muted)]">샘플 계정</p>
          {adminParticipant ? (
            <button
              type="button"
              onClick={onFillSample}
              className="mt-3 block w-full rounded-xl bg-[color:var(--accent-soft)] px-3 py-2 text-left text-sm transition hover:opacity-90"
            >
              {adminParticipant.name} · {adminParticipant.phone}
            </button>
          ) : null}
        </div>

        {message ? <Notice className="mt-4">{message}</Notice> : null}
        <div className="mt-4 text-sm text-[color:var(--muted)]">
          사용자 화면은 <Link href="/" className="font-medium text-[color:var(--ink)] underline">/</Link>에서 확인할 수
          있습니다.
        </div>
      </section>
    </main>
  );
}
