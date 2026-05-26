import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionTokenFromCookieHeader,
  isAuthorizedAdmin,
} from '@/lib/admin-session';
import { getAdminParticipant } from '@/lib/repositories/app-data';

export async function POST(request: Request) {
  try {
    const adminParticipant = await getAdminParticipant();
    const token = getAdminSessionTokenFromCookieHeader(request.headers.get('cookie'));

    if (!isAuthorizedAdmin(adminParticipant, token)) {
      const response = NextResponse.json(
        {
          message: '관리자 권한이 필요합니다.',
        },
        { status: 401 },
      );
      response.cookies.delete(ADMIN_SESSION_COOKIE);
      return response;
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete(ADMIN_SESSION_COOKIE);
    return response;
  } catch {
    return NextResponse.json(
      {
        message: '로그아웃 처리 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
