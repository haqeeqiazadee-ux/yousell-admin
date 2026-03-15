import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateAdmin } from '@/lib/auth/admin-api-auth';

export async function POST(req: NextRequest) {
  let user;
  try { user = await authenticateAdmin(req); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  const supabaseAdmin = createAdminClient();
  const body = await req.json();
  const { clientId, productIds, visible_to_client } = body;

  if (!clientId || !productIds?.length) {
    return NextResponse.json({ error: 'clientId and productIds are required' }, { status: 400 });
  }

  try {
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('default_product_limit')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const { count: activeCount, error: countError } = await supabaseAdmin
      .from('product_allocations')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)
      .eq('status', 'active');

    if (countError) {
      return NextResponse.json({ error: 'Failed to check allocation count' }, { status: 500 });
    }

    const currentCount = activeCount || 0;
    if (currentCount + productIds.length > client.default_product_limit) {
      return NextResponse.json(
        {
          error: `Allocation would exceed client limit. Current: ${currentCount}, Requested: ${productIds.length}, Limit: ${client.default_product_limit}`,
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('product_allocations')
      .insert(
        productIds.map((productId: string) => ({
          client_id: clientId,
          product_id: productId,
          allocated_by: user.id,
          status: 'active',
          visible_to_client: visible_to_client !== false,
          allocated_at: new Date().toISOString(),
        }))
      );

    if (error) {
      return NextResponse.json({ error: 'Allocation failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: productIds.length });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try { await authenticateAdmin(req); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  const supabaseAdmin = createAdminClient();
  const clientId = req.nextUrl.searchParams.get('clientId');

  // Fetch pending product requests
  let requestsQuery = supabaseAdmin
    .from('product_requests')
    .select('*, clients(name)')
    .eq('status', 'pending')
    .order('requested_at', { ascending: false });

  if (clientId) {
    requestsQuery = requestsQuery.eq('client_id', clientId);
  }

  const { data: requests } = await requestsQuery;

  // Fetch recent allocations
  let allocQuery = supabaseAdmin
    .from('product_allocations')
    .select('*, products(title, platform), clients(name)')
    .order('allocated_at', { ascending: false })
    .limit(50);

  if (clientId) {
    allocQuery = allocQuery.eq('client_id', clientId);
  }

  const { data: allocations, error } = await allocQuery;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch allocations' }, { status: 500 });
  }

  // Shape response to match what the allocate page expects
  const pending = (requests || []).map((r: Record<string, unknown>) => ({
    id: r.id,
    client_name: (r.clients as Record<string, unknown>)?.name || 'Unknown',
    platform: r.platform || 'all',
    note: r.note || '',
    requested_at: r.requested_at,
    status: r.status,
  }));

  const recent = (allocations || []).map((a: Record<string, unknown>) => ({
    id: a.id,
    client_name: (a.clients as Record<string, unknown>)?.name || 'Unknown',
    product_name: (a.products as Record<string, unknown>)?.title || 'Unknown',
    platform: (a.products as Record<string, unknown>)?.platform || 'unknown',
    allocated_at: a.allocated_at,
    visible_to_client: a.visible_to_client,
  }));

  return NextResponse.json({ pending, recent });
}
