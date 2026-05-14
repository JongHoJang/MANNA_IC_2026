'use client';

import { useEffect, useRef, useState } from 'react';
import type { Application, DayKey, Lecture, TimetableDay, TimeSlot } from '@/types';
import { formatLectureLocation } from '@/utils/lectures';
import { DAY_LABELS } from '@/utils/tickets';
import { isBreakSession, isTimeInsideRange } from './home-helpers';
import { PersonMark, PinMiniMark } from './home-marks';
import { ModalPortal } from './ModalPortal';

export function TimetableTab({
  activeDay,
  timetableDays,
  selectedDay,
  currentTime,
  timetableApplications,
  purchasedDays,
  lectureApplicationCountMap,
  onSelectDay,
  onGoToMyLectures,
}: {
  activeDay: TimetableDay;
  timetableDays: TimetableDay[];
  selectedDay: DayKey;
  currentTime: string;
  timetableApplications: Array<Application & { lecture: Lecture }>;
  purchasedDays: DayKey[];
  lectureApplicationCountMap: Record<string, number>;
  onSelectDay: (day: DayKey) => void;
  onGoToMyLectures: (day: DayKey, slot: TimeSlot) => void;
}) {
  const currentRowIndex = activeDay.rows.findIndex((row) => isTimeInsideRange(currentTime, row.time));
  const currentRowRef = useRef<HTMLElement | null>(null);
  const [purchaseNoticeDay, setPurchaseNoticeDay] = useState<DayKey | null>(null);

  useEffect(() => {
    if (currentRowIndex < 0) {
      return;
    }

    currentRowRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [activeDay.day, currentRowIndex]);

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2px] border-[2px] border-[color:var(--ink)] bg-[#f3efe8] px-4 py-5 shadow-[4px_4px_0_rgba(36,27,22,0.18)]">
        <div className="relative">
          <h2 className="max-w-[10ch] text-[2.35rem] font-semibold leading-[0.92] tracking-[-0.07em] text-[color:var(--ink)]">
            <span className="block text-[1.95rem] leading-[0.96]">{activeDay.title.split(' ')[0]}</span>
            <span className="block">{activeDay.title.split(' ').slice(1).join(' ')}</span>
          </h2>
          <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--ink)]/80">
            <span>@{activeDay.date}</span>
          </p>
        </div>
      </section>

      <div className="border-b border-[rgba(36,27,22,0.18)] pb-2">
        <div className="flex items-end gap-8">
          {timetableDays.map((day) => {
            const isActive = selectedDay === day.day;
            const dayNumber = day.day.replace('Day', '').padStart(2, '0');

            return (
              <button
                key={day.day}
                type="button"
                onClick={() => onSelectDay(day.day)}
                className={[
                  'relative pb-2 pt-4 text-[1.02rem] font-semibold tracking-[0.18em] transition',
                  isActive ? 'text-[color:var(--ink)]' : 'text-[rgba(36,27,22,0.34)]',
                ].join(' ')}
              >
                <span className="block uppercase">DAY {dayNumber}</span>
                {isActive ? <span className="absolute inset-x-0 -bottom-[9px] h-[2px] bg-[color:var(--ink)]" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      <section className="space-y-4">
        <div className="space-y-3">
          {activeDay.rows.map((row, index) => {
            const isCurrent = index === currentRowIndex;
            const isBreak = isBreakSession(row.label, row.title);
            const titleText = row.title.trim();
            const labelText = row.label.trim();
            const selectedSlot = resolveSelectionSlot(labelText, titleText, row.place);
            const selectedApplication = selectedSlot
              ? timetableApplications.find((application) => application.timeSlot === selectedSlot)
              : undefined;

            if (isBreak) {
              return (
                <article
                  ref={isCurrent ? currentRowRef : null}
                  key={`${activeDay.day}-${row.time}-${index}`}
                  className={[
                    'relative rounded-[2px] px-4 py-4 transition',
                    isCurrent
                      ? 'bg-[rgba(238,202,126,0.22)]'
                      : 'opacity-55',
                  ].join(' ')}
                >
                  {isCurrent ? (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-[2px]"
                      style={{
                        backgroundImage: [
                          'repeating-linear-gradient(90deg, rgba(255,255,255,0.96) 0 14px, transparent 14px 22px)',
                          'repeating-linear-gradient(180deg, rgba(255,255,255,0.96) 0 14px, transparent 14px 22px)',
                          'repeating-linear-gradient(90deg, rgba(255,255,255,0.96) 0 14px, transparent 14px 22px)',
                          'repeating-linear-gradient(180deg, rgba(255,255,255,0.96) 0 14px, transparent 14px 22px)',
                        ].join(', '),
                        backgroundPosition: 'top left, top right, bottom left, top left',
                        backgroundSize: '100% 2px, 2px 100%, 100% 2px, 2px 100%',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                  ) : null}
                  <div className="flex items-center gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className={['h-px flex-1', isCurrent ? 'bg-[rgba(36,27,22,0.24)]' : 'bg-[rgba(36,27,22,0.14)]'].join(' ')} />
                      <p
                        className={[
                          'shrink-0 text-[10px] font-semibold uppercase tracking-[0.28em]',
                          isCurrent ? 'text-[color:var(--ink)]' : 'text-[color:var(--ink)]/45',
                        ].join(' ')}
                      >
                        BREAK TIME
                      </p>
                      <div className={['h-px flex-1', isCurrent ? 'bg-[rgba(36,27,22,0.24)]' : 'bg-[rgba(36,27,22,0.14)]'].join(' ')} />
                    </div>
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--ink)]/18 bg-[color:var(--ink)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[color:var(--paper)]">
                        <span className="h-2 w-2 rounded-full bg-[color:var(--paper)]" />
                        현재 휴식
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 grid grid-cols-[72px_1fr_auto] items-center gap-3">
                    <div className={['text-sm font-semibold', isCurrent ? 'text-[color:var(--ink)]' : 'text-[color:var(--ink)]/50'].join(' ')}>
                      {row.time}
                    </div>
                    <div className="min-w-0 text-center">
                      <p
                        className={[
                          'text-[11px] font-medium tracking-[0.08em]',
                          isCurrent ? 'text-[color:var(--ink)]' : 'text-[color:var(--ink)]/68',
                        ].join(' ')}
                      >
                        {labelText}
                        {titleText ? <span className="mx-1">·</span> : null}
                        {titleText ? <span>{titleText}</span> : null}
                      </p>
                    </div>
                    <p
                      className={[
                        'inline-flex items-center justify-end gap-1.5 text-[11px] font-medium tracking-[0.08em]',
                        isCurrent ? 'text-[color:var(--ink)]/80' : 'text-[color:var(--ink)]/58',
                      ].join(' ')}
                    >
                      <PinMiniMark />
                      <span>{row.place}</span>
                    </p>
                  </div>
                </article>
              );
            }

            return (
              <article
                ref={isCurrent ? currentRowRef : null}
                key={`${activeDay.day}-${row.time}-${index}`}
                className={[
                  'relative grid grid-cols-[72px_1fr] gap-3 overflow-hidden rounded-[2px] border-[2px] bg-[color:var(--paper)] px-4 py-4 transition',
                  isCurrent
                    ? 'border-[rgba(36,27,22,0.1)] bg-[color:var(--page-bg)] shadow-none'
                    : 'border-[color:var(--ink)] bg-[rgba(238,202,126,0.28)] text-[color:var(--ink)] shadow-[3px_3px_0_rgba(36,27,22,0.14)]',
                ].join(' ')}
              >
                {isCurrent ? (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-[2px]"
                    style={{
                      backgroundImage: [
                        'repeating-linear-gradient(90deg, rgba(36,27,22,0.92) 0 10px, transparent 10px 15px)',
                        'repeating-linear-gradient(180deg, rgba(36,27,22,0.92) 0 10px, transparent 10px 15px)',
                        'repeating-linear-gradient(90deg, rgba(36,27,22,0.92) 0 10px, transparent 10px 15px)',
                        'repeating-linear-gradient(180deg, rgba(36,27,22,0.92) 0 10px, transparent 10px 15px)',
                      ].join(', '),
                      backgroundPosition: 'top left, top right, bottom left, top left',
                      backgroundSize: '100% 2px, 2px 100%, 100% 2px, 2px 100%',
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                ) : null}
                <div className="flex items-start gap-2 pt-0.5 text-[1rem] font-semibold text-[color:var(--ink)]">
                  {isCurrent ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[color:var(--ink)]" /> : null}
                  <span>{row.time}</span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <p
                        className={[
                          'text-[11px] font-semibold uppercase tracking-[0.22em]',
                          isCurrent ? 'text-[color:var(--muted)]/58' : 'text-[color:var(--muted)]',
                        ].join(' ')}
                      >
                        {labelText}
                      </p>
                      {titleText && !selectedSlot ? (
                        <p
                          className={[
                            'whitespace-pre-line text-[1.22rem] font-semibold leading-[1.1] tracking-[-0.05em]',
                            isCurrent ? 'text-[color:var(--ink)]/62' : 'text-[color:var(--ink)]',
                          ].join(' ')}
                        >
                          {titleText}
                        </p>
                      ) : null}
                    </div>

                    {isCurrent ? (
                      <span className="shrink-0 rounded-full bg-[color:var(--ink)] px-3 py-2 text-[0.7rem] font-black uppercase tracking-[0.12em] text-[color:var(--paper)]">
                        진행 중
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {selectedSlot ? (
                      <div className="rounded-[2px] border border-[color:var(--ink)]/16 bg-white/55 px-3 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8a6800]">내가 선택한 강의</p>
                        {selectedApplication ? (
                          <>
                            <p className="mt-1 text-sm font-semibold leading-6 text-[color:var(--ink)]">
                              {selectedApplication.lecture.title}
                            </p>
                            <p className="mt-1 text-[11px] text-[color:var(--ink)]/62">
                              {selectedApplication.lecture.speaker}
                              {selectedApplication.lecture.position && selectedApplication.lecture.position !== '비었음'
                                ? ` · ${selectedApplication.lecture.position}`
                                : ''}
                              {' · '}
                              {formatLectureLocation(selectedApplication.lecture, lectureApplicationCountMap[selectedApplication.lecture.id] ?? 0)}
                            </p>
                          </>
                        ) : (
                          <p className="mt-1 text-sm font-semibold text-[color:var(--ink)]/62">강의를 선택해주세요.</p>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (!purchasedDays.includes(activeDay.day)) {
                              setPurchaseNoticeDay(activeDay.day);
                              return;
                            }

                            onGoToMyLectures(activeDay.day, selectedSlot);
                          }}
                          className="mt-3 inline-flex items-center text-sm font-semibold text-[color:var(--ink)] underline decoration-[color:var(--ink)]/35 underline-offset-[5px] transition hover:text-[color:var(--ink)]/72"
                        >
                          <span>{selectedApplication ? '변경하러가기 >' : '강의 선택하러 가기 >'}</span>
                        </button>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between gap-3">
                      {row.speaker !== '비었음' ? (
                        <p
                          className={[
                            'flex min-w-0 items-start gap-1.5 text-[11px] font-medium tracking-[0.08em]',
                            isCurrent ? 'text-[color:var(--ink)]/42' : 'text-[color:var(--ink)]/68',
                          ].join(' ')}
                        >
                          <PersonMark />
                          <span className="min-w-0 whitespace-normal break-keep leading-[1.35]">
                            {row.speaker}
                            {row.position && row.position !== '비었음' ? ` · ${row.position}` : ''}
                          </span>
                        </p>
                      ) : (
                        <span />
                      )}
                      {selectedSlot ? <span /> : (
                        <p
                          className={[
                            'inline-flex shrink-0 items-center justify-end gap-1.5 text-[11px] font-medium tracking-[0.08em]',
                            isCurrent ? 'text-[color:var(--ink)]/42' : 'text-[color:var(--ink)]/68',
                          ].join(' ')}
                        >
                          <PinMiniMark />
                          <span>{row.place}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {purchaseNoticeDay ? (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-4 pb-4 pt-10 backdrop-blur-[2px] sm:items-center">
            <div className="w-full max-w-[420px] rounded-[28px] border-[2px] border-[color:var(--ink)] bg-[color:var(--panel)] p-5 shadow-[6px_6px_0_rgba(36,27,22,0.2)]">
              <p className="font-display text-xs uppercase tracking-[0.35em] text-[color:var(--muted)]">티켓 안내</p>
              <h3 className="mt-3 text-xl font-semibold leading-tight">{DAY_LABELS[purchaseNoticeDay]} 티켓을 구매해주세요.</h3>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                구매한 날짜만 선택세션 강의를 신청하거나 변경할 수 있습니다.
              </p>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setPurchaseNoticeDay(null)}
                  className="w-full rounded-[2px] bg-[color:var(--ink)] px-4 py-3 text-sm font-semibold text-[color:var(--paper)]"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      ) : null}
    </div>
  );
}

function resolveSelectionSlot(label: string, title?: string, place?: string): TimeSlot | null {
  const normalizedLabel = label.trim();
  const normalizedTitle = title?.trim() ?? '';
  const normalizedPlace = place?.trim() ?? '';

  if (
    normalizedLabel === '선택세션1' ||
    normalizedLabel === '첫번째 선택세션' ||
    (normalizedLabel.includes('선택세션') && normalizedLabel.includes('1'))
  ) {
    return '1타임';
  }

  if (
    normalizedLabel === '선택세션2' ||
    normalizedLabel === '두번째 선택세션' ||
    (normalizedLabel.includes('선택세션') && normalizedLabel.includes('2'))
  ) {
    return '2타임';
  }

  if (normalizedLabel.includes('첫번째 선택세션')) {
    return '1타임';
  }

  if (normalizedLabel.includes('두번째 선택세션')) {
    return '2타임';
  }

  if (normalizedTitle === '참가신청 시 선택한 세션' || normalizedPlace === '각 선택세션 장소') {
    return normalizedLabel.includes('2') || normalizedLabel.includes('두번째') ? '2타임' : '1타임';
  }

  return null;
}
