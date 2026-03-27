/**
 * Influencer Outreach Job Processor
 *
 * Sends outreach emails to influencers via Resend and tracks status.
 * Updates creator_product_matches status for pipeline tracking.
 */
import { Job } from 'bullmq'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

interface InfluencerOutreachData {
  influencer_id: string
  product_id: string
  email_draft?: string
  subject?: string
  client_id?: string
  userId: string
}

export async function processInfluencerOutreach(job: Job<InfluencerOutreachData>) {
  const { influencer_id, product_id, email_draft, subject } = job.data
  console.log(`[influencer-outreach] Processing: influencer=${influencer_id}, product=${product_id}`)

  // Fetch influencer details
  const { data: influencer } = await supabase
    .from('influencers')
    .select('username, email, platform, niche')
    .eq('id', influencer_id)
    .single()

  if (!influencer) {
    throw new Error(`Influencer not found: ${influencer_id}`)
  }

  if (!influencer.email) {
    console.log(`[influencer-outreach] No email for influencer ${influencer_id}`)
    return { status: 'no_email' }
  }

  // Fetch product
  const { data: product } = await supabase
    .from('products')
    .select('title, category')
    .eq('id', product_id)
    .single()

  const emailSubject = subject || `Collaboration Opportunity: ${product?.title || 'Exciting Product'}`
  const emailBody = email_draft || `Hi ${influencer.username},\n\nWe have an exciting product opportunity.\n\nBest,\nThe YouSell Team`

  // Insert outreach record
  const { data: outreach } = await supabase
    .from('outreach_emails')
    .insert({
      influencer_id,
      product_id,
      subject: emailSubject,
      body: emailBody,
      status: 'draft',
    })
    .select()
    .single()

  // Send via Resend
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.log('[influencer-outreach] RESEND_API_KEY not set — email stays as draft')
    return { status: 'draft', outreach_id: outreach?.id }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'YouSell <outreach@yousell.online>',
        to: influencer.email,
        subject: emailSubject,
        text: emailBody,
      }),
    })

    if (res.ok) {
      const emailData = (await res.json()) as Record<string, any>

      if (outreach) {
        await supabase.from('outreach_emails').update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          resend_id: emailData.id,
        }).eq('id', outreach.id)
      }

      // Update creator_product_matches status
      await supabase
        .from('creator_product_matches')
        .update({ status: 'contacted' })
        .eq('product_id', product_id)
        .eq('influencer_id', influencer_id)

      console.log(`[influencer-outreach] Email sent to ${influencer.email}`)
      return { status: 'sent', resend_id: emailData.id }
    } else {
      console.error(`[influencer-outreach] Resend error: ${res.status}`)
      return { status: 'failed' }
    }
  } catch (err) {
    console.error('[influencer-outreach] Send error:', err)
    return { status: 'error' }
  }
}
