import { NextResponse } from 'next/server';
import { loadParticipantState } from '@/lib/repositories/app-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get('participantId')?.trim() ?? '';

    if (!participantId) {
      return NextResponse.json(
        {
          message: 'participantId가 필요합니다.',
        },
        { status: 400 },
      );
    }

    const state = await loadParticipantState(participantId);

    if (!state) {
      return NextResponse.json(
        {
          message: '참가자 정보를 찾지 못했습니다.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json(state);
  } catch {
    return NextResponse.json(
      {
        message: '참가자 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
      },
      { status: 500 },
    );
  }
}
