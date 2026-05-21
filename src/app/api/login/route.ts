import { NextResponse } from 'next/server';
import { loginWithParticipantNameAndPhone } from '@/lib/repositories/app-data';
import { ADMIN_SESSION_COOKIE, createAdminSessionToken } from '@/lib/admin-session';

export async function POST(request: Request) {
  try {
    const { name, phone } = (await request.json()) as { name?: string; phone?: string };
    const result = await loginWithParticipantNameAndPhone(name ?? '', phone ?? '');

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          message: '등록된 이름과 휴대폰 번호를 찾지 못했습니다.',
        },
        { status: 404 },
      );
    }

    const response = NextResponse.json({
      success: true,
      message: `${result.participant.name} 님으로 로그인했습니다.`,
      session: result.session,
      participant: result.participant,
      applications: result.applications,
    });

    if (result.session.role === 'admin') {
      response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(result.participant.id), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 8,
      });
    } else {
      response.cookies.delete(ADMIN_SESSION_COOKIE);
    }

    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: '로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      },
      { status: 500 },
    );
  }
}
