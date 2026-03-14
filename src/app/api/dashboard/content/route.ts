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

    if (!client) return NextResponse.json({ items: [] })

    const { data: items } = await supabase
      .from('content_queue')
      .select('*')
      .eq('client_id', client.id)
      .order('requested_at', { ascending: false })
      .limit(50)

    return NextResponse.json({ items: items || [] })
  } catch (err) {
    console.error('[Content API] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
