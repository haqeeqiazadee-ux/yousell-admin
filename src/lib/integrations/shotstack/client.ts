/**
 * Shotstack API Client — Video Generation
 *
 * Generates short-form product videos from templates: TikTok/Reels
 * style product showcases, unboxing compilations, and ad creatives.
 *
 * V9 Content Engine Task 9.38: Shotstack integration for video content
 *
 * @see https://shotstack.io/docs/guide/
 */

import { getCircuitBreaker } from '@/lib/circuit-breaker';
import { engineLogger } from '@/lib/logger';

const API_KEY = () => process.env.SHOTSTACK_API_KEY || '';
const ENV = () => process.env.SHOTSTACK_ENV || 'stage'; // 'stage' or 'v1'
const BASE_URL = () => `https://api.shotstack.io/${ENV()}`;
const log = engineLogger('shotstack');
const breaker = () => getCircuitBreaker('shotstack');

export interface ShotstackClip {
  asset: {
    type: 'video' | 'image' | 'title' | 'html' | 'audio';
    src?: string;
    text?: string;
    html?: string;
    style?: string;
    width?: number;
    height?: number;
  };
  start: number;
  length: number;
  fit?: 'crop' | 'cover' | 'contain' | 'none';
  transition?: { in?: string; out?: string };
}

export interface ShotstackRenderRequest {
  timeline: {
    tracks: Array<{ clips: ShotstackClip[] }>;
    soundtrack?: { src: string; effect?: string };
  };
  output: {
    format: 'mp4' | 'gif' | 'webm';
    resolution: 'sd' | 'hd' | '1080' | '4k';
    aspectRatio?: '16:9' | '9:16' | '1:1' | '4:5';
    fps?: number;
  };
  callback?: string;
}

export interface ShotstackRenderResult {
  id: string;
  status: 'queued' | 'rendering' | 'done' | 'failed';
  url?: string;
  createdAt: string;
}

/**
 * Check if Shotstack is configured.
 */
export function isShotstackConfigured(): boolean {
  return !!API_KEY();
}

/**
 * Submit a render job.
 */
export async function submitRender(request: ShotstackRenderRequest): Promise<ShotstackRenderResult> {
  const key = API_KEY();
  if (!key) throw new Error('SHOTSTACK_API_KEY not configured');

  return breaker().execute(async () => {
    log.info('Submitting render', { format: request.output.format, resolution: request.output.resolution });

    const res = await fetch(`${BASE_URL()}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const errText = await res.text();
      log.error('Render submission failed', { status: res.status, error: errText });
      throw new Error(`Shotstack render failed: ${res.status} ${errText}`);
    }

    const data = await res.json() as Record<string, unknown>;
    const response = data.response as Record<string, unknown>;
    const id = (response?.id as string) || '';

    log.info('Render submitted', { renderId: id });
    return {
      id,
      status: 'queued',
      createdAt: new Date().toISOString(),
    };
  });
}

/**
 * Check render status.
 */
export async function getRenderStatus(renderId: string): Promise<ShotstackRenderResult> {
  const key = API_KEY();
  if (!key) throw new Error('SHOTSTACK_API_KEY not configured');

  return breaker().execute(async () => {
    const res = await fetch(`${BASE_URL()}/render/${renderId}`, {
      headers: { 'x-api-key': key },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      log.error('Status check failed', { renderId, status: res.status });
      throw new Error(`Shotstack status check failed: ${res.status}`);
    }
    const data = await res.json() as Record<string, unknown>;
    const response = data.response as Record<string, unknown>;

    return {
      id: (response?.id as string) || renderId,
      status: (response?.status as 'queued' | 'rendering' | 'done' | 'failed') || 'queued',
      url: (response?.url as string) || undefined,
      createdAt: (response?.created as string) || '',
    };
  });
}

/**
 * Generate a product showcase video (30s TikTok/Reels format).
 * Convenience wrapper for common use case.
 */
export async function generateProductVideo(
  product: {
    title: string;
    price: number;
    imageUrls: string[];
    description?: string;
  },
  options?: {
    duration?: number;
    aspectRatio?: '9:16' | '1:1' | '16:9';
    callbackUrl?: string;
    musicUrl?: string;
  },
): Promise<ShotstackRenderResult> {
  const duration = options?.duration || 30;
  const imageCount = product.imageUrls.length;
  const clipDuration = imageCount > 0 ? Math.min(duration / imageCount, 5) : duration;

  // Build image slideshow clips
  const imageClips: ShotstackClip[] = product.imageUrls.slice(0, 6).map((url, i) => ({
    asset: { type: 'image' as const, src: url },
    start: i * clipDuration,
    length: clipDuration,
    fit: 'cover' as const,
    transition: { in: 'fade', out: 'fade' },
  }));

  // Title overlay
  const titleClip: ShotstackClip = {
    asset: {
      type: 'html' as const,
      html: `<div style="font-size:48px;font-weight:bold;color:white;text-shadow:2px 2px 4px black;padding:20px;text-align:center">${product.title}</div>`,
      width: 1080,
      height: 200,
    },
    start: 0,
    length: 4,
  };

  // Price tag overlay
  const priceClip: ShotstackClip = {
    asset: {
      type: 'html' as const,
      html: `<div style="font-size:64px;font-weight:bold;color:#00ff88;text-shadow:2px 2px 4px black;text-align:center">$${product.price.toFixed(2)}</div>`,
      width: 400,
      height: 100,
    },
    start: duration - 5,
    length: 5,
  };

  // CTA overlay
  const ctaClip: ShotstackClip = {
    asset: {
      type: 'html' as const,
      html: '<div style="font-size:36px;font-weight:bold;color:white;background:#ff3366;padding:15px 30px;border-radius:10px;text-align:center">Shop Now →</div>',
      width: 400,
      height: 80,
    },
    start: duration - 4,
    length: 4,
  };

  const tracks = [
    { clips: [titleClip, priceClip, ctaClip] }, // Overlay track
    { clips: imageClips.length > 0 ? imageClips : [{ asset: { type: 'title' as const, text: product.title, style: 'future' }, start: 0, length: duration }] }, // Background track
  ];

  log.info('Generating product video', { title: product.title, images: imageCount, duration });

  return submitRender({
    timeline: {
      tracks,
      ...(options?.musicUrl ? { soundtrack: { src: options.musicUrl, effect: 'fadeOut' } } : {}),
    },
    output: {
      format: 'mp4',
      resolution: '1080',
      aspectRatio: options?.aspectRatio || '9:16',
      fps: 30,
    },
    callback: options?.callbackUrl,
  });
}
