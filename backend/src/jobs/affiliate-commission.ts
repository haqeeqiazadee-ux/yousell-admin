/**
 * Affiliate Commission Tracking Job Processor
 *
 * Calculates recurring commissions for active referrals.
 * Runs on schedule or triggered by Stripe webhook.
 */
import { Job } from 'bullmq'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

const PLAN_PRICES: Record<string, number> = {
  starter: 29, growth: 59, professional: 99, enterprise: 149,
}

interface AffiliateCommissionJobData {
  programId?: string
  period?: string
  userId?: string
}

export async function processAffiliateCommission(job: Job<AffiliateCommissionJobData>) {
  console.log(`[affiliate-commission] Processing job ${job.id}`)

  // Query all active referrals with subscriptions
  const { data: activeReferrals } = await supabase
    .from('affiliate_referrals')
    .select('id, referrer_client_id, referred_user_id, referral_code')
    .eq('status', 'subscribed')

  if (!activeReferrals || activeReferrals.length === 0) {
    console.log('[affiliate-commission] No active referrals to process')
    return { processed: 0 }
  }

  let processedCount = 0
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

  for (const referral of activeReferrals) {
    // Check if commission already exists for this period
    const { data: existing } = await supabase
      .from('affiliate_commissions')
      .select('id')
      .eq('referral_id', referral.id)
      .gte('period_start', periodStart)
      .limit(1)
      .single()

    if (existing) continue // Already processed

    // Get the referred user's subscription plan
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('client_id', referral.referred_user_id)
      .eq('status', 'active')
      .single()

    if (!sub) continue // No active subscription

    const planPrice = PLAN_PRICES[sub.plan] || 29
    const commissionRate = 0.20
    const commissionAmount = planPrice * commissionRate

    await supabase.from('affiliate_commissions').insert({
      referral_id: referral.id,
      referrer_client_id: referral.referrer_client_id,
      commission_amount: commissionAmount,
      commission_rate: commissionRate,
      status: 'pending',
      period_start: periodStart,
      period_end: periodEnd,
    })

    processedCount++
  }

  console.log(`[affiliate-commission] Processed ${processedCount} commissions`)
  return { processed: processedCount }
}
