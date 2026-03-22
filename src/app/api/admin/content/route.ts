import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { authenticateAdmin } from '@/lib/auth/admin-api-auth'

/**
 * GET /api/admin/content?status=generated&limit=50
 * List content queue items across all clients.
 */
export async function GET(request: NextRequest) {
  try { await authenticateAdmin(request) } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  const status = request.nextUrl.searchParams.get('status')
  const clientId = request.nextUrl.searchParams.get('client_id')
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50'), 100)

  const supabase = createAdminClient()
  let query = supabase
    .from('content_queue')
    .select('id, client_id, product_id, content_type, channel, generated_content, status, error, requested_at, completed_at')
    .order('requested_at', { ascending: false })
    .limit(limit)

  if (status) query = query.eq('status', status)
  if (clientId) query = query.eq('client_id', clientId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get counts by status
  const { data: counts } = await supabase
    .from('content_queue')
    .select('status')

  const statusCounts: Record<string, number> = {}
  for (const row of (counts || [])) {
    statusCounts[row.status] = (statusCounts[row.status] || 0) + 1
  }

  return NextResponse.json({ content: data || [], counts: statusCounts })
}

/**
 * PATCH /api/admin/content
 * Update content status (approve, schedule, reject).
 * Body: { id: string, action: 'approve' | 'reject' | 'schedule', channels?: string[] }
 */
export async function PATCH(request: NextRequest) {
  try { await authenticateAdmin(request) } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }

  try {
    const body = await request.json()
    const { id, action, channels } = body

    if (!id || !action) {
      return NextResponse.json({ error: 'id and action are required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    if (action === 'reject') {
      await supabase
        .from('content_queue')
        .update({ status: 'rejected', error: 'Rejected by admin' })
        .eq('id', id)
      return NextResponse.json({ status: 'rejected' })
    }

    if (action === 'approve') {
      await supabase
        .from('content_queue')
        .update({ status: 'generated' })
        .eq('id', id)
      return NextResponse.json({ status: 'approved' })
    }

    if (action === 'schedule') {
      // Queue for distribution
      const { data: content } = await supabase
        .from('content_queue')
        .select('*')
        .eq('id', id)
        .single()

      if (!content || !content.generated_content) {
        return NextResponse.json({ error: 'Content not found or not generated' }, { status: 404 })
      }

      await supabase
        .from('content_queue')
        .update({ status: 'scheduled' })
        .eq('id', id)

      // Queue distribution job via backend
      const backendUrl = process.env.RAILWAY_BACKEND_URL || process.env.BACKEND_URL || ''
      if (backendUrl) {
        await fetch(`${backendUrl}/api/content/distribute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content_id: id,
            channels: channels || ['ayrshare'],
            client_id: content.client_id,
          }),
        }).catch(err => console.error('[Admin Content] Distribution queue error:', err))
      }

      return NextResponse.json({ status: 'scheduled' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
