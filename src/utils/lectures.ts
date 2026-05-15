import type { DayKey, Lecture, LectureWithSlot, TimeSlot } from '@/types';
import { DAY_ORDER } from './tickets';

export const TIME_SLOTS: TimeSlot[] = ['1타임', '2타임'];

export function decorateLectures(rawLectures: Lecture[]): LectureWithSlot[] {
  const orderMap = new Map<DayKey, number>();

  return rawLectures.map((lecture) => {
    const nextOrder = (orderMap.get(lecture.day) ?? 0) + 1;
    orderMap.set(lecture.day, nextOrder);
    const timeSlot = TIME_SLOTS[nextOrder - 1] ?? '2타임';

    return {
      ...lecture,
      timeSlot,
    };
  });
}

export function getLecturesByDay(rawLectures: Lecture[]) {
  const decorated = decorateLectures(rawLectures);

  return DAY_ORDER.map((day) => {
    const dayLectures = decorated.filter((lecture) => lecture.day === day);
    return {
      day,
      date: dayLectures[0]?.date ?? '',
      lectures: dayLectures,
    };
  });
}

export function findLectureById(lectureId: string, rawLectures: Lecture[]) {
  return decorateLectures(rawLectures).find((lecture) => lecture.id === lectureId);
}

export function formatLectureLocation(lecture: Lecture, applicationCount?: number) {
  const normalizedLocation = normalizePlaceLabel(lecture.location);

  if (!lecture.capacity || lecture.capacity <= 0 || typeof applicationCount !== 'number') {
    return normalizedLocation;
  }

  return `${normalizedLocation} (${applicationCount}/${lecture.capacity})`;
}

export function normalizePlaceLabel(place: string | null | undefined) {
  const normalizedPlace = place?.trim();

  if (!normalizedPlace || normalizedPlace === '비었음') {
    return '장소 미정';
  }

  return normalizedPlace;
}
