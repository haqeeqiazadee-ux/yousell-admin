import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUser } from '@/lib/auth/get-user';
import { isAdmin } from '@/lib/auth/roles';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
  }

  const body = await req.json();
  const mode = body.mode || 'quick';
  const query = body.query || '';

  try {
    const token = req.cookies.get('sb-access-token')?.value;

    const response = await fetch(`${BACKEND_URL}/api/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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
    return NextResponse.json({ error: 'Failed to connect to scan backend' }, { status: 502 });
  }
}

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
  }

  const jobId = req.nextUrl.searchParams.get('jobId');

  if (jobId) {
    try {
      const token = req.cookies.get('sb-access-token')?.value;
      const response = await fetch(`${BACKEND_URL}/api/scan/${jobId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ error: 'Failed to fetch job status' }, { status: 502 });
    }
  }

  const { data: scans, error } = await supabaseAdmin
    .from('scans')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch scans' }, { status: 500 });
  }

  return NextResponse.json({ scans });
}

export async function DELETE(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
  }

  const body = await req.json();
  const { jobId } = body;

  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  try {
    const token = req.cookies.get('sb-access-token')?.value;
    const response = await fetch(`${BACKEND_URL}/api/scan/${jobId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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
