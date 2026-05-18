'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import type { Application, DayKey, Lecture, TimetableDay, TimeSlot } from '@/types';
import { formatLectureLocation, normalizePlaceLabel } from '@/utils/lectures';
import { DAY_LABELS, DAY_ORDER } from '@/utils/tickets';
import { isBreakSession, isTimeInsideRange } from './home-helpers';
import { PersonMark, PinMark, PinMiniMark } from './home-marks';
import { ModalPortal } from './ModalPortal';
import { RoughBorder } from './RoughBorder';

const DAY_TICKET_LABELS: Record<DayKey, string> = {
  Day1: '(6/23 화)',
  Day2: '(6/24 수)',
  Day3: '(6/25 목)',
};

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
  const targetRowIndex = getTargetRowIndex(activeDay.rows, currentTime);
  const currentRowRef = useRef<HTMLElement | null>(null);
  const [purchaseNoticeDay, setPurchaseNoticeDay] = useState<DayKey | null>(null);

  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      currentRowRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeDay.day, targetRowIndex]);

  return (
    <div className="space-y-5">
      <section className="space-y-4 px-1 pt-1">
        <h2 className="max-w-[15ch] text-[2rem] font-semibold leading-[1.06] tracking-[-0.05em] text-[color:var(--ink)] sm:text-[2.15rem]">
          만나 IC 2026 시간표를
          <br />
          확인해보세요.
        </h2>
      </section>

      <div className="grid grid-cols-3 gap-3">
        {DAY_ORDER.map((day) => {
          const purchased = purchasedDays.includes(day);
          const isActive = selectedDay === day;

          return (
            <button
              key={day}
              type="button"
              onClick={() => {
                if (!purchased) {
                  setPurchaseNoticeDay(day);
                  return;
                }

                onSelectDay(day);
              }}
              className={[
                'h-14 rounded-[2px] border-2 px-2 py-2 text-sm font-semibold leading-[1.05] transition',
                isActive
                  ? 'border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)]'
                  : purchased
                    ? 'border-[color:var(--line)] bg-[color:var(--paper)] text-[color:var(--ink)]'
                    : 'border-dashed border-[color:var(--line)] bg-white/60 text-[color:var(--muted)]/40',
              ].join(' ')}
            >
              <span className="block text-[16px]">{DAY_LABELS[day]}</span>
              <span className="mt-1 block text-[13px] font-medium tracking-[0.01em] opacity-75">{DAY_TICKET_LABELS[day]}</span>
            </button>
          );
        })}
      </div>

      <section className="px-1 pt-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[1rem] font-black leading-none tracking-[-0.05em] text-[color:var(--ink)] sm:text-[1.1rem]">
            {activeDay.title.split(' ')[0]}
          </p>
          <p className="text-sm font-semibold text-[color:var(--ink)]/82">@{activeDay.date}</p>
        </div>
        <h3 className="mt-2 text-[1.9rem] font-black leading-[0.92] tracking-[-0.075em] text-[color:var(--ink)] sm:text-[2.2rem]">
          {activeDay.title.split(' ').slice(1).join(' ')}
        </h3>
        <div className="mt-4 h-px w-full bg-[rgba(36,27,22,0.82)]" />
      </section>

      <section className="space-y-4">
        <div className="space-y-3">
          {activeDay.rows.map((row, index) => {
            const isCurrent = index === targetRowIndex;
            const isBreak = isBreakSession(row.label, row.title);
            const titleText = row.title.trim();
            const labelText = row.label.trim();
            const displayLabelText = formatTimetableLabel(labelText);
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
                    'relative px-4 py-4 transition',
                    isCurrent
                      ? 'bg-transparent'
                      : 'opacity-55',
                  ].join(' ')}
                >
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

                  <div className="mt-3 grid grid-cols-[72px_1fr_72px] items-center gap-3">
                    <div className={['text-sm font-semibold', isCurrent ? 'text-[color:var(--ink)]' : 'text-[color:var(--ink)]/50'].join(' ')}>
                      {row.time}
                    </div>
                    <div className="min-w-0 text-center">
                      <p
                        className={[
                          'text-[13px] font-medium tracking-[0.01em]',
                          isCurrent ? 'text-[color:var(--ink)]/78' : 'text-[color:var(--ink)]/62',
                        ].join(' ')}
                      >
                        {displayLabelText}
                      </p>
                    </div>
                    <div />
                  </div>
                </article>
              );
            }

            return (
              <article
                ref={isCurrent ? currentRowRef : null}
                key={`${activeDay.day}-${row.time}-${index}`}
                className={[
                  'relative grid grid-cols-[72px_1fr] gap-3 overflow-hidden rounded-[2px] bg-[color:var(--paper)] px-4 py-4 transition',
                  isCurrent
                    ? 'bg-[color:var(--page-bg)] shadow-none'
                    : 'bg-[rgba(238,202,126,0.28)] text-[color:var(--ink)] shadow-[3px_3px_0_rgba(36,27,22,0.14)]',
                ].join(' ')}
              >
                {!isCurrent ? <RoughBorder stroke="rgba(36,27,22,0.86)" strokeWidth={1.8} roughness={1.15} bowing={1.2} /> : null}
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
                          'text-[13px] font-medium uppercase tracking-[0.01em]',
                          isCurrent ? 'text-[color:var(--muted)]/78' : 'text-[color:var(--muted)]/74',
                        ].join(' ')}
                      >
                        {displayLabelText}
                      </p>
                      {titleText && !selectedSlot ? (
                        <p
                          className={[
                            'whitespace-pre-line text-[20px] font-bold leading-[1.12] tracking-tight',
                            isCurrent ? 'text-[color:var(--ink)]/74' : 'text-[color:var(--ink)]',
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
                        <p className="text-xs font-black uppercase tracking-[0.01em] text-[#8a6800]">내가 선택한 세션</p>
                        {selectedApplication ? (
                          <>
                            <p className="mt-1 text-[16px] font-semibold leading-[1.35] tracking-tight text-[color:var(--ink)]">
                              {selectedApplication.lecture.title}
                            </p>
                            <div className="mt-1 space-y-1.5 text-[14px] font-medium text-[color:var(--ink)]/72">
                              <p className="flex min-w-0 items-start gap-1.5">
                                <PersonMark />
                                <span className="min-w-0">
                                  {selectedApplication.lecture.speaker}
                                  {selectedApplication.lecture.position && selectedApplication.lecture.position !== '비었음'
                                    ? ` · ${selectedApplication.lecture.position}`
                                    : ''}
                                </span>
                              </p>
                              <p className="inline-flex items-start gap-1.5">
                                <PinMark />
                                <span>{formatLectureLocation(selectedApplication.lecture, lectureApplicationCountMap[selectedApplication.lecture.id] ?? 0)}</span>
                              </p>
                            </div>
                          </>
                        ) : (
                          <p className="mt-1 text-sm font-semibold text-[color:var(--ink)]/62">세션을 선택해주세요.</p>
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
                          <span>{selectedApplication ? '변경하러가기 >' : '세션 선택하러 가기 >'}</span>
                        </button>
                      </div>
                    ) : null}
                    <div className="space-y-1.5">
                      {formatSpeakerLabel(row.speaker, row.position) ? (
                        <p
                          className={[
                            'flex min-w-0 items-start gap-1.5 text-[14px] font-medium tracking-normal',
                            isCurrent ? 'text-[color:var(--ink)]/56' : 'text-[color:var(--ink)]/76',
                          ].join(' ')}
                        >
                          <PersonMark />
                          <span className="min-w-0 whitespace-normal break-keep leading-[1.35]">
                            {formatSpeakerLabel(row.speaker, row.position)}
                          </span>
                        </p>
                      ) : null}
                      {selectedSlot ? null : (
                        <p
                          className={[
                            'inline-flex items-start gap-1.5 text-[14px] font-medium tracking-normal',
                            isCurrent ? 'text-[color:var(--ink)]/56' : 'text-[color:var(--ink)]/76',
                          ].join(' ')}
                        >
                          <PinMiniMark />
                          <span>{normalizePlaceLabel(row.place)}</span>
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
                구매한 날짜만 세션을 신청하거나 변경할 수 있습니다.
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

function formatSpeakerLabel(speaker: string | null | undefined, position?: string | null) {
  const normalizedSpeaker = speaker?.trim();
  const normalizedPosition = position?.trim();

  if (!normalizedSpeaker || normalizedSpeaker === '비었음') {
    return '';
  }

  if (!normalizedPosition || normalizedPosition === '비었음') {
    return normalizedSpeaker;
  }

  return `${normalizedSpeaker} · ${normalizedPosition}`;
}

function formatTimetableLabel(label: string) {
  const normalizedLabel = label.trim();

  if (normalizedLabel === '선택세션1') {
    return '첫번째 선택세션';
  }

  if (normalizedLabel === '선택세션2') {
    return '두번째 선택세션';
  }

  return label;
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

function getTargetRowIndex(rows: TimetableDay['rows'], currentTime: string) {
  const currentMinutes = toMinutes(currentTime);

  if (currentMinutes < 0) {
    return 0;
  }

  const matchingIndex = rows.findIndex((row) => isTimeInsideRange(currentTime, row.time));

  if (matchingIndex >= 0) {
    return matchingIndex;
  }

  const futureIndex = rows.findIndex((row) => {
    const [start] = row.time.split(' - ');
    return toMinutes(start) >= currentMinutes;
  });

  if (futureIndex >= 0) {
    return futureIndex;
  }

  return Math.max(rows.length - 1, 0);
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map((part) => Number.parseInt(part, 10));

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return -1;
  }

  return hours * 60 + minutes;
}
