import { applications as mockApplications, lectures as mockLectures, participants as mockParticipants, timetableDays as mockTimetableDays } from '@/mocks';
import type { Application, DayKey, Lecture, Participant, TimetableDay, TimeSlot } from '@/types';
import { createSession, findParticipantById, findParticipantByLogin, getRoleForParticipant, normalizePhone } from '@/utils/session';
import { findLectureById, isLectureFull } from '@/utils/lectures';
import { createSupabaseServerClient, hasSupabaseServerEnv } from '@/lib/supabase/server';

type BootstrapData = {
  participants: Participant[];
  lectures: Lecture[];
  applications: Application[];
  timetableDays: TimetableDay[];
};

type ParticipantRecord = {
  id: string;
  name: string;
  phone: string;
  position: string | null;
  is_admin?: boolean | null;
  ticket_info: string | null;
  day1: boolean | null;
  day2: boolean | null;
  day3: boolean | null;
};

type LectureRecord = {
  id: string;
  day: DayKey;
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

function getMockBootstrapData(): BootstrapData {
  return {
    participants: mockParticipants,
    lectures: mockLectures,
    applications: mockApplications,
    timetableDays: mockTimetableDays,
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

export async function loadBootstrapData(): Promise<BootstrapData> {
  if (!hasSupabaseServerEnv()) {
    return getMockBootstrapData();
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return getMockBootstrapData();
  }

  try {
    const [participantsResult, lecturesResult, applicationsResult, timetableRowsResult] = await Promise.all([
      supabase.from('participants').select('id, name, phone, position, is_admin, ticket_info, day1, day2, day3').order('created_at'),
      supabase.from('lectures').select('id, day, title, speaker, position, location, capacity, date, slot_order').order('created_at'),
      supabase.from('registrations').select('id, participant_id, day, slot_order, lecture_id').order('created_at'),
      supabase.from('timetable_rows').select('day, sort_order, time, label, title, speaker, position, location').order('sort_order'),
    ]);

    const timetableRowsMissing =
      timetableRowsResult.error?.message?.toLowerCase().includes('relation') ||
      timetableRowsResult.error?.message?.toLowerCase().includes('does not exist');

    if (participantsResult.error || lecturesResult.error || applicationsResult.error || (timetableRowsResult.error && !timetableRowsMissing)) {
      throw new Error(
        participantsResult.error?.message ||
          lecturesResult.error?.message ||
          applicationsResult.error?.message ||
          timetableRowsResult.error?.message ||
          'Supabase bootstrap load failed',
      );
    }

    return {
      participants: ((participantsResult.data ?? []) as ParticipantRecord[]).map((participant) => ({
        id: participant.id,
        name: participant.name,
        phone: participant.phone,
        ticketText: buildTicketText(participant) || '비었음',
        position: participant.is_admin ? 'Admin' : participant.position?.trim() || '비었음',
      })),
      lectures: ((lecturesResult.data ?? []) as LectureRecord[]).map((lecture) => ({
        id: lecture.id,
        day: lecture.day,
        date: normalizeDbDate(lecture.date, DAY_DATE_MAP[lecture.day as DayKey] || '비었음'),
        title: lecture.title?.trim() || '비었음',
        speaker: lecture.speaker?.trim() || '비었음',
        position: lecture.position?.trim() || '비었음',
        location: lecture.location?.trim() || '비었음',
        capacity: lecture.capacity ?? null,
      })),
      applications: (applicationsResult.data ?? []).map((application) => ({
        id: application.id,
        participantId: application.participant_id,
        day: application.day,
        timeSlot: slotOrderToTimeSlot(application.slot_order),
        lectureId: application.lecture_id,
      })),
      timetableDays: timetableRowsMissing
        ? buildEmptyTimetableDays()
        : mapTimetableRows((timetableRowsResult.data ?? []) as TimetableRowRecord[]),
    };
  } catch {
    return getMockBootstrapData();
  }
}

export async function loginWithParticipantNameAndPhone(name: string, phone: string) {
  if (!hasSupabaseServerEnv()) {
    return getMockLoginResult(name, phone);
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return getMockLoginResult(name, phone);
  }

  try {
    const normalizedName = name.trim().replace(/\s+/g, '').toLowerCase();
    const normalizedPhone = normalizePhone(phone);
    const { data, error } = await supabase.from('participants').select('id, name, phone, position, ticket_info, day1, day2, day3');

    if (error) {
      throw new Error(error.message);
    }

    const participantRow = data?.find(
      (participant) =>
        participant.name.trim().replace(/\s+/g, '').toLowerCase() === normalizedName &&
        normalizePhone(participant.phone) === normalizedPhone,
    );

    if (!participantRow) {
      return null;
    }

    const participantRecord = participantRow as ParticipantRecord;
    const participant: Participant = {
      id: participantRow.id,
      name: participantRow.name,
      phone: participantRow.phone,
      ticketText: buildTicketText(participantRecord) || '비었음',
      position: participantRecord.is_admin ? 'Admin' : participantRow.position?.trim() || '비었음',
    };

    return {
      participant,
      session: createSession(participant),
    };
  } catch {
    return getMockLoginResult(name, phone);
  }
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
  const bootstrapData = await loadBootstrapData();
  const participant = findParticipantById(input.participantId, bootstrapData.participants);
  const lecture = findLectureById(input.lectureId, bootstrapData.lectures);

  if (!participant || !lecture) {
    return {
      success: false,
      message: '신청 대상 정보를 찾을 수 없습니다.',
      applications: bootstrapData.applications,
    };
  }

  if (lecture.day !== input.day) {
    return {
      success: false,
      message: '선택한 날짜와 세션 날짜가 일치하지 않습니다.',
      applications: bootstrapData.applications,
    };
  }

  const duplicateLecture = bootstrapData.applications.find(
    (application) =>
      application.participantId === input.participantId &&
      application.day === input.day &&
      application.lectureId === input.lectureId &&
      application.timeSlot !== input.timeSlot,
  );

  if (duplicateLecture) {
    return {
      success: false,
      message: '같은 세션을 다른 슬롯에 중복으로 선택할 수 없습니다.',
      applications: bootstrapData.applications,
    };
  }

  const applicationCount = bootstrapData.applications.filter((application) => application.lectureId === input.lectureId).length;
  const existing = bootstrapData.applications.find(
    (application) =>
      application.participantId === input.participantId &&
      application.day === input.day &&
      application.timeSlot === input.timeSlot,
  );
  const isKeepingCurrentLecture = existing?.lectureId === input.lectureId;

  if (!isKeepingCurrentLecture && isLectureFull(lecture, applicationCount)) {
    return {
      success: false,
      message: '정원이 모두 찬 세션입니다. 다른 세션을 선택해 주세요.',
      applications: bootstrapData.applications,
    };
  }

  if (!hasSupabaseServerEnv()) {
    const nextApplications = getMockUpsertApplications(input, bootstrapData);

    return {
      success: true,
      message: `${input.day} ${input.timeSlot} 선택이 반영되었습니다.`,
      applications: nextApplications,
    };
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    const nextApplications = getMockUpsertApplications(input, bootstrapData);

    return {
      success: true,
      message: `${input.day} ${input.timeSlot} 선택이 반영되었습니다.`,
      applications: nextApplications,
    };
  }

  const payload = {
    id: existing?.id ?? createApplicationId(true),
    participant_id: input.participantId,
    day: input.day,
    slot_order: input.timeSlot === '1타임' ? 1 : 2,
    lecture_id: input.lectureId,
  };

  try {
    const { error } = await supabase.from('registrations').upsert(payload);

    if (error) {
      throw new Error(error.message);
    }

    const refreshed = await loadBootstrapData();

    return {
      success: true,
      message: `${input.day} ${input.timeSlot} 선택이 반영되었습니다.`,
      applications: refreshed.applications,
    };
  } catch {
    const nextApplications = getMockUpsertApplications(input, bootstrapData);

    return {
      success: true,
      message: `${input.day} ${input.timeSlot} 선택이 반영되었습니다.`,
      applications: nextApplications,
    };
  }
}

export async function getAdminParticipant() {
  const bootstrapData = await loadBootstrapData();

  return bootstrapData.participants.find((participant) => getRoleForParticipant(participant) === 'admin');
}
