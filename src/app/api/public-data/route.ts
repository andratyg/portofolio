import { NextResponse } from 'next/server';
import { fetchPublicDataFromServer } from '@/lib/server-firebase';

// ISR: Cache responses for 5 minutes (300 seconds)
export const revalidate = 300;

export async function GET() {
  try {
    const data = await fetchPublicDataFromServer();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch public data' },
      { status: 500 }
    );
  }
}
