import { NextRequest, NextResponse } from 'next/server'
import { authenticateClientLite } from '@/lib/auth/client-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe, isStripeConfigured } from '@/lib/stripe'

// POST — Create Stripe Customer Portal session
export async function POST(req: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Billing is not yet available. Coming soon!' }, { status: 503 })
    }

    const client = await authenticateClientLite(req)
    const admin = createAdminClient()

    const { data: subscription } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('client_id', client.clientId)
      .single()

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 404 })
    }

    const stripe = getStripe()
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yousell.online'}/dashboard/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[Portal] Error:', err)
    const message = err instanceof Error ? err.message : 'Internal error'
    const status = message.includes('Unauthorized') || message.includes('No Authorization') ? 401 : message.includes('Not a client') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
