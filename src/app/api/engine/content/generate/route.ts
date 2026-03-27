/**
 * Engine-namespaced route: POST /api/engine/content/generate
 * @engine content-engine
 *
 * Generates AI content for a product. Calls ContentCreationEngine.
 * Gated by Governor — checks plan access, quota, and budget.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { withGovernor } from '@/lib/engines/governor/middleware';

const handler = async (request: NextRequest) => {
  try {
    const supabase = createAdminClient();

    const body = await request.json();
    const { productId, contentType, platform } = body;

    if (!productId || !contentType || !platform) {
      return NextResponse.json(
        { error: 'productId, contentType, and platform are required' },
        { status: 400 },
      );
    }

    // Get product data
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('title, description, tier')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Queue content generation via content_queue
    const contentId = `cnt_${productId}_${contentType}_${Date.now()}`;
    const { error: insertError } = await supabase
      .from('content_queue')
      .insert({
        product_id: productId,
        content_id: contentId,
        content_type: contentType,
        platform,
        status: 'queued',
        credits_cost: product.tier === 'HOT' ? 5 : 2,
        model_used: product.tier === 'HOT' ? 'sonnet' : 'haiku',
        metadata: {
          productTitle: product.title,
          queuedAt: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      contentId,
      status: 'queued',
      message: `Content generation queued for ${contentType} on ${platform}`,
    });
  } catch (error) {
    console.error('[API] /engine/content/generate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
};

export const POST = withGovernor('content-engine', 'generate_caption', handler);
