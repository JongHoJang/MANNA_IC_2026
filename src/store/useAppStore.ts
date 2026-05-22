import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AppSession, Application, DayKey, Lecture, Participant, TimeSlot, TimetableDay } from '@/types';
import { hasPurchasedDay } from '@/utils/tickets';

interface AppStore {
  session: AppSession | null;
  currentParticipant: Participant | null;
  lectures: Lecture[];
  myApplications: Application[];
  timetableDays: TimetableDay[];
  lectureApplicationCountMap: Record<string, number>;
  lectureApplicationBreakdownMap: Record<string, { first: number; second: number }>;
  selectedDayByParticipantId: Record<string, DayKey>;
  hydrated: boolean;
  bootstrapLoaded: boolean;
  bootstrapError: string | null;
  setHydrated: (hydrated: boolean) => void;
  fetchBootstrap: () => Promise<void>;
  fetchParticipantState: (participantId: string) => Promise<void>;
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
      currentParticipant: null,
      lectures: [],
      myApplications: [],
      timetableDays: [],
      lectureApplicationCountMap: {},
      lectureApplicationBreakdownMap: {},
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
          lectures: payload.lectures,
          lectureApplicationCountMap: payload.lectureApplicationCountMap ?? {},
          lectureApplicationBreakdownMap: payload.lectureApplicationBreakdownMap ?? {},
          timetableDays: payload.timetableDays,
          bootstrapLoaded: true,
          bootstrapError: null,
        });
      },
      fetchParticipantState: async (participantId) => {
        const response = await fetch(`/api/participant-state?participantId=${encodeURIComponent(participantId)}`, {
          cache: 'no-store',
        });
        const payload = await response.json();

        if (!response.ok) {
          set({
            session: null,
            currentParticipant: null,
            myApplications: [],
          });
          return;
        }

        set({
          currentParticipant: payload.participant,
          myApplications: payload.applications ?? [],
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

        set({
          session: payload.session,
          currentParticipant: payload.participant,
          myApplications: payload.applications ?? [],
        });

        return {
          success: true,
          message: payload.message,
          role: payload.session.role,
        };
      },
      logout: () => set({ session: null, currentParticipant: null, myApplications: [] }),
      selectDay: (participantId, day) =>
        set((state) => ({
          selectedDayByParticipantId: {
            ...state.selectedDayByParticipantId,
            [participantId]: day,
          },
        })),
      applyLecture: async (participantId, day, timeSlot, lectureId) => {
        const participant = get().currentParticipant;
        const lecture = get().lectures.find((item) => item.id === lectureId);

        if (!participant || participant.id !== participantId || !lecture) {
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
          myApplications: payload.applications ?? [],
          lectureApplicationCountMap: payload.lectureApplicationCountMap ?? get().lectureApplicationCountMap,
          lectureApplicationBreakdownMap:
            payload.lectureApplicationBreakdownMap ?? get().lectureApplicationBreakdownMap,
        });

        return {
          success: true,
          message: payload.message,
        };
      },
      resetDemo: () =>
        set({
          session: null,
          currentParticipant: null,
          lectures: [],
          myApplications: [],
          timetableDays: [],
          lectureApplicationCountMap: {},
          lectureApplicationBreakdownMap: {},
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
