import { NextRequest, NextResponse } from 'next/server'
import { authenticateClient } from '@/lib/auth/client-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// GET — Return or generate client's referral code + stats
export async function GET(req: NextRequest) {
  try {
    const clientCtx = await authenticateClient(req)
    const admin = createAdminClient()

    // Get or create referral code
    const { data: client } = await admin
      .from('clients')
      .select('referral_code')
      .eq('id', clientCtx.clientId)
      .single()

    let referralCode = client?.referral_code
    if (!referralCode) {
      referralCode = generateReferralCode()
      await admin
        .from('clients')
        .update({ referral_code: referralCode })
        .eq('id', clientCtx.clientId)
    }

    // Get referral stats
    const { data: referrals } = await admin
      .from('affiliate_referrals')
      .select('id, status')
      .eq('referrer_client_id', clientCtx.clientId)

    const stats = {
      total_referrals: referrals?.length || 0,
      signed_up: referrals?.filter(r => r.status === 'signed_up').length || 0,
      subscribed: referrals?.filter(r => r.status === 'subscribed').length || 0,
    }

    // Get commissions
    const { data: commissions } = await admin
      .from('affiliate_commissions')
      .select('*')
      .eq('referrer_client_id', clientCtx.clientId)
      .order('created_at', { ascending: false })

    const totalEarnings = commissions
      ?.filter(c => c.status === 'approved' || c.status === 'paid')
      .reduce((sum: number, c) => sum + Number(c.commission_amount), 0) || 0

    const pendingEarnings = commissions
      ?.filter(c => c.status === 'pending')
      .reduce((sum: number, c) => sum + Number(c.commission_amount), 0) || 0

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yousell.online'

    return NextResponse.json({
      referral_code: referralCode,
      referral_url: `${siteUrl}/signup?ref=${referralCode}`,
      stats,
      total_earnings: totalEarnings,
      pending_earnings: pendingEarnings,
      commissions: commissions || [],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    const status = message.includes('Unauthorized') || message.includes('No Authorization') ? 401 : message.includes('Not a client') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
