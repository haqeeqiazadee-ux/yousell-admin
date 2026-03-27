/**
 * Square Webhook Handler — Primary Payment Provider
 *
 * Handles Square subscription lifecycle events and wires them
 * into the Governor budget envelope system.
 *
 * Square is the current payment provider. Stripe webhook exists
 * in parallel for future migration.
 *
 * @see docs/v9/V9_Engine_Governor_Architecture.md Section 3.3
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'crypto'
import {
  createBudgetEnvelope,
  updateBudgetEnvelope,
  archiveBudgetEnvelope,
  renewBudgetEnvelope,
} from '@/lib/engines/governor/envelope-lifecycle'
import type { PlanId } from '@/lib/engines/governor/types'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

/** Verify Square webhook signature */
function verifySquareSignature(
  body: string,
  signatureHeader: string | null,
  webhookUrl: string
): boolean {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
  if (!signatureKey || !signatureHeader) return false

  const combined = webhookUrl + body
  const expectedSignature = createHmac('sha256', signatureKey)
    .update(combined)
    .digest('base64')

  try {
    return timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

/** Map Square plan IDs to our plan tiers */
const SQUARE_PLAN_MAP: Record<string, PlanId> = {
  // Map Square catalog variation IDs to plan tiers
  // These should be configured via env vars in production
  [process.env.SQUARE_PLAN_STARTER_ID || 'starter']: 'starter',
  [process.env.SQUARE_PLAN_GROWTH_ID || 'growth']: 'growth',
  [process.env.SQUARE_PLAN_PROFESSIONAL_ID || 'professional']: 'professional',
  [process.env.SQUARE_PLAN_ENTERPRISE_ID || 'enterprise']: 'enterprise',
}

function resolvePlan(squarePlanId: string | undefined): PlanId | null {
  if (!squarePlanId) return null
  return SQUARE_PLAN_MAP[squarePlanId] || null
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-square-hmacsha256-signature')

  const webhookSecret = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
  if (!webhookSecret) {
    console.warn('[Square Webhook] Square not configured — skipping')
    return NextResponse.json({ error: 'Square not yet configured' }, { status: 503 })
  }

  // Verify signature
  const webhookUrl = process.env.SQUARE_WEBHOOK_URL || ''
  if (!verifySquareSignature(body, signature, webhookUrl)) {
    console.error('[Square Webhook] Signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: {
    type: string
    data?: { object?: { subscription?: Record<string, unknown> } }
    merchant_id?: string
  }

  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = getServiceClient()

  try {
    switch (event.type) {
      // ─── New Subscription Created ──────────────────────────
      case 'subscription.created': {
        const sub = event.data?.object?.subscription
        if (!sub) break

        const squareCustomerId = sub.customer_id as string | undefined
        const squareSubscriptionId = sub.id as string | undefined
        const planVariationId = sub.plan_variation_id as string | undefined

        if (!squareCustomerId || !squareSubscriptionId) {
          console.error('[Square Webhook] Missing customer_id or subscription id')
          break
        }

        // Look up client by square_customer_id
        const { data: client } = await supabase
          .from('clients')
          .select('id')
          .eq('square_customer_id', squareCustomerId)
          .single()

        if (!client) {
          console.error(`[Square Webhook] No client found for Square customer ${squareCustomerId}`)
          break
        }

        const plan = resolvePlan(planVariationId)
        if (!plan) {
          console.error(`[Square Webhook] Unknown plan variation: ${planVariationId}`)
          break
        }

        // Create/update subscription record
        await supabase.from('subscriptions').upsert({
          client_id: client.id,
          square_customer_id: squareCustomerId,
          square_subscription_id: squareSubscriptionId,
          plan,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }, { onConflict: 'client_id' })

        // Governor: Create budget envelope
        const periodStart = new Date()
        const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        await createBudgetEnvelope(client.id, plan, periodStart, periodEnd)
          .catch(err => console.error('[Square Webhook] Envelope creation error:', err))

        console.log(`[Square Webhook] Subscription created for client ${client.id}, plan: ${plan}`)
        break
      }

      // ─── Subscription Updated (upgrade/downgrade) ──────────
      case 'subscription.updated': {
        const sub = event.data?.object?.subscription
        if (!sub) break

        const squareSubscriptionId = sub.id as string | undefined
        const planVariationId = sub.plan_variation_id as string | undefined
        const status = sub.status as string | undefined

        if (!squareSubscriptionId) break

        // Update subscription status
        const updateData: Record<string, unknown> = {}
        if (status) {
          updateData.status = status === 'ACTIVE' ? 'active'
            : status === 'CANCELED' ? 'cancelled'
            : status === 'PAUSED' ? 'paused'
            : status.toLowerCase()
        }

        const newPlan = resolvePlan(planVariationId)
        if (newPlan) {
          updateData.plan = newPlan
        }

        if (Object.keys(updateData).length > 0) {
          await supabase
            .from('subscriptions')
            .update(updateData)
            .eq('square_subscription_id', squareSubscriptionId)
        }

        // Governor: Update envelope on plan change
        if (newPlan) {
          const { data: subRecord } = await supabase
            .from('subscriptions')
            .select('client_id')
            .eq('square_subscription_id', squareSubscriptionId)
            .single()

          if (subRecord?.client_id) {
            await updateBudgetEnvelope(subRecord.client_id, newPlan)
              .catch(err => console.error('[Square Webhook] Envelope update error:', err))
          }
        }

        console.log(`[Square Webhook] Subscription ${squareSubscriptionId} updated`)
        break
      }

      // ─── Subscription Cancelled ────────────────────────────
      case 'subscription.canceled':
      case 'subscription.cancelled': {
        const sub = event.data?.object?.subscription
        if (!sub) break

        const squareSubscriptionId = sub.id as string | undefined
        if (!squareSubscriptionId) break

        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('square_subscription_id', squareSubscriptionId)

        // Governor: Archive budget envelope
        const { data: cancelledSub } = await supabase
          .from('subscriptions')
          .select('client_id')
          .eq('square_subscription_id', squareSubscriptionId)
          .single()

        if (cancelledSub?.client_id) {
          await archiveBudgetEnvelope(cancelledSub.client_id)
            .catch(err => console.error('[Square Webhook] Envelope archive error:', err))
        }

        console.log(`[Square Webhook] Subscription ${squareSubscriptionId} cancelled`)
        break
      }

      // ─── Invoice Payment (renewal) ─────────────────────────
      case 'invoice.payment_made': {
        const sub = event.data?.object?.subscription
        if (!sub) break

        const squareSubscriptionId = sub.id as string | undefined
        if (!squareSubscriptionId) break

        const { data: subRecord } = await supabase
          .from('subscriptions')
          .select('client_id, plan')
          .eq('square_subscription_id', squareSubscriptionId)
          .single()

        if (subRecord?.client_id && subRecord.plan) {
          const periodStart = new Date()
          const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          await renewBudgetEnvelope(
            subRecord.client_id,
            subRecord.plan as PlanId,
            periodStart,
            periodEnd
          ).catch(err => console.error('[Square Webhook] Envelope renewal error:', err))

          // Ensure subscription status is active after payment
          await supabase
            .from('subscriptions')
            .update({ status: 'active' })
            .eq('square_subscription_id', squareSubscriptionId)
        }

        console.log(`[Square Webhook] Payment received for ${squareSubscriptionId}`)
        break
      }

      default:
        console.log(`[Square Webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`[Square Webhook] Error processing ${event.type}:`, err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
