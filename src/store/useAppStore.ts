import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AppSession, Application, DayKey, Lecture, Participant, TimeSlot, TimetableDay } from '@/types';
import { findParticipantById } from '@/utils/session';
import { hasPurchasedDay } from '@/utils/tickets';

interface AppStore {
  session: AppSession | null;
  participants: Participant[];
  lectures: Lecture[];
  applications: Application[];
  timetableDays: TimetableDay[];
  selectedDayByParticipantId: Record<string, DayKey>;
  hydrated: boolean;
  bootstrapLoaded: boolean;
  bootstrapError: string | null;
  setHydrated: (hydrated: boolean) => void;
  fetchBootstrap: () => Promise<void>;
  login: (name: string, phone: string) => Promise<{
    success: boolean;
    message: string;
    role?: AppSession['role'];
  }>;
  logout: () => void;
  selectDay: (participantId: string, day: DayKey) => void;
  applyLecture: (participantId: string, day: DayKey, timeSlot: TimeSlot, lectureId: string) => Promise<{
    success: boolean;
    message: string;
  }>;
  resetDemo: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      session: null,
      participants: [],
      lectures: [],
      applications: [],
      timetableDays: [],
      selectedDayByParticipantId: {},
      hydrated: false,
      bootstrapLoaded: false,
      bootstrapError: null,
      setHydrated: (hydrated) => set({ hydrated }),
      fetchBootstrap: async () => {
        const response = await fetch('/api/bootstrap', {
          cache: 'no-store',
        });
        const payload = await response.json();

        if (!response.ok) {
          set({
            bootstrapLoaded: true,
            bootstrapError: payload.message ?? '데이터를 불러오지 못했습니다.',
          });
          return;
        }

        set({
          participants: payload.participants,
          lectures: payload.lectures,
          applications: payload.applications,
          timetableDays: payload.timetableDays,
          bootstrapLoaded: true,
          bootstrapError: null,
        });
      },
      login: async (name, phone) => {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, phone }),
        });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          return {
            success: false,
            message: payload.message ?? '로그인에 실패했습니다.',
          };
        }

        set((state) => ({
          session: payload.session,
          participants: state.participants.some((participant) => participant.id === payload.participant.id)
            ? state.participants
            : [...state.participants, payload.participant],
        }));

        return {
          success: true,
          message: payload.message,
          role: payload.session.role,
        };
      },
      logout: () => set({ session: null }),
      selectDay: (participantId, day) =>
        set((state) => ({
          selectedDayByParticipantId: {
            ...state.selectedDayByParticipantId,
            [participantId]: day,
          },
        })),
      applyLecture: async (participantId, day, timeSlot, lectureId) => {
        const participant = findParticipantById(participantId, get().participants);
        const lecture = get().lectures.find((item) => item.id === lectureId);

        if (!participant || !lecture) {
          return {
            success: false,
            message: '신청 대상 정보를 찾을 수 없습니다.',
          };
        }

        if (lecture.day !== day) {
          return {
            success: false,
            message: '선택한 날짜와 세션 날짜가 일치하지 않습니다.',
          };
        }

        if (!hasPurchasedDay(participant.ticketText, day)) {
          return {
            success: false,
            message: '구매하지 않은 날짜는 신청할 수 없습니다.',
          };
        }

        const response = await fetch('/api/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participantId,
            day,
            timeSlot,
            lectureId: lecture.id,
          }),
        });
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          return {
            success: false,
            message: payload.message ?? '세션 신청 저장에 실패했습니다.',
          };
        }

        set({
          applications: payload.applications,
        });

        return {
          success: true,
          message: payload.message,
        };
      },
      resetDemo: () =>
        set({
          session: null,
          participants: [],
          lectures: [],
          applications: [],
          timetableDays: [],
          selectedDayByParticipantId: {},
          bootstrapLoaded: false,
          bootstrapError: null,
        }),
    }),
    {
      name: 'manna-ic-mock-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        session: state.session,
        selectedDayByParticipantId: state.selectedDayByParticipantId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
