import type { ProviderConfig } from "../types";

export function getAffiliateConfig(): ProviderConfig {
  return {
    name: "affiliate",
    isConfigured: true, // Seeded data, no API key needed initially
  };
}

export interface AffiliateProgram {
  name: string;
  platform: string;
  commissionRate: number;
  recurring: boolean;
  cookieDays: number;
  network: string;
  joinUrl: string;
  nicheTags: string[];
}

/**
 * Get AI affiliate programs (SaaS, subscriptions).
 * Initially seeded from spec Section 7 table.
 */
export async function getAIAffiliatePrograms(): Promise<AffiliateProgram[]> {
  // TODO Phase 11: Fetch from affiliate_programs table
  // Seed data will be inserted via migration
  return [];
}

/**
 * Get physical affiliate opportunities (TikTok Shop + Amazon commissions).
 * No inventory required — commission-based.
 */
export async function getPhysicalAffiliateProducts(): Promise<AffiliateProgram[]> {
  // TODO Phase 11: Implement TikTok Shop affiliate discovery
  // TODO: Amazon Associates product discovery
  return [];
}
