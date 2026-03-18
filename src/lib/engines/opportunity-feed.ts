/**
 * Opportunity Feed Engine — Aggregates products, clusters, trends,
 * creator matches, and ads into a unified opportunity feed.
 * This is the "big picture" view for admin decision-making.
 *
 * Engine wrapper added in Phase B — provides lifecycle management and
 * event bus integration. Original buildOpportunityFeed() export preserved.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import type { Engine, EngineConfig, EngineEvent, EngineStatus } from './types';
import { ENGINE_EVENTS } from './types';

export interface Opportunity {
  id: string;
  title: string;
  platform: string;
  category: string;
  price: number;
  finalScore: number;
  trendScore: number;
  viralScore: number;
  profitScore: number;
  trendStage: string;
  tier: 'HOT' | 'WARM' | 'WATCH' | 'COLD';
  imageUrl: string | null;
  externalUrl: string | null;
  // Enrichment
  clusterName: string | null;
  clusterSize: number;
  matchedCreators: number;
  topCreator: string | null;
  estimatedProfit: number;
  relatedAds: number;
  trendDirection: string | null;
  // Status
  isAllocated: boolean;
  hasBlueprint: boolean;
  hasFinancialModel: boolean;
  createdAt: string;
}

/**
 * Build the opportunity feed — aggregated view of top products
 * with enrichment signals.
 */
