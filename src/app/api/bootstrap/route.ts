import { NextResponse } from 'next/server';
import { loadBootstrapData } from '@/lib/repositories/app-data';

export async function GET() {
  try {
    const data = await loadBootstrapData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Failed to load bootstrap data',
      },
      { status: 500 },
    );
  }
}
