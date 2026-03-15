import { NextRequest, NextResponse } from 'next/server'
import { authenticateClientLite } from '@/lib/auth/client-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const client = await authenticateClientLite(req)
    const admin = createAdminClient()

    const { data: items } = await admin
      .from('content_queue')
      .select('*')
      .eq('client_id', client.clientId)
      .order('requested_at', { ascending: false })
      .limit(50)

    return NextResponse.json({ items: items || [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    const status = message.includes('Unauthorized') || message.includes('No Authorization') ? 401 : message.includes('Not a client') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
