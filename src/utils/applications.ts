import type { Application, DayKey, LectureWithSlot, Participant, TimeSlot } from '@/types';
import { DAY_ORDER } from './tickets';

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

export function getUnsubmittedParticipants(sourceParticipants: Participant[], applications: Application[]) {
  const submittedIds = getSubmittedParticipantIds(applications);

  return sourceParticipants.filter(
    (participant) =>
      !participant.position.trim().toLowerCase().includes('admin') && !submittedIds.has(participant.id),
  );
}
