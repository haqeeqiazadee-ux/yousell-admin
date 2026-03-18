/**
 * Ad Intelligence Engine — Discovers ads via Meta Ads Library (free)
 * and stores them in the ads table for tracking.
 *
 * Engine wrapper added in Phase B — provides lifecycle management and
 * event bus integration. Original discoverAds() export preserved.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { getEventBus } from './event-bus';
import type { Engine, EngineConfig, EngineEvent, EngineStatus } from './types';
import { ENGINE_EVENTS } from './types';

/**
 * Discover ads from Meta Ads Library (free, no auth required).
 * Also checks TikTok Creative Center for trending ads.
 */
export async function discoverAds(
  query: string,
  platforms: string[] = ['facebook'],
  limit: number = 20
): Promise<{
  adsFound: number;
  adsStored: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let totalFound = 0;
  let totalStored = 0;

  for (const platform of platforms) {
    try {
      let ads: AdCandidate[] = [];

      if (platform === 'facebook' || platform === 'meta') {
        ads = await searchMetaAdsLibrary(query, limit);
      } else if (platform === 'tiktok') {
        ads = await searchTikTokCreativeCenter(query, limit);
      }

      totalFound += ads.length;

      if (ads.length > 0) {
        const stored = await storeAds(ads);
        totalStored += stored;
      }
    } catch (err) {
      errors.push(`${platform}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { adsFound: totalFound, adsStored: totalStored, errors };
}

interface AdCandidate {
  external_id: string;
  platform: string;
  advertiser_name: string;
  ad_text: string;
  landing_url: string;
  thumbnail_url: string;
  impressions: number;
  spend_estimate: number;
  days_running: number;
  is_scaling: boolean;
  discovery_query: string;
}

/**
 * Search Meta Ads Library (free public API, no auth needed).
 */
async function searchMetaAdsLibrary(query: string, limit: number): Promise<AdCandidate[]> {
  // Meta Ads Library public search (no API key required)
  try {
    const url = `https://www.facebook.com/ads/library/api/?search_terms=${encodeURIComponent(query)}&ad_type=all&country=US&media_type=all`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; YouSell/1.0)',
      },
      signal: AbortSignal.timeout(15000),
    });

    // Meta Ads Library API is restricted; if we can't access it directly,
    // generate intelligence from Apify if available
    if (!res.ok) {
      return searchMetaAdsViaApify(query, limit);
    }

    const data = await res.json();
    if (!data || !Array.isArray(data.results)) {
      return searchMetaAdsViaApify(query, limit);
    }

    return data.results.slice(0, limit).map((ad: Record<string, unknown>) => {
      const bodies = ad.ad_creative_bodies as string[] | undefined;
      const captions = ad.ad_creative_link_captions as string[] | undefined;
      const images = ad.ad_creative_link_images as string[] | undefined;
      const imp = ad.impressions as Record<string, unknown> | number | undefined;
      const sp = ad.spend as Record<string, unknown> | number | undefined;

      return {
        external_id: String(ad.id || `meta-${Date.now()}-${Math.random().toString(36).slice(2)}`),
        platform: 'facebook',
        advertiser_name: String(ad.page_name || ad.advertiser_name || 'Unknown'),
        ad_text: String(bodies?.[0] || ad.body || ''),
        landing_url: String(captions?.[0] || ad.landing_page || ''),
        thumbnail_url: String(images?.[0] || ''),
        impressions: typeof imp === 'object' ? Number(imp?.upper_bound || 0) : Number(imp || 0),
        spend_estimate: typeof sp === 'object' ? Number(sp?.upper_bound || 0) : Number(sp || 0),
        days_running: calculateDaysRunning(ad.ad_delivery_start_time as string),
        is_scaling: (typeof imp === 'object' ? Number(imp?.upper_bound || 0) : Number(imp || 0)) > 100000,
        discovery_query: query,
      };
    });
  } catch {
    return searchMetaAdsViaApify(query, limit);
  }
}

async function searchMetaAdsViaApify(query: string, limit: number): Promise<AdCandidate[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) return [];

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/apify~facebook-ads-library-scraper/run-sync-get-dataset-items?token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchTerms: query,
          country: 'US',
          adType: 'ALL',
          maxResults: limit,
        }),
        signal: AbortSignal.timeout(60000),
      }
    );

    if (!res.ok) return [];
    const items = await res.json();
    if (!Array.isArray(items)) return [];

    return items.slice(0, limit).map((ad: Record<string, unknown>) => ({
      external_id: String(ad.id || ad.adArchiveID || `fb-${Date.now()}-${Math.random().toString(36).slice(2)}`),
      platform: 'facebook',
      advertiser_name: String(ad.pageName || ad.page_name || 'Unknown'),
      ad_text: String(ad.body || ad.ad_creative_body || ''),
      landing_url: String(ad.linkUrl || ad.landing_page_url || ''),
      thumbnail_url: String(ad.image || ((ad.snapshot as Record<string, unknown>)?.images as string[])?.[0] || ''),
      impressions: estimateImpressions(ad),
      spend_estimate: estimateSpend(ad),
      days_running: calculateDaysRunning(String(ad.startDate || ad.ad_delivery_start_time || '')),
      is_scaling: estimateImpressions(ad) > 100000,
      discovery_query: query,
    }));
  } catch {
    return [];
  }
}

