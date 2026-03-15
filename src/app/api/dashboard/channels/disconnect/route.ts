import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

    const { channelId } = await request.json()
    if (!channelId) return NextResponse.json({ error: 'channelId required' }, { status: 400 })

    // Use admin client to bypass RLS for the update
    const admin = createAdminClient()

    // Verify the channel belongs to this client
    const { data: channel } = await admin
      .from('connected_channels')
      .select('id, client_id')
      .eq('id', channelId)
      .single()

    if (!channel || channel.client_id !== client.id) {
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
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
