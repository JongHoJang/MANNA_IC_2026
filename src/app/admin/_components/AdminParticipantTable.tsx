import type { DayKey, Participant } from '@/types';
import { DAY_ORDER } from '@/utils/tickets';

export type AdminParticipantRow = {
  rowNumber?: number;
  participant: Participant;
  missingDays: DayKey[];
  totalApplications: number;
  sessionsByDay: Record<DayKey, string[]>;
};

type ParsedSessionDay = {
  firstTitle: string | null;
  secondTitle: string | null;
};

function hasTicketDay(participant: Participant, day: DayKey) {
  if (day === 'Day1' && typeof participant.day1 === 'boolean') {
    return participant.day1;
  }

  if (day === 'Day2' && typeof participant.day2 === 'boolean') {
    return participant.day2;
  }

  if (day === 'Day3' && typeof participant.day3 === 'boolean') {
    return participant.day3;
  }

  const source = participant.ticketInfo ?? participant.ticketText;
  return source.includes(day);
}

function TicketOx({ active }: { active: boolean }) {
  return (
    <span
      className={[
        'inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4',
        active ? 'bg-[#f6ecd2] text-[#9a7b00]' : 'bg-[#f2f0ea] text-[#9b9588]',
      ].join(' ')}
    >
      {active ? 'O' : 'X'}
    </span>
  );
}

function parseSessionDay(items: string[]): ParsedSessionDay {
  const parsed: ParsedSessionDay = {
    firstTitle: null,
    secondTitle: null,
  };

  for (const item of items) {
    const [timeSlot, title] = item.split(' · ');
    const displayTitle = title ?? '강의 정보 없음';

    if (timeSlot === '1타임') {
      parsed.firstTitle = displayTitle;
    }

    if (timeSlot === '2타임') {
      parsed.secondTitle = displayTitle;
    }
  }

  return parsed;
}

function SessionSummary({
  hasAccess,
  items,
}: {
  hasAccess: boolean;
  items: string[];
}) {
  if (!hasAccess) {
    return null;
  }

  const { firstTitle, secondTitle } = parseSessionDay(items);

  return (
    <div className="space-y-1.5 text-[13px] font-medium leading-5 text-[#4f4b45]">
      <p>
        <span className="text-[#6f6258]">[1]</span>{' '}
        <span
          title={firstTitle ?? '-'}
          className={[
            'inline-block max-w-[calc(100%-1.75rem)] truncate align-bottom',
            firstTitle ? 'text-[#4f4b45]' : 'text-[#b45a52]',
          ].join(' ')}
        >
          {firstTitle ?? '-'}
        </span>
      </p>
      <p>
        <span className="text-[#6f6258]">[2]</span>{' '}
        <span
          title={secondTitle ?? '-'}
          className={[
            'inline-block max-w-[calc(100%-1.75rem)] truncate align-bottom',
            secondTitle ? 'text-[#4f4b45]' : 'text-[#b45a52]',
          ].join(' ')}
        >
          {secondTitle ?? '-'}
        </span>
      </p>
    </div>
  );
}

function DaySessionCell({
  participant,
  day,
  items,
}: {
  participant: Participant;
  day: DayKey;
  items: string[];
}) {
  const hasAccess = hasTicketDay(participant, day);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#6f6258]">티켓</span>
        <TicketOx active={hasAccess} />
      </div>
      <SessionSummary hasAccess={hasAccess} items={items} />
    </div>
  );
}

