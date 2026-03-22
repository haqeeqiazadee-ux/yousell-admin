/**
 * Engine-namespaced route: POST /api/engine/deploy
 * @engine admin-command-center
 *
 * Deploys a product to YOUSELL's own store.
 * Creates deployment record and queues store push.
 * Gated by Governor — checks plan access, quota, and budget.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { withGovernor } from '@/lib/engines/governor/middleware';

const handler = async (request: NextRequest) => {
  try {
    const supabase = createAdminClient();

    const body = await request.json();
    const { productId, targetStore, adminId, productIds } = body;

    // Batch deploy
    if (productIds && Array.isArray(productIds)) {
      const deployments: string[] = [];
      let deployed = 0;
      let failed = 0;

      for (const pid of productIds) {
        const deploymentId = `deploy_${pid}_${Date.now()}`;

        const { data: product } = await supabase
          .from('products')
          .select('title, price')
          .eq('id', pid)
          .single();

        if (!product) {
          failed++;
          continue;
        }

        const { error } = await supabase
          .from('shop_products')
          .upsert({
            product_id: pid,
            channel_type: targetStore || 'shopify',
            push_status: 'pending',
            title: product.title,
            price: product.price,
            deployment_id: deploymentId,
            deployed_by: adminId,
            created_at: new Date().toISOString(),
          }, { onConflict: 'product_id,channel_type' });

        if (error) {
          failed++;
        } else {
          deployed++;
          deployments.push(deploymentId);
        }
      }

      return NextResponse.json({
        status: 'batch_queued',
        deployed,
        failed,
        deployments,
      });
    }

    // Single deploy
    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const { data: product } = await supabase
      .from('products')
      .select('title, description, price, image_url')
      .eq('id', productId)
      .single();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const deploymentId = `deploy_${productId}_${Date.now()}`;

    const { error } = await supabase
      .from('shop_products')
      .upsert({
        product_id: productId,
        channel_type: targetStore || 'shopify',
        push_status: 'pending',
        title: product.title,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        deployment_id: deploymentId,
        deployed_by: adminId,
        created_at: new Date().toISOString(),
      }, { onConflict: 'product_id,channel_type' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      status: 'queued',
      deploymentId,
      productId,
      targetStore: targetStore || 'shopify',
    });
  } catch (error) {
    console.error('[API] /engine/deploy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
};

export const POST = withGovernor('admin-command-center', 'deploy', handler);
