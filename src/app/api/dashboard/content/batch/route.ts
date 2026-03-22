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

/**
 * POST /api/dashboard/content/batch
 * Generate content for multiple products in a single request.
 *
 * Body: {
 *   items: Array<{ productId: string; contentType: ContentType; channel?: string }>
 *   // Max 10 items per batch to control costs
 * }
 *
 * Returns results for each item (some may fail while others succeed).
 */
export async function POST(request: NextRequest) {
  try {
    const clientCtx = await authenticateClient(request)
    const admin = createAdminClient()

    const contentPlans = ['growth', 'professional', 'enterprise']
    if (!clientCtx.subscription || !contentPlans.includes(clientCtx.subscription.plan)) {
      return NextResponse.json({ error: 'Content engine requires Growth plan or higher' }, { status: 403 })
    }

    const body = await request.json()
    const { items } = body as { items: Array<{ productId: string; contentType: string; channel?: string }> }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items array is required (1-10 items)' }, { status: 400 })
    }

    if (items.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 items per batch' }, { status: 400 })
    }

    // Validate all content types upfront
    for (const item of items) {
      if (!item.productId || !item.contentType) {
        return NextResponse.json({ error: 'Each item requires productId and contentType' }, { status: 400 })
      }
      if (!isValidContentType(item.contentType)) {
        return NextResponse.json({ error: `Invalid content type: ${item.contentType}` }, { status: 400 })
      }
    }

    // Calculate total credit cost
    const isUnlimited = clientCtx.subscription?.plan === 'enterprise'
    let totalCost = 0
    for (const item of items) {
      const creditKey = getCreditType(item.contentType as ContentType) as keyof typeof CONTENT_CREDIT_COSTS
      totalCost += CONTENT_CREDIT_COSTS[creditKey] || 1
    }

    // Check credits upfront
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
        if (available < totalCost) {
          return NextResponse.json({
            error: `Insufficient credits. Need ${totalCost}, have ${available}.`,
            creditsRemaining: available,
            totalCost,
          }, { status: 403 })
        }
      }
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (!anthropicKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    // Fetch all unique products in one query
    const productIds = [...new Set(items.map(i => i.productId))]
    const { data: products } = await admin
      .from('products')
      .select('id, title, description, price, source, category, final_score, trend_stage')
      .in('id', productIds)

    const productMap = new Map((products || []).map(p => [p.id, p]))

    // Process each item sequentially (to respect rate limits)
    const results: Array<{
      productId: string
      contentType: string
      status: 'generated' | 'failed'
      contentId?: string
      content?: string
      error?: string
    }> = []

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        results.push({ productId: item.productId, contentType: item.contentType, status: 'failed', error: 'Product not found' })
        continue
      }

      const contentType = item.contentType as ContentType
      const template = CONTENT_TEMPLATES[contentType]
      const prompt = buildContentPrompt(contentType, product)

      // Insert pending queue entry
      const { data: queueEntry, error: insertErr } = await admin
        .from('content_queue')
        .insert({
          client_id: clientCtx.clientId,
          product_id: item.productId,
          content_type: item.contentType,
          channel: item.channel || null,
          prompt,
          status: 'pending',
          requested_by: clientCtx.userId,
        })
        .select('id')
        .single()

      if (insertErr || !queueEntry) {
        results.push({ productId: item.productId, contentType: item.contentType, status: 'failed', error: 'Failed to create queue entry' })
        continue
      }

      try {
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
          throw new Error(`AI error: ${response.status}`)
        }

        const result = await response.json()
        const generatedContent = result.content?.[0]?.text || ''

        await admin
          .from('content_queue')
          .update({ generated_content: generatedContent, status: 'generated', completed_at: new Date().toISOString() })
          .eq('id', queueEntry.id)

        results.push({
          productId: item.productId,
          contentType: item.contentType,
          status: 'generated',
          contentId: queueEntry.id,
          content: generatedContent,
        })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        await admin.from('content_queue').update({ status: 'failed', error: errorMsg }).eq('id', queueEntry.id)
        results.push({ productId: item.productId, contentType: item.contentType, status: 'failed', contentId: queueEntry.id, error: errorMsg })
      }
    }

    // Deduct credits for successful generations
    const successCount = results.filter(r => r.status === 'generated').length
    if (!isUnlimited && successCount > 0) {
      let actualCost = 0
      for (const r of results) {
        if (r.status === 'generated') {
          const creditKey = getCreditType(r.contentType as ContentType) as keyof typeof CONTENT_CREDIT_COSTS
          actualCost += CONTENT_CREDIT_COSTS[creditKey] || 1
        }
      }

      const now = new Date()
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

      const { data: existing } = await admin
        .from('content_credits')
        .select('id, used_credits')
        .eq('client_id', clientCtx.clientId)
        .gte('period_start', periodStart)
        .order('period_start', { ascending: false })
        .limit(1)
        .single()

      if (existing) {
        await admin.from('content_credits').update({ used_credits: existing.used_credits + actualCost }).eq('id', existing.id)
      } else {
        const { PRICING_TIERS } = await import('@/lib/stripe')
        const planKey = (clientCtx.subscription?.plan || 'starter') as keyof typeof PRICING_TIERS
        const totalCredits = PRICING_TIERS[planKey]?.contentCredits ?? 50
        await admin.from('content_credits').insert({
          client_id: clientCtx.clientId,
          period_start: periodStart,
          period_end: periodEnd,
          total_credits: totalCredits === Infinity ? 999999 : totalCredits,
          used_credits: actualCost,
        })
      }
    }

    const generated = results.filter(r => r.status === 'generated').length
    const failed = results.filter(r => r.status === 'failed').length

    return NextResponse.json({
      summary: { total: items.length, generated, failed },
      results,
    })
  } catch (err) {
    console.error('[Content Batch] Error:', err)
    const message = err instanceof Error ? err.message : 'Internal error'
    const status = message.includes('Unauthorized') || message.includes('No Authorization') ? 401 : message.includes('Not a client') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
