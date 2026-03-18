/**
 * Creator Matching Engine — Pairs products with influencers based on
 * niche alignment, engagement quality, and price range fit.
 *
 * Engine wrapper added in Phase B — provides lifecycle management and
 * event bus integration. Original runCreatorMatching() export preserved.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { getEventBus } from './event-bus';
import type { Engine, EngineConfig, EngineEvent, EngineStatus } from './types';
import { ENGINE_EVENTS } from './types';

interface ProductForMatching {
  id: string;
  title: string;
  platform: string;
  category: string;
  price: number;
  final_score: number;
  tags: string[];
}

interface InfluencerForMatching {
  id: string;
  username: string;
  platform: string;
  followers: number;
  engagement_rate: number;
  niche: string;
  conversion_score: number;
  tier: string;
}

/**
 * Run creator matching for high-scoring products.
 * Finds best influencer matches based on niche, engagement, and price fit.
 */
export async function runCreatorMatching(
  minProductScore: number = 60,
  maxCreatorsPerProduct: number = 10
): Promise<{
  productsMatched: number;
  matchesCreated: number;
  errors: string[];
}> {
  const admin = createAdminClient();
  const errors: string[] = [];

  // Fetch eligible products
  const { data: products, error: prodErr } = await admin
    .from('products')
    .select('id, title, platform, category, price, final_score, tags')
    .gte('final_score', minProductScore)
    .order('final_score', { ascending: false })
    .limit(50);

  if (prodErr || !products || products.length === 0) {
    return { productsMatched: 0, matchesCreated: 0, errors: prodErr ? [prodErr.message] : ['No qualifying products'] };
  }

  // Fetch all influencers
  const { data: influencers, error: infErr } = await admin
    .from('influencers')
    .select('id, username, platform, followers, engagement_rate, niche, conversion_score, tier')
    .order('conversion_score', { ascending: false })
    .limit(500);

  if (infErr || !influencers || influencers.length === 0) {
    return { productsMatched: 0, matchesCreated: 0, errors: infErr ? [infErr.message] : ['No influencers in database'] };
  }

  let productsMatched = 0;
  let matchesCreated = 0;

  for (const product of products as ProductForMatching[]) {
    const matches = scoreInfluencerMatches(product, influencers as InfluencerForMatching[]);
    const topMatches = matches
      .filter(m => m.matchScore >= 30)
      .slice(0, maxCreatorsPerProduct);

    if (topMatches.length === 0) continue;
    productsMatched++;

    for (const match of topMatches) {
      const { error: matchErr } = await admin
        .from('creator_product_matches')
        .upsert({
          product_id: product.id,
          influencer_id: match.influencerId,
          match_score: match.matchScore,
          niche_alignment: match.nicheAlignment,
          engagement_fit: match.engagementFit,
          price_range_fit: match.priceRangeFit,
          estimated_views: match.estimatedViews,
          estimated_conversions: match.estimatedConversions,
          estimated_profit: match.estimatedProfit,
          status: 'suggested',
          matched_at: new Date().toISOString(),
        }, { onConflict: 'product_id,influencer_id' });

      if (matchErr) {
        errors.push(`Match ${product.title} × ${match.influencerUsername}: ${matchErr.message}`);
      } else {
        matchesCreated++;
      }
    }
  }

  return { productsMatched, matchesCreated, errors };
}

