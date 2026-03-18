import { NextRequest, NextResponse } from 'next/server'
import { authenticateClient, requireEngine } from '@/lib/auth/client-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateClient(request)
    requireEngine(client, 'store_integration')
    const admin = createAdminClient()

    const { channelId } = await request.json()
    if (!channelId) return NextResponse.json({ error: 'channelId required' }, { status: 400 })

    // Verify the channel belongs to this client
    const { data: channel } = await admin
      .from('connected_channels')
      .select('id, client_id')
      .eq('id', channelId)
      .single()

    if (!channel || channel.client_id !== client.clientId) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    // Soft disconnect — mark as disconnected, clear tokens
    const { error } = await admin
      .from('connected_channels')
      .update({
        status: 'disconnected',
        disconnected_at: new Date().toISOString(),
        access_token_encrypted: null,
        refresh_token_encrypted: null,
      })
      .eq('id', channelId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Channel Disconnect] Error:', err)
    const message = err instanceof Error ? err.message : 'Internal error'
    const status = message.includes('Unauthorized') || message.includes('No Authorization') ? 401 : message.includes('Not a client') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
