'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Application, DayKey, Lecture, Participant, TimeSlot } from '@/types';
import { DAY_LABELS, DAY_ORDER } from '@/utils/tickets';
import { formatLectureLocation } from '@/utils/lectures';
import { splitLectureHeading } from './home-helpers';
import { PencilMark, PersonMark, PinMark } from './home-marks';
import { ModalPortal } from './ModalPortal';

const sessionSlots = [
  { slot: '1타임', title: '첫번째 선택세션' },
  { slot: '2타임', title: '두번째 선택세션' },
] as const;

const DAY_TICKET_LABELS: Record<DayKey, string> = {
  Day1: 'Day1 (6/23 화)',
  Day2: 'Day2 (6/24 수)',
  Day3: 'Day3 (6/25 목)',
};

export function MyLecturesTab({
  activeDay,
  activeSlot,
  applications,
  purchasedDays,
  currentParticipant,
  lectures,
  lectureLookup,
  onSelectDay,
  onSelectSlot,
  onApplyLecture,
  lectureApplicationCountMap,
}: {
  activeDay: DayKey;
  activeSlot: TimeSlot;
  applications: Application[];
  purchasedDays: DayKey[];
  currentParticipant: Participant;
  lectures: Lecture[];
  lectureLookup: Map<string, Lecture>;
  onSelectDay: (day: DayKey) => void;
  onSelectSlot: (slot: TimeSlot) => void;
  onApplyLecture: (day: DayKey, timeSlot: TimeSlot, lectureId: string) => Promise<boolean>;
  lectureApplicationCountMap: Record<string, number>;
}) {
  const dayApplications = applications.filter(
    (application) => application.participantId === currentParticipant.id && application.day === activeDay,
  );
  const slotApplications = useMemo(() => {
    return new Map(dayApplications.map((application) => [application.timeSlot, application] as const));
  }, [dayApplications]);
  const selectedApplicationBySlot = slotApplications;
  const dayLectures = useMemo(() => lectures.filter((lecture) => lecture.day === activeDay), [activeDay, lectures]);
  const [expandedSlot, setExpandedSlot] = useState<TimeSlot | null>(null);
  const [pendingLectureBySlot, setPendingLectureBySlot] = useState<Partial<Record<TimeSlot, string>>>({});
  const [confirmTarget, setConfirmTarget] = useState<{ slot: TimeSlot; lectureId: string } | null>(null);
  const [purchaseNoticeDay, setPurchaseNoticeDay] = useState<DayKey | null>(null);
  const actionButtonRefs = useRef<Partial<Record<TimeSlot, HTMLButtonElement | null>>>({});
  const lectureItemRefs = useRef<Partial<Record<TimeSlot, Partial<Record<string, HTMLButtonElement | null>>>>>({});

  useEffect(() => {
    setExpandedSlot(null);
    setPendingLectureBySlot({});
    setConfirmTarget(null);
    setPurchaseNoticeDay(null);
  }, [activeDay]);

  useEffect(() => {
    if (!expandedSlot) {
      return;
    }

    const selectedApplication = selectedApplicationBySlot.get(expandedSlot);
    const selectedLectureId = selectedApplication?.lectureId;

    if (!selectedLectureId) {
      return;
    }

    window.requestAnimationFrame(() => {
      slowScrollElementIntoView(lectureItemRefs.current[expandedSlot]?.[selectedLectureId], 700);
    });
  }, [expandedSlot, selectedApplicationBySlot]);

  function closeConfirmModal() {
    setConfirmTarget(null);
  }

  async function commitPendingLecture(slot: TimeSlot, lectureId: string) {
    const success = await onApplyLecture(activeDay, slot, lectureId);

    if (success) {
      setExpandedSlot(null);
      setPendingLectureBySlot((current) => {
        const next = { ...current };
        delete next[slot];
        return next;
      });
    }

    closeConfirmModal();
  }

  function cancelSelection(slot: TimeSlot) {
    setPendingLectureBySlot((current) => {
      const next = { ...current };
      delete next[slot];
      return next;
    });
    setExpandedSlot(null);
  }

  function scrollActionButtonIntoView(slot: TimeSlot) {
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        slowScrollElementIntoView(actionButtonRefs.current[slot], 700);
      }, 80);
    });
  }

  const confirmLecture = confirmTarget ? lectureLookup.get(confirmTarget.lectureId) : undefined;
  const confirmApplication = confirmTarget
    ? dayApplications.find((application) => application.timeSlot === confirmTarget.slot)
    : undefined;
  const currentLecture = confirmApplication ? lectureLookup.get(confirmApplication.lectureId) : undefined;

  function getLectureSequenceLabel(lectureId: string) {
    const sequence = dayLectures.findIndex((lecture) => lecture.id === lectureId);
    return sequence >= 0 ? `선택세션 ${sequence + 1}.` : '';
  }
  const isConfirmingChange = Boolean(confirmApplication);

  return (
    <div className="space-y-5">
      <section className="space-y-4 px-1 pt-1">
        <h2 className="max-w-[15ch] text-[2rem] font-semibold leading-[1.06] tracking-[-0.05em] text-[color:var(--ink)] sm:text-[2.15rem]">
          선택세션 강의를
          <br />
          선택해주세요.
        </h2>

      </section>

      <div className="grid grid-cols-3 gap-3">
        {DAY_ORDER.map((day) => {
          const purchased = purchasedDays.includes(day);
          const isActive = activeDay === day;

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
              <span className="block">{DAY_LABELS[day]}</span>
              <span className="mt-1 block text-[11px] font-medium tracking-[-0.01em] opacity-75">{DAY_TICKET_LABELS[day]}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4">
        {sessionSlots.map(({ slot, title }) => {
          const application = slotApplications.get(slot);
          const pendingLectureId = pendingLectureBySlot[slot];
          const hasExistingApplication = Boolean(application);
          const hasEffectivePendingSelection = Boolean(pendingLectureId && pendingLectureId !== application?.lectureId);
          const displayedLecture = pendingLectureId
            ? lectureLookup.get(pendingLectureId)
            : application
              ? lectureLookup.get(application.lectureId)
              : undefined;
          const isActive = activeSlot === slot;
          const isExpanded = expandedSlot === slot;
          const actionLabel = !isExpanded
            ? hasExistingApplication
              ? '강의 변경하기'
              : '강의 선택하기'
            : hasEffectivePendingSelection
              ? hasExistingApplication
                ? '강의 변경하기'
                : '강의 결정하기'
              : '닫기';

          return (
            <section
              key={slot}
              className={[
                'overflow-hidden rounded-[2px] border-[2px] border-[color:var(--ink)] bg-[#f3efe8] transition',
                isActive ? 'shadow-[4px_4px_0_rgba(36,27,22,0.2)]' : 'shadow-[3px_3px_0_rgba(36,27,22,0.14)]',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-3 px-4 py-4">
                <button type="button" onClick={() => onSelectSlot(slot)} className="min-w-0 flex-1 text-left">
                  <div className="mb-4 text-xs font-medium text-[color:var(--muted)]">
                    <span>{title}</span>
                  </div>
                  {displayedLecture ? (
                    <div className="space-y-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                          {getLectureSequenceLabel(displayedLecture.id)}
                        </p>
                        <p className="mt-2 text-[1.18rem] font-semibold leading-[1.18] tracking-[-0.045em] text-[color:var(--ink)]">
                          {splitLectureHeading(displayedLecture.title).title}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[color:var(--muted)]">
                        <span className="inline-flex items-center gap-1.5">
                          <PersonMark />
                          <span>
                            {displayedLecture.speaker}
                            {displayedLecture.position && displayedLecture.position !== '비었음' ? ` · ${displayedLecture.position}` : ''}
                          </span>
                        </span>
                        <span className="text-[color:var(--muted)]">·</span>
                        <span className="inline-flex items-center gap-1.5">
                          <PinMark />
                          <span>{formatLectureLocation(displayedLecture, lectureApplicationCountMap[displayedLecture.id] ?? 0)}</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-[color:var(--muted)]">아직 강의가 선택되지 않았습니다.</p>
                  )}
                </button>
              </div>

              <div className="px-4 pb-4">
                  <button
                  ref={(node) => {
                    actionButtonRefs.current[slot] = node;
                  }}
                  type="button"
                  onClick={() => {
                    if (!isExpanded) {
                      if (application?.lectureId) {
                        setPendingLectureBySlot((current) => ({
                          ...current,
                          [slot]: application.lectureId,
                        }));
                      }
                      setExpandedSlot(slot);
                      return;
                    }

                    if (hasEffectivePendingSelection && pendingLectureId) {
                      setExpandedSlot(null);
                      setConfirmTarget({ slot, lectureId: pendingLectureId });
                      return;
                    }

                    cancelSelection(slot);
                  }}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-[2px] border-[2px] border-[color:var(--ink)] bg-transparent px-3 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-[rgba(36,27,22,0.03)]"
                >
                  <span>{actionLabel}</span>
                  <PencilMark />
                </button>
              </div>

              {isExpanded ? (
                <div className="border-t-2 border-[color:var(--ink)]/12 bg-[#fcfbf8] px-4 py-4">
                  <div className="space-y-2">
                    {dayLectures.map((item, index) => {
                      const itemPendingInSlot = pendingLectureId === item.id;
                      const itemApplication = dayApplications.find((value) => value.lectureId === item.id);
                      const itemIsSelectedElsewhere = itemApplication && itemApplication.timeSlot !== slot;
                      const itemHeading = splitLectureHeading(item.title);
                      const itemSessionLabel = `선택세션 ${index + 1}.`;
                      const itemDisabled = Boolean(itemIsSelectedElsewhere);

                      return (
                        <button
                          key={item.id}
                          ref={(node) => {
                            if (!lectureItemRefs.current[slot]) {
                              lectureItemRefs.current[slot] = {};
                            }

                            lectureItemRefs.current[slot]![item.id] = node;
                          }}
                          type="button"
                          onClick={() => {
                            if (itemDisabled) {
                              return;
                            }

                            setPendingLectureBySlot((current) => {
                              const next = { ...current };
                              const currentSelection = current[slot];
                              const nextSelection = currentSelection === item.id || application?.lectureId === item.id ? undefined : item.id;

                              if (nextSelection) {
                                next[slot] = nextSelection;
                              } else {
                                delete next[slot];
                              }

                              return next;
                            });
                            scrollActionButtonIntoView(slot);
                          }}
                          className={[
                            'flex w-full items-start justify-between gap-3 rounded-[16px] border px-3 py-3 text-left transition',
                            itemPendingInSlot
                              ? 'border-[color:var(--accent)] bg-[rgba(238,202,126,0.2)] shadow-[0_8px_22px_rgba(37,24,17,0.06)]'
                              : itemIsSelectedElsewhere
                                ? 'cursor-not-allowed border-[color:var(--line)] bg-white/55 opacity-45'
                                : 'border-[color:var(--line)] bg-white hover:bg-white',
                          ].join(' ')}
                          disabled={itemDisabled}
                        >
                          <div className="min-w-0">
                            {itemSessionLabel ? (
                              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                                {itemSessionLabel}
                              </p>
                            ) : null}
                            <h4 className="mt-1 text-sm font-semibold leading-snug text-[color:var(--ink)]">
                              {itemHeading.title}
                            </h4>
                            <p className="mt-1 text-xs text-[color:var(--muted)]">
                              {item.speaker}
                              {item.position && item.position !== '비었음' ? ` · ${item.position}` : ''}
                              {' · '}
                              {formatLectureLocation(item, lectureApplicationCountMap[item.id] ?? 0)}
                            </p>
                            {itemIsSelectedElsewhere ? (
                              <span className="mt-2 inline-flex rounded-full bg-[#e8e8e8] px-2.5 py-1 text-[11px] font-medium text-[color:var(--muted)]">
                                다른 타임 선택됨
                              </span>
                            ) : itemPendingInSlot ? (
                              <span className="mt-2 inline-flex rounded-full bg-[color:var(--accent-soft)] px-2.5 py-1 text-[11px] font-medium text-[color:var(--ink)]">
                                선택 예정
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      {confirmTarget ? (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-4 pb-4 pt-10 backdrop-blur-[2px] sm:items-center">
            <div className="w-full max-w-[420px] rounded-[28px] border-[2px] border-[color:var(--ink)] bg-[color:var(--panel)] p-5 shadow-[6px_6px_0_rgba(36,27,22,0.2)]">
            <p className="font-display text-xs uppercase tracking-[0.35em] text-[color:var(--muted)]">
              {isConfirmingChange ? '변경 확인' : '선택 확인'}
            </p>
            <h3 className="mt-3 text-xl font-semibold leading-tight">
              {isConfirmingChange ? '변경 전후를 확인해 주세요' : '이 강의를 신청하시겠어요?'}
            </h3>

            {isConfirmingChange ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-[color:var(--line)] bg-white px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">현재 선택</p>
                  {currentLecture ? (
                    <div className="mt-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                        {splitLectureHeading(currentLecture.title).label}
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-snug text-[color:var(--ink)]">
                        {splitLectureHeading(currentLecture.title).title}
                      </p>
                      <p className="mt-2 text-xs text-[color:var(--muted)]">
                        {currentLecture.speaker}
                        {currentLecture.position && currentLecture.position !== '비었음' ? ` · ${currentLecture.position}` : ''}
                        {' · '}
                        {formatLectureLocation(currentLecture, lectureApplicationCountMap[currentLecture.id] ?? 0)}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-[color:var(--muted)]">아직 선택된 강의가 없습니다.</p>
                  )}
                </div>

                <div className="rounded-[22px] border border-[color:var(--line)] bg-[#fffdf7] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">변경 후</p>
                  {confirmLecture ? (
                    <div className="mt-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                        {splitLectureHeading(confirmLecture.title).label}
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-snug text-[color:var(--ink)]">
                        {splitLectureHeading(confirmLecture.title).title}
                      </p>
                      <p className="mt-2 text-xs text-[color:var(--muted)]">
                        {confirmLecture.speaker}
                        {confirmLecture.position && confirmLecture.position !== '비었음' ? ` · ${confirmLecture.position}` : ''}
                        {' · '}
                        {formatLectureLocation(confirmLecture, lectureApplicationCountMap[confirmLecture.id] ?? 0)}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : confirmLecture ? (
              <div className="mt-4 rounded-[22px] border border-[color:var(--line)] bg-[#fffdf7] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">신청할 강의</p>
                <div className="mt-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                    {splitLectureHeading(confirmLecture.title).label}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-[color:var(--ink)]">
                    {splitLectureHeading(confirmLecture.title).title}
                  </p>
                  <p className="mt-2 text-xs text-[color:var(--muted)]">
                    {confirmLecture.speaker}
                    {confirmLecture.position && confirmLecture.position !== '비었음' ? ` · ${confirmLecture.position}` : ''}
                    {' · '}
                    {formatLectureLocation(confirmLecture, lectureApplicationCountMap[confirmLecture.id] ?? 0)}
                  </p>
                </div>
              </div>
            ) : null}

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={closeConfirmModal}
                  className="flex-1 rounded-[2px] border-2 border-[color:var(--ink)] bg-white px-4 py-3 text-sm font-semibold text-[color:var(--muted)]"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void commitPendingLecture(confirmTarget.slot, confirmTarget.lectureId);
                  }}
                  className="flex-1 rounded-[2px] bg-[color:var(--ink)] px-4 py-3 text-sm font-semibold text-[color:var(--paper)]"
                >
                  {isConfirmingChange ? '변경하기' : '결정하기'}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      ) : null}

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

function slowScrollElementIntoView(element: HTMLElement | null | undefined, durationMs: number) {
  if (!element) {
    return;
  }

  const container = getScrollContainer(element);

  if (!container) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    return;
  }

  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const currentTop = container.scrollTop;
  const targetTop =
    currentTop + (elementRect.top - containerRect.top) - container.clientHeight / 2 + elementRect.height / 2;
  animateScrollTop(container, targetTop, durationMs);
}

function getScrollContainer(element: HTMLElement) {
  let current: HTMLElement | null = element.parentElement;

  while (current) {
    const style = window.getComputedStyle(current);
    const canScroll =
      /(auto|scroll|overlay)/.test(style.overflowY) && current.scrollHeight > current.clientHeight;

    if (canScroll) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

function animateScrollTop(container: HTMLElement, targetTop: number, durationMs: number) {
  const startTop = container.scrollTop;
  const distance = targetTop - startTop;

  if (Math.abs(distance) < 1) {
    return;
  }

  const startTime = window.performance.now();

  const step = (now: number) => {
    const progress = Math.min(1, (now - startTime) / durationMs);
    const eased = easeInOutCubic(progress);
    container.scrollTop = startTop + distance * eased;

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}
