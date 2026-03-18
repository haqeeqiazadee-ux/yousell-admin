import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Resend Webhook Handler
 *
 * Tracks email delivery events (delivered, bounced, opened, clicked)
 * and updates outreach_emails status accordingly.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const emailId = data.email_id

    if (!emailId) {
      return NextResponse.json({ received: true })
    }

    // Map Resend event types to our status
    const statusMap: Record<string, string> = {
      'email.delivered': 'delivered',
      'email.bounced': 'bounced',
      'email.opened': 'opened',
      'email.clicked': 'clicked',
      'email.complained': 'spam',
    }

    const newStatus = statusMap[type]
    if (!newStatus) {
      return NextResponse.json({ received: true })
    }

    // Update outreach_emails by resend_id
    const { error } = await supabase
      .from('outreach_emails')
      .update({
        status: newStatus,
        metadata: {
          resend_event: type,
          resend_timestamp: data.created_at || new Date().toISOString(),
        },
      })
      .eq('resend_id', emailId)

    if (error) {
      console.error('[Resend Webhook] Update error:', error)
    } else {
      console.log(`[Resend Webhook] Email ${emailId} status: ${newStatus}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Resend Webhook] Error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
