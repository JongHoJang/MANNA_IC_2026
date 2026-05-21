import { applications as mockApplications, lectures as mockLectures, participants as mockParticipants, timetableDays as mockTimetableDays } from '@/mocks';
import type { Application, DayKey, Lecture, Participant, TimetableDay, TimeSlot } from '@/types';
import { createSession, findParticipantById, findParticipantByLogin, getRoleForParticipant } from '@/utils/session';
import { findLectureById, getLectureEligibilityMessage, isLectureFull } from '@/utils/lectures';
import { createSupabaseServerClient, hasSupabaseServerEnv } from '@/lib/supabase/server';

type BootstrapData = {
  participants: Participant[];
  lectures: Lecture[];
  applications: Application[];
  timetableDays: TimetableDay[];
};

export type PublicBootstrapData = {
  lectures: Lecture[];
  timetableDays: TimetableDay[];
  lectureApplicationCountMap: Record<string, number>;
};

export type ParticipantStateData = {
  participant: Participant;
  applications: Application[];
};

type ParticipantRecord = {
  id: string;
  name: string;
  phone: string;
  is_active?: boolean | null;
  position: string | null;
  email?: string | null;
  organization?: string | null;
  is_admin?: boolean | null;
  ticket_info: string | null;
  day1: boolean | null;
  day2: boolean | null;
  day3: boolean | null;
};

type LectureRecord = {
  id: string;
  day: DayKey;
  session_no?: number | null;
  title: string | null;
  speaker: string | null;
  position?: string | null;
  location: string | null;
  capacity?: number | null;
  date?: string | Date | null;
  slot_order?: number | null;
};

type TimetableRowRecord = {
  day: DayKey;
  sort_order: number;
  time: string | null;
  label: string | null;
  title: string | null;
  speaker?: string | null;
  position?: string | null;
  location: string | null;
};

type RegistrationRecord = {
  id: string;
  participant_id: string;
  day: DayKey;
  slot_order: number;
  lecture_id: string;
};

type ParticipantUpdateInput = {
  name: string;
  phone: string;
  position: string;
  ticketInfo: string;
  email: string | null;
  organization: string | null;
  day1: boolean;
  day2: boolean;
  day3: boolean;
  sessions: ParticipantSessionSelectionInput[];
};

type ParticipantSessionSelectionInput = {
  day: DayKey;
  timeSlot: TimeSlot;
  lectureId: string | null;
};

type ParticipantUpdateResult = {
  participant: Participant;
  applications: Application[];
};

export type AdminExportRow = {
  name: string;
  phone: string;
  email: string | null;
  organization: string | null;
  position: string;
  ticketInfo: string;
  missingDays: DayKey[];
};

type ParticipantLoginRpcRow = {
  id: string;
  name: string;
  phone: string;
  is_active?: boolean | null;
  position: string | null;
  email?: string | null;
  organization?: string | null;
  is_admin?: boolean | null;
  ticket_info: string | null;
  day1: boolean | null;
  day2: boolean | null;
  day3: boolean | null;
};

type ApplyLectureSelectionRpcRow = {
  success: boolean;
  message: string;
};

type LectureApplicationCountRpcRow = {
  lecture_id: string;
  count: number | string;
};

function getMockBootstrapData(): BootstrapData {
  return {
    participants: mockParticipants,
    lectures: mockLectures,
    applications: mockApplications,
    timetableDays: mockTimetableDays,
  };
}

function getMockPublicBootstrapData(): PublicBootstrapData {
  const bootstrapData = getMockBootstrapData();

  return {
    lectures: bootstrapData.lectures,
    timetableDays: bootstrapData.timetableDays,
    lectureApplicationCountMap: buildLectureApplicationCountMap(bootstrapData.applications),
  };
}

