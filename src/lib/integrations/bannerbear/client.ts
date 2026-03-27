/**
 * Bannerbear API Client — Image Generation
 *
 * Generates product images from templates: social posts, ads,
 * product cards, carousel frames, and mockups.
 *
 * V9 Content Engine Task 9.37: Bannerbear integration for image content
 *
 * @see https://developers.bannerbear.com/
 */

import { getCircuitBreaker } from '@/lib/circuit-breaker';
import { engineLogger } from '@/lib/logger';

const API_KEY = () => process.env.BANNERBEAR_API_KEY || '';
const BASE_URL = 'https://api.bannerbear.com/v2';
const log = engineLogger('bannerbear');
const breaker = () => getCircuitBreaker('bannerbear');

export interface BannerbearTemplate {
  uid: string;
  name: string;
  width: number;
  height: number;
  tags: string[];
}

export interface BannerbearImageRequest {
  templateUid: string;
  modifications: Array<{
    name: string;
    text?: string;
    image_url?: string;
    color?: string;
  }>;
  webhookUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface BannerbearImage {
  uid: string;
  status: 'pending' | 'completed' | 'failed';
  imageUrl?: string;
  imageUrlPng?: string;
  createdAt: string;
}

/**
 * Check if Bannerbear is configured.
 */
export function isBannerbearConfigured(): boolean {
  return !!API_KEY();
}

/**
 * List available templates.
 */
export async function listTemplates(): Promise<BannerbearTemplate[]> {
  const key = API_KEY();
  if (!key) return [];

  return breaker().executeWithFallback(async () => {
    const res = await fetch(`${BASE_URL}/templates`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      log.warn('Failed to list templates', { status: res.status });
      return [];
    }
    const data = await res.json() as Array<Record<string, unknown>>;

    log.info('Templates listed', { count: data.length });
    return data.map(t => ({
      uid: (t.uid as string) || '',
      name: (t.name as string) || '',
      width: (t.width as number) || 0,
      height: (t.height as number) || 0,
      tags: (t.tags as string[]) || [],
    }));
  }, []);
}

/**
 * Create an image from a template.
 * Returns immediately with a pending status — use webhook or poll.
 */
export async function createImage(request: BannerbearImageRequest): Promise<BannerbearImage> {
  const key = API_KEY();
  if (!key) throw new Error('BANNERBEAR_API_KEY not configured');

  return breaker().execute(async () => {
    log.info('Creating image', { template: request.templateUid });

    const res = await fetch(`${BASE_URL}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        template: request.templateUid,
        modifications: request.modifications,
        webhook_url: request.webhookUrl,
        metadata: request.metadata,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const errText = await res.text();
      log.error('Image creation failed', { status: res.status, error: errText });
      throw new Error(`Bannerbear image creation failed: ${res.status} ${errText}`);
    }

    const data = await res.json() as Record<string, unknown>;
    log.info('Image created', { uid: data.uid, status: data.status });
    return {
      uid: (data.uid as string) || '',
      status: (data.status as 'pending' | 'completed' | 'failed') || 'pending',
      imageUrl: (data.image_url as string) || undefined,
      imageUrlPng: (data.image_url_png as string) || undefined,
      createdAt: (data.created_at as string) || new Date().toISOString(),
    };
  });
}

/**
 * Poll for image completion.
 */
export async function getImage(uid: string): Promise<BannerbearImage> {
  const key = API_KEY();
  if (!key) throw new Error('BANNERBEAR_API_KEY not configured');

  return breaker().execute(async () => {
    const res = await fetch(`${BASE_URL}/images/${uid}`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      log.error('Image fetch failed', { uid, status: res.status });
      throw new Error(`Bannerbear image fetch failed: ${res.status}`);
    }
    const data = await res.json() as Record<string, unknown>;

    return {
      uid: (data.uid as string) || '',
      status: (data.status as 'pending' | 'completed' | 'failed') || 'pending',
      imageUrl: (data.image_url as string) || undefined,
      imageUrlPng: (data.image_url_png as string) || undefined,
      createdAt: (data.created_at as string) || '',
    };
  });
}

/**
 * Generate a product image with standard modifications.
 * Convenience wrapper for common use case.
 */
export async function generateProductImage(
  templateUid: string,
  product: { title: string; price: number; imageUrl?: string; description?: string },
  webhookUrl?: string,
): Promise<BannerbearImage> {
  return createImage({
    templateUid,
    modifications: [
      { name: 'title', text: product.title },
      { name: 'price', text: `$${product.price.toFixed(2)}` },
      ...(product.imageUrl ? [{ name: 'product_image', image_url: product.imageUrl }] : []),
      ...(product.description ? [{ name: 'description', text: product.description.slice(0, 150) }] : []),
    ],
    webhookUrl,
    metadata: { productTitle: product.title },
  });
}
