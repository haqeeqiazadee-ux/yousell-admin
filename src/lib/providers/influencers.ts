import { getCachedProducts } from './cache';

export interface Influencer {
  username: string;
  platform: string;
  followers: number;
  tier: 'nano' | 'micro' | 'mid' | 'macro';
  engagement_rate: number;
  us_audience_pct: number;
  fake_follower_pct: number;
  conversion_score: number;
  email: string | null;
  cpp_estimate: number | null;
  niche: string | null;
}

/**
 * Influencer Conversion Score formula (Section 8 of build brief)
 *
 * Conversion Score = (Engagement Rate × 30%)
 *                  + (Purchase Intent Comment Ratio × 25%)
 *                  + (Product Demo Quality × 20%)
 *                  + (Audience Trust Signals × 15%)
 *                  + (US Audience % × 10%)
 */
export function calculateConversionScore(inputs: {
  engagementRate: number;
  purchaseIntentRatio: number;
  productDemoQuality: number;
  audienceTrustSignals: number;
  usAudiencePct: number;
}): number {
  return Math.min(100, Math.max(0, Math.round(
    inputs.engagementRate * 0.30 +
    inputs.purchaseIntentRatio * 0.25 +
    inputs.productDemoQuality * 0.20 +
    inputs.audienceTrustSignals * 0.15 +
    inputs.usAudiencePct * 0.10
  )));
}

/**
 * Fake follower filter: exclude any influencer where fake_follower_pct > 30%
 * (i.e. less than 70% real followers)
 */
export function passesFakeFollowerFilter(fakeFollowerPct: number): boolean {
  return fakeFollowerPct <= 30;
}

/**
 * Classify influencer tier by follower count
 */
export function classifyTier(followers: number): Influencer['tier'] {
  if (followers >= 100000) return 'macro';
  if (followers >= 50000) return 'mid';
  if (followers >= 10000) return 'micro';
  return 'nano';
}

/**
 * Discover influencers from configured provider
 * Uses env var INFLUENCER_PROVIDER to select source
 */
export async function discoverInfluencers(productCategory: string): Promise<Influencer[]> {
  const provider = process.env.INFLUENCER_PROVIDER || 'ainfluencer';

  // Check 24h cache first
  const cached = await getCachedProducts('influencer', productCategory);
  if (cached) return cached as unknown as Influencer[];

  switch (provider) {
    case 'ainfluencer':
      return fetchFromAInfluencer(productCategory);
    case 'modash':
      return fetchFromModash(productCategory);
    default:
      console.warn(`Unknown influencer provider: ${provider}`);
      return [];
  }
}

async function fetchFromAInfluencer(category: string): Promise<Influencer[]> {
  const apiKey = process.env.AINFLUENCER_API_KEY;
  if (!apiKey) {
    console.warn('AINFLUENCER_API_KEY not set');
    return [];
  }
  // Placeholder — actual API integration needed
  return [];
}

async function fetchFromModash(category: string): Promise<Influencer[]> {
  const apiKey = process.env.MODASH_API_KEY;
  if (!apiKey) {
    console.warn('MODASH_API_KEY not set');
    return [];
  }
  // Placeholder — actual API integration needed
  return [];
}