function getMockParticipantState(participantId: string): ParticipantStateData | null {
  const bootstrapData = getMockBootstrapData();
  const participant = findParticipantById(participantId, bootstrapData.participants);

  if (!participant) {
    return null;
  }

  return {
    participant,
    applications: bootstrapData.applications.filter((application) => application.participantId === participantId),
  };
}

function getMockLoginResult(name: string, phone: string) {
  const participant = findParticipantByLogin(name, phone, mockParticipants);

  if (!participant) {
    return null;
  }

  return {
    participant,
    session: createSession(participant),
    applications: mockApplications.filter((application) => application.participantId === participant.id),
  };
}

function getMockUpsertApplications(input: {
  participantId: string;
  day: DayKey;
  timeSlot: TimeSlot;
  lectureId: string;
}, bootstrapData: BootstrapData) {
  return [
    ...bootstrapData.applications.filter(
      (application) =>
        !(
          application.participantId === input.participantId &&
          application.day === input.day &&
          application.timeSlot === input.timeSlot
        ),
    ),
    {
      id: createApplicationId(),
      participantId: input.participantId,
      day: input.day,
      timeSlot: input.timeSlot,
      lectureId: input.lectureId,
    },
  ];
}

function getMockSessionSelectionApplications(
  participantId: string,
  selections: ParticipantSessionSelectionInput[],
  bootstrapData: BootstrapData,
) {
  const retained = bootstrapData.applications.filter((application) => {
    if (application.participantId !== participantId) {
      return true;
    }

    return !selections.some((selection) => selection.day === application.day && selection.timeSlot === application.timeSlot);
  });

  const selectedApplications = selections
    .filter((selection) => selection.lectureId)
    .map((selection) => ({
      id: retained.find(
        (application) =>
          application.participantId === participantId &&
          application.day === selection.day &&
          application.timeSlot === selection.timeSlot,
      )?.id ?? createApplicationId(),
      participantId,
      day: selection.day,
      timeSlot: selection.timeSlot,
      lectureId: selection.lectureId as string,
    }));

  return [...retained, ...selectedApplications];
}

function validateParticipantSessionSelections(
  bootstrapData: BootstrapData,
  participantId: string,
  selections: ParticipantSessionSelectionInput[],
  participantPosition?: string | null,
) {
  const participant = findParticipantById(participantId, bootstrapData.participants);
  const effectiveParticipantPosition = participantPosition ?? participant?.position ?? '';

  for (const selection of selections) {
    if (!selection.lectureId) {
      continue;
    }

    const lecture = findLectureById(selection.lectureId, bootstrapData.lectures);

    if (!lecture) {
      return '선택한 세션 정보를 찾을 수 없습니다.';
    }

    if (lecture.day !== selection.day) {
      return '선택한 날짜와 세션 날짜가 일치하지 않습니다.';
    }

    const eligibilityMessage = getLectureEligibilityMessage(lecture, effectiveParticipantPosition);

    if (eligibilityMessage) {
      return eligibilityMessage;
    }

    const duplicateLecture = bootstrapData.applications.find(
      (application) =>
        application.participantId === participantId &&
        application.day === selection.day &&
        application.lectureId === selection.lectureId &&
        application.timeSlot !== selection.timeSlot,
    );

    if (duplicateLecture) {
      return '같은 세션을 다른 슬롯에 중복으로 선택할 수 없습니다.';
    }

    const applicationCount = bootstrapData.applications.filter(
      (application) =>
        application.lectureId === selection.lectureId &&
        !(application.participantId === participantId && application.day === selection.day && application.timeSlot === selection.timeSlot),
    ).length;

    if (!isLectureFull(lecture, applicationCount)) {
      continue;
    }

    const existing = bootstrapData.applications.find(
      (application) =>
        application.participantId === participantId &&
        application.day === selection.day &&
        application.timeSlot === selection.timeSlot,
    );

    if (existing?.lectureId === selection.lectureId) {
      continue;
    }

    return '정원이 모두 찬 세션입니다. 다른 세션을 선택해 주세요.';
  }

  return null;
}