function scoreInfluencerMatches(
  product: ProductForMatching,
  influencers: InfluencerForMatching[]
): Array<{
  influencerId: string;
  influencerUsername: string;
  matchScore: number;
  nicheAlignment: number;
  engagementFit: number;
  priceRangeFit: number;
  estimatedViews: number;
  estimatedConversions: number;
  estimatedProfit: number;
}> {
  return influencers.map(inf => {
    // Niche alignment (0-100): how well influencer niche matches product tags/category
    const nicheAlignment = calculateNicheAlignment(product, inf);

    // Engagement fit (0-100): engagement rate quality
    const engagementFit = calculateEngagementFit(inf);

    // Price range fit (0-100): does this influencer's audience match the price point?
    const priceRangeFit = calculatePriceRangeFit(product.price, inf);

    // Platform match bonus
    const platformMatch = product.platform === inf.platform ? 15 : 0;

    // Weighted match score
    const matchScore = Math.min(100, Math.round(
      nicheAlignment * 0.35 +
      engagementFit * 0.30 +
      priceRangeFit * 0.20 +
      platformMatch +
      (inf.conversion_score || 0) * 0.05
    ));

    // ROI estimates
    const estimatedViews = Math.round((inf.followers || 0) * (inf.engagement_rate || 1) / 100 * 10);
    const conversionRate = inf.engagement_rate > 5 ? 0.03 : inf.engagement_rate > 2 ? 0.02 : 0.01;
    const estimatedConversions = Math.round(estimatedViews * conversionRate);
    const margin = product.price > 30 ? 0.4 : product.price > 15 ? 0.3 : 0.2;
    const estimatedProfit = Math.round(estimatedConversions * product.price * margin * 100) / 100;

    return {
      influencerId: inf.id,
      influencerUsername: inf.username,
      matchScore,
      nicheAlignment,
      engagementFit,
      priceRangeFit,
      estimatedViews,
      estimatedConversions,
      estimatedProfit,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

function calculateNicheAlignment(product: ProductForMatching, inf: InfluencerForMatching): number {
  if (!inf.niche) return 20; // Unknown niche = low default

  const productKeywords = [
    ...(product.tags || []),
    product.category?.toLowerCase() || '',
    product.title.toLowerCase(),
  ].join(' ').toLowerCase();

  const nicheWords = inf.niche.toLowerCase().split(/[\s,]+/);
  let matches = 0;

  for (const word of nicheWords) {
    if (word.length > 2 && productKeywords.includes(word)) matches++;
  }

  if (matches >= 3) return 90;
  if (matches >= 2) return 70;
  if (matches >= 1) return 50;
  return 15;
}

function calculateEngagementFit(inf: InfluencerForMatching): number {
  const er = inf.engagement_rate || 0;

  // Micro-influencer sweet spot (high engagement)
  if (er >= 5 && inf.followers >= 10000 && inf.followers <= 100000) return 95;
  if (er >= 5) return 85;
  if (er >= 3) return 70;
  if (er >= 1.5) return 50;
  if (er >= 0.5) return 30;
  return 10;
}

function calculatePriceRangeFit(productPrice: number, inf: InfluencerForMatching): number {
  const followers = inf.followers || 0;

  // Nano/Micro influencers work best for impulse buys ($10-60)
  if (followers < 100000 && productPrice >= 10 && productPrice <= 60) return 90;
  // Mid-tier for mid-range ($30-150)
  if (followers >= 100000 && followers < 1000000 && productPrice >= 30 && productPrice <= 150) return 85;
  // Macro for premium ($100+)
  if (followers >= 1000000 && productPrice >= 100) return 80;

  // General fit based on price accessibility
  if (productPrice >= 15 && productPrice <= 60) return 60;
  if (productPrice < 15) return 40;
  return 50;
}

// ─── Engine Interface Wrapper ──────────────────────────────

export class CreatorMatchingEngine implements Engine {
  private _status: EngineStatus = 'idle';

  readonly config: EngineConfig = {
    name: 'creator-matching',
    version: '1.0.0',
    dependencies: [],
    queues: ['creator-matching'],
    publishes: [
      ENGINE_EVENTS.CREATOR_MATCHED,
      ENGINE_EVENTS.MATCHES_COMPLETE,
    ],
    subscribes: [
      ENGINE_EVENTS.PRODUCT_SCORED,
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
    if (event.type === ENGINE_EVENTS.PRODUCT_SCORED) {
      // Could auto-match when new high-scoring products arrive — manual-first per G10
      console.log(`[CreatorMatchingEngine] Product scored from ${event.source}, matching deferred to manual trigger`);
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Run creator matching and emit events for matches found.
   * Wraps runCreatorMatching with event bus integration.
   */
  async runMatching(
    minProductScore: number = 60,
    maxCreatorsPerProduct: number = 10,
  ): Promise<{ productsMatched: number; matchesCreated: number; errors: string[] }> {
    this._status = 'running';
    try {
      const result = await runCreatorMatching(minProductScore, maxCreatorsPerProduct);

      const bus = getEventBus();
      await bus.emit(
        ENGINE_EVENTS.MATCHES_COMPLETE,
        {
          productsMatched: result.productsMatched,
          matchesCreated: result.matchesCreated,
          errors: result.errors,
        },
        'creator-matching',
      );

      return result;
    } finally {
      this._status = 'idle';
    }
  }
}
