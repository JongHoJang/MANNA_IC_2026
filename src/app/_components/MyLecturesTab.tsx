'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Application, DayKey, Lecture, Participant, TimeSlot } from '@/types';
import { DAY_LABELS, DAY_ORDER } from '@/utils/tickets';
import { formatLectureSpeakerMeta, getLectureCapacityLabel, getLectureEligibilityMessage, isLectureFull, normalizePlaceLabel, sortLecturesBySessionNo } from '@/utils/lectures';
import { splitLectureHeading } from './home-helpers';
import { PencilMark, PersonMark, PinMark } from './home-marks';
import { ModalPortal } from './ModalPortal';

const sessionSlots = [
  { slot: '1타임', title: '첫번째 선택세션' },
  { slot: '2타임', title: '두번째 선택세션' },
] as const;

const DAY_TICKET_LABELS: Record<DayKey, string> = {
  Day1: '(6/23 화)',
  Day2: '(6/24 수)',
  Day3: '(6/25 목)',
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
  const dayLectures = useMemo(
    () => sortLecturesBySessionNo(lectures.filter((lecture) => lecture.day === activeDay)),
    [activeDay, lectures],
  );
  const [expandedSlot, setExpandedSlot] = useState<TimeSlot | null>(null);
  const [pendingLectureBySlot, setPendingLectureBySlot] = useState<Partial<Record<TimeSlot, string>>>({});
  const [confirmTarget, setConfirmTarget] = useState<{ slot: TimeSlot; lectureId: string } | null>(null);
  const [purchaseNoticeDay, setPurchaseNoticeDay] = useState<DayKey | null>(null);
  const [fullCapacityNotice, setFullCapacityNotice] = useState(false);
  const slotApplicationsRef = useRef(slotApplications);
  const lectureItemRefs = useRef<Partial<Record<TimeSlot, Partial<Record<string, HTMLButtonElement | null>>>>>({});

  useEffect(() => {
    slotApplicationsRef.current = slotApplications;
  }, [slotApplications]);

  useEffect(() => {
    setExpandedSlot(null);
    setPendingLectureBySlot({});
    setConfirmTarget(null);
    setPurchaseNoticeDay(null);
    setFullCapacityNotice(false);
  }, [activeDay]);

  useEffect(() => {
    if (!expandedSlot) {
      return;
    }

    const selectedApplication = slotApplicationsRef.current.get(expandedSlot);
    const selectedLectureId = selectedApplication?.lectureId;

    if (!selectedLectureId) {
      return;
    }

    window.requestAnimationFrame(() => {
      slowScrollElementIntoView(lectureItemRefs.current[expandedSlot]?.[selectedLectureId], 700);
    });
  }, [expandedSlot]);

  async function commitPendingLecture(slot: TimeSlot, lectureId: string) {
    const success = await onApplyLecture(activeDay, slot, lectureId);

    if (success) {
      setExpandedSlot(null);
      setPendingLectureBySlot((current) => {
        const next = { ...current };
        delete next[slot];
        return next;
      });
      setConfirmTarget(null);
      return;
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

  const confirmLecture = confirmTarget ? lectureLookup.get(confirmTarget.lectureId) : undefined;
  const confirmApplication = confirmTarget
    ? dayApplications.find((application) => application.timeSlot === confirmTarget.slot)
    : undefined;
  const currentLecture = confirmApplication ? lectureLookup.get(confirmApplication.lectureId) : undefined;

  function closeConfirmModal() {
    if (confirmTarget) {
      setPendingLectureBySlot((current) => {
        const next = { ...current };

        if (confirmApplication?.lectureId) {
          next[confirmTarget.slot] = confirmApplication.lectureId;
        } else {
          delete next[confirmTarget.slot];
        }

        return next;
      });
    }

    setConfirmTarget(null);
  }

  function renderLectureLocation(lecture: Lecture) {
    const applicationCount = lectureApplicationCountMap[lecture.id] ?? 0;
    const capacityLabel = getLectureCapacityLabel(lecture, applicationCount);
    const lectureIsFull = isLectureFull(lecture, applicationCount);

    return (
      <span className="leading-[1.35]">
        {normalizePlaceLabel(lecture.location)}
        {capacityLabel ? (
          <>
            {' '}
            <span aria-hidden="true">• </span>
            <span className={lectureIsFull ? 'font-semibold text-[#c43d2f]' : 'text-[color:var(--muted)]'}>({capacityLabel})</span>
            {lectureIsFull ? <span className="font-semibold text-[#c43d2f]"> 정원초과</span> : null}
          </>
        ) : null}
      </span>
    );
  }

  const isConfirmingChange = Boolean(confirmApplication);

  return (
    <div className="space-y-5">
      <section className="space-y-4 px-1 pt-1">
        <h2 className="max-w-[15ch] text-[2rem] font-semibold leading-[1.06] tracking-[-0.05em] text-[color:var(--ink)] sm:text-[2.15rem]">
          듣고 싶은 선택세션을
          <br />
          골라주세요.
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
              <span className="block text-[16px]">{DAY_LABELS[day]}</span>
              <span className="mt-1 block text-[13px] font-medium tracking-[0.01em] opacity-75">{DAY_TICKET_LABELS[day]}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4">
        {sessionSlots.map(({ slot, title }) => {
          const application = slotApplications.get(slot);
          const pendingLectureId = pendingLectureBySlot[slot];
          const hasExistingApplication = Boolean(application);
          const displayedLecture = pendingLectureId
            ? lectureLookup.get(pendingLectureId)
            : application
              ? lectureLookup.get(application.lectureId)
              : undefined;
          const isActive = activeSlot === slot;
          const isExpanded = expandedSlot === slot;
          const actionLabel = !isExpanded
            ? hasExistingApplication
              ? '세션 변경하기'
              : '세션 선택하기'
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
                        {(() => {
                          const heading = splitLectureHeading(displayedLecture.title, displayedLecture.sessionNo);

                          return (
                            <>
                              <p className="text-[13px] font-medium uppercase tracking-[0.01em] text-[color:var(--muted)]/74">
                                {heading.label}
                              </p>
                              <p className="mt-2 text-[20px] font-bold leading-[1.14] tracking-tight text-[color:var(--ink)]">
                                {heading.title}
                              </p>
                            </>
                          );
                        })()}
                      </div>
                      <div className="space-y-1.5 text-[14px] font-medium text-[color:var(--muted)]">
                        <span className="flex items-start gap-1.5">
                          <PersonMark />
                          <span className="leading-[1.35]">
                            {formatLectureSpeakerMeta(displayedLecture.speaker, displayedLecture.position)}
                          </span>
                        </span>
                        <span className="flex items-start gap-1.5">
                          <PinMark />
                          {renderLectureLocation(displayedLecture)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-[color:var(--muted)]">아직 세션이 선택되지 않았습니다.</p>
                  )}
                </button>
              </div>

              <div className="px-4 pb-4">
                <button
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
                    {dayLectures.map((item) => {
                      const itemPendingInSlot = pendingLectureId === item.id;
                      const itemApplication = dayApplications.find((value) => value.lectureId === item.id);
                      const itemIsSelectedElsewhere = itemApplication && itemApplication.timeSlot !== slot;
                      const itemEligibilityMessage = getLectureEligibilityMessage(item, currentParticipant.position);
                      const itemApplicationCount = lectureApplicationCountMap[item.id] ?? 0;
                      const itemIsFull = isLectureFull(item, itemApplicationCount);
                      const itemIsCurrentSelection = application?.lectureId === item.id;
                      const itemHeading = splitLectureHeading(item.title, item.sessionNo);
                      const itemDisabled = Boolean(itemIsSelectedElsewhere || itemEligibilityMessage);

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
                            if (itemIsSelectedElsewhere) {
                              return;
                            }

                            if (itemEligibilityMessage) {
                              return;
                            }

                            if (itemIsFull && !itemIsCurrentSelection) {
                              setFullCapacityNotice(true);
                              return;
                            }

                            const nextSelection = application?.lectureId === item.id ? undefined : item.id;

                            setPendingLectureBySlot((current) => {
                              const next = { ...current };

                              if (nextSelection) {
                                next[slot] = nextSelection;
                              } else {
                                delete next[slot];
                              }

                              return next;
                            });

                            if (nextSelection) {
                              setConfirmTarget({ slot, lectureId: nextSelection });
                            }
                          }}
                          className={[
                            'flex w-full items-start justify-between gap-3 rounded-[16px] border px-3 py-3 text-left transition',
                            itemPendingInSlot
                              ? 'border-[color:var(--accent)] bg-[rgba(238,202,126,0.2)] shadow-[0_8px_22px_rgba(37,24,17,0.06)]'
                              : itemIsSelectedElsewhere || itemEligibilityMessage || (itemIsFull && !itemIsCurrentSelection)
                                ? 'cursor-not-allowed border-[color:var(--line)] bg-white/55 opacity-45'
                                : 'border-[color:var(--line)] bg-white hover:bg-white',
                          ].join(' ')}
                          disabled={itemDisabled}
                        >
                          <div className="min-w-0">
                            {itemHeading.label ? (
                              <p className="text-[13px] font-medium uppercase tracking-[0.01em] text-[color:var(--muted)]/74">
                                {itemHeading.label}
                              </p>
                            ) : null}
                            <h4 className="mt-1 text-[20px] font-bold leading-[1.14] tracking-tight text-[color:var(--ink)]">
                              {itemHeading.title}
                            </h4>
                            <div className="mt-2 space-y-1.5 text-[14px] font-medium text-[color:var(--muted)]">
                              <p className="flex items-start gap-1.5">
                                <PersonMark />
                                <span className="leading-[1.35]">
                                  {formatLectureSpeakerMeta(item.speaker, item.position)}
                                </span>
                              </p>
                              <p className="flex items-start gap-1.5">
                                <PinMark />
                                {renderLectureLocation(item)}
                              </p>
                            </div>
                            {itemIsSelectedElsewhere ? (
                              <span className="mt-2 inline-flex rounded-full bg-[#e8e8e8] px-2.5 py-1 text-xs font-medium text-[color:var(--muted)]">
                                다른 타임 선택됨
                              </span>
                            ) : null}
                            {itemEligibilityMessage ? (
                              <span className="mt-2 inline-flex rounded-full bg-[#e8e8e8] px-2.5 py-1 text-xs font-medium text-[color:var(--muted)]">
                                {itemEligibilityMessage}
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
              {isConfirmingChange ? '선택 세션 변경' : '선택 확인'}
            </p>
            <h3 className="mt-3 text-xl font-semibold leading-tight">
              {isConfirmingChange ? '현재 선택한 세션이 아래와 같이 변경됩니다.' : '이 세션을 신청하시겠어요?'}
            </h3>

            {isConfirmingChange ? (
              <div className="mt-4 grid gap-3">
                <div className="rounded-[22px] border border-[color:var(--line)] bg-white px-4 py-4">
                  <p className="text-[13px] font-medium uppercase tracking-[0.01em] text-[color:var(--muted)]/74">현재 세션</p>
                  {currentLecture ? (
                    <div className="mt-2">
                      <p className="text-[13px] font-medium uppercase tracking-[0.01em] text-[color:var(--muted)]/74">
                        {splitLectureHeading(currentLecture.title, currentLecture.sessionNo).label}
                      </p>
                      <p className="mt-1 text-[20px] font-bold leading-[1.14] tracking-tight text-[color:var(--ink)]">
                        {splitLectureHeading(currentLecture.title, currentLecture.sessionNo).title}
                      </p>
                      <div className="mt-2 space-y-1 text-[14px] font-medium text-[color:var(--muted)]">
                        <p className="flex items-start gap-1.5">
                          <PersonMark />
                          <span className="leading-[1.35]">
                            {formatLectureSpeakerMeta(currentLecture.speaker, currentLecture.position)}
                          </span>
                        </p>
                        <p className="flex items-start gap-1.5">
                          <PinMark />
                          {renderLectureLocation(currentLecture)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-[color:var(--muted)]">아직 선택된 세션이 없습니다.</p>
                  )}
                </div>

                <div className="flex justify-center">
                  <span
                    aria-hidden="true"
                    className="inline-flex items-center justify-center text-lg font-semibold text-[color:var(--muted)]"
                  >
                    ↓
                  </span>
                </div>

                <div className="rounded-[22px] border border-[color:var(--accent)] bg-[rgba(238,202,126,0.24)] px-4 py-4 shadow-[0_10px_24px_rgba(238,202,126,0.18)]">
                  <p className="text-[13px] font-medium uppercase tracking-[0.01em] text-[color:var(--ink)]/74">변경될 세션</p>
                  {confirmLecture ? (
                    <div className="mt-2">
                      <p className="text-[13px] font-medium uppercase tracking-[0.01em] text-[color:var(--ink)]/74">
                        {splitLectureHeading(confirmLecture.title, confirmLecture.sessionNo).label}
                      </p>
                      <p className="mt-1 text-[20px] font-bold leading-[1.14] tracking-tight text-[color:var(--ink)]">
                        {splitLectureHeading(confirmLecture.title, confirmLecture.sessionNo).title}
                      </p>
                      <div className="mt-2 space-y-1 text-[14px] font-medium text-[color:var(--muted)]">
                        <p className="flex items-start gap-1.5">
                          <PersonMark />
                          <span className="leading-[1.35]">
                            {formatLectureSpeakerMeta(confirmLecture.speaker, confirmLecture.position)}
                          </span>
                        </p>
                        <p className="flex items-start gap-1.5">
                          <PinMark />
                          {renderLectureLocation(confirmLecture)}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : confirmLecture ? (
              <div className="mt-4 rounded-[22px] border border-[color:var(--accent)] bg-[rgba(238,202,126,0.24)] px-4 py-4 shadow-[0_10px_24px_rgba(238,202,126,0.18)]">
                <p className="text-[13px] font-medium uppercase tracking-[0.01em] text-[color:var(--ink)]/74">신청할 세션</p>
                <div className="mt-2">
                  <p className="text-[13px] font-medium uppercase tracking-[0.01em] text-[color:var(--ink)]/74">
                    {splitLectureHeading(confirmLecture.title, confirmLecture.sessionNo).label}
                  </p>
                  <p className="mt-1 text-[20px] font-bold leading-[1.14] tracking-tight text-[color:var(--ink)]">
                    {splitLectureHeading(confirmLecture.title, confirmLecture.sessionNo).title}
                  </p>
                  <div className="mt-2 space-y-1 text-[14px] font-medium text-[color:var(--muted)]">
                    <p className="flex items-start gap-1.5">
                      <PersonMark />
                      <span className="leading-[1.35]">
                        {formatLectureSpeakerMeta(confirmLecture.speaker, confirmLecture.position)}
                      </span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <PinMark />
                      {renderLectureLocation(confirmLecture)}
                    </p>
                  </div>
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

      {fullCapacityNotice ? (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-4 pb-4 pt-10 backdrop-blur-[2px] sm:items-center">
            <div className="w-full max-w-[420px] rounded-[28px] border-[2px] border-[color:var(--ink)] bg-[color:var(--panel)] p-5 shadow-[6px_6px_0_rgba(36,27,22,0.2)]">
              <p className="font-display text-xs uppercase tracking-[0.35em] text-[color:var(--muted)]">정원 안내</p>
              <h3 className="mt-3 text-xl font-semibold leading-tight">정원이 모두 찬 세션입니다.</h3>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                다른 세션을 선택해 주세요.
              </p>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setFullCapacityNotice(false)}
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