const DAY_DATE_MAP: Record<DayKey, string> = {
  Day1: '2026-06-23',
  Day2: '2026-06-24',
  Day3: '2026-06-25',
};

const DAY_TITLE_MAP: Record<DayKey, string> = {
  Day1: 'Day.1 비었음',
  Day2: 'Day.2 비었음',
  Day3: 'Day.3 비었음',
};

const DEFAULT_DAY_TITLES: Record<DayKey, string> = {
  Day1: 'Day.1 다시, 목회철학',
  Day2: 'Day.2 이제, 다음시대',
  Day3: 'Day.3 결국, 예배',
};

function buildTicketText(participant: ParticipantRecord) {
  if (participant.ticket_info?.trim()) {
    return participant.ticket_info.trim();
  }

  return [
    participant.day1 ? 'Day1' : null,
    participant.day2 ? 'Day2' : null,
    participant.day3 ? 'Day3' : null,
  ]
    .filter(Boolean)
    .join(' ');
}

function mapParticipantRecord(participant: ParticipantRecord): Participant {
  return {
    id: participant.id,
    name: participant.name,
    phone: participant.phone,
    isActive: participant.is_active ?? true,
    ticketText: buildTicketText(participant) || '비었음',
    ticketInfo: participant.ticket_info?.trim() || null,
    position: participant.is_admin ? 'Admin' : participant.position?.trim() || '비었음',
    email: participant.email?.trim() || null,
    organization: participant.organization?.trim() || null,
    day1: Boolean(participant.day1),
    day2: Boolean(participant.day2),
    day3: Boolean(participant.day3),
    isAdmin: Boolean(participant.is_admin),
  };
}

function mapLectureRecord(lecture: LectureRecord): Lecture {
  return {
    id: lecture.id,
    day: lecture.day,
    sessionNo: lecture.session_no ?? null,
    date: normalizeDbDate(lecture.date, DAY_DATE_MAP[lecture.day as DayKey] || '비었음'),
    title: lecture.title?.trim() || '비었음',
    speaker: lecture.speaker?.trim() || '비었음',
    position: lecture.position?.trim() || '비었음',
    location: lecture.location?.trim() || '비었음',
    capacity: lecture.capacity ?? null,
    slotOrder: lecture.slot_order ?? null,
  };
}

function mapRegistrationRecord(application: RegistrationRecord): Application {
  return {
    id: application.id,
    participantId: application.participant_id,
    day: application.day,
    timeSlot: slotOrderToTimeSlot(application.slot_order),
    lectureId: application.lecture_id,
  };
}

function buildLectureApplicationCountMap(applications: Application[]) {
  return applications.reduce<Record<string, number>>((counts, application) => {
    counts[application.lectureId] = (counts[application.lectureId] ?? 0) + 1;
    return counts;
  }, {});
}

function slotOrderToTimeSlot(slotOrder: number): TimeSlot {
  return slotOrder === 1 ? '1타임' : '2타임';
}

