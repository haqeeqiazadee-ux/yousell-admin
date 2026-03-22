/**
 * Smart Schedule API — AI-optimal posting times
 * GET /api/engine/schedule?client_id=X&platform=Y&timezone=Z
 *
 * @engine smart-schedule
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSmartSchedule, getFullSchedule } from '@/lib/engines/smart-schedule';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const clientId = searchParams.get('client_id');
    const platform = searchParams.get('platform');
    const timezone = searchParams.get('timezone') || 'UTC';

    if (!clientId) {
      return NextResponse.json({ error: 'client_id required' }, { status: 400 });
    }

    if (platform) {
      // Single platform schedule
      const schedule = await getSmartSchedule(clientId, platform, undefined, timezone);
      return NextResponse.json(schedule);
    }

    // Full schedule for all platforms
    const schedules = await getFullSchedule(clientId, timezone);
    return NextResponse.json({ schedules, timezone });
  } catch (error) {
    console.error('[Schedule API] Error:', error);
    return NextResponse.json({ error: 'Failed to compute schedule' }, { status: 500 });
  }
}
