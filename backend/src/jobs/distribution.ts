/**
 * Content Distribution Job Processor
 *
 * Distributes generated content to target channels (Ayrshare, Shopify blog, etc.).
 * Feature-flagged: external calls only when channel-specific flags are enabled.
 */
import { Job } from 'bullmq'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

interface DistributionJobData {
  content_id: string
  channels: string[]
  scheduled_at?: string
  client_id: string
  userId?: string
}

export async function processDistribution(job: Job<DistributionJobData>) {
  const { content_id, channels, client_id } = job.data
  console.log(`[distribution] Processing job ${job.id}: content=${content_id}, channels=${channels.join(',')}`)

  // Fetch content
  const { data: content } = await supabase
    .from('content_queue')
    .select('*')
    .eq('id', content_id)
    .single()

  if (!content) {
    throw new Error(`Content not found: ${content_id}`)
  }

  if (!content.generated_content) {
    throw new Error(`Content ${content_id} has no generated content`)
  }

  const results: Record<string, string> = {}

  for (const channel of channels) {
    switch (channel) {
      case 'ayrshare': {
        const enabled = process.env.AYRSHARE_ENABLED === 'true'
        const apiKey = process.env.AYRSHARE_API_KEY
        if (!enabled || !apiKey) {
          results[channel] = 'disabled'
          console.log(`[distribution] Ayrshare disabled — set AYRSHARE_ENABLED=true and AYRSHARE_API_KEY`)
          break
        }

        try {
          const res = await fetch('https://app.ayrshare.com/api/post', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              post: content.generated_content,
              platforms: ['twitter', 'facebook', 'instagram'],
              scheduleDate: job.data.scheduled_at || undefined,
            }),
            signal: AbortSignal.timeout(30000),
          })

          if (!res.ok) {
            const errText = await res.text()
            results[channel] = `failed: ${res.status}`
            console.error(`[distribution] Ayrshare error: ${errText}`)
          } else {
            results[channel] = 'published'
          }
        } catch (err) {
          results[channel] = `error: ${err instanceof Error ? err.message : 'unknown'}`
        }
        break
      }

      case 'shopify_blog': {
        const enabled = process.env.SHOPIFY_CONTENT_PUSH_ENABLED === 'true'
        if (!enabled) {
          results[channel] = 'disabled'
          break
        }

        // Fetch Shopify credentials
        const { data: channelConn } = await supabase
          .from('connected_channels')
          .select('access_token_encrypted, metadata')
          .eq('client_id', client_id)
          .eq('channel_type', 'shopify')
          .single()

        if (!channelConn?.access_token_encrypted) {
          results[channel] = 'no_connection'
          break
        }

        const shopDomain = (channelConn.metadata as Record<string, string>)?.shop_domain
        if (!shopDomain) {
          results[channel] = 'no_shop_domain'
          break
        }

        try {
          const res = await fetch(
            `https://${shopDomain}/admin/api/2024-01/blogs.json`,
            { headers: { 'X-Shopify-Access-Token': channelConn.access_token_encrypted } },
          )
          const blogs = (await res.json()) as Record<string, any>
          const blogId = blogs.blogs?.[0]?.id
          if (!blogId) {
            results[channel] = 'no_blog_found'
            break
          }

          const articleRes = await fetch(
            `https://${shopDomain}/admin/api/2024-01/blogs/${blogId}/articles.json`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': channelConn.access_token_encrypted,
              },
              body: JSON.stringify({
                article: {
                  title: content.content_type?.replace(/_/g, ' ') || 'New Content',
                  body_html: content.generated_content,
                  published: true,
                },
              }),
            },
          )

          results[channel] = articleRes.ok ? 'published' : `failed: ${articleRes.status}`
        } catch (err) {
          results[channel] = `error: ${err instanceof Error ? err.message : 'unknown'}`
        }
        break
      }

      default:
        results[channel] = 'scheduled'
    }
  }

  // Determine final status
  const allDisabled = Object.values(results).every(r => r === 'disabled' || r === 'scheduled')
  const anyPublished = Object.values(results).some(r => r === 'published')
  const finalStatus = anyPublished ? 'published' : allDisabled ? 'scheduled' : 'partially_published'

  await supabase
    .from('content_queue')
    .update({
      status: finalStatus,
      metadata: { ...(content.metadata || {}), distribution_results: results },
    })
    .eq('id', content_id)

  console.log(`[distribution] Content ${content_id} distribution: ${finalStatus}`, results)
  return { status: finalStatus, results }
}
