import { NextRequest, NextResponse } from 'next/server';
import { authenticateClientLite } from '@/lib/auth/client-api-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const client = await authenticateClientLite(req);
    const admin = createAdminClient();

    const { data } = await admin
      .from('platform_access')
      .select('platform, enabled')
      .eq('client_id', client.clientId);

    const enabled = (data || [])
      .filter((r) => r.enabled)
      .map((r) => r.platform as string);

    return NextResponse.json({ platforms: enabled });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    const status =
      message.includes('Unauthorized') || message.includes('No Authorization')
        ? 401
        : message.includes('Not a client')
        ? 403
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
