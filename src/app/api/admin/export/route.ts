import { NextResponse } from 'next/server';
import { getAdminSessionTokenFromCookieHeader, isAuthorizedAdmin } from '@/lib/admin-session';
import { getAdminParticipant, loadAdminParticipantsData } from '@/lib/repositories/app-data';
import { getApplicationsByDayForParticipant, getMissingDaysForParticipant } from '@/utils/applications';
import type { DayKey } from '@/types';
import { DAY_ORDER, SESSION_DAY_LABELS } from '@/utils/tickets';

function parseCompletion(value: string | null) {
  if (value === 'complete' || value === 'incomplete') {
    return value;
  }

  return 'incomplete';
}

function parseDayFilter(value: string | null): DayKey | 'all' {
  if (value === 'Day1' || value === 'Day2' || value === 'Day3') {
    return value;
  }

  return 'all';
}

function parseDayFilters(value: string | null): DayKey[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item): item is DayKey => item === 'Day1' || item === 'Day2' || item === 'Day3');
}

export async function GET(request: Request) {
  try {
    const adminParticipant = await getAdminParticipant();
    const token = getAdminSessionTokenFromCookieHeader(request.headers.get('cookie'));

    if (!isAuthorizedAdmin(adminParticipant, token)) {
      return NextResponse.json(
        {
          message: '관리자 권한이 필요합니다.',
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim().toLowerCase() ?? '';
    const ticket = parseDayFilters(searchParams.get('ticket'));
    const completion = parseCompletion(searchParams.get('completion'));
    const missingDay = parseDayFilter(searchParams.get('missingDay'));
    const { participants, applications } = await loadAdminParticipantsData();

    const rows = participants.filter((participant) => {
      const haystack = [
        participant.name,
        participant.phone,
        participant.email ?? '',
        participant.organization ?? '',
      ]
        .join(' ')
        .toLowerCase();
      const missingDays = getMissingDaysForParticipant(applications, participant);
      const isComplete = missingDays.length === 0;

      if (query && !haystack.includes(query)) {
        return false;
      }

      if (ticket.length > 0 && !ticket.some((day) => (participant.ticketInfo ?? participant.ticketText).includes(day))) {
        return false;
      }

      if (completion === 'complete' && !isComplete) {
        return false;
      }

      if (completion === 'incomplete' && isComplete) {
        return false;
      }

      if (missingDay !== 'all' && !missingDays.includes(missingDay)) {
        return false;
      }

      return true;
    });

    if (rows.length === 0) {
      return NextResponse.json(
        {
          message: '다운로드할 미신청 대상이 없습니다.',
        },
        { status: 400 },
      );
    }

    const header = ['이름', '연락처', '이메일', '소속', '직분', '티켓 정보', '선택세션 미신청 Day', '선택세션 상태'];
    const csv = [header, ...rows.map((participant) => {
      const missingDays = getMissingDaysForParticipant(applications, participant);
      const byDay = getApplicationsByDayForParticipant(applications, participant.id);
      const status = DAY_ORDER.map((day) => `${SESSION_DAY_LABELS[day]} ${byDay[day].length}/2`).join(' | ');

      return [
        participant.name,
        participant.phone,
        participant.email ?? '',
        participant.organization ?? '',
        participant.position,
        participant.ticketInfo ?? participant.ticketText,
        missingDays.join(', '),
        status,
      ];
    })]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return new NextResponse(`\uFEFF${csv}`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=\"admin-missing-participants.csv\"',
      },
    });
  } catch {
    return NextResponse.json(
      {
        message: 'CSV 생성 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
