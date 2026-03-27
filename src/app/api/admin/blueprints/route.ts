import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateAdmin } from '@/lib/auth/admin-api-auth';

export async function GET(request: NextRequest) {
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const supabase = createAdminClient();

  const { data: blueprints, error } = await supabase
    .from('launch_blueprints')
    .select('*, products(id, title, platform, final_score, trend_stage)')
    .order('generated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(blueprints || []);
}

export async function POST(req: NextRequest) {
  try { await authenticateAdmin(req); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const supabase = createAdminClient();

  const body = await req.json();
  const { product_id, positioning, product_page_content, pricing_strategy,
    video_script, ad_blueprint, launch_timeline, risk_notes } = body;

  if (!product_id) {
    return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
  }

  const { data: blueprint, error } = await supabase
    .from('launch_blueprints')
    .insert({
      product_id,
      positioning,
      product_page_content,
      pricing_strategy,
      video_script,
      ad_blueprint,
      launch_timeline,
      risk_notes,
      generated_by: 'sonnet',
    })
    .select('*, products(id, title, platform, final_score)')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(blueprint);
}