function normalizeDbDate(value: string | Date | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  if (typeof value === 'string') {
    return value.trim() || fallback;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  return fallback;
}

function formatDayDate(day: DayKey) {
  const [year, month, date] = DAY_DATE_MAP[day].split('-');
  return `${year}년 ${Number(month)}월 ${Number(date)}일`;
}

function mapTimetableRows(records: TimetableRowRecord[]): TimetableDay[] {
  const rowsByDay = new Map<DayKey, TimetableRowRecord[]>();

  for (const record of records) {
    const current = rowsByDay.get(record.day) ?? [];
    current.push(record);
    rowsByDay.set(record.day, current);
  }

  return (['Day1', 'Day2', 'Day3'] as DayKey[]).map((day) => {
    const rows = (rowsByDay.get(day) ?? []).sort((a, b) => a.sort_order - b.sort_order);

    return {
      day,
      title: DEFAULT_DAY_TITLES[day],
      date: formatDayDate(day),
      rows:
        rows.length > 0
          ? rows.map((row) => ({
              time: row.time?.trim() || '비었음',
              label: row.label?.trim() || '비었음',
              title: row.title?.trim() || '비었음',
              speaker: row.speaker?.trim() || '비었음',
              position: row.position?.trim() || '비었음',
              place: row.location?.trim() || '비었음',
            }))
          : [
              {
                time: '비었음',
                label: '비었음',
                title: '비었음',
                speaker: '비었음',
                position: '비었음',
                place: '비었음',
              },
            ],
    };
  });
}

function buildEmptyTimetableDays(): TimetableDay[] {
  return (['Day1', 'Day2', 'Day3'] as DayKey[]).map((day) => ({
    day,
    title: DAY_TITLE_MAP[day],
    date: '비었음',
    rows: [
      {
        time: '비었음',
        label: '비었음',
        title: '비었음',
        speaker: '비었음',
        position: '비었음',
        place: '비었음',
      },
    ],
  }));
}

async function loadLectureRecordsAndTimetable() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  const [lecturesResult, timetableRowsResult] = await Promise.all([
    supabase.from('lectures').select('id, day, session_no, title, speaker, position, location, capacity, date, slot_order').order('created_at'),
    supabase.from('timetable_rows').select('day, sort_order, time, label, title, speaker, position, location').order('sort_order'),
  ]);

  const timetableRowsMissing =
    timetableRowsResult.error?.message?.toLowerCase().includes('relation') ||
    timetableRowsResult.error?.message?.toLowerCase().includes('does not exist');

  if (lecturesResult.error || (timetableRowsResult.error && !timetableRowsMissing)) {
    throw new Error(lecturesResult.error?.message || timetableRowsResult.error?.message || 'Supabase lecture load failed');
  }

  return {
    lectures: ((lecturesResult.data ?? []) as LectureRecord[]).map(mapLectureRecord),
    timetableDays: timetableRowsMissing
      ? buildEmptyTimetableDays()
      : mapTimetableRows((timetableRowsResult.data ?? []) as TimetableRowRecord[]),
  };
}

