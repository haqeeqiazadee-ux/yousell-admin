import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!client) return NextResponse.json({ channels: [] })

    const { data: channels } = await supabase
      .from('connected_channels')
      .select('*')
      .eq('client_id', client.id)
      .eq('status', 'active')
      .order('connected_at', { ascending: false })

    return NextResponse.json({ channels: channels || [] })
  } catch (err) {
    console.error('[Channels API] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
