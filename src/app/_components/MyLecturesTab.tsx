'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { lectures } from '@/mocks';
import type { Application, DayKey, Lecture, Participant, TimeSlot } from '@/types';
import { DAY_LABELS, DAY_ORDER } from '@/utils/tickets';
import { splitLectureHeading } from './home-helpers';
import { ClockMark, PencilMark, PersonMark, PinMark } from './home-marks';

const sessionSlots = [
  { slot: '1타임', title: '첫번째 선택세션' },
  { slot: '2타임', title: '두번째 선택세션' },
] as const;

export function MyLecturesTab({
  activeDay,
  activeSlot,
  applications,
  accessSummary,
  purchasedDays,
  currentParticipant,
  lectureLookup,
  onSelectDay,
  onSelectSlot,
  onApplyLecture,
}: {
  activeDay: DayKey;
  activeSlot: TimeSlot;
  applications: Application[];
  accessSummary: string;
  purchasedDays: DayKey[];
  currentParticipant: Participant;
  lectureLookup: Map<string, Lecture>;
  onSelectDay: (day: DayKey) => void;
  onSelectSlot: (slot: TimeSlot) => void;
  onApplyLecture: (day: DayKey, timeSlot: TimeSlot, lectureId: string) => boolean;
}) {
  const dayApplications = applications.filter(
    (application) => application.participantId === currentParticipant.id && application.day === activeDay,
  );
  const slotApplications = new Map(dayApplications.map((application) => [application.timeSlot, application] as const));
  const dayLectures = useMemo(() => lectures.filter((lecture) => lecture.day === activeDay), [activeDay]);
  const [expandedSlot, setExpandedSlot] = useState<TimeSlot | null>(null);
  const [pendingLectureBySlot, setPendingLectureBySlot] = useState<Partial<Record<TimeSlot, string>>>({});
  const [confirmTarget, setConfirmTarget] = useState<{ slot: TimeSlot; lectureId: string } | null>(null);
  const actionButtonRefs = useRef<Partial<Record<TimeSlot, HTMLButtonElement | null>>>({});

  useEffect(() => {
    setExpandedSlot(null);
    setPendingLectureBySlot({});
    setConfirmTarget(null);
  }, [activeDay]);

  function closeConfirmModal() {
    setConfirmTarget(null);
  }

  function commitPendingLecture(slot: TimeSlot, lectureId: string) {
    const success = onApplyLecture(activeDay, slot, lectureId);

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
      actionButtonRefs.current[slot]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }

  const confirmLecture = confirmTarget ? lectureLookup.get(confirmTarget.lectureId) : undefined;
  const confirmApplication = confirmTarget
    ? dayApplications.find((application) => application.timeSlot === confirmTarget.slot)
    : undefined;
  const currentLecture = confirmApplication ? lectureLookup.get(confirmApplication.lectureId) : undefined;

  return (
    <div className="space-y-5">
      <section className="space-y-4 px-1 pt-1">
        <h2 className="max-w-[19ch] text-[2rem] font-semibold leading-[1.06] tracking-[-0.05em] text-[color:var(--ink)] sm:text-[2.15rem]">
          안녕하세요 {currentParticipant.name} {currentParticipant.position} 님,
          만나IC 2026 컨퍼런스에 오신것을 환영합니다.
        </h2>

        <div className="inline-flex rounded-[2px] border-2 border-[color:var(--ink)] bg-white px-3 py-2 text-sm font-semibold text-[color:var(--ink)] shadow-[2px_2px_0_rgba(36,27,22,0.18)]">
          참가일: {accessSummary}
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3">
        {DAY_ORDER.map((day) => {
          const purchased = purchasedDays.includes(day);
          const isActive = activeDay === day;

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDay(day)}
              disabled={!purchased}
              className={[
                'h-12 rounded-[2px] border-2 px-2 text-sm font-semibold transition',
                isActive
                  ? 'border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)]'
                  : purchased
                    ? 'border-[color:var(--line)] bg-[color:var(--paper)] text-[color:var(--ink)]'
                    : 'cursor-not-allowed border-dashed border-[color:var(--line)] bg-[color:var(--paper)] text-[color:var(--muted)]',
              ].join(' ')}
            >
              {DAY_LABELS[day]}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4">
        {sessionSlots.map(({ slot, title }) => {
          const application = slotApplications.get(slot);
          const pendingLectureId = pendingLectureBySlot[slot];
          const displayedLecture = pendingLectureId
            ? lectureLookup.get(pendingLectureId)
            : application
              ? lectureLookup.get(application.lectureId)
              : undefined;
          const hasPendingSelection = Boolean(pendingLectureId);
          const isActive = activeSlot === slot;
          const isExpanded = expandedSlot === slot;

          return (
            <section
              key={slot}
              className={[
                'overflow-hidden rounded-[2px] border-[2px] border-[color:var(--ink)] bg-white transition',
                isActive ? 'shadow-[4px_4px_0_rgba(36,27,22,0.2)]' : 'shadow-[3px_3px_0_rgba(36,27,22,0.14)]',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-3 px-4 py-4">
                <button type="button" onClick={() => onSelectSlot(slot)} className="min-w-0 flex-1 text-left">
                  <div className="mb-4 flex items-center gap-2 text-xs font-medium text-[color:var(--muted)]">
                    <ClockMark />
                    <span>{title}</span>
                  </div>
                  {displayedLecture ? (
                    <div className="space-y-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                          {splitLectureHeading(displayedLecture.title).label}
                        </p>
                        <p className="mt-2 text-[1.18rem] font-semibold leading-[1.18] tracking-[-0.045em] text-[color:var(--ink)]">
                          {splitLectureHeading(displayedLecture.title).title}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[color:var(--muted)]">
                        <span className="inline-flex items-center gap-1.5">
                          <PersonMark />
                          <span>{displayedLecture.speaker}</span>
                        </span>
                        <span className="text-[color:var(--muted)]">·</span>
                        <span className="inline-flex items-center gap-1.5">
                          <PinMark />
                          <span>{displayedLecture.location}</span>
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
                      setExpandedSlot(slot);
                      return;
                    }

                    if (pendingLectureId) {
                      setConfirmTarget({ slot, lectureId: pendingLectureId });
                      return;
                    }

                    cancelSelection(slot);
                  }}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-[2px] border-[2px] border-[color:var(--ink)] bg-transparent px-3 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-[rgba(36,27,22,0.03)]"
                >
                  <span>{!isExpanded ? (application ? '강의 변경하기' : '강의 선택하기') : hasPendingSelection ? '변경하기' : '닫기'}</span>
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
                      const itemHeading = splitLectureHeading(item.title);
                      const itemDisabled = Boolean(itemIsSelectedElsewhere);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            if (itemDisabled) {
                              return;
                            }

                            setPendingLectureBySlot((current) => ({ ...current, [slot]: item.id }));
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
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                              {itemHeading.label}
                            </p>
                            <h4 className="mt-1 text-sm font-semibold leading-snug text-[color:var(--ink)]">
                              {itemHeading.title}
                            </h4>
                            <p className="mt-1 text-xs text-[color:var(--muted)]">
                              {item.speaker} · {item.location}
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-4 pb-4 pt-10 backdrop-blur-[2px] sm:items-center">
          <div className="w-full max-w-[420px] rounded-[28px] border-[2px] border-[color:var(--ink)] bg-[color:var(--panel)] p-5 shadow-[6px_6px_0_rgba(36,27,22,0.2)]">
            <p className="font-display text-xs uppercase tracking-[0.35em] text-[color:var(--muted)]">변경 확인</p>
            <h3 className="mt-3 text-xl font-semibold leading-tight">변경 전후를 확인해 주세요</h3>

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
                      {currentLecture.speaker} · {currentLecture.location}
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
                      {confirmLecture.speaker} · {confirmLecture.location}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

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
                onClick={() => commitPendingLecture(confirmTarget.slot, confirmTarget.lectureId)}
                className="flex-1 rounded-[2px] bg-[color:var(--ink)] px-4 py-3 text-sm font-semibold text-[color:var(--paper)]"
              >
                반영하기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
