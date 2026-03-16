import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Use service role client for webhook processing (no user context)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    console.warn('[Stripe Webhook] Stripe not configured — billing coming soon')
    return NextResponse.json({ error: 'Billing not yet configured' }, { status: 503 })
  }

  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const clientId = session.metadata?.client_id
        const planId = session.metadata?.plan_id

        if (!clientId || !planId) {
          console.error('[Stripe Webhook] Missing metadata in checkout session')
          break
        }

        // Create/update subscription record
        await supabase.from('subscriptions').upsert({
          client_id: clientId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan: planId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }, { onConflict: 'client_id' })

        console.log(`[Stripe Webhook] Subscription created for client ${clientId}, plan: ${planId}`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subData = subscription as any
        const periodStart = subData.current_period_start as number | undefined
        const periodEnd = subData.current_period_end as number | undefined
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status === 'active' ? 'active' : subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            ...(periodStart ? { current_period_start: new Date(periodStart * 1000).toISOString() } : {}),
            ...(periodEnd ? { current_period_end: new Date(periodEnd * 1000).toISOString() } : {}),
          })
          .eq('stripe_subscription_id', subscription.id)

        console.log(`[Stripe Webhook] Subscription ${subscription.id} updated: ${subscription.status}`)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', subscription.id)

        console.log(`[Stripe Webhook] Subscription ${subscription.id} cancelled`)
        break
      }

      case 'invoice.payment_failed': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription as string | null
        if (subscriptionId) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId)

          console.log(`[Stripe Webhook] Payment failed for subscription ${subscriptionId}`)
        }
        break
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`[Stripe Webhook] Error processing ${event.type}:`, err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
