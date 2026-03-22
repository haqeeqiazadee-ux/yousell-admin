/**
 * TikTok Discovery Engine — Discovers TikTok videos, stores them,
 * and generates hashtag signal analysis.
 *
 * Implements the Engine interface for the YOUSELL engine system.
 * Backward-compatible: discoverTikTokVideos and analyzeHashtagSignals
 * are still exported as standalone functions.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { getCircuitBreaker } from '@/lib/circuit-breaker';
import { engineLogger } from '@/lib/logger';
import { getEventBus } from './event-bus';
import type { Engine, EngineConfig, EngineEvent, EngineStatus } from './types';
import { ENGINE_EVENTS } from './types';

const log = engineLogger('tiktok-discovery');

// ─── Internal Types ─────────────────────────────────────────

interface TikTokVideo {
  video_id: string;
  url: string;
  description: string;
  author_username: string;
  author_id: string;
  author_followers: number;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  hashtags: string[];
  music_title: string;
  thumbnail_url: string;
  product_urls: string[];
  has_product_link: boolean;
  discovery_query: string;
  create_time: string | null;
}

interface ApifyItem {
  id?: string;
  video_id?: string;
  webVideoUrl?: string;
  url?: string;
  desc?: string;
  text?: string;
  description?: string;
  authorMeta?: { id?: string; name?: string; nickName?: string; fans?: number; followers?: number };
  author?: string | { id?: string; uniqueId?: string; nickname?: string };
  diggCount?: number;
  likes?: number;
  shareCount?: number;
  shares?: number;
  commentCount?: number;
  comments?: number;
  playCount?: number;
  views?: number;
  hashtags?: Array<{ name?: string } | string>;
  challenges?: Array<{ title?: string }>;
  musicMeta?: { musicName?: string };
  music?: { title?: string };
  videoMeta?: { coverUrl?: string };
  cover?: string;
  thumbnail?: string;
  productLink?: string;
  commerceInfo?: { url?: string };
  createTime?: number | string;
  [key: string]: unknown;
}

// ─── Internal Helpers ───────────────────────────────────────

/**
 * Map an Apify TikTok scraper item to our internal video schema
 */
