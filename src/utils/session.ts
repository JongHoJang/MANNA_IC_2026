import { participants } from '@/mocks';
import type { AppSession, Participant, UserRole } from '@/types';

export function normalizePhone(phone: string) {
  return phone.replace(/[^\d]/g, '');
}

export function isAdminParticipant(participant: Participant) {
  return participant.position.trim().toLowerCase().includes('admin');
}

export function getRoleForParticipant(participant: Participant): UserRole {
  return isAdminParticipant(participant) ? 'admin' : 'user';
}

export function findParticipantByLogin(name: string, phone: string) {
  const targetName = name.trim().replace(/\s+/g, '').toLowerCase();
  const targetPhone = normalizePhone(phone);

  return participants.find(
    (participant) =>
      participant.name.trim().replace(/\s+/g, '').toLowerCase() === targetName &&
      normalizePhone(participant.phone) === targetPhone,
  );
}

export function findParticipantById(participantId: string) {
  return participants.find((participant) => participant.id === participantId);
}

export function createSession(participant: Participant): AppSession {
  return {
    participantId: participant.id,
    role: getRoleForParticipant(participant),
  };
}
