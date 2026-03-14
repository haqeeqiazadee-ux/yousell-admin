import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { getStripe, PRICING_TIERS } from '@/lib/stripe'

// GET — Fetch current client subscription
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'client') {
      return NextResponse.json({ error: 'Not a client' }, { status: 403 })
    }

    // Get client record
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!client) {
      return NextResponse.json({ subscription: null, plan: null })
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('client_id', client.id)
      .single()

    const plan = subscription?.plan ? PRICING_TIERS[subscription.plan as keyof typeof PRICING_TIERS] : null

    return NextResponse.json({ subscription, plan })
  } catch (err) {
    console.error('[Subscription API] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// POST — Create Stripe Checkout session
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { planId } = body

    if (!planId || !PRICING_TIERS[planId as keyof typeof PRICING_TIERS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const plan = PRICING_TIERS[planId as keyof typeof PRICING_TIERS]

    // Get client record
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const stripe = getStripe()

    // Check for existing Stripe customer
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('client_id', client.id)
      .single()

    const sessionParams: Record<string, unknown> = {
      mode: 'subscription' as const,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `YouSell ${plan.name} Plan` },
          unit_amount: plan.price * 100,
          recurring: { interval: 'month' as const },
        },
        quantity: 1,
      }],
      metadata: { client_id: client.id, plan_id: planId },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yousell.online'}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yousell.online'}/dashboard/billing?cancelled=true`,
    }

    if (existingSub?.stripe_customer_id) {
      sessionParams.customer = existingSub.stripe_customer_id
    } else {
      sessionParams.customer_email = user.email
    }

    const session = await stripe.checkout.sessions.create(sessionParams as Stripe.Checkout.SessionCreateParams)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[Checkout] Error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
