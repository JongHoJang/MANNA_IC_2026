import type { ReactNode } from 'react';
import type { DayKey } from '@/types';

type DayRegistrationMetric = {
  day: DayKey;
  label: string;
  count: number;
};

type PositionMetric = {
  label: string;
  count: number;
};

type PopularLectureMetric = {
  id: string;
  title: string;
  dayLabel: string;
  count: number;
};

type DayLectureGroup = {
  day: DayKey;
  dayLabel: string;
  items: PopularLectureMetric[];
};

function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[10px] border border-[#d9ccb6] bg-[#fffdfa] px-6 py-5">
      <div className="border-b border-[#eee7da] pb-4">
        <h2 className="text-[1rem] font-semibold tracking-[-0.03em] text-[#232425]">{title}</h2>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

export function AdminOverviewMetrics({
  totalParticipants,
  completedParticipants,
  incompleteParticipants,
  completionRate,
  dayRegistrationCounts,
  positionTop5,
  popularLecturesByDay,
}: {
  totalParticipants: number;
  completedParticipants: number;
  incompleteParticipants: number;
  completionRate: number;
  dayRegistrationCounts: DayRegistrationMetric[];
  positionTop5: PositionMetric[];
  popularLecturesByDay: DayLectureGroup[];
}) {
  const donutAngle = `${Math.max(0, Math.min(completionRate, 100)) * 3.6}deg`;
  const maxPositionCount = Math.max(...positionTop5.map((item) => item.count), 1);
  const maxLectureCount = Math.max(
    ...popularLecturesByDay.flatMap((group) => group.items.map((item) => item.count)),
    1,
  );

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[2.1fr_0.9fr]">
        <section className="rounded-[10px] border border-[#d9ccb6] bg-[#fffdfa] px-6 py-7">
          <div className="flex flex-col items-center justify-center gap-5">
            <div className="text-center">
              <h2 className="text-[1.85rem] font-semibold tracking-[-0.05em] text-[#232425]">선택세션 완료율</h2>
            </div>
            <div
              className="relative flex h-[280px] w-[280px] items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#8a6d00 0deg ${donutAngle}, #e9e4d8 ${donutAngle} 360deg)`,
              }}
            >
              <div className="flex h-[196px] w-[196px] flex-col items-center justify-center rounded-full bg-[#fffdfa] text-center shadow-[inset_0_0_0_1px_rgba(217,204,182,0.55)]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8a6d00]">완료 비율</p>
                <p className="mt-2 text-[3.2rem] font-semibold leading-none tracking-[-0.08em] text-[#232425]">{completionRate}%</p>
              </div>
            </div>

            <div className="grid w-full max-w-[640px] gap-3 sm:grid-cols-3">
              <div className="rounded-[10px] border border-[#e5dcc8] bg-[#fbf8f1] px-5 py-4 text-center">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#70685b]">전체 참석자</p>
                <p className="mt-2 text-[2rem] font-semibold leading-none tracking-[-0.05em] text-[#232425]">{totalParticipants.toLocaleString()}명</p>
              </div>
              <div className="rounded-[10px] border border-[#e5dcc8] bg-[#fbf8f1] px-5 py-4 text-center">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8a6d00]">완료</p>
                <p className="mt-2 text-[2rem] font-semibold leading-none tracking-[-0.05em] text-[#232425]">{completedParticipants.toLocaleString()}명</p>
              </div>
              <div className="rounded-[10px] border border-[#e5dcc8] bg-[#fbf8f1] px-5 py-4 text-center">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#70685b]">미완료</p>
                <p className="mt-2 text-[2rem] font-semibold leading-none tracking-[-0.05em] text-[#232425]">{incompleteParticipants.toLocaleString()}명</p>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <Panel title="Day별 신청 인원 수">
            <div className="grid gap-2 sm:grid-cols-3">
              {dayRegistrationCounts.map((item, index) => (
                <div
                  key={`card-${item.day}`}
                  className="rounded-[8px] border border-[#e9dfcc] bg-[#fbf8f1] px-3 py-4 text-center"
                >
                  <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#6f6258]">{item.label}</p>
                  <p
                    className={[
                      'mt-2 text-[1.55rem] font-semibold leading-none tracking-[-0.05em]',
                      index === 2 ? 'text-[#8a6d00]' : 'text-[#232425]',
                    ].join(' ')}
                  >
                    {item.count}명
                  </p>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="직분 Top5">
            <div className="space-y-4">
              {positionTop5.map((position, index) => (
                <div key={position.label} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-[14px]">
                    <p className="font-medium text-[#4f4b45]">{position.label}</p>
                    <p className="font-medium text-[#6f6258]">{position.count}명</p>
                  </div>
                  <div className="h-2 rounded-full bg-[#efe9de]">
                    <div
                      className={index === 0 ? 'h-full rounded-full bg-[#8a6d00]' : 'h-full rounded-full bg-[#b4a47b]'}
                      style={{ width: `${Math.max((position.count / maxPositionCount) * 85, position.count > 0 ? 14 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <Panel title="Day별 인기 선택세션 Top3">
          <div className="grid gap-4 xl:grid-cols-3">
            {popularLecturesByDay.map((group) => {
              return (
                <section key={group.day} className="rounded-[8px] border border-[#ece3d1] bg-[#fdfbf6] px-4 py-4">
                  <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#eee7da] pb-3">
                    <h3 className="text-[14px] font-semibold tracking-[-0.03em] text-[#232425]">{group.day}</h3>
                  </div>

                  <div className="space-y-3">
                    {group.items.map((lecture, index) => (
                      <div key={lecture.id} className="rounded-[8px] bg-[#fbf8f1] px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a6d00]">
                              Top {index + 1}
                            </p>
                            <p className="mt-1 text-[14px] font-medium leading-5 text-[#232425]">{lecture.title}</p>
                          </div>
                          <p className="shrink-0 text-[15px] font-semibold text-[#232425]">{lecture.count}명</p>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-[#ece7dc]">
                          <div
                            className={index === 0 ? 'h-full rounded-full bg-[#8a6d00]' : index === 1 ? 'h-full rounded-full bg-[#b4a47b]' : 'h-full rounded-full bg-[#d4d9df]'}
                            style={{ width: `${Math.max((lecture.count / maxLectureCount) * 90, lecture.count > 0 ? 16 : 0)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
      </Panel>
    </section>
  );
}
