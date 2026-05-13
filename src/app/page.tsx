'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { DayKey, Lecture, TimeSlot } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { getPurchaseTicketSummary, getPurchasedDays, hasPurchasedDay } from '@/utils/tickets';
import { findParticipantById } from '@/utils/session';
import { LoadingShell } from '@/components/ui/LoadingShell';
import { Notice } from '@/components/ui/Notice';
import { BottomNav, type AppTab } from './_components/BottomNav';
import { formatCurrentTime } from './_components/home-helpers';
import { HomeLogin } from './_components/HomeLogin';
import { HomeTab } from './_components/HomeTab';
import { MyLecturesTab } from './_components/MyLecturesTab';
import { TimetableTab } from './_components/TimetableTab';
import { GuideTab } from './_components/GuideTab';

export default function HomePage() {
  const router = useRouter();
  const session = useAppStore((state) => state.session);
  const participants = useAppStore((state) => state.participants);
  const lectures = useAppStore((state) => state.lectures);
  const applications = useAppStore((state) => state.applications);
  const timetableDays = useAppStore((state) => state.timetableDays);
  const selectedDayByParticipantId = useAppStore((state) => state.selectedDayByParticipantId);
  const hydrated = useAppStore((state) => state.hydrated);
  const bootstrapLoaded = useAppStore((state) => state.bootstrapLoaded);
  const bootstrapError = useAppStore((state) => state.bootstrapError);
  const fetchBootstrap = useAppStore((state) => state.fetchBootstrap);
  const login = useAppStore((state) => state.login);
  const logout = useAppStore((state) => state.logout);
  const selectDay = useAppStore((state) => state.selectDay);
  const applyLecture = useAppStore((state) => state.applyLecture);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<DayKey>('Day1');
  const [activeTimetableDay, setActiveTimetableDay] = useState<DayKey>('Day2');
  const [activeLectureSlot, setActiveLectureSlot] = useState<TimeSlot>('1타임');
  const [currentTime, setCurrentTime] = useState(() => formatCurrentTime(new Date()));
  const [activeTab, setActiveTab] = useState<AppTab>('timetable');
  const didAutoOpenTimetable = useRef(false);
  const contentScrollRef = useRef<HTMLDivElement | null>(null);
  const lectureLookup = useMemo(
    () => new Map(lectures.map((lecture) => [lecture.id, lecture] as const)) as Map<string, Lecture>,
    [lectures],
  );
  const lectureApplicationCountMap = useMemo(
    () =>
      applications.reduce<Record<string, number>>((accumulator, application) => {
        accumulator[application.lectureId] = (accumulator[application.lectureId] ?? 0) + 1;
        return accumulator;
      }, {}),
    [applications],
  );

  useEffect(() => {
    if (hydrated && !bootstrapLoaded) {
      void fetchBootstrap();
    }
  }, [bootstrapLoaded, fetchBootstrap, hydrated]);

  useEffect(() => {
    if (session?.role === 'admin') {
      router.replace('/admin');
    }
  }, [router, session?.role]);

  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(formatCurrentTime(new Date()));
    };

    updateCurrentTime();
    const interval = window.setInterval(updateCurrentTime, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  const currentParticipant = session ? findParticipantById(session.participantId, participants) : undefined;
  const purchasedDays = useMemo(
    () => (currentParticipant ? getPurchasedDays(currentParticipant.ticketText) : []),
    [currentParticipant],
  );
  const selectedDay = currentParticipant
    ? selectedDayByParticipantId[currentParticipant.id] ?? purchasedDays[0] ?? 'Day1'
    : activeDay;
  const accessSummary = currentParticipant ? getPurchaseTicketSummary(currentParticipant.ticketText) : '';
  const activeTimetable = timetableDays.find((day) => day.day === activeTimetableDay) ?? timetableDays[0];
  const timetableApplications = useMemo(() => {
    if (!currentParticipant) {
      return [];
    }

    return applications
      .filter((application) => application.participantId === currentParticipant.id && application.day === activeTimetableDay)
      .map((application) => ({
        ...application,
        lecture: lectureLookup.get(application.lectureId),
      }))
      .filter((application): application is typeof application & { lecture: Lecture } => Boolean(application.lecture));
  }, [activeTimetableDay, applications, currentParticipant, lectureLookup]);

  useEffect(() => {
    if (!currentParticipant) {
      return;
    }

    if (!selectedDayByParticipantId[currentParticipant.id]) {
      selectDay(currentParticipant.id, purchasedDays[0] ?? 'Day1');
    }
  }, [currentParticipant, purchasedDays, selectDay, selectedDayByParticipantId]);

  useEffect(() => {
    if (!currentParticipant) {
      return;
    }

    setActiveDay(selectedDay);
  }, [currentParticipant, selectedDay]);

  useEffect(() => {
    if (currentParticipant && !didAutoOpenTimetable.current) {
      didAutoOpenTimetable.current = true;
      setActiveTab('my-lectures');
    }

    if (!currentParticipant) {
      didAutoOpenTimetable.current = false;
    }
  }, [currentParticipant]);

  useEffect(() => {
    contentScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeTab]);

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = await login(name, phone);

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    if (result.role === 'admin') {
      router.replace('/admin');
      return;
    }

    setName('');
    setPhone('');
    setActiveTab('my-lectures');
    didAutoOpenTimetable.current = true;
    setMessage(null);
  }

  function handleDaySelect(day: DayKey) {
    if (!currentParticipant) {
      setActiveDay(day);
      return;
    }

    if (!hasPurchasedDay(currentParticipant.ticketText, day)) {
      return;
    }

    selectDay(currentParticipant.id, day);
  }

  function handleGoToMyLectures(day: DayKey, slot: TimeSlot) {
    handleDaySelect(day);
    setActiveLectureSlot(slot);
    setActiveTab('my-lectures');
  }

  async function handleApply(day: DayKey, timeSlot: TimeSlot, lectureId: string) {
    if (!currentParticipant) {
      return false;
    }

    const result = await applyLecture(currentParticipant.id, day, timeSlot, lectureId);

    if (!result.success) {
      setMessage(result.message);
      return false;
    }

    setMessage(null);
    return true;
  }

  if (!hydrated || !bootstrapLoaded) {
    return <LoadingShell />;
  }

  if (bootstrapError) {
    return <LoadingShell message={bootstrapError} />;
  }

  if (session?.role === 'admin') {
    return <LoadingShell message="어드민 화면으로 이동 중입니다." />;
  }

  if (!currentParticipant) {
    return (
      <HomeLogin
        name={name}
        phone={phone}
        message={message}
        onNameChange={setName}
        onPhoneChange={setPhone}
        onSubmit={handleLoginSubmit}
      />
    );
  }

  return (
    <main className="mx-auto h-[100dvh] w-full max-w-[460px] bg-[color:var(--accent)] px-4 py-4">
      <section className="flex h-full min-h-0 flex-col bg-[color:var(--accent)]">
        <header className="flex items-center justify-between px-1 py-2">
          <button type="button" className="flex h-10 w-10 items-center justify-center" aria-label="메뉴">
            <span className="relative block h-4 w-5">
              <span className="absolute left-0 top-0 h-0.5 w-5 rounded-full bg-[color:var(--ink)]" />
              <span className="absolute left-0 top-1.5 h-0.5 w-5 rounded-full bg-[color:var(--ink)]" />
              <span className="absolute left-0 top-3 h-0.5 w-5 rounded-full bg-[color:var(--ink)]" />
            </span>
          </button>

          <p className="font-display text-lg font-semibold tracking-[0.08em] text-[color:var(--ink)]">MANNAIC 2026</p>

          <button
            type="button"
            onClick={() => {
              logout();
              setMessage(null);
              setActiveTab('my-lectures');
              didAutoOpenTimetable.current = false;
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--ink)]/40 bg-[color:var(--accent)] text-[color:var(--ink)]"
            aria-label="로그아웃"
          >
            <span className="block h-4 w-4 rounded-full border-2 border-[color:var(--ink)]" />
          </button>
        </header>

        <div
          ref={contentScrollRef}
          className="flex-1 min-h-0 space-y-6 overflow-y-auto px-1 py-3 pb-36"
          style={{ scrollbarGutter: 'stable' }}
        >
          {message ? <Notice>{message}</Notice> : null}
          {activeTab === 'home' ? <HomeTab currentParticipant={currentParticipant} /> : null}
          {activeTab === 'timetable' ? (
            <TimetableTab
              activeDay={activeTimetable}
              timetableDays={timetableDays}
              selectedDay={activeTimetableDay}
              currentTime={currentTime}
              timetableApplications={timetableApplications}
              purchasedDays={purchasedDays}
              lectureApplicationCountMap={lectureApplicationCountMap}
              onSelectDay={setActiveTimetableDay}
              onGoToMyLectures={handleGoToMyLectures}
            />
          ) : null}
          {activeTab === 'my-lectures' ? (
            <MyLecturesTab
              activeDay={selectedDay}
              activeSlot={activeLectureSlot}
              applications={applications}
              accessSummary={accessSummary}
              purchasedDays={purchasedDays}
              currentParticipant={currentParticipant}
              lectures={lectures}
              lectureLookup={lectureLookup}
              lectureApplicationCountMap={lectureApplicationCountMap}
              onSelectDay={handleDaySelect}
              onSelectSlot={setActiveLectureSlot}
              onApplyLecture={handleApply}
            />
          ) : null}
          {activeTab === 'guide' ? <GuideTab /> : null}
        </div>

        <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      </section>
    </main>
  );
}
