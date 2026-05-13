import Link from 'next/link';
import { lectures } from '@/mocks';
import type { Application, DayKey, Participant } from '@/types';
import { DAY_LABELS, DAY_ORDER, getPurchaseSummary } from '@/utils/tickets';
import { decorateLectures } from '@/utils/lectures';
import {
  getApplicationCountByLecture,
  getApplicationsByDayForParticipant,
  getParticipantApplicationNames,
  getParticipantApplications,
} from '@/utils/applications';
import { Notice } from '@/components/ui/Notice';

const decoratedLectures = decorateLectures(lectures);

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--paper)] px-4 py-4">
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full border px-3 py-2 text-xs font-medium transition',
        active
          ? 'border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)]'
          : 'border-[color:var(--line)] bg-white text-[color:var(--muted)]',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export function AdminDashboard({
  applications,
  attendeeParticipants,
  submittedParticipants,
  unsubmittedParticipants,
  attendeeApplicationTotal,
  dayFilter,
  message,
  onDayFilterChange,
  onLogout,
}: {
  applications: Application[];
  attendeeParticipants: Participant[];
  submittedParticipants: Participant[];
  unsubmittedParticipants: Participant[];
  attendeeApplicationTotal: number;
  dayFilter: DayKey | 'all';
  message: string | null;
  onDayFilterChange: (day: DayKey | 'all') => void;
  onLogout: () => void;
}) {
  const lectureCountMap = getApplicationCountByLecture(applications);
  const filteredLectures =
    dayFilter === 'all' ? decoratedLectures : decoratedLectures.filter((lecture) => lecture.day === dayFilter);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-5 lg:px-6 lg:py-8">
      <section className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--panel)] shadow-frame">
        <div className="flex flex-col gap-4 border-b border-[color:var(--line)] px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.35em] text-[color:var(--muted)]">manna IC admin</p>
            <h1 className="mt-2 text-3xl font-semibold">운영 대시보드</h1>
            <p className="mt-2 text-sm text-[color:var(--muted)]">신청 현황, 미신청자, 날짜별 인원수를 한 번에 확인합니다.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-[color:var(--line)] px-3 py-2 text-xs font-medium text-[color:var(--muted)]"
            >
              로그아웃
            </button>
            <Link href="/" className="rounded-full bg-[color:var(--ink)] px-3 py-2 text-xs font-medium text-[color:var(--paper)]">
              사용자 화면
            </Link>
          </div>
        </div>

        <div className="space-y-6 px-5 py-5">
          {message ? <Notice>{message}</Notice> : null}

          <div className="grid gap-3 md:grid-cols-4">
            <Metric label="전체 참가자" value={attendeeParticipants.length} />
            <Metric label="신청 완료" value={submittedParticipants.length} />
            <Metric label="미신청자" value={unsubmittedParticipants.length} />
            <Metric label="전체 신청 수" value={attendeeApplicationTotal} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <section className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--paper)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">강의별 신청 현황</h2>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">날짜 또는 전체 기준으로 강의 신청 인원을 확인합니다.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <FilterPill active={dayFilter === 'all'} onClick={() => onDayFilterChange('all')}>
                    전체
                  </FilterPill>
                  {DAY_ORDER.map((day) => (
                    <FilterPill key={day} active={dayFilter === day} onClick={() => onDayFilterChange(day)}>
                      {DAY_LABELS[day]}
                    </FilterPill>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {filteredLectures.map((lecture) => {
                  const names = getParticipantApplicationNames(applications, lecture);
                  const count = lectureCountMap[lecture.id] ?? 0;

                  return (
                    <article key={lecture.id} className="rounded-[22px] border border-[color:var(--line)] bg-white px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                            {DAY_LABELS[lecture.day]} · {lecture.timeSlot}
                          </p>
                          <h3 className="mt-1 text-base font-semibold">{lecture.title}</h3>
                          <p className="mt-1 text-sm text-[color:var(--muted)]">
                            {lecture.speaker} · {lecture.location}
                          </p>
                        </div>
                        <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold">
                          {count}명
                        </span>
                      </div>

                      <div className="mt-3 text-sm text-[color:var(--muted)]">
                        {names.length === 0 ? '아직 신청자가 없습니다.' : names.join(' · ')}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--paper)] p-4">
                <h2 className="text-lg font-semibold">미신청자</h2>
                <p className="mt-1 text-xs text-[color:var(--muted)]">현재 신청이 없는 참가자입니다.</p>
                <div className="mt-4 space-y-2">
                  {unsubmittedParticipants.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[color:var(--line)] bg-white/55 px-4 py-3 text-sm text-[color:var(--muted)]">
                      모두 신청을 완료했습니다.
                    </div>
                  ) : (
                    unsubmittedParticipants.map((participant) => (
                      <div key={participant.id} className="rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <p className="text-xs text-[color:var(--muted)]">{participant.phone}</p>
                          </div>
                          <span className="rounded-full bg-[color:var(--accent-soft)] px-2.5 py-1 text-xs font-medium">
                            {getPurchaseSummary(participant.ticketText)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--paper)] p-4">
                <h2 className="text-lg font-semibold">참가자별 상태</h2>
                <div className="mt-4 space-y-3">
                  {attendeeParticipants.map((participant) => {
                    const apps = getParticipantApplications(applications, participant.id);
                    const byDay = getApplicationsByDayForParticipant(applications, participant.id);

                    return (
                      <article key={participant.id} className="rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <p className="text-xs text-[color:var(--muted)]">
                              {participant.phone} · {getPurchaseSummary(participant.ticketText)}
                            </p>
                          </div>
                          <span className="rounded-full bg-[color:var(--accent-soft)] px-2.5 py-1 text-xs font-semibold">
                            {apps.length}개 신청
                          </span>
                        </div>

                        <div className="mt-3 space-y-1 text-xs text-[color:var(--muted)]">
                          {DAY_ORDER.map((day) => (
                            <p key={day}>
                              {DAY_LABELS[day]}: {byDay[day].length > 0 ? `${byDay[day].length}개 신청` : '미신청'}
                            </p>
                          ))}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
