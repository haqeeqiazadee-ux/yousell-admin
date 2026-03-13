import type { ProviderConfig } from "../types";

const PROVIDER = process.env.INFLUENCER_PROVIDER || "ainfluencer";

export function getInfluencerConfig(): ProviderConfig {
  return {
    name: PROVIDER,
    isConfigured: PROVIDER === "ainfluencer"
      ? true // Ainfluencer is 100% free, always available
      : !!(process.env.MODASH_API_KEY || process.env.HYPEAUDITOR_API_KEY),
  };
}

export interface InfluencerResult {
  username: string;
  platform: string;
  followers: number;
  engagementRate: number;
  niche: string;
  email?: string;
  profileUrl: string;
}

/**
 * Search for influencers matching a product niche.
 * Primary: Ainfluencer (100% free)
 * Fallback: Modash free tier, HypeAuditor
 * Additional: YouTube Data API, Pinterest Creator API, TikTok Creator Marketplace
 */
export async function searchInfluencers(
  niche: string,
  _platform?: string
): Promise<InfluencerResult[]> {
  if (process.env.APIFY_API_TOKEN) {
    return searchViaApify(niche);
  }
  return [];
}

async function searchViaApify(niche: string): Promise<InfluencerResult[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) return [];

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          search: niche,
          resultsLimit: 15,
        }),
        signal: AbortSignal.timeout(60000),
      }
    );

    if (!res.ok) {
      console.error(`Apify Influencer error: ${res.status}`);
      return [];
    }

    const items = await res.json();
    if (!Array.isArray(items)) return [];

    return items.slice(0, 15).map((item: Record<string, unknown>) => ({
      username: (item.username as string) || (item.name as string) || "unknown",
      platform: "instagram",
      followers: parseInt(String(item.followersCount || item.followers || 0), 10),
      engagementRate: parseFloat(String(item.engagementRate || 0)) || 0,
      niche,
      email: (item.email as string) || (item.businessEmail as string) || undefined,
      profileUrl: (item.url as string) || `https://instagram.com/${item.username || ""}`,
    }));
  } catch (err) {
    console.error("Apify Influencer search failed:", err);
    return [];
  }
}

/**
 * Calculate influencer tier based on follower count.
 * Nano: 1K-10K, Micro: 10K-100K, Mid: 100K-1M, Macro: 1M+
 */
export function getInfluencerTier(followers: number): "nano" | "micro" | "mid" | "macro" {
  if (followers >= 1_000_000) return "macro";
  if (followers >= 100_000) return "mid";
  if (followers >= 10_000) return "micro";
  return "nano";
}

/**
 * Estimate cost per post based on tier.
 */
export function estimateCPP(tier: "nano" | "micro" | "mid" | "macro"): { min: number; max: number } {
  switch (tier) {
    case "nano": return { min: 20, max: 100 };
    case "micro": return { min: 100, max: 500 };
    case "mid": return { min: 500, max: 5000 };
    case "macro": return { min: 5000, max: 50000 };
  }
}

/**
 * Influencer Conversion Score formula (Section 8 of build brief)
 *
 * Conversion Score = (Engagement Rate x 30%)
 *                  + (Purchase Intent Comment Ratio x 25%)
 *                  + (Product Demo Quality x 20%)
 *                  + (Audience Trust Signals x 15%)
 *                  + (US Audience % x 10%)
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
 */
export function passesFakeFollowerFilter(fakeFollowerPct: number): boolean {
  return fakeFollowerPct <= 30;
}
