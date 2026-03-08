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
  _niche: string,
  _platform?: string
): Promise<InfluencerResult[]> {
  // TODO Phase 15: Implement Ainfluencer API
  // TODO: Implement Modash free tier
  // TODO: YouTube Data API for creator discovery
  return [];
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
