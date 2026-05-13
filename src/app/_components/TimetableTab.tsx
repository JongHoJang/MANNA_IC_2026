 'use client';

import { useEffect, useRef } from 'react';
import { timetableDays } from '@/mocks';
import type { DayKey, TimetableDay } from '@/types';
import { isBreakSession, isTimeInsideRange } from './home-helpers';
import { PinMiniMark } from './home-marks';

export function TimetableTab({
  activeDay,
  selectedDay,
  currentTime,
  onSelectDay,
}: {
  activeDay: TimetableDay;
  selectedDay: DayKey;
  currentTime: string;
  onSelectDay: (day: DayKey) => void;
}) {
  const currentRowIndex = activeDay.rows.findIndex((row) => isTimeInsideRange(currentTime, row.time));
  const currentRowRef = useRef<HTMLElement | null>(null);

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
      <section className="relative overflow-hidden rounded-[2px] border-[2px] border-[color:var(--ink)] bg-[linear-gradient(180deg,rgba(255,234,166,0.92),rgba(242,200,98,0.92))] px-4 py-5 shadow-[4px_4px_0_rgba(36,27,22,0.18)]">
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
                  'grid grid-cols-[72px_1fr] gap-3 rounded-[2px] border-[2px] border-[color:var(--ink)] bg-[color:var(--paper)] px-4 py-4 shadow-[3px_3px_0_rgba(36,27,22,0.14)] transition',
                  isCurrent
                    ? 'border-[color:var(--ink)] bg-[rgba(238,202,126,0.28)] shadow-[4px_4px_0_rgba(36,27,22,0.18)]'
                    : 'border-[color:var(--ink)]/18 bg-[color:var(--paper)]/72 text-[color:var(--ink)]/72 opacity-70',
                ].join(' ')}
              >
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
                          isCurrent ? 'text-[color:var(--muted)]' : 'text-[color:var(--muted)]/70',
                        ].join(' ')}
                      >
                        {labelText}
                      </p>
                      {titleText ? (
                        <p
                          className={[
                            'whitespace-pre-line text-[1.22rem] font-semibold leading-[1.1] tracking-[-0.05em]',
                            isCurrent ? 'text-[color:var(--ink)]' : 'text-[color:var(--ink)]/76',
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
                    <p
                      className={[
                        'inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.08em]',
                        isCurrent ? 'text-[color:var(--ink)]/68' : 'text-[color:var(--ink)]/48',
                      ].join(' ')}
                    >
                      <PinMiniMark />
                      <span>{row.place}</span>
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
