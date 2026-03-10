import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/roles';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || '';

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: 'Scan backend not configured. Set NEXT_PUBLIC_BACKEND_URL in environment.' },
      { status: 503 }
    );
  }

  const body = await req.json();
  const mode = body.mode || 'quick';
  const query = body.query || '';

  try {
    const response = await fetch(`${BACKEND_URL}/api/scan`, {
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
    return NextResponse.json({ error: 'Failed to connect to scan backend. Check NEXT_PUBLIC_BACKEND_URL.' }, { status: 502 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobId = req.nextUrl.searchParams.get('jobId');

  if (jobId && BACKEND_URL) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/scan/${jobId}`);

      if (!response.ok) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ error: 'Failed to fetch job status' }, { status: 502 });
    }
  }

  // Bug #22: table name was 'scans' but migration creates 'scan_history'
  const supabase = await createClient();
  const { data: scans, error } = await supabase
    .from('scan_history')
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

  // Bug #5: client sends jobId as query param, not in body
  const jobId = req.nextUrl.searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  if (!BACKEND_URL) {
    return NextResponse.json({ error: 'Scan backend not configured' }, { status: 503 });
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/scan/${jobId}/cancel`, {
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
