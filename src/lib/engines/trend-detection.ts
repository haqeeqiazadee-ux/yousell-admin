/**
 * Trend Detection Engine — Analyzes products and signals to detect
 * emerging trends. Updates trend_keywords table with scored trends.
 *
 * Engine wrapper added in Phase B — provides lifecycle management and
 * event bus integration. Original detectTrends() export preserved.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { getEventBus } from './event-bus';
import type { Engine, EngineConfig, EngineEvent, EngineStatus } from './types';
import { ENGINE_EVENTS } from './types';

interface TrendSignal {
  keyword: string;
  sources: string[];
  productCount: number;
  avgScore: number;
  totalViews: number;
  growth: number;
  direction: 'rising' | 'stable' | 'declining';
}

/** V9 Task 1.066: Trend lifecycle stage classification */
type TrendLifecycleStage = 'emerging' | 'rising' | 'exploding' | 'saturated';

/**
 * Classify trend lifecycle stage based on score + velocity.
 * V9 Tasks 1.066-1.068
 */
function classifyLifecycleStage(
  score: number,
  growth: number,
  _platformCount: number,
): TrendLifecycleStage {
  if (score >= 80 && growth > 0.3) return 'exploding';
  if (score >= 60 && growth > 0.1) return 'rising';
  if (score >= 40 && growth <= 0.1 && growth >= -0.1) return 'saturated';
  return 'emerging';
}

/**
 * Calculate cross-platform pre-viral score from multiple signals.
 * V9 Task 1.065: Aggregate signals from 14 platforms
 */
function calculatePreViralScore(signal: TrendSignal): {
  score: number;
  confidenceTier: 'LOW' | 'MEDIUM' | 'HIGH';
} {
  const baseScore = calculateTrendScore(signal);

  // Cross-platform correlation bonus (V9 Task 1.074-1.075)
  const platformCount = signal.sources.length;
  let confidenceTier: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (platformCount >= 4) confidenceTier = 'HIGH';
  else if (platformCount >= 2) confidenceTier = 'MEDIUM';

  // Pre-viral threshold check (V9 Task 1.067)
  const preViralBonus = baseScore >= 70 ? 5 : 0;

  return {
    score: Math.min(100, baseScore + preViralBonus),
    confidenceTier,
  };
}

/**
 * Detect trends by analyzing:
 * 1. Product tags and categories (frequency + score)
 * 2. TikTok hashtag signals (velocity)
 * 3. Existing trend keywords (update direction)
 */
export async function detectTrends(): Promise<{
  trendsDetected: number;
  trendsUpdated: number;
  errors: string[];
}> {
  const admin = createAdminClient();
  const errors: string[] = [];

  // Step 1: Aggregate product tags into trend signals
  const { data: products, error: prodErr } = await admin
    .from('products')
    .select('tags, category, platform, final_score, created_at')
    .gte('final_score', 30)
    .order('created_at', { ascending: false })
    .limit(1000);

  if (prodErr) {
    errors.push(`Products query: ${prodErr.message}`);
  }

  const signalMap = new Map<string, TrendSignal>();

  // Analyze product tags
  if (products) {
    for (const product of products) {
      const tags = (product.tags as string[]) || [];
      const allKeywords = [...tags];
      if (product.category) allKeywords.push(product.category.toLowerCase());

      for (const keyword of allKeywords) {
        const clean = keyword.toLowerCase().trim();
        if (clean.length < 3) continue;

        const existing = signalMap.get(clean) || {
          keyword: clean,
          sources: [],
          productCount: 0,
          avgScore: 0,
          totalViews: 0,
          growth: 0,
          direction: 'stable' as const,
        };

        existing.productCount++;
        existing.avgScore = ((existing.avgScore * (existing.productCount - 1)) + (product.final_score || 0)) / existing.productCount;
        if (product.platform && !existing.sources.includes(product.platform)) {
          existing.sources.push(product.platform);
        }

        signalMap.set(clean, existing);
      }
    }
  }

  // Step 2: Enrich with TikTok hashtag velocity data
  const { data: hashtags, error: hashErr } = await admin
    .from('tiktok_hashtag_signals')
    .select('hashtag, total_views, view_velocity, video_growth_rate, engagement_rate')
    .order('view_velocity', { ascending: false })
    .limit(200);

  if (hashErr) {
    errors.push(`Hashtag signals: ${hashErr.message}`);
  }

  if (hashtags) {
    for (const h of hashtags) {
      const clean = h.hashtag.toLowerCase();
      const existing = signalMap.get(clean) || {
        keyword: clean,
        sources: ['tiktok'],
        productCount: 0,
        avgScore: 0,
        totalViews: 0,
        growth: 0,
        direction: 'stable' as const,
      };

      existing.totalViews += Number(h.total_views || 0);
      existing.growth = Number(h.video_growth_rate || 0);

      if (!existing.sources.includes('tiktok')) {
        existing.sources.push('tiktok');
      }

      // Determine direction based on growth rate
      if (existing.growth > 0.1) existing.direction = 'rising';
      else if (existing.growth < -0.1) existing.direction = 'declining';
      else existing.direction = 'stable';

      signalMap.set(clean, existing);
    }
  }

  // Step 3: Score and filter trends
  const trends = [...signalMap.values()]
    .filter(t => t.productCount >= 2 || t.totalViews > 10000)
    .map(t => ({
      ...t,
      trendScore: calculateTrendScore(t),
    }))
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 100);

  // Step 4: Upsert to trend_keywords
  let trendsDetected = 0;
  let trendsUpdated = 0;

  for (const trend of trends) {
    const { data: existing } = await admin
      .from('trend_keywords')
      .select('id')
      .eq('keyword', trend.keyword)
      .maybeSingle();

    const lifecycleStage = classifyLifecycleStage(trend.trendScore, trend.growth, trend.sources.length);
    const preViral = calculatePreViralScore(trend);

    const row = {
      keyword: trend.keyword,
      trend_score: trend.trendScore,
      trend_direction: trend.direction,
      volume: trend.totalViews,
      related_keywords: [],
      source: trend.sources.join(','),
      category: null,
      lifecycle_stage: lifecycleStage,
      confidence_tier: preViral.confidenceTier,
      pre_viral_score: preViral.score,
      platform_count: trend.sources.length,
    };

    if (existing) {
      const { error: updateErr } = await admin
        .from('trend_keywords')
        .update({ ...row, fetched_at: new Date().toISOString() })
        .eq('id', existing.id);

      if (updateErr) errors.push(`Update trend "${trend.keyword}": ${updateErr.message}`);
      else trendsUpdated++;
    } else {
      const { error: insertErr } = await admin
        .from('trend_keywords')
        .insert(row);

      if (insertErr) errors.push(`Insert trend "${trend.keyword}": ${insertErr.message}`);
      else trendsDetected++;
    }
  }

  return { trendsDetected, trendsUpdated, errors };
}

