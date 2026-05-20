import { NextResponse } from 'next/server';
import { getAdminSessionTokenFromCookieHeader, isAuthorizedAdmin } from '@/lib/admin-session';
import { getAdminParticipant, loadAdminParticipantsData } from '@/lib/repositories/app-data';

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

    const payload = await loadAdminParticipantsData();
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      {
        message: '어드민 참가자 데이터를 불러오지 못했습니다.',
      },
      { status: 500 },
    );
  }
}
