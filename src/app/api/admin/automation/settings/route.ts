import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { authenticateAdmin } from '@/lib/auth/admin-api-auth'

/**
 * GET /api/admin/automation/settings?client_id=xxx
 * Fetch automation settings for a client.
 */
export async function GET(request: NextRequest) {
  try { await authenticateAdmin(request) } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  const clientId = request.nextUrl.searchParams.get('client_id')
  if (!clientId) {
    return NextResponse.json({ error: 'client_id is required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('client_automation_settings')
    .select('*')
    .eq('client_id', clientId)
    .single()

  // Return defaults if no settings exist
  const settings = data || {
    client_id: clientId,
    automation_levels: { product_upload: 1, content_creation: 1, content_publishing: 1, influencer_outreach: 1, product_discovery: 1 },
    guardrails: { dailySpendCap: 50, contentVolumeCapPerDay: 10, productUploadCapPerDay: 5, outreachCapPerDay: 20, pauseOnConsecutiveErrors: 3 },
    soft_limits: { contentApprovalWindowHours: 4, allowedCategories: [], priceRange: { min: 0, max: 1000 }, minimumScore: 60, weeklyDigestEnabled: true },
  }

  return NextResponse.json(settings)
}

/**
 * PUT /api/admin/automation/settings
 * Update automation settings for a client.
 */
export async function PUT(request: NextRequest) {
  try { await authenticateAdmin(request) } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  try {
    const body = await request.json()
    const { client_id, automation_levels, guardrails, soft_limits } = body

    if (!client_id) {
      return NextResponse.json({ error: 'client_id is required' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('client_automation_settings')
      .upsert({
        client_id,
        automation_levels: automation_levels || { product_upload: 1, content_creation: 1, content_publishing: 1, influencer_outreach: 1, product_discovery: 1 },
        guardrails: guardrails || {},
        soft_limits: soft_limits || {},
        updated_at: new Date().toISOString(),
      }, { onConflict: 'client_id' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
