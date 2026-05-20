import type { DayKey } from '@/types';

export const DAY_ORDER: DayKey[] = ['Day1', 'Day2', 'Day3'];

export const DAY_LABELS: Record<DayKey, string> = {
  Day1: 'Day 1',
  Day2: 'Day 2',
  Day3: 'Day 3',
};

export const TICKET_DAY_LABELS: Record<DayKey, string> = {
  Day1: '티켓 Day1',
  Day2: '티켓 Day2',
  Day3: '티켓 Day3',
};

export const SESSION_DAY_LABELS: Record<DayKey, string> = {
  Day1: '선택세션 Day1',
  Day2: '선택세션 Day2',
  Day3: '선택세션 Day3',
};

export function getPurchasedDays(ticketText: string): DayKey[] {
  const normalized = ticketText.toLowerCase();
  return DAY_ORDER.filter((day) => normalized.includes(day.toLowerCase()));
}

export function hasPurchasedDay(ticketText: string, day: DayKey) {
  return getPurchasedDays(ticketText).includes(day);
}

export function getPurchaseSummary(ticketText: string) {
  const days = getPurchasedDays(ticketText);

  if (days.length === 0) {
    return '구매 정보 없음';
  }

  return days.map((day) => TICKET_DAY_LABELS[day]).join(' · ');
}

export function getPurchaseTicketSummary(ticketText: string) {
  const days = getPurchasedDays(ticketText);

  if (days.length === 0) {
    return '참가일 없음';
  }

  return `- ${days.map((day) => TICKET_DAY_LABELS[day]).join(' · ')}`;
}
