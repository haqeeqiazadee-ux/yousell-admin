import { NextRequest, NextResponse } from 'next/server'
import { authenticateClient } from '@/lib/auth/client-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { CONTENT_CREDIT_COSTS } from '@/lib/stripe'

// Map content types to credit cost keys
const CONTENT_TYPE_TO_CREDIT: Record<string, keyof typeof CONTENT_CREDIT_COSTS> = {
  product_description: 'caption',
  social_post: 'caption',
  ad_copy: 'ad',
  email_sequence: 'email_sequence',
  video_script: 'short_video',
  blog_post: 'blog',
}

const CONTENT_TEMPLATES: Record<string, { systemPrompt: string; maxTokens: number }> = {
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
}

export async function POST(request: NextRequest) {
  try {
    const clientCtx = await authenticateClient(request)
    const admin = createAdminClient()

    // Content engine requires Growth plan or higher
    const contentPlans = ['growth', 'professional', 'enterprise']
    if (!clientCtx.subscription || !contentPlans.includes(clientCtx.subscription.plan)) {
      return NextResponse.json({ error: 'Content engine requires Growth plan or higher' }, { status: 403 })
    }

    const body = await request.json()
    const { productId, contentType, channel } = body

    if (!productId || !contentType) {
      return NextResponse.json({ error: 'productId and contentType are required' }, { status: 400 })
    }

    const template = CONTENT_TEMPLATES[contentType]
    if (!template) {
      return NextResponse.json({ error: `Invalid content type. Must be one of: ${Object.keys(CONTENT_TEMPLATES).join(', ')}` }, { status: 400 })
    }

    // Check content credits (skip for enterprise/unlimited plans)
    const creditKey = CONTENT_TYPE_TO_CREDIT[contentType] || 'caption'
    const creditCost = CONTENT_CREDIT_COSTS[creditKey]
    const isUnlimited = clientCtx.subscription?.plan === 'enterprise'

    if (!isUnlimited) {
      const now = new Date()
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { data: credits } = await admin
        .from('content_credits')
        .select('id, total_credits, used_credits, bonus_credits')
        .eq('client_id', clientCtx.clientId)
        .gte('period_start', periodStart)
        .order('period_start', { ascending: false })
        .limit(1)
        .single()

      if (credits) {
        const available = (credits.total_credits + credits.bonus_credits) - credits.used_credits
        if (available < creditCost) {
          return NextResponse.json({
            error: `Insufficient content credits. Need ${creditCost}, have ${available}. Upgrade your plan or purchase additional credits.`,
            creditsRemaining: available,
            creditCost,
          }, { status: 403 })
        }
      }
      // If no credits record exists yet, allow generation (first use in billing period)
    }

    // Get product info for context
    const { data: product } = await admin
      .from('products')
      .select('title, description, price, source, category, final_score, trend_stage')
      .eq('id', productId)
      .single()

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const productContext = [
      `Product: ${product.title}`,
      product.description ? `Description: ${product.description}` : null,
      product.price ? `Price: $${product.price}` : null,
      product.category ? `Category: ${product.category}` : null,
      product.source ? `Platform: ${product.source}` : null,
      product.trend_stage ? `Trend Stage: ${product.trend_stage}` : null,
      channel ? `Target Channel: ${channel}` : null,
    ].filter(Boolean).join('\n')

    const prompt = `Generate ${contentType.replace(/_/g, ' ')} for this product:\n\n${productContext}`

    // Insert queue entry as pending
    const { data: queueEntry, error: insertError } = await admin
      .from('content_queue')
      .insert({
        client_id: clientCtx.clientId,
        product_id: productId,
        content_type: contentType,
        channel: channel || null,
        prompt,
        status: 'pending',
        requested_by: clientCtx.userId,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[Content Generate] Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create content request' }, { status: 500 })
    }

    // Generate content using Anthropic Claude Haiku (cost-optimized per v7 spec)
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      await admin
        .from('content_queue')
        .update({ status: 'failed', error: 'AI service not configured' })
        .eq('id', queueEntry.id)

      return NextResponse.json({
        id: queueEntry.id,
        status: 'failed',
        error: 'AI service not configured — content generation requires ANTHROPIC_API_KEY',
      })
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: template.maxTokens,
          system: template.systemPrompt,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!response.ok) {
        const errBody = await response.text()
        throw new Error(`Anthropic API error: ${response.status} ${errBody}`)
      }

      const result = await response.json()
      const generatedContent = result.content?.[0]?.text || ''

      await admin
        .from('content_queue')
        .update({
          generated_content: generatedContent,
          status: 'generated',
          completed_at: new Date().toISOString(),
        })
        .eq('id', queueEntry.id)

      // Track usage and deduct credits
      const now = new Date()
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

      await admin.from('usage_tracking').insert({
        client_id: clientCtx.clientId,
        resource: 'content',
        action: contentType,
        count: 1,
        period_start: periodStart,
        period_end: periodEnd,
      })

      // Deduct content credits (upsert: create record if first use this period)
      if (!isUnlimited) {
        const { data: existing } = await admin
          .from('content_credits')
          .select('id, used_credits')
          .eq('client_id', clientCtx.clientId)
          .gte('period_start', periodStart)
          .order('period_start', { ascending: false })
          .limit(1)
          .single()

        if (existing) {
          await admin
            .from('content_credits')
            .update({ used_credits: existing.used_credits + creditCost })
            .eq('id', existing.id)
        } else {
          // First content generation this period — create credits record
          const { PRICING_TIERS } = await import('@/lib/stripe')
          const planKey = (clientCtx.subscription?.plan || 'starter') as keyof typeof PRICING_TIERS
          const totalCredits = PRICING_TIERS[planKey]?.contentCredits ?? 50

          await admin.from('content_credits').insert({
            client_id: clientCtx.clientId,
            period_start: periodStart,
            period_end: periodEnd,
            total_credits: totalCredits === Infinity ? 999999 : totalCredits,
            used_credits: creditCost,
          })
        }
      }

      return NextResponse.json({
        id: queueEntry.id,
        status: 'generated',
        content: generatedContent,
        contentType,
        channel,
      })
    } catch (aiError: unknown) {
      const errorMessage = aiError instanceof Error ? aiError.message : 'Unknown AI error'
      console.error('[Content Generate] AI error:', errorMessage)

      await admin
        .from('content_queue')
        .update({ status: 'failed', error: errorMessage })
        .eq('id', queueEntry.id)

      return NextResponse.json({
        id: queueEntry.id,
        status: 'failed',
        error: 'Content generation failed',
      })
    }
  } catch (err) {
    console.error('[Content Generate] Error:', err)
    const message = err instanceof Error ? err.message : 'Internal error'
    const status = message.includes('Unauthorized') || message.includes('No Authorization') ? 401 : message.includes('Not a client') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
