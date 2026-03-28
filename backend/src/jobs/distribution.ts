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

      case 'meta':
      case 'facebook':
      case 'instagram': {
        // Direct Meta Graph API posting (fallback when Ayrshare not configured)
        const enabled = process.env.META_PUBLISHING_ENABLED === 'true'
        const pageToken = process.env.META_PAGE_ACCESS_TOKEN
        const pageId = process.env.META_PAGE_ID
        const igAccountId = process.env.META_IG_ACCOUNT_ID

        if (!enabled || !pageToken) {
          results[channel] = 'disabled'
          console.log(`[distribution] Meta ${channel} disabled — set META_PUBLISHING_ENABLED=true`)
          break
        }

        try {
          if (channel === 'instagram' && igAccountId) {
            // Instagram Content Publishing API (requires business account)
            // Step 1: Create media container
            const imageUrl = (content.metadata as Record<string, unknown>)?.image_url as string
            const createRes = await fetch(
              `https://graph.facebook.com/v19.0/${igAccountId}/media`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  caption: content.generated_content,
                  image_url: imageUrl || undefined,
                  access_token: pageToken,
                }),
                signal: AbortSignal.timeout(30000),
              },
            )
            const createData = await createRes.json() as Record<string, unknown>

            if (createData.id) {
              // Step 2: Publish the container
              const publishRes = await fetch(
                `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    creation_id: createData.id,
                    access_token: pageToken,
                  }),
                  signal: AbortSignal.timeout(30000),
                },
              )
              results[channel] = publishRes.ok ? 'published' : `failed: ${publishRes.status}`
            } else {
              results[channel] = `failed: ${(createData.error as Record<string, unknown>)?.message || 'container creation failed'}`
            }
          } else if (pageId) {
            // Facebook Page post
            const postRes = await fetch(
              `https://graph.facebook.com/v19.0/${pageId}/feed`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  message: content.generated_content,
                  access_token: pageToken,
                }),
                signal: AbortSignal.timeout(30000),
              },
            )
            results[channel] = postRes.ok ? 'published' : `failed: ${postRes.status}`
          } else {
            results[channel] = 'no_page_id'
          }
        } catch (err) {
          results[channel] = `error: ${err instanceof Error ? err.message : 'unknown'}`
        }
        break
      }

      case 'tiktok': {
        // TikTok Content Posting API
        // https://developers.tiktok.com/doc/content-posting-api-get-started
        const enabled = process.env.TIKTOK_CONTENT_ENABLED === 'true'
        if (!enabled) {
          results[channel] = 'disabled'
          console.log(`[distribution] TikTok content posting disabled`)
          break
        }

        // Fetch TikTok creator credentials
        const { data: tiktokConn } = await supabase
          .from('connected_channels')
          .select('access_token_encrypted, metadata')
          .eq('client_id', client_id)
          .eq('channel_type', 'tiktok-creator')
          .single()

        if (!tiktokConn?.access_token_encrypted) {
          results[channel] = 'no_connection'
          break
        }

        try {
          const { createDecipheriv } = await import('crypto')
          const hex = process.env.ENCRYPTION_KEY
          if (!hex || hex.length !== 64) throw new Error('ENCRYPTION_KEY not configured')
          const key = Buffer.from(hex, 'hex')
          const packed = Buffer.from(tiktokConn.access_token_encrypted, 'base64')
          const iv = packed.subarray(0, 12)
          const authTag = packed.subarray(packed.length - 16)
          const ciphertext = packed.subarray(12, packed.length - 16)
          const decipher = createDecipheriv('aes-256-gcm', key, iv)
          decipher.setAuthTag(authTag)
          const tiktokToken = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')

          // TikTok Content Posting API — create a text post or photo post
          const postRes = await fetch('https://open.tiktokapis.com/v2/post/publish/content/init/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tiktokToken}`,
            },
            body: JSON.stringify({
              post_info: {
                title: (content.content_type as string)?.replace(/_/g, ' ') || 'New Content',
                description: content.generated_content?.slice(0, 2200),
                privacy_level: 'PUBLIC_TO_EVERYONE',
                disable_comment: false,
              },
              source_info: {
                source: 'PULL_FROM_URL',
                video_url: (content.metadata as Record<string, unknown>)?.video_url || undefined,
              },
            }),
            signal: AbortSignal.timeout(30000),
          })

          if (postRes.ok) {
            const postData = await postRes.json() as Record<string, unknown>
            const postError = postData.error as Record<string, unknown> | undefined
            results[channel] = (postError?.code === 'ok' || !postError) ? 'published' : `failed: ${postError?.message}`
          } else {
            results[channel] = `failed: ${postRes.status}`
          }
        } catch (err) {
          results[channel] = `error: ${err instanceof Error ? err.message : 'unknown'}`
        }
        break
      }

      case 'pinterest': {
        // Pinterest API v5 — Create Pin
        const enabled = process.env.PINTEREST_ENABLED === 'true'
        const pinterestToken = process.env.PINTEREST_ACCESS_TOKEN
        if (!enabled || !pinterestToken) {
          results[channel] = 'disabled'
          console.log(`[distribution] Pinterest disabled — set PINTEREST_ENABLED=true`)
          break
        }

        try {
          const boardId = process.env.PINTEREST_BOARD_ID || ''
          const imageUrl = (content.metadata as Record<string, unknown>)?.image_url as string

          const pinRes = await fetch('https://api.pinterest.com/v5/pins', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${pinterestToken}`,
            },
            body: JSON.stringify({
              title: (content.content_type as string)?.replace(/_/g, ' ') || 'New Content',
              description: content.generated_content?.slice(0, 500),
              board_id: boardId,
              media_source: imageUrl
                ? { source_type: 'image_url', url: imageUrl }
                : undefined,
              link: (content.metadata as Record<string, unknown>)?.product_url || undefined,
            }),
            signal: AbortSignal.timeout(30000),
          })

          results[channel] = pinRes.ok ? 'published' : `failed: ${pinRes.status}`
        } catch (err) {
          results[channel] = `error: ${err instanceof Error ? err.message : 'unknown'}`
        }
        break
      }

      default:
        results[channel] = 'unsupported'
        console.log(`[distribution] Unknown channel: ${channel}`)
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
