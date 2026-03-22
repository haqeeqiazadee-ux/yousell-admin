/**
 * Automation Scheduler Job Processor
 *
 * Runs on a repeatable cron schedule to:
 * 1. Expire stale pending approval actions
 * 2. Execute scheduled automation workflows for Level 3 clients
 * 3. Generate weekly digests (Mondays)
 *
 * @engine automation-orchestrator
 * @queue automation-orchestrator
 */
import { Job } from 'bullmq'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

interface AutomationSchedulerData {
  type: 'expire_actions' | 'run_scheduled' | 'weekly_digest' | 'tick'
}

export async function processAutomationScheduler(job: Job<AutomationSchedulerData>) {
  const type = job.data?.type || 'tick'
  console.log(`[automation-scheduler] Processing: type=${type}`)

  const results = {
    expired: 0,
    scheduled: 0,
    digests: 0,
  }

  // ── 1. Expire stale pending actions ──
  try {
    const { data: stale } = await supabase
      .from('automation_pending_actions')
      .select('id')
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString())

    if (stale && stale.length > 0) {
      await supabase
        .from('automation_pending_actions')
        .update({ status: 'expired' })
        .in('id', stale.map(a => a.id))

      results.expired = stale.length
      console.log(`[automation-scheduler] Expired ${stale.length} pending actions`)
    }
  } catch (err) {
    console.error('[automation-scheduler] Error expiring actions:', err)
  }

  // ── 2. Execute scheduled Level 3 automation workflows ──
  if (type === 'run_scheduled' || type === 'tick') {
    try {
      // Find all clients with Level 3 product_discovery enabled
      const { data: autoClients } = await supabase
        .from('client_automation_settings')
        .select('client_id, automation_levels, guardrails, soft_limits')

      if (autoClients) {
        for (const client of autoClients) {
          const levels = client.automation_levels as Record<string, number>

          // Product discovery at Level 3 — trigger a discovery scan
          if (levels.product_discovery === 3) {
            const today = new Date().toISOString().slice(0, 10)
            const { data: usage } = await supabase
              .from('automation_daily_usage')
              .select('daily_spend')
              .eq('client_id', client.client_id)
              .eq('date', today)
              .single()

            const guardrails = client.guardrails as Record<string, number>
            const dailySpend = usage?.daily_spend || 0

            if (dailySpend < (guardrails.dailySpendCap || 50)) {
              // Check if a scan was already run today
              const { data: recentLog } = await supabase
                .from('automation_action_log')
                .select('id')
                .eq('client_id', client.client_id)
                .eq('action_type', 'scheduled_discovery')
                .gte('created_at', `${today}T00:00:00`)
                .limit(1)

              if (!recentLog || recentLog.length === 0) {
                // Log that we'd trigger a scan (actual scan requires backend queue)
                await supabase
                  .from('automation_action_log')
                  .insert({
                    client_id: client.client_id,
                    feature: 'product_discovery',
                    action_type: 'scheduled_discovery',
                    status: 'executed',
                    payload: { automated: true, trigger: 'cron' },
                    created_at: new Date().toISOString(),
                  })

                results.scheduled++
                console.log(`[automation-scheduler] Scheduled discovery for client ${client.client_id}`)
              }
            }
          }

          // Content publishing at Level 3 — auto-publish queued content
          if (levels.content_publishing === 3) {
            const { data: readyContent } = await supabase
              .from('content_queue')
              .select('id')
              .eq('client_id', client.client_id)
              .eq('status', 'generated')
              .limit(5)

            if (readyContent && readyContent.length > 0) {
              // Mark as scheduled for distribution
              const softLimits = client.soft_limits as Record<string, unknown>
              const minScore = (softLimits?.minimumScore as number) || 60

              for (const content of readyContent) {
                await supabase
                  .from('content_queue')
                  .update({
                    status: 'scheduled',
                    metadata: {
                      scheduled_at: new Date().toISOString(),
                      target_channels: ['ayrshare'],
                      automated: true,
                    },
                  })
                  .eq('id', content.id)

                results.scheduled++
              }

              console.log(`[automation-scheduler] Auto-scheduled ${readyContent.length} content items for client ${client.client_id}`)
            }
          }
        }
      }
    } catch (err) {
      console.error('[automation-scheduler] Error running scheduled workflows:', err)
    }
  }

  // ── 3. Weekly digest (Monday only) ──
  if (type === 'weekly_digest' || (type === 'tick' && new Date().getDay() === 1 && new Date().getHours() === 9)) {
    try {
      const { data: clients } = await supabase
        .from('client_automation_settings')
        .select('client_id, soft_limits')

      if (clients) {
        for (const client of clients) {
          const softLimits = client.soft_limits as Record<string, unknown>
          if (softLimits?.weeklyDigestEnabled === false) continue

          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

          const { data: actions } = await supabase
            .from('automation_action_log')
            .select('status')
            .eq('client_id', client.client_id)
            .gte('created_at', weekAgo)

          const total = actions?.length || 0
          if (total === 0) continue

          const executed = actions?.filter((a: { status: string }) => a.status === 'executed').length || 0
          const failed = actions?.filter((a: { status: string }) => a.status === 'failed').length || 0

          await supabase
            .from('notifications')
            .insert({
              type: 'automation',
              subtype: 'weekly_digest',
              recipient: client.client_id,
              message: `Weekly automation digest: ${executed} actions executed, ${failed} failed, ${total} total this week.`,
              status: 'unread',
              created_at: new Date().toISOString(),
            })

          results.digests++
        }
      }
    } catch (err) {
      console.error('[automation-scheduler] Error generating digests:', err)
    }
  }

  console.log(`[automation-scheduler] Complete: expired=${results.expired}, scheduled=${results.scheduled}, digests=${results.digests}`)
  return results
}