async function loadApplicationRecords(participantId?: string) {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  let query = supabase.from('registrations').select('id, participant_id, day, slot_order, lecture_id').order('created_at');

  if (participantId) {
    query = query.eq('participant_id', participantId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as RegistrationRecord[]).map(mapRegistrationRecord);
}

async function loadParticipantById(participantId: string) {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  const { data, error } = await supabase
    .from('participants')
    .select('id, name, phone, is_active, position, email, organization, is_admin, ticket_info, day1, day2, day3')
    .eq('id', participantId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapParticipantRecord(data as ParticipantRecord) : null;
}

async function loadLectureApplicationCountMap() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  const { data, error } = await supabase.rpc('get_lecture_application_counts');

  if (!error) {
    return ((data ?? []) as LectureApplicationCountRpcRow[]).reduce<Record<string, number>>((counts, row) => {
      counts[row.lecture_id] = typeof row.count === 'number' ? row.count : Number(row.count);
      return counts;
    }, {});
  }

  const shouldFallback =
    error.message?.toLowerCase().includes('could not find the function') ||
    error.message?.toLowerCase().includes('function public.get_lecture_application_counts');

  if (!shouldFallback) {
    throw new Error(error.message);
  }

  const applications = await loadApplicationRecords();
  return buildLectureApplicationCountMap(applications);
}

function buildParticipantUpdatePayload(input: ParticipantUpdateInput) {
  return {
    name: input.name.trim(),
    phone: input.phone.trim(),
    position: input.position.trim() || null,
    ticket_info: input.ticketInfo.trim() || null,
    email: input.email?.trim() || null,
    organization: input.organization?.trim() || null,
    day1: input.day1,
    day2: input.day2,
    day3: input.day3,
  };
}

export async function loadBootstrapData(): Promise<BootstrapData> {
  if (!hasSupabaseServerEnv()) {
    return getMockBootstrapData();
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return getMockBootstrapData();
  }

  const [participantsResult, lectureData, applications] = await Promise.all([
    supabase.from('participants').select('id, name, phone, is_active, position, email, organization, is_admin, ticket_info, day1, day2, day3').order('created_at'),
    loadLectureRecordsAndTimetable(),
    loadApplicationRecords(),
  ]);

  if (participantsResult.error) {
    throw new Error(participantsResult.error.message);
  }

  return {
    participants: ((participantsResult.data ?? []) as ParticipantRecord[]).map(mapParticipantRecord),
    lectures: lectureData.lectures,
    applications,
    timetableDays: lectureData.timetableDays,
  };
}

export async function loadPublicBootstrapData(): Promise<PublicBootstrapData> {
  if (!hasSupabaseServerEnv()) {
    return getMockPublicBootstrapData();
  }

  const [lectureData, lectureApplicationCountMap] = await Promise.all([
    loadLectureRecordsAndTimetable(),
    loadLectureApplicationCountMap(),
  ]);

  return {
    lectures: lectureData.lectures,
    timetableDays: lectureData.timetableDays,
    lectureApplicationCountMap,
  };
}

export async function loadParticipantState(participantId: string): Promise<ParticipantStateData | null> {
  if (!hasSupabaseServerEnv()) {
    return getMockParticipantState(participantId);
  }

  const participant = await loadParticipantById(participantId);

  if (!participant) {
    return null;
  }

  const applications = await loadApplicationRecords(participantId);

  return {
    participant,
    applications,
  };
}

export async function loginWithParticipantNameAndPhone(name: string, phone: string) {
  if (!hasSupabaseServerEnv()) {
    return getMockLoginResult(name, phone);
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return getMockLoginResult(name, phone);
  }

  const { data, error } = await supabase.rpc('find_participant_by_name_phone', {
    p_name: name,
    p_phone: phone,
  });

  if (error) {
    throw new Error(error.message);
  }

  const participantRow = (data as ParticipantLoginRpcRow[] | null)?.[0];

  if (!participantRow) {
    return null;
  }

  const participant = mapParticipantRecord(participantRow);
  const applications = await loadApplicationRecords(participant.id);

  return {
    participant,
    session: createSession(participant),
    applications,
  };
}

function createApplicationId(useUuidOnly = false) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return useUuidOnly ? crypto.randomUUID() : `app-${crypto.randomUUID()}`;
  }

  const fallback = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  return useUuidOnly ? fallback : `app-${fallback}`;
}

