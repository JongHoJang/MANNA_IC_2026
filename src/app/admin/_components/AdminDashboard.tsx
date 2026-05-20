'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Application, DayKey, Lecture, Participant, TimeSlot } from '@/types';
import { Notice } from '@/components/ui/Notice';
import {
  getApplicationCountByLecture,
  getApplicationsByDayForParticipant,
  getMissingDaysForParticipant,
} from '@/utils/applications';
import { sortLecturesBySessionNo } from '@/utils/lectures';
import { DAY_ORDER, SESSION_DAY_LABELS } from '@/utils/tickets';
import { AdminParticipantDetailPanel } from './AdminParticipantDetailPanel';
import { AdminParticipantTable, type AdminParticipantRow } from './AdminParticipantTable';
import { AdminSessionStats } from './AdminSessionStats';

type AdminPayload = {
  participants: Participant[];
  lectures: Lecture[];
  applications: Application[];
};

type FilterState = {
  query: string;
  ticket: DayKey[];
  completion: 'all' | 'complete' | 'incomplete';
  missingDay: 'all' | DayKey;
  statsDay: 'all' | DayKey;
};

type FormState = {
  name: string;
  phone: string;
  position: string;
  ticketInfo: string;
  email: string;
  organization: string;
  day1: boolean;
  day2: boolean;
  day3: boolean;
};

type SessionDraft = Record<DayKey, Record<TimeSlot, string>>;

type SectionKey = 'participants' | 'sessions';
type ToggleOption<T extends string> = {
  label: string;
  value: T;
};

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-[10px] border border-[#ddd7cc] bg-white px-5 py-5">
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6d6961]">{label}</p>
      <p className="mt-3 text-[2.7rem] font-semibold leading-none tracking-[-0.06em] text-[#241b16]">{value}</p>
      {detail ? <p className="mt-3 text-[14px] text-[#6f6258]">{detail}</p> : null}
    </div>
  );
}

function SidebarItem({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex w-full items-center gap-3 rounded-r-xl px-5 py-3 text-left text-[15px] font-medium transition',
        active
          ? 'border-l-4 border-[#9a7b00] bg-[rgba(154,123,0,0.18)] text-[#b89100]'
          : 'text-white/88 hover:bg-white/6',
      ].join(' ')}
    >
      <span className="inline-block h-4 w-4 rounded-[4px] border border-current/60" />
      <span>{label}</span>
    </button>
  );
}

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex w-full max-w-[420px] items-center gap-3 rounded-[18px] border border-[#e6dcc6] bg-[rgba(255,255,255,0.96)] px-5 py-3.5 shadow-[0_14px_32px_rgba(160,132,52,0.10)]">
      <span className="text-[#9a7b00]">⌕</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="참가자 검색"
        className="w-full bg-transparent text-[15px] text-[#3d3428] outline-none placeholder:text-[#a79a87]"
      />
    </div>
  );
}

function ToggleChipGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: ToggleOption<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8a7b63]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={[
                'rounded-full border px-4 py-2 text-[14px] font-medium transition',
                active
                  ? 'border-[#9a7b00] bg-[#9a7b00] text-white shadow-[0_8px_18px_rgba(154,123,0,0.18)]'
                  : 'border-[#e6dcc6] bg-white/96 text-[#6f6258] hover:border-[#d4c39b] hover:bg-[#fdf9ef]',
              ].join(' ')}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MultiDayChipGroup({
  label,
  value,
  onChange,
}: {
  label: string;
  value: DayKey[];
  onChange: (value: DayKey[]) => void;
}) {
  const allActive = value.length === 0;

  return (
    <div className="space-y-2">
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8a7b63]">{label}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange([])}
          className={[
            'rounded-full border px-4 py-2 text-[14px] font-medium transition',
            allActive
              ? 'border-[#9a7b00] bg-[#9a7b00] text-white shadow-[0_8px_18px_rgba(154,123,0,0.18)]'
              : 'border-[#e6dcc6] bg-white/96 text-[#6f6258] hover:border-[#d4c39b] hover:bg-[#fdf9ef]',
          ].join(' ')}
        >
          전체
        </button>
        {DAY_ORDER.map((day) => {
          const active = value.includes(day);

          return (
            <button
              key={day}
              type="button"
              onClick={() =>
                onChange(active ? value.filter((item) => item !== day) : [...value, day])
              }
              className={[
                'rounded-full border px-4 py-2 text-[14px] font-medium transition',
                active
                  ? 'border-[#9a7b00] bg-[#9a7b00] text-white shadow-[0_8px_18px_rgba(154,123,0,0.18)]'
                  : 'border-[#e6dcc6] bg-white/96 text-[#6f6258] hover:border-[#d4c39b] hover:bg-[#fdf9ef]',
              ].join(' ')}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function buildFormState(participant: Participant | null): FormState {
  return {
    name: participant?.name ?? '',
    phone: participant?.phone ?? '',
    position: participant?.position ?? '',
    ticketInfo: participant?.ticketInfo ?? participant?.ticketText ?? '',
    email: participant?.email ?? '',
    organization: participant?.organization ?? '',
    day1: Boolean(participant?.day1),
    day2: Boolean(participant?.day2),
    day3: Boolean(participant?.day3),
  };
}

function buildSessionDraft(participantId: string | null, applications: Application[]) {
  const draft = DAY_ORDER.reduce<SessionDraft>((acc, day) => {
    acc[day] = {
      '1타임': '',
      '2타임': '',
    };
    return acc;
  }, {} as SessionDraft);

  if (!participantId) {
    return draft;
  }

  const byDay = getApplicationsByDayForParticipant(applications, participantId);

  for (const day of DAY_ORDER) {
    for (const application of byDay[day]) {
      draft[day][application.timeSlot] = application.lectureId;
    }
  }

  return draft;
}

export function AdminDashboard({
  message,
  onLogout,
}: {
  message: string | null;
  onLogout: () => void;
}) {
  const completionFilterOptions: ToggleOption<FilterState['completion']>[] = [
    { label: '전체', value: 'all' },
    { label: '완료', value: 'complete' },
    { label: '미완료', value: 'incomplete' },
  ];

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    query: '',
    ticket: [],
    completion: 'all',
    missingDay: 'all',
    statsDay: 'all',
  });
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(buildFormState(null));
  const [sessionDraft, setSessionDraft] = useState<SessionDraft>(buildSessionDraft(null, []));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(message);
  const [section, setSection] = useState<SectionKey>('participants');
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchAdminData() {
      setLoading(true);

      try {
        const response = await fetch('/api/admin/participants', { cache: 'no-store' });
        const payload = (await response.json()) as AdminPayload & { message?: string };

        if (!response.ok) {
          throw new Error(payload.message ?? '어드민 데이터를 불러오지 못했습니다.');
        }

        if (!active) {
          return;
        }

        setParticipants(payload.participants);
        setLectures(payload.lectures);
        setApplications(payload.applications);
      } catch (error) {
        if (!active) {
          return;
        }

        setStatusMessage(error instanceof Error ? error.message : '어드민 데이터를 불러오지 못했습니다.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchAdminData();

    return () => {
      active = false;
    };
  }, []);

  const rows: AdminParticipantRow[] = participants.map((participant) => {
    const byDay = getApplicationsByDayForParticipant(applications, participant.id);

    return {
      participant,
      missingDays: getMissingDaysForParticipant(applications, participant),
      totalApplications: applications.filter((application) => application.participantId === participant.id).length,
      sessionsByDay: DAY_ORDER.reduce<Record<DayKey, string[]>>((acc, day) => {
        acc[day] = byDay[day].map((application) => {
          const lecture = lectures.find((item) => item.id === application.lectureId);
          return lecture
            ? `${application.timeSlot} · ${lecture.title} · ${lecture.speaker} · ${lecture.location}`
            : `${application.timeSlot} · 강의 정보 없음`;
        });
        return acc;
      }, {} as Record<DayKey, string[]>),
    };
  });

  const filteredRows = rows.filter((row) => {
    const haystack = [
      row.participant.name,
      row.participant.phone,
      row.participant.organization ?? '',
      row.participant.email ?? '',
    ]
      .join(' ')
      .toLowerCase();
    const isComplete = row.missingDays.length === 0;

    if (filters.query && !haystack.includes(filters.query.toLowerCase())) {
      return false;
    }

    if (
      filters.ticket.length > 0 &&
      !filters.ticket.some((day) => (row.participant.ticketInfo ?? row.participant.ticketText).includes(day))
    ) {
      return false;
    }

    if (filters.completion === 'complete' && !isComplete) {
      return false;
    }

    if (filters.completion === 'incomplete' && isComplete) {
      return false;
    }

    if (filters.missingDay !== 'all' && !row.missingDays.includes(filters.missingDay)) {
      return false;
    }

    return true;
  });

  useEffect(() => {
    if (filteredRows.length === 0) {
      setSelectedParticipantId(null);
      return;
    }

    if (selectedParticipantId && !filteredRows.some((row) => row.participant.id === selectedParticipantId)) {
      setSelectedParticipantId(null);
    }
  }, [filteredRows, selectedParticipantId]);

  const selectedRow =
    filteredRows.find((row) => row.participant.id === selectedParticipantId) ??
    rows.find((row) => row.participant.id === selectedParticipantId) ??
    null;

  useEffect(() => {
    setForm(buildFormState(selectedRow?.participant ?? null));
    setSessionDraft(buildSessionDraft(selectedRow?.participant?.id ?? null, applications));
  }, [applications, selectedRow?.participant]);

  const lectureOptionsByDay = useMemo(() => {
    return DAY_ORDER.reduce<Record<DayKey, Lecture[]>>((acc, day) => {
      acc[day] = sortLecturesBySessionNo(lectures.filter((item) => item.day === day));
      return acc;
    }, {} as Record<DayKey, Lecture[]>);
  }, [lectures]);

  const visibleLectures = sortLecturesBySessionNo(
    filters.statsDay === 'all' ? lectures : lectures.filter((lecture) => lecture.day === filters.statsDay),
  );
  const lectureCountMap = getApplicationCountByLecture(applications);
  const lectureApplicantMap = useMemo(() => {
    return applications.reduce<Record<string, { first: Array<{ id: string; name: string; position: string; organization: string | null }>; second: Array<{ id: string; name: string; position: string; organization: string | null }> }>>((acc, application) => {
      const participant = participants.find((item) => item.id === application.participantId);

      if (!participant) {
        return acc;
      }

      const current = acc[application.lectureId] ?? { first: [], second: [] };
      const summary = {
        id: participant.id,
        name: participant.name,
        position: participant.position,
        organization: participant.organization ?? null,
      };

      if (application.timeSlot === '1타임') {
        current.first.push(summary);
      } else {
        current.second.push(summary);
      }

      acc[application.lectureId] = current;
      return acc;
    }, {});
  }, [applications, participants]);
  const totalParticipants = participants.length;
  const completedParticipants = rows.filter((row) => row.missingDays.length === 0).length;
  const incompleteParticipants = totalParticipants - completedParticipants;
  const completionRate = totalParticipants > 0 ? Math.round((completedParticipants / totalParticipants) * 1000) / 10 : 0;

  async function handleSave() {
    if (!selectedRow) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/participants/${selectedRow.participant.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          sessions: sessionDraft,
        }),
      });
      const payload = (await response.json()) as { message?: string; participant?: Participant; applications?: Application[] };

      if (!response.ok || !payload.participant) {
        throw new Error(payload.message ?? '참가자 정보 저장에 실패했습니다.');
      }

      setParticipants((current) =>
        current.map((participant) => (participant.id === payload.participant?.id ? payload.participant : participant)),
      );
      if (payload.applications) {
        setApplications(payload.applications);
      }
      setStatusMessage(payload.message ?? '참가자 정보를 저장했습니다.');
      setDetailOpen(false);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : '참가자 정보 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDownloadCsv() {
    setDownloading(true);

    try {
      const params = new URLSearchParams({
        q: filters.query,
        ticket: filters.ticket.join(','),
        completion: filters.completion === 'all' ? 'incomplete' : filters.completion,
        missingDay: filters.missingDay,
      });
      const response = await fetch(`/api/admin/export?${params.toString()}`);

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? 'CSV 다운로드에 실패했습니다.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'admin-missing-participants.csv';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      setStatusMessage('미신청자 명단 다운로드를 시작했습니다.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'CSV 다운로드에 실패했습니다.');
    } finally {
      setDownloading(false);
    }
  }

  function handleDayToggle(day: DayKey, checked: boolean) {
    setForm((current) => {
      const next = {
        ...current,
        [day === 'Day1' ? 'day1' : day === 'Day2' ? 'day2' : 'day3']: checked,
      };
      const ticketDays = DAY_ORDER.filter((item) => {
        if (item === 'Day1') {
          return item === day ? checked : next.day1;
        }

        if (item === 'Day2') {
          return item === day ? checked : next.day2;
        }

        return item === day ? checked : next.day3;
      });

      return {
        ...next,
        ticketInfo: ticketDays.join(' '),
      };
    });

    if (!checked) {
      setSessionDraft((current) => ({
        ...current,
        [day]: {
          '1타임': '',
          '2타임': '',
        },
      }));
    }
  }

  function handleSessionChange(day: DayKey, timeSlot: TimeSlot, lectureId: string) {
    setSessionDraft((current) => ({
      ...current,
      [day]: {
        ...current[day],
        [timeSlot]: lectureId,
      },
    }));
  }

  return (
    <main className="min-h-screen bg-[#f5f4ef]">
      <div className="grid min-h-screen lg:grid-cols-[226px_minmax(0,1fr)]">
        <aside className="flex flex-col bg-[#303233] text-white">
          <div className="px-5 pb-6 pt-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3c94c] text-lg font-bold text-[#574300]">
                M
              </div>
              <div>
                <p className="text-[0.95rem] font-bold tracking-[0.03em] text-[#b89100]">MANNA IC 2026</p>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <SidebarItem active={section === 'participants'} label="참가자 관리" onClick={() => setSection('participants')} />
            <SidebarItem active={section === 'sessions'} label="세션 통계" onClick={() => setSection('sessions')} />
          </div>

          <div className="mt-auto border-t border-white/10 px-4 py-5">
            <div className="space-y-1">
              <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] text-white/84">
                <span>↪</span>
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="space-y-6 px-7 py-7">
            {statusMessage ? <Notice>{statusMessage}</Notice> : null}

            {section === 'participants' ? (
              <>
                <section className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h1 className="text-[2.35rem] font-semibold leading-[0.95] tracking-[-0.07em] text-[#232425]">참가자 관리</h1>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    disabled={downloading}
                    className="rounded-[8px] border border-[#d8d4ca] bg-white px-4 py-3 text-[15px] font-medium text-[#232425] disabled:opacity-60"
                  >
                    {downloading ? '다운로드 준비 중...' : '미신청자 명단 다운로드'}
                  </button>
                </section>

                <section className="space-y-4">
                  <div className="space-y-4 rounded-[18px] border border-[#e8dfcc] bg-[rgba(255,255,255,0.72)] px-4 py-4 shadow-[0_14px_30px_rgba(160,132,52,0.06)]">
                    <SearchBar value={filters.query} onChange={(value) => setFilters((current) => ({ ...current, query: value }))} />
                    <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
                      <MultiDayChipGroup
                        label="티켓"
                        value={filters.ticket}
                        onChange={(value) => setFilters((current) => ({ ...current, ticket: value }))}
                      />
                      <ToggleChipGroup
                        label="선택세션 상태"
                        value={filters.completion}
                        options={completionFilterOptions}
                        onChange={(value) => setFilters((current) => ({ ...current, completion: value }))}
                      />
                    </div>
                  </div>

                  <AdminParticipantTable
                    rows={filteredRows}
                    selectedParticipantId={selectedParticipantId}
                    onSelect={(participantId) => {
                      setSelectedParticipantId(participantId);
                      setDetailOpen(true);
                    }}
                  />
                  <AdminParticipantDetailPanel
                    participant={selectedRow?.participant ?? null}
                    form={form}
                    sessionDraft={sessionDraft}
                    lectureOptionsByDay={lectureOptionsByDay}
                    saving={saving}
                    open={detailOpen}
                    onClose={() => setDetailOpen(false)}
                    onDayToggle={handleDayToggle}
                    onSessionChange={handleSessionChange}
                    onSave={handleSave}
                  />
                </section>
              </>
            ) : null}

            {section === 'sessions' ? (
              <>
                <section>
                  <h1 className="text-[2.15rem] font-semibold tracking-[-0.06em] text-[#232425]">선택세션 통계 KPI카드</h1>
                </section>

                <div className="grid gap-5 xl:grid-cols-4">
                  <MetricCard label="전체 참가자 수" value={`${totalParticipants}명`} />
                  <MetricCard
                    label="신청 완료 인원"
                    value={`${completedParticipants}명`}
                    detail={`전체 ${totalParticipants}명 중 ${completedParticipants}명`}
                  />
                  <MetricCard
                    label="미신청 인원"
                    value={`${incompleteParticipants}명`}
                    detail={`전체 ${totalParticipants}명 중 ${incompleteParticipants}명`}
                  />
                  <MetricCard label="신청 완료율" value={`${completionRate}%`} />
                </div>

                <section className="space-y-5">
                  <div>
                    <h2 className="text-[2.15rem] font-semibold tracking-[-0.06em] text-[#232425]">선택 세션 참가자 현황</h2>
                    <p className="mt-2 text-[14px] text-[#8a7d72]">선택 세션을 클릭하면 신청자 확인이 가능합니다.</p>
                  </div>

                  <div className="flex justify-end">
                    <select
                      value={filters.statsDay}
                      onChange={(event) => setFilters((current) => ({ ...current, statsDay: event.target.value as FilterState['statsDay'] }))}
                      className="rounded-[10px] border border-[#d8d4ca] bg-white px-4 py-3 text-[15px] outline-none"
                    >
                      <option value="all">전체 날짜</option>
                      {DAY_ORDER.map((day) => (
                        <option key={day} value={day}>{SESSION_DAY_LABELS[day]}</option>
                      ))}
                    </select>
                  </div>

                  <AdminSessionStats
                    lectures={visibleLectures}
                    countMap={lectureCountMap}
                    applicantMap={lectureApplicantMap}
                  />
                </section>
              </>
            ) : null}

            {loading ? (
              <div className="rounded-[10px] border border-[#ddd7cc] bg-white px-5 py-6 text-[15px] text-[#6f6258]">
                데이터를 불러오는 중입니다.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
