import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUser } from '@/lib/auth/get-user';

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientId = req.nextUrl.searchParams.get('clientId');

  let query = supabaseAdmin
    .from('product_allocations')
    .select('*, products(*), clients(*)')
    .order('allocated_at', { ascending: false });

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch allocations' }, { status: 500 });
  }

  return NextResponse.json({ allocations: data });
}