export async function upsertLectureApplication(input: {
  participantId: string;
  day: DayKey;
  timeSlot: TimeSlot;
  lectureId: string;
}) {
  if (!hasSupabaseServerEnv()) {
    const bootstrapData = await loadBootstrapData();
    const nextApplications = getMockUpsertApplications(input, bootstrapData);

    return {
      success: true,
      message: `${input.day} ${input.timeSlot} 선택이 반영되었습니다.`,
      applications: nextApplications.filter((application) => application.participantId === input.participantId),
      lectureApplicationCountMap: buildLectureApplicationCountMap(nextApplications),
    };
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  const { data, error } = await supabase.rpc('apply_lecture_selection', {
    p_participant_id: input.participantId,
    p_day: input.day,
    p_slot_order: input.timeSlot === '1타임' ? 1 : 2,
    p_lecture_id: input.lectureId,
  });

  if (error) {
    throw new Error(error.message);
  }

  const outcome = (data as ApplyLectureSelectionRpcRow[] | null)?.[0];

  if (!outcome) {
    throw new Error('Lecture application RPC returned no result.');
  }

  if (!outcome.success) {
    return {
      success: false,
      message: outcome.message,
      applications: [],
      lectureApplicationCountMap: {},
    };
  }

  const [applications, lectureApplicationCountMap] = await Promise.all([
    loadApplicationRecords(input.participantId),
    loadLectureApplicationCountMap(),
  ]);

  return {
    success: true,
    message: outcome.message,
    applications,
    lectureApplicationCountMap,
  };
}

export async function loadAdminParticipantsData() {
  const bootstrapData = await loadBootstrapData();

  return {
    participants: bootstrapData.participants.filter((participant) => !participant.isAdmin && participant.isActive !== false),
    lectures: bootstrapData.lectures,
    applications: bootstrapData.applications,
  };
}

async function updateParticipantSessions(
  participantId: string,
  selections: ParticipantSessionSelectionInput[],
  bootstrapData: BootstrapData,
) {
  const nextApplications = getMockSessionSelectionApplications(participantId, selections, bootstrapData);

  if (!hasSupabaseServerEnv()) {
    mockApplications.splice(0, mockApplications.length, ...nextApplications);
    return nextApplications;
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  for (const selection of selections) {
    const { error: deleteError } = await supabase
      .from('registrations')
      .delete()
      .eq('participant_id', participantId)
      .eq('day', selection.day)
      .eq('slot_order', selection.timeSlot === '1타임' ? 1 : 2);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    if (!selection.lectureId) {
      continue;
    }

    const lecture = findLectureById(selection.lectureId, bootstrapData.lectures);

    if (!lecture) {
      continue;
    }

    const payload = {
      id: createApplicationId(true),
      participant_id: participantId,
      day: selection.day,
      slot_order: selection.timeSlot === '1타임' ? 1 : 2,
      lecture_id: selection.lectureId,
    };

    const { error } = await supabase.from('registrations').upsert(payload);

    if (error) {
      throw new Error(error.message);
    }
  }

  const refreshed = await loadBootstrapData();
  return refreshed.applications;
}

export async function updateAdminParticipant(participantId: string, input: ParticipantUpdateInput): Promise<ParticipantUpdateResult | null> {
  const bootstrapData = await loadBootstrapData();
  const validationError = validateParticipantSessionSelections(bootstrapData, participantId, input.sessions, input.position);

  if (validationError) {
    return null;
  }

  if (!hasSupabaseServerEnv()) {
    const target = mockParticipants.find((participant) => participant.id === participantId && !participant.isAdmin);

    if (!target) {
      return null;
    }

    target.name = input.name.trim();
    target.phone = input.phone.trim();
    target.position = input.position.trim() || '비었음';
    target.ticketInfo = input.ticketInfo.trim() || null;
    target.ticketText = input.ticketInfo.trim() || [input.day1 ? 'Day1' : null, input.day2 ? 'Day2' : null, input.day3 ? 'Day3' : null].filter(Boolean).join(' ');
    target.email = input.email?.trim() || null;
    target.organization = input.organization?.trim() || null;
    target.day1 = input.day1;
    target.day2 = input.day2;
    target.day3 = input.day3;

    const applications = await updateParticipantSessions(participantId, input.sessions, bootstrapData);

    return {
      participant: target,
      applications,
    };
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }

  const payload = buildParticipantUpdatePayload(input);
  const { data, error } = await supabase
    .from('participants')
    .update(payload)
    .eq('id', participantId)
    .eq('is_admin', false)
    .select('id, name, phone, is_active, position, email, organization, is_admin, ticket_info, day1, day2, day3')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'participant update failed');
  }

  const participant = mapParticipantRecord(data as ParticipantRecord);
  const applications = await updateParticipantSessions(participantId, input.sessions, bootstrapData);

  return {
    participant,
    applications,
  };
}

export async function getAdminParticipant() {
  const bootstrapData = await loadBootstrapData();

  return bootstrapData.participants.find((participant) => getRoleForParticipant(participant) === 'admin');
}
