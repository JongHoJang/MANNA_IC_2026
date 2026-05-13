import { NextResponse } from 'next/server';
import { loadBootstrapData } from '@/lib/repositories/app-data';

export async function GET() {
  try {
    const data = await loadBootstrapData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        message: '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
      },
      { status: 500 },
    );
  }
}
