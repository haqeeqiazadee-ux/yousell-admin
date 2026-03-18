import { NextRequest, NextResponse } from 'next/server'
import { authenticateClient, requireEngine } from '@/lib/auth/client-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const client = await authenticateClient(req)
    requireEngine(client, 'store_integration')
    const admin = createAdminClient()

    const { data: channels } = await admin
      .from('connected_channels')
      .select('*')
      .eq('client_id', client.clientId)
      .eq('status', 'active')
      .order('connected_at', { ascending: false })

    return NextResponse.json({ channels: channels || [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    const status = message.includes('Unauthorized') || message.includes('No Authorization') ? 401 : message.includes('Not a client') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
