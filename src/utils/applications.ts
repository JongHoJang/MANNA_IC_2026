import type { Application, DayKey, LectureWithSlot, Participant, TimeSlot } from '@/types';
import { DAY_ORDER, getPurchasedDays } from './tickets';

export type ApplicationDraft = Omit<Application, 'id'>;

function createApplicationId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `app-${crypto.randomUUID()}`;
  }

  return `app-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function getParticipantApplications(applications: Application[], participantId: string) {
  return applications.filter((application) => application.participantId === participantId);
}

export function getApplicationForSlot(
  applications: Application[],
  participantId: string,
  day: DayKey,
  timeSlot: TimeSlot,
) {
  return applications.find(
    (application) =>
      application.participantId === participantId &&
      application.day === day &&
      application.timeSlot === timeSlot,
  );
}

export function upsertApplication(applications: Application[], draft: ApplicationDraft) {
  const nextApplication: Application = {
    ...draft,
    id: createApplicationId(),
  };

  return [
    ...applications.filter(
      (application) =>
        !(
          application.participantId === draft.participantId &&
          application.day === draft.day &&
          application.timeSlot === draft.timeSlot
        ),
    ),
    nextApplication,
  ];
}

export function getApplicationCountByLecture(applications: Application[]) {
  return applications.reduce<Record<string, number>>((acc, application) => {
    acc[application.lectureId] = (acc[application.lectureId] ?? 0) + 1;
    return acc;
  }, {});
}

export function getApplicationBreakdownByLecture(applications: Application[]) {
  return applications.reduce<Record<string, { first: number; second: number }>>((acc, application) => {
    const current = acc[application.lectureId] ?? { first: 0, second: 0 };

    if (application.timeSlot === '1타임') {
      current.first += 1;
    } else {
      current.second += 1;
    }

    acc[application.lectureId] = current;
    return acc;
  }, {});
}

export function getApplicationsByDayForParticipant(applications: Application[], participantId: string) {
  return DAY_ORDER.reduce<Record<DayKey, Application[]>>((acc, day) => {
    acc[day] = applications.filter(
      (application) => application.participantId === participantId && application.day === day,
    );
    return acc;
  }, {} as Record<DayKey, Application[]>);
}

export function getParticipantApplicationNames(
  applications: Application[],
  participants: Participant[],
  lecture: LectureWithSlot,
) {
  const ids = applications
    .filter((application) => application.lectureId === lecture.id)
    .map((application) => application.participantId);

  return participants.filter((participant) => ids.includes(participant.id)).map((participant) => participant.name);
}

export function getSubmittedParticipantIds(applications: Application[]) {
  return new Set(applications.map((application) => application.participantId));
}

export function getParticipantActiveDays(participant: Participant) {
  const days = DAY_ORDER.filter((day) => {
    if (day === 'Day1') {
      return participant.day1;
    }

    if (day === 'Day2') {
      return participant.day2;
    }

    return participant.day3;
  });

  return days.length > 0 ? days : getPurchasedDays(participant.ticketText);
}

export function getMissingDaysForParticipant(applications: Application[], participant: Participant) {
  const byDay = getApplicationsByDayForParticipant(applications, participant.id);

  return getParticipantActiveDays(participant).filter((day) => byDay[day].length < 2);
}

export function hasIncompleteSelections(applications: Application[], participant: Participant) {
  return getMissingDaysForParticipant(applications, participant).length > 0;
}

export function getUnsubmittedParticipants(sourceParticipants: Participant[], applications: Application[]) {
  return sourceParticipants.filter(
    (participant) => !participant.isAdmin && hasIncompleteSelections(applications, participant),
  );
}
