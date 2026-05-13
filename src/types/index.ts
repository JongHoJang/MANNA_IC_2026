export type DayKey = 'Day1' | 'Day2' | 'Day3';

export type TimeSlot = '1타임' | '2타임';

export type UserRole = 'user' | 'admin';

export interface Participant {
  id: string;
  name: string;
  phone: string;
  ticketText: string;
  position: string;
}

export interface Lecture {
  id: string;
  day: DayKey;
  date: string;
  title: string;
  speaker: string;
  location: string;
}

export interface LectureWithSlot extends Lecture {
  timeSlot: TimeSlot;
}

export interface Application {
  id: string;
  participantId: string;
  day: DayKey;
  timeSlot: TimeSlot;
  lectureId: string;
}

export interface AppSession {
  participantId: string;
  role: UserRole;
}

export interface TimetableRow {
  time: string;
  label: string;
  title: string;
  place: string;
}

export interface TimetableDay {
  day: DayKey;
  title: string;
  date: string;
  rows: TimetableRow[];
}
