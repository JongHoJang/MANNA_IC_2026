export type DayKey = 'Day1' | 'Day2' | 'Day3';

export type TimeSlot = '1타임' | '2타임';

export type UserRole = 'user' | 'admin';

export interface Participant {
  id: string;
  name: string;
  phone: string;
  isActive?: boolean;
  ticketText: string;
  ticketInfo?: string | null;
  position: string;
  email?: string | null;
  organization?: string | null;
  day1?: boolean;
  day2?: boolean;
  day3?: boolean;
  isAdmin?: boolean;
}

export interface Lecture {
  id: string;
  day: DayKey;
  sessionNo?: number | null;
  date: string;
  title: string;
  speaker: string;
  position?: string;
  location: string;
  capacity?: number | null;
  slotOrder?: number | null;
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
  speaker?: string;
  position?: string;
  place: string;
}

export interface TimetableDay {
  day: DayKey;
  title: string;
  date: string;
  rows: TimetableRow[];
}