export function AdminParticipantTable({
  rows,
  selectedParticipantId,
  onSelect,
}: {
  rows: AdminParticipantRow[];
  selectedParticipantId: string | null;
  onSelect: (participantId: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#e6dcc6] bg-[rgba(255,255,255,0.9)] shadow-[0_18px_42px_rgba(160,132,52,0.08)]">

      <div className="space-y-3 border-t border-[#efe6d3] px-4 py-4 lg:hidden">
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#ddd2be] bg-[#faf8f3] px-4 py-4 text-sm text-[#6f6258]">
            표시할 참가자가 없습니다.
          </div>
        ) : (
          rows.map((row) => {
            const active = row.participant.id === selectedParticipantId;

            return (
              <button
                key={row.participant.id}
                type="button"
                onClick={() => onSelect(row.participant.id)}
                className={[
                  'w-full rounded-[16px] border px-4 py-4 text-left shadow-[0_10px_24px_rgba(124,117,150,0.06)]',
                  active ? 'border-[#caa334] bg-[#fffdf6]' : 'border-[#e9e0cf] bg-white/96',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a7b00]">
                      No. {row.rowNumber ?? '-'}
                    </p>
                    <p className="font-semibold text-[#232425]">{row.participant.name}</p>
                    <p className="mt-1 text-[13px] text-[#6f6258]">
                      {row.participant.organization ?? '소속 미입력'} · {row.participant.position}
                    </p>
                  </div>
                  <span className="text-[13px] text-[#8a7c6f]">{row.totalApplications}개 신청</span>
                </div>
                <p className="mt-2 text-[13px] text-[#8a7c6f]">
                  {row.participant.phone} · {row.participant.email ?? '이메일 미입력'}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {DAY_ORDER.map((day) => (
                    <div key={day} className="rounded-[12px] border border-[#ece4d4] bg-[#fcfbf7] px-3 py-3">
                      <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8a7b63]">{day}</p>
                      <DaySessionCell participant={row.participant} day={day} items={row.sessionsByDay[day]} />
                    </div>
                  ))}
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-[1080px] w-full table-fixed text-[14px]">
          <colgroup>
            <col style={{ width: '5.5%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '20.8333%' }} />
            <col style={{ width: '20.8333%' }} />
            <col style={{ width: '20.8334%' }} />
          </colgroup>
          <thead>
            <tr className="bg-[#f8f3e7] text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8a7b63]">
              <th className="rounded-tl-[18px] border-b border-[#ece2cc] px-4 py-3">No.</th>
              <th className="border-b border-[#ece2cc] px-4 py-3">이름</th>
              <th className="border-b border-[#ece2cc] px-4 py-3">소속</th>
              <th className="border-b border-[#ece2cc] px-4 py-3">직분</th>
              <th className="border-b border-[#ece2cc] px-4 py-3">연락처</th>
              {DAY_ORDER.map((day) => (
                <th
                  key={`day-${day}`}
                  className={[
                    'border-b border-[#ece2cc] px-4 py-3',
                    day === 'Day1' ? 'border-l border-[#ece2cc]' : '',
                    day === 'Day3' ? 'rounded-tr-[18px]' : '',
                  ].join(' ')}
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const active = row.participant.id === selectedParticipantId;

              return (
                <tr
                  key={row.participant.id}
                  className={active ? 'bg-[#fffdf6]' : 'bg-white hover:bg-[#fdfbf6]'}
                >
                  <td className="border-b border-[#efe6d3] px-4 py-4 align-top text-[13px] font-semibold text-[#9a7b00]">
                    {row.rowNumber ?? '-'}
                  </td>
                  <td className="border-b border-[#efe6d3] px-4 py-4 align-top">
                    <button type="button" onClick={() => onSelect(row.participant.id)} className="text-left">
                      <p className="text-[15px] font-medium leading-6 text-[#232425]">{row.participant.name}</p>
                    </button>
                  </td>
                  <td className="border-b border-[#efe6d3] px-4 py-4 align-top text-[#4f4b45]">
                    {row.participant.organization ?? '비었음'}
                  </td>
                  <td className="border-b border-[#efe6d3] px-4 py-4 align-top text-[#4f4b45]">
                    {row.participant.position}
                  </td>
                  <td className="border-b border-[#efe6d3] px-4 py-4 align-top text-[#4f4b45]">
                    <p>{row.participant.phone}</p>
                    <p className="mt-0.5 text-[12px] text-[#8a7c6f]">{row.participant.email ?? '이메일 미입력'}</p>
                  </td>
                  {DAY_ORDER.map((day) => (
                    <td
                      key={`day-${row.participant.id}-${day}`}
                      className={[
                        'border-b border-[#efe6d3] px-4 py-4 align-top',
                        day === 'Day1' ? 'border-l border-[#efe6d3]' : '',
                      ].join(' ')}
                    >
                      <DaySessionCell participant={row.participant} day={day} items={row.sessionsByDay[day]} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