function calculateTrendScore(signal: TrendSignal): number {
  let score = 0;

  // Product frequency (0-30)
  if (signal.productCount >= 10) score += 30;
  else if (signal.productCount >= 5) score += 20;
  else if (signal.productCount >= 2) score += 10;

  // Average product score (0-25)
  score += Math.min(25, Math.round(signal.avgScore * 0.25));

  // View volume (0-25)
  if (signal.totalViews > 10000000) score += 25;
  else if (signal.totalViews > 1000000) score += 20;
  else if (signal.totalViews > 100000) score += 15;
  else if (signal.totalViews > 10000) score += 10;

  // Growth rate (0-20)
  if (signal.growth > 0.5) score += 20;
  else if (signal.growth > 0.2) score += 15;
  else if (signal.growth > 0.1) score += 10;
  else if (signal.growth > 0) score += 5;

  // Multi-platform bonus
  if (signal.sources.length >= 3) score += 10;
  else if (signal.sources.length >= 2) score += 5;

  return Math.min(100, Math.max(0, score));
}

// ─── Engine Interface Wrapper ──────────────────────────────

export class TrendDetectionEngine implements Engine {
  private _status: EngineStatus = 'idle';

  readonly config: EngineConfig = {
    name: 'trend-detection',
    version: '1.0.0',
    dependencies: [],
    queues: ['trend-detection', 'trend-scan'],
    publishes: [
      ENGINE_EVENTS.TREND_DETECTED,
      ENGINE_EVENTS.TREND_DIRECTION_CHANGED,
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
      // Could auto-detect trends after a scan — manual-first per G10
      console.log(`[TrendDetectionEngine] Scan complete from ${event.source}, trend detection deferred to manual trigger`);
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Run trend detection and emit events for detected trends.
   * Wraps detectTrends with event bus integration.
   */
  async runDetection(): Promise<{ trendsDetected: number; trendsUpdated: number; expired: number; errors: string[] }> {
    this._status = 'running';
    try {
      const result = await detectTrends();
      const bus = getEventBus();

      // Emit TREND_DETECTED for new/updated trends
      await bus.emit(
        ENGINE_EVENTS.TREND_DETECTED,
        {
          trendsDetected: result.trendsDetected,
          trendsUpdated: result.trendsUpdated,
          errors: result.errors,
        },
        'trend-detection',
      );

      // V9 Tasks 1.078-1.079: Check for expired trends
      // Trends that dropped from 70+ to below 60 should be marked expired
      let expired = 0;
      try {
        const admin = createAdminClient();
        const { data: hotTrends } = await admin
          .from('trend_keywords')
          .select('id, keyword, trend_score, pre_viral_score')
          .gte('pre_viral_score', 70);

        if (hotTrends) {
          for (const trend of hotTrends) {
            if (trend.trend_score < 60) {
              // Trend has decayed — mark as expired
              await admin
                .from('trend_keywords')
                .update({ lifecycle_stage: 'expired', trend_direction: 'declining' })
                .eq('id', trend.id);

              await bus.emit(
                ENGINE_EVENTS.TREND_DIRECTION_CHANGED,
                { keyword: trend.keyword, direction: 'expired', previousScore: trend.pre_viral_score, currentScore: trend.trend_score },
                'trend-detection',
              );

              expired++;
            }
          }
        }
      } catch (err) {
        console.error('[TrendDetection] Error checking expired trends:', err);
      }

      return { ...result, expired };
    } finally {
      this._status = 'idle';
    }
  }
}
