/**
 * Trend Detection Engine — Analyzes products and signals to detect
 * emerging trends. Updates trend_keywords table with scored trends.
 */

import { createAdminClient } from '@/lib/supabase/admin';

interface TrendSignal {
  keyword: string;
  sources: string[];
  productCount: number;
  avgScore: number;
  totalViews: number;
  growth: number;
  direction: 'rising' | 'stable' | 'declining';
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

    const row = {
      keyword: trend.keyword,
      trend_score: trend.trendScore,
      trend_direction: trend.direction,
      volume: trend.totalViews,
      related_keywords: [],
      source: trend.sources.join(','),
      category: null,
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
