import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Participant } from '@/types';

export const ADMIN_SESSION_COOKIE = 'manna_ic_admin_session';

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || 'manna-ic-admin-session';
}

function signParticipantId(participantId: string) {
  return createHmac('sha256', getSecret()).update(participantId).digest('hex');
}

export function createAdminSessionToken(participantId: string) {
  return `${participantId}.${signParticipantId(participantId)}`;
}

export function readAdminSessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [participantId, signature] = token.split('.');

  if (!participantId || !signature) {
    return null;
  }

  const expected = signParticipantId(participantId);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) {
    return null;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer) ? participantId : null;
}

export function getAdminSessionTokenFromCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) {
    return undefined;
  }

  const cookie = cookieHeader
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${ADMIN_SESSION_COOKIE}=`));

  return cookie?.slice(`${ADMIN_SESSION_COOKIE}=`.length);
}

export function isAuthorizedAdmin(participant: Participant | undefined, token: string | undefined) {
  const participantId = readAdminSessionToken(token);

  if (!participantId || !participant) {
    return false;
  }

  return participant.isAdmin === true && participant.id === participantId;
}
