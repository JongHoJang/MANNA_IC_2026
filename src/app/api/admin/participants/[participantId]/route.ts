import { NextResponse } from 'next/server';
import { getAdminSessionTokenFromCookieHeader, isAuthorizedAdmin } from '@/lib/admin-session';
import { getAdminParticipant, updateAdminParticipant } from '@/lib/repositories/app-data';
import type { DayKey, TimeSlot } from '@/types';

type RouteContext = {
  params: {
    participantId: string;
  };
};

export async function PATCH(request: Request, context: RouteContext) {
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

    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      position?: string;
      ticketInfo?: string;
      email?: string | null;
      organization?: string | null;
      day1?: boolean;
      day2?: boolean;
      day3?: boolean;
      sessions?: Partial<Record<DayKey, Partial<Record<TimeSlot, string>>>>;
    };

    const sessions = (['Day1', 'Day2', 'Day3'] as DayKey[]).flatMap((day) =>
      (['1타임', '2타임'] as TimeSlot[]).map((timeSlot) => ({
        day,
        timeSlot,
        lectureId: body.sessions?.[day]?.[timeSlot] ?? null,
      })),
    );

    const result = await updateAdminParticipant(context.params.participantId, {
      name: body.name ?? '',
      phone: body.phone ?? '',
      position: body.position ?? '',
      ticketInfo: body.ticketInfo ?? '',
      email: body.email ?? null,
      organization: body.organization ?? null,
      day1: Boolean(body.day1),
      day2: Boolean(body.day2),
      day3: Boolean(body.day3),
      sessions,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          message: result.message,
        },
        { status: result.status },
      );
    }

    return NextResponse.json({
      message: `${result.participant.name} 참가자 정보를 저장했습니다.`,
      participant: result.participant,
      applications: result.applications,
    });
  } catch {
    return NextResponse.json(
      {
        message: '참가자 정보 저장 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
