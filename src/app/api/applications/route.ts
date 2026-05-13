import { NextResponse } from 'next/server';
import { upsertLectureApplication } from '@/lib/repositories/app-data';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      participantId: string;
      day: 'Day1' | 'Day2' | 'Day3';
      timeSlot: '1타임' | '2타임';
      lectureId: string;
    };

    const result = await upsertLectureApplication(body);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '신청 저장 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