export async function buildOpportunityFeed(options: {
  minScore?: number;
  platform?: string;
  trendStage?: string;
  limit?: number;
} = {}): Promise<{
  opportunities: Opportunity[];
  stats: {
    total: number;
    hot: number;
    warm: number;
    watch: number;
    cold: number;
    avgScore: number;
    topPlatform: string;
    topCategory: string;
  };
}> {
  const admin = createAdminClient();
  const { minScore = 0, platform, trendStage, limit = 100 } = options;

  // Fetch products
  let query = admin
    .from('products')
    .select('*')
    .gte('final_score', minScore)
    .order('final_score', { ascending: false })
    .limit(limit);

  if (platform) query = query.eq('platform', platform);
  if (trendStage) query = query.eq('trend_stage', trendStage);

  const { data: products, error } = await query;
  if (error || !products) return { opportunities: [], stats: emptyStats() };

  // Fetch enrichment data in parallel
  const productIds = products.map(p => p.id);

  const [clusterData, matchData, allocationData, blueprintData, financialData] = await Promise.all([
    // Cluster memberships
    admin
      .from('product_cluster_members')
      .select('product_id, cluster_id, product_clusters(name, product_count)')
      .in('product_id', productIds),

    // Creator matches
    admin
      .from('creator_product_matches')
      .select('product_id, influencer_id, match_score, estimated_profit, influencers(username)')
      .in('product_id', productIds)
      .order('match_score', { ascending: false }),

    // Allocations
    admin
      .from('product_allocations')
      .select('product_id')
      .in('product_id', productIds),

    // Blueprints
    admin
      .from('launch_blueprints')
      .select('product_id')
      .in('product_id', productIds),

    // Financial models
    admin
      .from('financial_models')
      .select('product_id')
      .in('product_id', productIds),
  ]);

  // Build lookup maps
  const clusterMap = new Map<string, { name: string; size: number }>();
  if (clusterData.data) {
    for (const cm of clusterData.data) {
      const cluster = cm.product_clusters as unknown as { name: string; product_count: number } | null;
      if (cluster) {
        clusterMap.set(cm.product_id, { name: cluster.name, size: cluster.product_count });
      }
    }
  }

  const matchMap = new Map<string, { count: number; topCreator: string | null; totalProfit: number }>();
  if (matchData.data) {
    for (const m of matchData.data) {
      const existing = matchMap.get(m.product_id);
      const influencer = m.influencers as unknown as { username: string } | null;
      if (existing) {
        existing.count++;
        existing.totalProfit += Number(m.estimated_profit || 0);
      } else {
        matchMap.set(m.product_id, {
          count: 1,
          topCreator: influencer?.username || null,
          totalProfit: Number(m.estimated_profit || 0),
        });
      }
    }
  }

  const allocatedSet = new Set((allocationData.data || []).map(a => a.product_id));
  const blueprintSet = new Set((blueprintData.data || []).map(b => b.product_id));
  const financialSet = new Set((financialData.data || []).map(f => f.product_id));

  // Build opportunities
  const opportunities: Opportunity[] = products.map(p => {
    const score = p.final_score || 0;
    const cluster = clusterMap.get(p.id);
    const matches = matchMap.get(p.id);

    return {
      id: p.id,
      title: p.title,
      platform: p.platform,
      category: p.category || 'General',
      price: p.price || 0,
      finalScore: score,
      trendScore: p.trend_score || 0,
      viralScore: p.viral_score || 0,
      profitScore: p.profit_score || 0,
      trendStage: p.trend_stage || 'emerging',
      tier: score >= 80 ? 'HOT' : score >= 60 ? 'WARM' : score >= 40 ? 'WATCH' : 'COLD',
      imageUrl: p.image_url,
      externalUrl: p.external_url,
      clusterName: cluster?.name || null,
      clusterSize: cluster?.size || 0,
      matchedCreators: matches?.count || 0,
      topCreator: matches?.topCreator || null,
      estimatedProfit: matches?.totalProfit || 0,
      relatedAds: 0, // Could be enriched further
      trendDirection: null, // Could match with trend_keywords
      isAllocated: allocatedSet.has(p.id),
      hasBlueprint: blueprintSet.has(p.id),
      hasFinancialModel: financialSet.has(p.id),
      createdAt: p.created_at,
    };
  });

  // Calculate stats
  const hot = opportunities.filter(o => o.tier === 'HOT').length;
  const warm = opportunities.filter(o => o.tier === 'WARM').length;
  const watch = opportunities.filter(o => o.tier === 'WATCH').length;
  const cold = opportunities.filter(o => o.tier === 'COLD').length;
  const avgScore = opportunities.length > 0
    ? Math.round(opportunities.reduce((s, o) => s + o.finalScore, 0) / opportunities.length)
    : 0;

  // Top platform/category
  const platformCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  for (const o of opportunities) {
    platformCounts.set(o.platform, (platformCounts.get(o.platform) || 0) + 1);
    categoryCounts.set(o.category, (categoryCounts.get(o.category) || 0) + 1);
  }

  const topPlatform = [...platformCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  const topCategory = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  return {
    opportunities,
    stats: {
      total: opportunities.length,
      hot, warm, watch, cold,
      avgScore,
      topPlatform,
      topCategory,
    },
  };
}

function emptyStats() {
  return { total: 0, hot: 0, warm: 0, watch: 0, cold: 0, avgScore: 0, topPlatform: '', topCategory: '' };
}

// ─── Engine Interface Wrapper ──────────────────────────────

export class OpportunityFeedEngine implements Engine {
  private _status: EngineStatus = 'idle';

  readonly config: EngineConfig = {
    name: 'opportunity-feed',
    version: '1.0.0',
    dependencies: [],
    queues: [],
    publishes: [],
    subscribes: [
      ENGINE_EVENTS.CLUSTERS_REBUILT,
      ENGINE_EVENTS.MATCHES_COMPLETE,
      ENGINE_EVENTS.TREND_DETECTED,
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
    // Opportunity feed is read-only aggregation — no auto-action needed
    console.log(`[OpportunityFeedEngine] Received ${event.type} from ${event.source}`);
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Build the opportunity feed with event bus notification.
   * Wraps buildOpportunityFeed with lifecycle management.
   */
  async buildFeed(options: {
    minScore?: number;
    platform?: string;
    trendStage?: string;
    limit?: number;
  } = {}): Promise<ReturnType<typeof buildOpportunityFeed>> {
    this._status = 'running';
    try {
      return await buildOpportunityFeed(options);
    } finally {
      this._status = 'idle';
    }
  }
}
