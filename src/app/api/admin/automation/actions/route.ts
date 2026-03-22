import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { authenticateAdmin } from '@/lib/auth/admin-api-auth'

/**
 * GET /api/admin/automation/actions?client_id=xxx&status=pending
 * Fetch pending automation actions for the approval queue.
 */
export async function GET(request: NextRequest) {
  try { await authenticateAdmin(request) } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  const clientId = request.nextUrl.searchParams.get('client_id')
  const status = request.nextUrl.searchParams.get('status') || 'pending'

  const supabase = createAdminClient()
  let query = supabase
    .from('automation_pending_actions')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(50)

  if (clientId) {
    query = query.eq('client_id', clientId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ actions: data || [] })
}

/**
 * POST /api/admin/automation/actions
 * Approve or reject a pending action.
 * Body: { action_id: string, decision: 'approve' | 'reject' }
 */
export async function POST(request: NextRequest) {
  try { await authenticateAdmin(request) } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  try {
    const body = await request.json()
    const { action_id, decision } = body

    if (!action_id || !decision || !['approve', 'reject'].includes(decision)) {
      return NextResponse.json({ error: 'action_id and decision (approve/reject) required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch the action
    const { data: action, error: fetchErr } = await supabase
      .from('automation_pending_actions')
      .select('*')
      .eq('id', action_id)
      .eq('status', 'pending')
      .single()

    if (fetchErr || !action) {
      return NextResponse.json({ error: 'Action not found or already processed' }, { status: 404 })
    }

    // Check if expired
    if (new Date(action.expires_at) < new Date()) {
      await supabase
        .from('automation_pending_actions')
        .update({ status: 'expired' })
        .eq('id', action_id)
      return NextResponse.json({ error: 'Action has expired' }, { status: 410 })
    }

    if (decision === 'reject') {
      await supabase
        .from('automation_pending_actions')
        .update({ status: 'rejected' })
        .eq('id', action_id)
      return NextResponse.json({ status: 'rejected', action_id })
    }

    // Approve — route the action to the appropriate backend queue
    const backendUrl = process.env.RAILWAY_BACKEND_URL || process.env.BACKEND_URL || ''
    const backendSecret = process.env.RAILWAY_API_SECRET || ''

    const routeMap: Record<string, string> = {
      auto_push_to_store: '/api/shopify/push',
      auto_deploy_blueprint: '/api/shopify/push',
      auto_publish_content: '/api/content/distribute',
      auto_outreach: '/api/influencers/outreach',
      score_and_enrich: '/api/scan',
    }

    const endpoint = routeMap[action.action_type]
    let executeResult: Record<string, unknown> = {}

    if (backendUrl && endpoint) {
      try {
        const res = await fetch(`${backendUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(backendSecret ? { Authorization: `Bearer ${backendSecret}` } : {}),
          },
          body: JSON.stringify({
            ...action.payload,
            client_id: action.client_id,
            automated: true,
            approved_by: 'admin',
          }),
          signal: AbortSignal.timeout(15000),
        })
        executeResult = await res.json() as Record<string, unknown>
      } catch (err) {
        executeResult = { error: err instanceof Error ? err.message : 'Backend unreachable' }
      }
    }

    await supabase
      .from('automation_pending_actions')
      .update({
        status: 'executed',
        executed_at: new Date().toISOString(),
        result: executeResult,
      })
      .eq('id', action_id)

    // Log the approved action
    await supabase
      .from('automation_action_log')
      .insert({
        client_id: action.client_id,
        feature: action.feature,
        action_type: action.action_type,
        status: 'executed',
        payload: { ...action.payload, approved_by: 'admin' },
        created_at: new Date().toISOString(),
      })

    return NextResponse.json({ status: 'executed', action_id, result: executeResult })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
