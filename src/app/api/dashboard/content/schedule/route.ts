import { NextRequest, NextResponse } from 'next/server'
import { authenticateClient } from '@/lib/auth/client-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const clientCtx = await authenticateClient(request)
    const admin = createAdminClient()

    const body = await request.json()
    const { content_id, scheduled_at, channels } = body

    if (!content_id || !scheduled_at) {
      return NextResponse.json(
        { error: 'content_id and scheduled_at are required' },
        { status: 400 },
      )
    }

    // Verify content belongs to this client
    const { data: content, error: contentErr } = await admin
      .from('content_queue')
      .select('id, status, client_id')
      .eq('id', content_id)
      .eq('client_id', clientCtx.clientId)
      .single()

    if (contentErr || !content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    if (content.status !== 'generated') {
      return NextResponse.json(
        { error: `Content must be in 'generated' status to schedule. Current: ${content.status}` },
        { status: 400 },
      )
    }

    // Update content with schedule info
    const { data: updated, error: updateErr } = await admin
      .from('content_queue')
      .update({
        status: 'scheduled',
        metadata: {
          scheduled_at,
          target_channels: channels || ['default'],
          scheduled_by: clientCtx.userId,
        },
      })
      .eq('id', content_id)
      .select()
      .single()

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to schedule content' }, { status: 500 })
    }

    // Try to enqueue distribution job (backend may not be available)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'
    try {
      await fetch(`${backendUrl}/api/content/distribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.BACKEND_API_KEY || ''}`,
        },
        body: JSON.stringify({
          content_id,
          channels: channels || ['default'],
          scheduled_at,
          client_id: clientCtx.clientId,
        }),
        signal: AbortSignal.timeout(5000),
      })
    } catch {
      // Backend not reachable — content stays scheduled for manual distribution
    }

    return NextResponse.json({ content: updated })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    const status = message.includes('Unauthorized') || message.includes('No Authorization') ? 401 : message.includes('Not a client') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
