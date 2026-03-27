/**
 * Content Generation Job Processor
 *
 * Async content generation via Claude API. Provides an alternative
 * to the sync generation in /api/dashboard/content/generate/route.ts.
 *
 * Canonical template definitions are in src/lib/content/templates.ts.
 * This file mirrors them for backend (non-Next.js) context.
 *
 * Model selection: HOT products (score >= 80) → Claude Sonnet, else → Claude Haiku
 */
import { Job } from 'bullmq'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

// Mirror of src/lib/content/templates.ts — keep in sync
const TEMPLATES: Record<string, { systemPrompt: string; maxTokens: number }> = {
  product_description: {
    systemPrompt: 'You are an expert e-commerce copywriter. Write a compelling product description that highlights benefits, uses power words, and drives conversions. Keep it under 200 words.',
    maxTokens: 400,
  },
  social_post: {
    systemPrompt: 'You are a social media marketing expert. Write an engaging social media post that drives clicks and engagement. Include relevant hashtags. Keep it under 280 characters for Twitter compatibility.',
    maxTokens: 200,
  },
  ad_copy: {
    systemPrompt: 'You are a direct-response advertising copywriter. Write ad copy with a strong hook, clear value proposition, and compelling CTA. Include a headline (under 40 chars) and body (under 125 chars).',
    maxTokens: 300,
  },
  email_sequence: {
    systemPrompt: 'You are an email marketing specialist. Write a 3-email welcome/launch sequence for a product. Each email should have a subject line and body. Focus on building interest, demonstrating value, and driving purchase.',
    maxTokens: 1000,
  },
  video_script: {
    systemPrompt: 'You are a short-form video content strategist. Write a 30-60 second video script for TikTok/Reels that hooks viewers in the first 3 seconds, demonstrates the product, and ends with a CTA.',
    maxTokens: 500,
  },
  blog_post: {
    systemPrompt: 'You are an SEO content writer. Write a 500-800 word blog post about this product that naturally incorporates search keywords, provides genuine value to readers, and includes a compelling CTA at the end.',
    maxTokens: 1500,
  },
  seo_listing: {
    systemPrompt: 'You are an Amazon/marketplace SEO specialist. Write an optimized product listing with: title (under 200 chars with top keywords), 5 bullet points highlighting key features and benefits, and a keyword-rich description (under 2000 chars).',
    maxTokens: 800,
  },
}

function selectModel(finalScore?: number): string {
  return (finalScore != null && finalScore >= 80)
    ? 'claude-sonnet-4-5-20250514'
    : 'claude-haiku-4-5-20251001'
}

interface ContentJobData {
  product_id: string
  client_id: string
  content_type: string
  channel?: string
  queue_entry_id: string
  userId: string
}

export async function processContentGeneration(job: Job<ContentJobData>) {
  const { product_id, content_type, queue_entry_id } = job.data
  console.log(`[content-generation] Processing job ${job.id}: type=${content_type}`)

  const template = TEMPLATES[content_type]
  if (!template) {
    await supabase.from('content_queue').update({ status: 'failed', error: `Unknown content type: ${content_type}` }).eq('id', queue_entry_id)
    throw new Error(`Unknown content type: ${content_type}`)
  }

  // Fetch product
  const { data: product } = await supabase
    .from('products')
    .select('title, description, price, source, category, final_score, trend_stage')
    .eq('id', product_id)
    .single()

  if (!product) {
    await supabase.from('content_queue').update({ status: 'failed', error: 'Product not found' }).eq('id', queue_entry_id)
    throw new Error(`Product not found: ${product_id}`)
  }

  const productContext = [
    `Product: ${product.title}`,
    product.description ? `Description: ${product.description}` : null,
    product.price ? `Price: $${product.price}` : null,
    product.category ? `Category: ${product.category}` : null,
  ].filter(Boolean).join('\n')

  const prompt = `Generate ${content_type.replace(/_/g, ' ')} for this product:\n\n${productContext}`

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) {
    await supabase.from('content_queue').update({ status: 'failed', error: 'ANTHROPIC_API_KEY not configured' }).eq('id', queue_entry_id)
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const model = selectModel(product.final_score)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: template.maxTokens,
      system: template.systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const errBody = await response.text()
    await supabase.from('content_queue').update({ status: 'failed', error: `AI error: ${response.status}` }).eq('id', queue_entry_id)
    throw new Error(`Anthropic API error: ${response.status} ${errBody}`)
  }

  const result = (await response.json()) as Record<string, any>
  const generatedContent = result.content?.[0]?.text || ''

  await supabase.from('content_queue').update({
    generated_content: generatedContent,
    status: 'generated',
    completed_at: new Date().toISOString(),
  }).eq('id', queue_entry_id)

  console.log(`[content-generation] Content generated for ${product_id}`)
  return { status: 'generated', content_id: queue_entry_id }
}
