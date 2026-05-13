import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { applications as seedApplications, lectures } from '@/mocks';
import type { AppSession, Application, DayKey, TimeSlot } from '@/types';
import { findLectureById } from '@/utils/lectures';
import { findParticipantById, findParticipantByLogin, createSession } from '@/utils/session';
import { hasPurchasedDay } from '@/utils/tickets';
import { upsertApplication } from '@/utils/applications';

interface AppStore {
  session: AppSession | null;
  applications: Application[];
  selectedDayByParticipantId: Record<string, DayKey>;
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  login: (name: string, phone: string) => {
    success: boolean;
    message: string;
    role?: AppSession['role'];
  };
  logout: () => void;
  selectDay: (participantId: string, day: DayKey) => void;
  applyLecture: (participantId: string, day: DayKey, timeSlot: TimeSlot, lectureId: string) => {
    success: boolean;
    message: string;
  };
  resetDemo: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      session: null,
      applications: seedApplications,
      selectedDayByParticipantId: {},
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      login: (name, phone) => {
        const participant = findParticipantByLogin(name, phone);

        if (!participant) {
          return {
            success: false,
            message: '등록된 이름과 휴대폰 번호를 찾지 못했습니다.',
          };
        }

        const session = createSession(participant);
        set({ session });

        return {
          success: true,
          message: `${participant.name} 님으로 로그인했습니다.`,
          role: session.role,
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
      applyLecture: (participantId, day, timeSlot, lectureId) => {
        const participant = findParticipantById(participantId);
        const lecture = findLectureById(lectureId, lectures);

        if (!participant || !lecture) {
          return {
            success: false,
            message: '신청 대상 정보를 찾을 수 없습니다.',
          };
        }

        if (lecture.day !== day) {
          return {
            success: false,
            message: '선택한 날짜와 강의 날짜가 일치하지 않습니다.',
          };
        }

        if (!hasPurchasedDay(participant.ticketText, day)) {
          return {
            success: false,
            message: '구매하지 않은 날짜는 신청할 수 없습니다.',
          };
        }

        const duplicateLecture = get().applications.find(
          (application) =>
            application.participantId === participantId &&
            application.day === day &&
            application.lectureId === lectureId &&
            application.timeSlot !== timeSlot,
        );

        if (duplicateLecture) {
          return {
            success: false,
            message: '같은 강의를 다른 슬롯에 중복으로 선택할 수 없습니다.',
          };
        }

        set((state) => ({
          applications: upsertApplication(state.applications, {
            participantId,
            day,
            timeSlot,
            lectureId: lecture.id,
          }),
        }));

        return {
          success: true,
          message: `${day} ${timeSlot} 선택이 반영되었습니다.`,
        };
      },
      resetDemo: () =>
        set({
          session: null,
          applications: seedApplications,
          selectedDayByParticipantId: {},
        }),
    }),
    {
      name: 'manna-ic-mock-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        session: state.session,
        applications: state.applications,
        selectedDayByParticipantId: state.selectedDayByParticipantId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
