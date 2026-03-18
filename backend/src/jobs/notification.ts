/**
 * Notification Job Processor
 *
 * Inserts notifications into the notifications table and
 * optionally sends email for action_required types via Resend.
 */
import { Job } from 'bullmq'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

interface NotificationJobData {
  recipientId: string
  type: 'email' | 'in_app' | 'push'
  template: string
  data: Record<string, unknown>
  title?: string
  message?: string
  category?: string
  action_url?: string
}

export async function processNotification(job: Job<NotificationJobData>) {
  const { recipientId, type, title, message, category, action_url, data: jobData } = job.data
  console.log(`[notification] Processing: recipient=${recipientId}, type=${type}`)

  const notifTitle = title || jobData.title as string || 'Notification'
  const notifMessage = message || jobData.message as string || ''

  // Always insert in-app notification
  const { error } = await supabase.from('notifications').insert({
    user_id: recipientId,
    title: notifTitle,
    message: notifMessage,
    type: type === 'email' ? 'action_required' : 'info',
    category: category || 'system',
    action_url: action_url || null,
    metadata: jobData,
  })

  if (error) {
    console.error('[notification] Insert error:', error)
    throw error
  }

  // Send email for action_required notifications
  if (type === 'email' || type === 'push') {
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      // Look up user email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', recipientId)
        .single()

      if (profile?.email) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${resendKey}`,
            },
            body: JSON.stringify({
              from: process.env.RESEND_FROM || 'YouSell <noreply@yousell.online>',
              to: profile.email,
              subject: notifTitle,
              html: `<p>${notifMessage}</p>${action_url ? `<p><a href="${action_url}">View details</a></p>` : ''}`,
            }),
          })
          console.log(`[notification] Email sent to ${profile.email}`)
        } catch (err) {
          console.error('[notification] Email error:', err)
        }
      }
    }
  }

  return { status: 'sent', type }
}
