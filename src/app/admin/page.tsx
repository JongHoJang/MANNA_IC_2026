'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { LoadingShell } from '@/components/ui/LoadingShell';
import { AdminDashboard } from './_components/AdminDashboard';

export default function AdminPage() {
  const router = useRouter();
  const session = useAppStore((state) => state.session);
  const currentParticipant = useAppStore((state) => state.currentParticipant);
  const hydrated = useAppStore((state) => state.hydrated);
  const fetchParticipantState = useAppStore((state) => state.fetchParticipantState);
  const logout = useAppStore((state) => state.logout);

  useEffect(() => {
    if (!session || session.role === 'user') {
      router.replace('/');
    }
  }, [router, session]);

  useEffect(() => {
    if (!hydrated || !session?.participantId || currentParticipant?.id === session.participantId) {
      return;
    }

    void fetchParticipantState(session.participantId);
  }, [currentParticipant?.id, fetchParticipantState, hydrated, session?.participantId]);

  if (!hydrated) {
    return <LoadingShell outerClassName="min-h-screen max-w-6xl" />;
  }

  if (!session || session.role === 'user') {
    return <LoadingShell message="로그인 화면으로 이동 중입니다." outerClassName="min-h-screen max-w-6xl" />;
  }

  if (!currentParticipant) {
    return <LoadingShell message="어드민 정보를 불러오는 중입니다." outerClassName="min-h-screen max-w-6xl" />;
  }

  return (
    <AdminDashboard
      message={null}
      onLogout={async () => {
        await fetch('/api/admin/logout', {
          method: 'POST',
        });
        logout();
        router.replace('/');
      }}
    />
  );
}