async function searchTikTokCreativeCenter(query: string, limit: number): Promise<AdCandidate[]> {
  // TikTok Creative Center is free but requires scraping
  const token = process.env.APIFY_API_TOKEN;
  if (!token) return [];

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items?token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchQueries: [`${query} ad`],
          resultsPerPage: limit,
          searchSection: 'video',
        }),
        signal: AbortSignal.timeout(60000),
      }
    );

    if (!res.ok) return [];
    const items = await res.json();
    if (!Array.isArray(items)) return [];

    // Filter for items that look like ads (commercial content)
    return items
      .filter((item: Record<string, unknown>) => {
        const desc = String(item.desc || item.text || '').toLowerCase();
        return desc.includes('shop') || desc.includes('buy') || desc.includes('link') ||
               desc.includes('discount') || desc.includes('sale') || item.productLink;
      })
      .slice(0, limit)
      .map((item: Record<string, unknown>) => ({
        external_id: String(item.id || `tt-${Date.now()}-${Math.random().toString(36).slice(2)}`),
        platform: 'tiktok',
        advertiser_name: String(
          (item.authorMeta as Record<string, unknown>)?.nickName ||
          (item.authorMeta as Record<string, unknown>)?.name ||
          item.author || 'Unknown'
        ),
        ad_text: String(item.desc || item.text || ''),
        landing_url: String(item.productLink || item.webVideoUrl || ''),
        thumbnail_url: String(item.cover || item.thumbnail || ''),
        impressions: Number(item.playCount || item.views || 0),
        spend_estimate: 0,
        days_running: calculateDaysRunning(item.createTime ? new Date(Number(item.createTime) * 1000).toISOString() : ''),
        is_scaling: Number(item.playCount || 0) > 1000000,
        discovery_query: query,
      }));
  } catch {
    return [];
  }
}

async function storeAds(ads: AdCandidate[]): Promise<number> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('ads')
    .upsert(
      ads.map(ad => ({
        ...ad,
        discovered_at: new Date().toISOString(),
      })),
      { onConflict: 'external_id,platform', ignoreDuplicates: false }
    )
    .select('id');

  if (error) {
    console.error('Ads store error:', error.message);
    return 0;
  }

  return data?.length ?? ads.length;
}

function calculateDaysRunning(startDate: string): number {
  if (!startDate) return 0;
  try {
    const start = new Date(startDate);
    const now = new Date();
    return Math.max(0, Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

function estimateImpressions(ad: Record<string, unknown>): number {
  if (ad.impressions) {
    if (typeof ad.impressions === 'object') {
      return Number((ad.impressions as Record<string, unknown>).upper_bound || 0);
    }
    return Number(ad.impressions);
  }
  return 0;
}

function estimateSpend(ad: Record<string, unknown>): number {
  if (ad.spend) {
    if (typeof ad.spend === 'object') {
      return Number((ad.spend as Record<string, unknown>).upper_bound || 0);
    }
    return Number(ad.spend);
  }
  return 0;
}

// ─── Engine Interface Wrapper ──────────────────────────────

export class AdIntelligenceEngine implements Engine {
  private _status: EngineStatus = 'idle';

  readonly config: EngineConfig = {
    name: 'ad-intelligence',
    version: '1.0.0',
    dependencies: [],
    queues: ['ad-intelligence'],
    publishes: [
      ENGINE_EVENTS.ADS_DISCOVERED,
    ],
    subscribes: [
      ENGINE_EVENTS.PRODUCT_DISCOVERED,
    ],
  };

  status(): EngineStatus {
    return this._status;
  }

  async init(): Promise<void> {
    this._status = 'idle';
  }

  async start(): Promise<void> {
    this._status = 'running';
  }

  async stop(): Promise<void> {
    this._status = 'stopped';
  }

  async handleEvent(event: EngineEvent): Promise<void> {
    if (event.type === ENGINE_EVENTS.PRODUCT_DISCOVERED) {
      // Could auto-search ads for newly discovered products — manual-first per G10
      console.log(`[AdIntelligenceEngine] Product discovered from ${event.source}, ad search deferred to manual trigger`);
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Discover ads and emit events for results.
   * Wraps discoverAds with event bus integration.
   */
  async runDiscovery(
    query: string,
    platforms: string[] = ['facebook'],
    limit: number = 20,
  ): Promise<{ adsFound: number; adsStored: number; errors: string[] }> {
    this._status = 'running';
    try {
      const result = await discoverAds(query, platforms, limit);

      const bus = getEventBus();
      await bus.emit(
        ENGINE_EVENTS.ADS_DISCOVERED,
        {
          query,
          platforms,
          adsFound: result.adsFound,
          adsStored: result.adsStored,
          errors: result.errors,
        },
        'ad-intelligence',
      );

      return result;
    } finally {
      this._status = 'idle';
    }
  }
}
