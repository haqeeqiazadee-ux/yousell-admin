import { NextRequest, NextResponse } from 'next/server'
import { authenticateClient } from '@/lib/auth/client-api-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { CONTENT_CREDIT_COSTS } from '@/lib/stripe'
import {
  CONTENT_TEMPLATES,
  type ContentType,
  isValidContentType,
  getCreditType,
  buildContentPrompt,
  selectModel,
} from '@/lib/content/templates'

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

    if (!isValidContentType(contentType)) {
      return NextResponse.json({ error: `Invalid content type. Must be one of: ${Object.keys(CONTENT_TEMPLATES).join(', ')}` }, { status: 400 })
    }

    const template = CONTENT_TEMPLATES[contentType]

    // Check content credits (skip for enterprise/unlimited plans)
    const creditKey = getCreditType(contentType as ContentType) as keyof typeof CONTENT_CREDIT_COSTS
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

    const prompt = buildContentPrompt(contentType as ContentType, product)

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
      // Select model based on product tier (HOT → Sonnet, else → Haiku)
      const tier = product.final_score != null && product.final_score >= 80 ? 'HOT' : undefined
      const { model } = selectModel(tier)

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
