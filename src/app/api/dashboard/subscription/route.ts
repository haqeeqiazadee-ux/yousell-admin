import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { authenticateClient, authenticateClientLite } from '@/lib/auth/client-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe, isStripeConfigured, PRICING_TIERS } from '@/lib/stripe'

// GET — Fetch current client subscription
export async function GET(req: NextRequest) {
  try {
    const clientCtx = await authenticateClient(req)

    return NextResponse.json({
      subscription: clientCtx.subscription,
      plan: clientCtx.subscription?.plan
        ? PRICING_TIERS[clientCtx.subscription.plan as keyof typeof PRICING_TIERS] || null
        : null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    const status = message.includes('Unauthorized') || message.includes('No Authorization') ? 401 : message.includes('Not a client') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

// POST — Create Stripe Checkout session
export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Billing is not yet available. Coming soon!' }, { status: 503 })
    }

    const client = await authenticateClientLite(request)
    const admin = createAdminClient()

    const body = await request.json()
    const { planId } = body

    if (!planId || !PRICING_TIERS[planId as keyof typeof PRICING_TIERS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const plan = PRICING_TIERS[planId as keyof typeof PRICING_TIERS]
    const stripe = getStripe()

    // Check for existing Stripe customer
    const { data: existingSub } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('client_id', client.clientId)
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
      metadata: { client_id: client.clientId, plan_id: planId },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yousell.online'}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yousell.online'}/dashboard/billing?cancelled=true`,
    }

    if (existingSub?.stripe_customer_id) {
      sessionParams.customer = existingSub.stripe_customer_id
    } else {
      sessionParams.customer_email = client.email
    }

    const session = await stripe.checkout.sessions.create(sessionParams as Stripe.Checkout.SessionCreateParams)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[Checkout] Error:', err)
    const message = err instanceof Error ? err.message : 'Internal error'
    const status = message.includes('Unauthorized') || message.includes('No Authorization') ? 401 : message.includes('Not a client') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

// PATCH — Upgrade/downgrade subscription plan
export async function PATCH(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Billing is not yet available' }, { status: 503 })
    }

    const clientCtx = await authenticateClient(request)
    const admin = createAdminClient()

    const body = await request.json()
    const { planId } = body

    if (!planId || !PRICING_TIERS[planId as keyof typeof PRICING_TIERS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const { data: sub } = await admin
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('client_id', clientCtx.clientId)
      .single()

    if (!sub?.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription to modify' }, { status: 404 })
    }

    const stripe = getStripe()
    const plan = PRICING_TIERS[planId as keyof typeof PRICING_TIERS]

    // Retrieve current subscription to get item ID
    const currentSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id)
    const itemId = currentSub.items.data[0]?.id

    if (!itemId) {
      return NextResponse.json({ error: 'Could not find subscription item' }, { status: 500 })
    }

    // Create a new price for the target plan, then update subscription
    const newPrice = await stripe.prices.create({
      currency: 'usd',
      unit_amount: plan.price * 100,
      recurring: { interval: 'month' },
      product_data: { name: `YouSell ${plan.name} Plan` },
    })

    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      items: [{ id: itemId, price: newPrice.id }],
      metadata: { plan_id: planId },
      proration_behavior: 'create_prorations',
    })

    // Update local record
    await admin
      .from('subscriptions')
      .update({ plan: planId })
      .eq('client_id', clientCtx.clientId)

    return NextResponse.json({ success: true, plan: planId })
  } catch (err) {
    console.error('[Subscription Upgrade] Error:', err)
    const message = err instanceof Error ? err.message : 'Internal error'
    const status = message.includes('Unauthorized') || message.includes('No Authorization') ? 401 : message.includes('Not a client') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
