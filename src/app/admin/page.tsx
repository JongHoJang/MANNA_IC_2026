'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { participants } from '@/mocks';
import type { DayKey } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { getUnsubmittedParticipants, getParticipantApplications } from '@/utils/applications';
import { findParticipantById, isAdminParticipant } from '@/utils/session';
import { LoadingShell } from '@/components/ui/LoadingShell';
import { AdminDashboard } from './_components/AdminDashboard';
import { AdminLogin } from './_components/AdminLogin';

export default function AdminPage() {
  const router = useRouter();
  const session = useAppStore((state) => state.session);
  const applications = useAppStore((state) => state.applications);
  const hydrated = useAppStore((state) => state.hydrated);
  const login = useAppStore((state) => state.login);
  const logout = useAppStore((state) => state.logout);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [dayFilter, setDayFilter] = useState<DayKey | 'all'>('all');

  useEffect(() => {
    if (session?.role === 'user') {
      router.replace('/');
    }
  }, [router, session?.role]);

  const currentParticipant = session ? findParticipantById(session.participantId) : undefined;
  const adminParticipant = participants.find(isAdminParticipant);
  const attendeeParticipants = participants.filter((participant) => !isAdminParticipant(participant));
  const submittedParticipants = attendeeParticipants.filter(
    (participant) => getParticipantApplications(applications, participant.id).length > 0,
  );
  const unsubmittedParticipants = getUnsubmittedParticipants(participants, applications);
  const attendeeApplicationTotal = applications.filter((application) =>
    attendeeParticipants.some((participant) => participant.id === application.participantId),
  ).length;

  function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = login(name, phone);
    setMessage(result.message);

    if (!result.success) {
      return;
    }

    if (result.role === 'user') {
      router.replace('/');
      return;
    }

    setName('');
    setPhone('');
  }

  if (!hydrated) {
    return <LoadingShell outerClassName="min-h-screen max-w-6xl" />;
  }

  if (session?.role === 'user') {
    return <LoadingShell message="사용자 화면으로 이동 중입니다." outerClassName="min-h-screen max-w-6xl" />;
  }

  if (!currentParticipant || !adminParticipant) {
    return (
      <AdminLogin
        name={name}
        phone={phone}
        message={message}
        adminParticipant={adminParticipant}
        onNameChange={setName}
        onPhoneChange={setPhone}
        onFillSample={() => {
          if (!adminParticipant) {
            return;
          }

          setName(adminParticipant.name);
          setPhone(adminParticipant.phone);
        }}
        onSubmit={handleLoginSubmit}
      />
    );
  }

  return (
    <AdminDashboard
      applications={applications}
      attendeeParticipants={attendeeParticipants}
      submittedParticipants={submittedParticipants}
      unsubmittedParticipants={unsubmittedParticipants}
      attendeeApplicationTotal={attendeeApplicationTotal}
      dayFilter={dayFilter}
      message={message}
      onDayFilterChange={setDayFilter}
      onLogout={() => {
        logout();
        setMessage('로그아웃했습니다.');
      }}
    />
  );
}
