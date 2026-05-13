export function splitLectureHeading(title: string) {
  const [labelPart, ...rest] = title.split('.');
  const label = labelPart?.trim() ?? '';
  const titleText = rest.join('.').trim();

  return {
    label: label ? `${label}.` : '',
    title: titleText || title,
  };
}

export function isTimeInsideRange(currentTime: string, range: string) {
  const [start, end] = range.split(' - ');

  if (!start || !end) {
    return false;
  }

  const current = toMinutes(currentTime);
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);

  return current >= startMinutes && current < endMinutes;
}

export function formatCurrentTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function isBreakSession(label: string, title: string) {
  return ['점심 시간', '저녁 시간', '간식 및 이동 시간', '이동'].some(
    (keyword) => label.includes(keyword) || title.includes(keyword),
  );
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map((part) => Number.parseInt(part, 10));

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return -1;
  }

  return hours * 60 + minutes;
}
