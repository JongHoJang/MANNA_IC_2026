import type { Lecture, LectureWithSlot, TimeSlot } from '@/types';
import { DAY_ORDER } from './tickets';

export const TIME_SLOTS: TimeSlot[] = ['1타임', '2타임'];
export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  '1타임': '첫번째 선택세션',
  '2타임': '두번째 선택세션',
};

export function sortLecturesBySessionNo<T extends Lecture>(lectures: T[]) {
  return [...lectures].sort((a, b) => {
    const left = a.sessionNo ?? Number.MAX_SAFE_INTEGER;
    const right = b.sessionNo ?? Number.MAX_SAFE_INTEGER;

    if (left !== right) {
      return left - right;
    }

    return a.title.localeCompare(b.title, 'ko');
  });
}

function splitMetaParts(value: string | null | undefined) {
  return (value ?? '')
    .split('/')
    .map((part) => part.trim())
    .filter((part) => Boolean(part) && part !== '비었음');
}

export function formatLectureSpeakerMeta(speaker: string | null | undefined, position?: string | null) {
  const speakers = splitMetaParts(speaker);
  const positions = splitMetaParts(position);

  if (speakers.length === 0) {
    return '';
  }

  return speakers
    .map((speakerItem, index) => {
      const positionItem = positions[index];
      return positionItem ? `${speakerItem}(${positionItem})` : speakerItem;
    })
    .join(', ');
}

function normalizeParticipantPosition(position: string | null | undefined) {
  return (position ?? '').replace(/\s+/g, '');
}

function normalizeLectureTitle(title: string | null | undefined) {
  return (title ?? '').replace(/\s+/g, '');
}

export function isLectureFirstSlotOnly(lecture: Lecture) {
  const normalizedTitle = normalizeLectureTitle(lecture.title);
  return normalizedTitle.includes('커피챗');
}

export function getLectureTimeSlotRestrictionMessage(lecture: Lecture, timeSlot: TimeSlot) {
  if (isLectureFirstSlotOnly(lecture) && timeSlot !== '1타임') {
    return '이 세션은 첫번째 선택세션에서만 선택할 수 있습니다.';
  }

  return null;
}

export function getLectureEligibilityMessage(lecture: Lecture, participantPosition: string | null | undefined) {
  const normalizedTitle = normalizeLectureTitle(lecture.title);
  const normalizedPosition = normalizeParticipantPosition(participantPosition);

  if (normalizedTitle.includes('목사님출입금지')) {
    return normalizedPosition === '사모' ? null : '사모만 신청할 수 있는 세션입니다.';
  }

  if (normalizedTitle.includes('커피챗')) {
    return normalizedPosition === '신학생' ? null : '신학생만 신청할 수 있는 세션입니다.';
  }

  return null;
}

export function decorateLectures(rawLectures: Lecture[]): LectureWithSlot[] {
  return DAY_ORDER.flatMap((day) => {
    const dayLectures = sortLecturesBySessionNo(rawLectures.filter((lecture) => lecture.day === day));
    const fallbackPivot = Math.ceil(dayLectures.length / 2);

    return dayLectures.map((lecture, index) => {
      const slotOrder = lecture.slotOrder ?? (index < fallbackPivot ? 1 : 2);
      const normalizedOrder = slotOrder === 1 ? 1 : 2;

      return {
        ...lecture,
        slotOrder: normalizedOrder,
        timeSlot: TIME_SLOTS[normalizedOrder - 1],
      };
    });
  });
}

export function getLecturesByDay(rawLectures: Lecture[]) {
  const decorated = decorateLectures(rawLectures);

  return DAY_ORDER.map((day) => {
    const dayLectures = sortLecturesBySessionNo(decorated.filter((lecture) => lecture.day === day));
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

export function isLectureFull(lecture: Lecture, applicationCount: number) {
  if (!lecture.capacity || lecture.capacity <= 0) {
    return false;
  }

  return applicationCount >= lecture.capacity;
}

export function getLectureCapacityLabel(lecture: Lecture, applicationCount: number) {
  if (!lecture.capacity || lecture.capacity <= 0) {
    return null;
  }

  return `${applicationCount}/${lecture.capacity}`;
}
