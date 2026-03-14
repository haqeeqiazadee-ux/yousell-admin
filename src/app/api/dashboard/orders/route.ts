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

    if (!client) return NextResponse.json({ orders: [] })

    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({ orders: orders || [] })
  } catch (err) {
    console.error('[Orders API] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
