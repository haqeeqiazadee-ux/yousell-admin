import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUser } from '@/lib/auth/get-user';

export async function GET(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: blueprints, error } = await supabaseAdmin
    .from('blueprints')
    .select('*, products(*)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch blueprints' }, { status: 500 });
  }

  return NextResponse.json({ blueprints });
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, productId, strategy, targetAudience, marketingPlan, pricingStrategy } = body;

  const { data: blueprint, error } = await supabaseAdmin
    .from('blueprints')
    .insert({
      title,
      product_id: productId,
      strategy,
      target_audience: targetAudience,
      marketing_plan: marketingPlan,
      pricing_strategy: pricingStrategy,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to create blueprint' }, { status: 500 });
  }

  return NextResponse.json({ blueprint });
}
