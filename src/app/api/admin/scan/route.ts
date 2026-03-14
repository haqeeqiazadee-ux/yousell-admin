import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';

const ENV_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || '';

async function getBackendUrl(): Promise<string> {
  if (ENV_BACKEND_URL) return ENV_BACKEND_URL;

  // Check DB-saved settings
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'api_keys')
      .single();
    if (data?.value?.BACKEND_URL) return data.value.BACKEND_URL;
  } catch {}

  return '';
}

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const backendUrl = await getBackendUrl();

  if (!backendUrl) {
    return NextResponse.json(
      { error: 'Scan backend not configured. Go to Settings and set BACKEND_URL, or deploy the Express backend first.' },
      { status: 503 }
    );
  }

  const body = await req.json();
  const mode = body.mode || 'quick';
  const query = body.query || '';

  try {
    const response = await fetch(`${backendUrl}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode,
        query,
        userId: user.id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Failed to queue scan' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to dispatch scan to backend:', error);
    return NextResponse.json({ error: 'Failed to connect to scan backend. Is the backend running?' }, { status: 502 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobId = req.nextUrl.searchParams.get('jobId');
  const backendUrl = await getBackendUrl();

  // Check backend status
  if (req.nextUrl.searchParams.get('check') === 'status') {
    return NextResponse.json({ configured: !!backendUrl });
  }

  if (jobId && backendUrl) {
    try {
      const response = await fetch(`${backendUrl}/api/scan/${jobId}`);

      if (!response.ok) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ error: 'Failed to fetch job status' }, { status: 502 });
    }
  }

  // Read from 'scans' table — the backend worker writes here
  const supabase = await createClient();
  const { data: scans, error } = await supabase
    .from('scans')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch scan history' }, { status: 500 });
  }

  return NextResponse.json({ scans });
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobId = req.nextUrl.searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  const backendUrl = await getBackendUrl();

  if (!backendUrl) {
    return NextResponse.json({ error: 'Scan backend not configured' }, { status: 503 });
  }

  try {
    const response = await fetch(`${backendUrl}/api/scan/${jobId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to cancel scan' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to connect to scan backend' }, { status: 502 });
  }
}
