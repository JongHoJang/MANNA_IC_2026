import type { DayKey } from '@/types';

export const DAY_ORDER: DayKey[] = ['Day1', 'Day2', 'Day3'];

export const DAY_LABELS: Record<DayKey, string> = {
  Day1: 'Day 1',
  Day2: 'Day 2',
  Day3: 'Day 3',
};

const DAY_TICKET_LABELS: Record<DayKey, string> = {
  Day1: 'Day1 (6/23 화)',
  Day2: 'Day2 (6/24 수)',
  Day3: 'Day3 (6/25 목)',
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

  return days.map((day) => DAY_LABELS[day]).join(' · ');
}

export function getPurchaseTicketSummary(ticketText: string) {
  const days = getPurchasedDays(ticketText);

  if (days.length === 0) {
    return '참가일 없음';
  }

  return `- ${days.map((day) => DAY_TICKET_LABELS[day]).join(' · ')}`;
}