function mapApifyItem(item: ApifyItem, query: string): TikTokVideo {
  const videoId = String(item.id || item.video_id || `${Date.now()}-${Math.random().toString(36).slice(2)}`);

  // Extract author info from various Apify response shapes
  let authorUsername = '';
  let authorId = '';
  let authorFollowers = 0;

  if (item.authorMeta) {
    authorUsername = item.authorMeta.nickName || item.authorMeta.name || '';
    authorId = item.authorMeta.id || '';
    authorFollowers = item.authorMeta.fans || item.authorMeta.followers || 0;
  } else if (typeof item.author === 'object' && item.author) {
    authorUsername = item.author.uniqueId || item.author.nickname || '';
    authorId = item.author.id || '';
  } else if (typeof item.author === 'string') {
    authorUsername = item.author;
  }

  // Extract hashtags
  const hashtags: string[] = [];
  if (Array.isArray(item.hashtags)) {
    for (const h of item.hashtags) {
      if (typeof h === 'string') hashtags.push(h);
      else if (h && typeof h === 'object' && h.name) hashtags.push(h.name);
    }
  }
  if (Array.isArray(item.challenges)) {
    for (const c of item.challenges) {
      if (c.title && !hashtags.includes(c.title)) hashtags.push(c.title);
    }
  }
  // Also extract from description
  const desc = String(item.desc || item.text || item.description || '');
  const descTags = desc.match(/#(\w+)/g);
  if (descTags) {
    for (const tag of descTags) {
      const clean = tag.replace('#', '');
      if (!hashtags.includes(clean)) hashtags.push(clean);
    }
  }

  // Detect product links
  const productUrls: string[] = [];
  if (item.productLink) productUrls.push(String(item.productLink));
  if (item.commerceInfo?.url) productUrls.push(String(item.commerceInfo.url));
  // Check for sticker/product URLs in the raw item
  for (const key of Object.keys(item)) {
    if (key.toLowerCase().includes('product') && typeof item[key] === 'string' && (item[key] as string).startsWith('http')) {
      const url = item[key] as string;
      if (!productUrls.includes(url)) productUrls.push(url);
    }
  }

  const createTime = item.createTime
    ? new Date(typeof item.createTime === 'number' ? item.createTime * 1000 : item.createTime).toISOString()
    : null;

  return {
    video_id: videoId,
    url: String(item.webVideoUrl || item.url || `https://www.tiktok.com/@${authorUsername}/video/${videoId}`),
    description: desc,
    author_username: authorUsername,
    author_id: authorId,
    author_followers: authorFollowers,
    views: Number(item.playCount || item.views || 0),
    likes: Number(item.diggCount || item.likes || 0),
    shares: Number(item.shareCount || item.shares || 0),
    comments: Number(item.commentCount || item.comments || 0),
    hashtags,
    music_title: String(item.musicMeta?.musicName || item.music?.title || ''),
    thumbnail_url: String(item.videoMeta?.coverUrl || item.cover || item.thumbnail || ''),
    product_urls: productUrls,
    has_product_link: productUrls.length > 0,
    discovery_query: query,
    create_time: createTime,
  };
}

// ─── Core Logic (unchanged from original) ───────────────────

/**
 * Discover TikTok videos via Apify and store in tiktok_videos table
 */
export async function discoverTikTokVideos(
  query: string,
  limit: number = 30
): Promise<{
  videosFound: number;
  videosStored: number;
  hashtagsAnalyzed: number;
  errors: string[];
}> {
  const errors: string[] = [];
  const token = process.env.APIFY_API_TOKEN;

  if (!token) {
    return { videosFound: 0, videosStored: 0, hashtagsAnalyzed: 0, errors: ['APIFY_API_TOKEN not configured'] };
  }

  // Step 1: Call Apify TikTok Scraper (with circuit breaker)
  let rawItems: ApifyItem[] = [];
  const apifyBreaker = getCircuitBreaker('apify');
  try {
    log.info('Starting TikTok discovery', { query, limit });
    const res = await apifyBreaker.execute(() => fetch(
      `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items?token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchQueries: [query],
          resultsPerPage: Math.min(limit, 100),
          searchSection: 'video',
        }),
        signal: AbortSignal.timeout(90000),
      }
    ));

    if (!res.ok) {
      log.error('Apify TikTok scraper failed', { status: res.status, statusText: res.statusText });
      errors.push(`Apify returned ${res.status}: ${res.statusText}`);
      return { videosFound: 0, videosStored: 0, hashtagsAnalyzed: 0, errors };
    }

    rawItems = await res.json();
    if (!Array.isArray(rawItems)) {
      errors.push('Apify returned non-array response');
      return { videosFound: 0, videosStored: 0, hashtagsAnalyzed: 0, errors };
    }
  } catch (err) {
    errors.push(`Apify fetch failed: ${err instanceof Error ? err.message : String(err)}`);
    return { videosFound: 0, videosStored: 0, hashtagsAnalyzed: 0, errors };
  }

  // Step 2: Map to internal schema
  const videos = rawItems.slice(0, limit).map(item => mapApifyItem(item, query));

  // Step 3: Batch upsert to tiktok_videos (25 at a time)
  const admin = createAdminClient();
  let storedCount = 0;
  const batchSize = 25;

  for (let i = 0; i < videos.length; i += batchSize) {
    const batch = videos.slice(i, i + batchSize);
    const { data, error } = await admin
      .from('tiktok_videos')
      .upsert(
        batch.map(v => ({
          ...v,
          discovered_at: new Date().toISOString(),
        })),
        { onConflict: 'video_id', ignoreDuplicates: false }
      )
      .select('id');

    if (error) {
      errors.push(`Batch ${i / batchSize + 1} error: ${error.message}`);
    } else {
      storedCount += data?.length ?? batch.length;
    }
  }

  // Step 4: Run hashtag signal analysis on discovered videos
  let hashtagsAnalyzed = 0;
  try {
    hashtagsAnalyzed = await analyzeHashtagSignals(query);
  } catch (err) {
    errors.push(`Hashtag analysis error: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Step 5: Emit event via EventBus
  const bus = getEventBus();
  await bus.emit(
    ENGINE_EVENTS.TIKTOK_VIDEOS_FOUND,
    { query, videosFound: videos.length, videosStored: storedCount, hashtagsAnalyzed },
    'tiktok-discovery',
  );

  return {
    videosFound: videos.length,
    videosStored: storedCount,
    hashtagsAnalyzed,
    errors,
  };
}

/**
 * Analyze hashtag signals from stored TikTok videos.
 * Groups by hashtag, calculates velocity metrics, stores snapshots.
 */
export async function analyzeHashtagSignals(discoveryQuery?: string): Promise<number> {
  const admin = createAdminClient();

  // Fetch recent videos (last 48 hours or from current discovery)
  let videosQuery = admin
    .from('tiktok_videos')
    .select('hashtags, views, likes, shares, comments, author_username, has_product_link, discovered_at')
    .order('discovered_at', { ascending: false })
    .limit(2000);

  if (discoveryQuery) {
    videosQuery = videosQuery.eq('discovery_query', discoveryQuery);
  }

  const { data: videos, error } = await videosQuery;

  if (error || !videos || videos.length === 0) return 0;

  // Aggregate by hashtag
  const hashtagMap = new Map<string, {
    totalVideos: number;
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    creators: Set<string>;
    productVideos: number;
  }>();

  for (const video of videos) {
    const hashtags = video.hashtags as string[] || [];
    for (const tag of hashtags) {
      const existing = hashtagMap.get(tag) || {
        totalVideos: 0, totalViews: 0, totalLikes: 0,
        totalShares: 0, totalComments: 0, creators: new Set(), productVideos: 0,
      };

      existing.totalVideos++;
      existing.totalViews += Number(video.views || 0);
      existing.totalLikes += Number(video.likes || 0);
      existing.totalShares += Number(video.shares || 0);
      existing.totalComments += Number(video.comments || 0);
      if (video.author_username) existing.creators.add(video.author_username);
      if (video.has_product_link) existing.productVideos++;

      hashtagMap.set(tag, existing);
    }
  }

  // Filter to hashtags with 3+ videos (meaningful signal)
  const significantHashtags = [...hashtagMap.entries()]
    .filter(([, data]) => data.totalVideos >= 3)
    .slice(0, 100);

  if (significantHashtags.length === 0) return 0;

  // Fetch previous snapshots for velocity calculation
  const hashtagNames = significantHashtags.map(([name]) => name);
  const { data: prevSnapshots } = await admin
    .from('tiktok_hashtag_signals')
    .select('hashtag, total_videos, total_views, unique_creators')
    .in('hashtag', hashtagNames)
    .order('snapshot_at', { ascending: false });

  const prevMap = new Map<string, { total_videos: number; total_views: number; unique_creators: number }>();
  if (prevSnapshots) {
    for (const snap of prevSnapshots) {
      if (!prevMap.has(snap.hashtag)) {
        prevMap.set(snap.hashtag, snap);
      }
    }
  }

  // Calculate and store signals
  const now = new Date().toISOString();
  const signals = significantHashtags.map(([hashtag, data]) => {
    const prev = prevMap.get(hashtag);
    const videoGrowthRate = prev && prev.total_videos > 0
      ? (data.totalVideos - prev.total_videos) / prev.total_videos
      : 0;
    const creatorGrowthRate = prev && prev.unique_creators > 0
      ? (data.creators.size - prev.unique_creators) / prev.unique_creators
      : 0;
    const totalEngagement = data.totalLikes + data.totalComments + data.totalShares;
    const engagementRate = data.totalViews > 0 ? totalEngagement / data.totalViews : 0;
    const viewVelocity = data.totalVideos > 0 ? data.totalViews / data.totalVideos : 0;
    const productVideoPct = data.totalVideos > 0 ? (data.productVideos / data.totalVideos) * 100 : 0;

    return {
      hashtag,
      total_videos: data.totalVideos,
      total_views: data.totalViews,
      total_likes: data.totalLikes,
      total_shares: data.totalShares,
      total_comments: data.totalComments,
      unique_creators: data.creators.size,
      video_growth_rate: Math.round(videoGrowthRate * 10000) / 10000,
      view_velocity: Math.round(viewVelocity * 100) / 100,
      creator_growth_rate: Math.round(creatorGrowthRate * 10000) / 10000,
      engagement_rate: Math.round(engagementRate * 10000) / 10000,
      product_video_pct: Math.round(productVideoPct * 100) / 100,
      snapshot_at: now,
    };
  });

  const { error: insertErr } = await admin
    .from('tiktok_hashtag_signals')
    .upsert(signals, { onConflict: 'hashtag,snapshot_at' });

  if (insertErr) {
    console.error('Hashtag signals insert error:', insertErr.message);
  }

  // Emit hashtag analysis event
  const bus = getEventBus();
  await bus.emit(
    ENGINE_EVENTS.TIKTOK_HASHTAGS_ANALYZED,
    { hashtagsAnalyzed: signals.length, query: discoveryQuery },
    'tiktok-discovery',
  );

  return signals.length;
}

// ─── Engine Class Implementation ────────────────────────────

export class TikTokDiscoveryEngine implements Engine {
  private _status: EngineStatus = 'idle';

  readonly config: EngineConfig = {
    name: 'tiktok-discovery',
    version: '1.0.0',
    dependencies: [],
    queues: ['tiktok-discovery'],
    publishes: [
      ENGINE_EVENTS.TIKTOK_VIDEOS_FOUND,
      ENGINE_EVENTS.TIKTOK_HASHTAGS_ANALYZED,
    ],
    subscribes: [
      ENGINE_EVENTS.SCAN_COMPLETE,
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
    if (event.type === ENGINE_EVENTS.SCAN_COMPLETE) {
      // Could auto-trigger TikTok discovery on scan complete
      // For now, log and skip — manual-first per G10
      console.log(`[TikTokDiscovery] Received scan_complete from ${event.source}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    return !!process.env.APIFY_API_TOKEN;
  }

  /**
   * Run discovery via the engine interface.
   * Delegates to the standalone function for backward compatibility.
   */
  async discover(query: string, limit?: number) {
    this._status = 'running';
    try {
      return await discoverTikTokVideos(query, limit);
    } finally {
      this._status = 'idle';
    }
  }
}
