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
  return [
    { name: "Jasper AI", platform: "jasper.ai", commissionRate: 30, recurring: true, cookieDays: 30, network: "Direct", joinUrl: "https://jasper.ai/partners", nicheTags: ["ai", "writing", "marketing"] },
    { name: "Copy.ai", platform: "copy.ai", commissionRate: 45, recurring: false, cookieDays: 60, network: "Direct", joinUrl: "https://copy.ai/affiliates", nicheTags: ["ai", "copywriting"] },
    { name: "Midjourney", platform: "midjourney.com", commissionRate: 50, recurring: false, cookieDays: 30, network: "Direct", joinUrl: "https://midjourney.com/affiliate", nicheTags: ["ai", "art", "design"] },
    { name: "Canva Pro", platform: "canva.com", commissionRate: 25, recurring: false, cookieDays: 30, network: "Impact", joinUrl: "https://partner.canva.com", nicheTags: ["design", "templates"] },
    { name: "Notion", platform: "notion.so", commissionRate: 50, recurring: false, cookieDays: 90, network: "Direct", joinUrl: "https://notion.so/affiliates", nicheTags: ["productivity", "templates"] },
    { name: "Teachable", platform: "teachable.com", commissionRate: 30, recurring: true, cookieDays: 90, network: "Direct", joinUrl: "https://teachable.com/partners", nicheTags: ["courses", "education"] },
    { name: "ConvertKit", platform: "convertkit.com", commissionRate: 30, recurring: true, cookieDays: 90, network: "Direct", joinUrl: "https://convertkit.com/affiliates", nicheTags: ["email", "marketing"] },
    { name: "Shopify", platform: "shopify.com", commissionRate: 20, recurring: false, cookieDays: 30, network: "Impact", joinUrl: "https://shopify.com/affiliates", nicheTags: ["ecommerce", "dropshipping"] },
    { name: "Hostinger", platform: "hostinger.com", commissionRate: 60, recurring: false, cookieDays: 30, network: "Direct", joinUrl: "https://hostinger.com/affiliates", nicheTags: ["hosting", "website"] },
    { name: "NordVPN", platform: "nordvpn.com", commissionRate: 40, recurring: true, cookieDays: 30, network: "CJ", joinUrl: "https://nordvpn.com/affiliate", nicheTags: ["vpn", "security", "tech"] },
  ];
}

export async function getPhysicalAffiliateProducts(): Promise<AffiliateProgram[]> {
  // Combine seeded data with dynamic discovery when available
  const seeded: AffiliateProgram[] = [
    { name: "Amazon Associates", platform: "amazon.com", commissionRate: 4, recurring: false, cookieDays: 1, network: "Direct", joinUrl: "https://affiliate-program.amazon.com", nicheTags: ["physical", "general"] },
    { name: "TikTok Shop Affiliate", platform: "tiktok.com", commissionRate: 15, recurring: false, cookieDays: 7, network: "Direct", joinUrl: "https://seller.tiktok.com/affiliate", nicheTags: ["physical", "viral", "tiktok"] },
    { name: "Walmart Affiliate", platform: "walmart.com", commissionRate: 4, recurring: false, cookieDays: 3, network: "Impact", joinUrl: "https://affiliates.walmart.com", nicheTags: ["physical", "general"] },
    { name: "Target Partners", platform: "target.com", commissionRate: 5, recurring: false, cookieDays: 7, network: "Impact", joinUrl: "https://partners.target.com", nicheTags: ["physical", "home", "fashion"] },
    { name: "eBay Partner Network", platform: "ebay.com", commissionRate: 3, recurring: false, cookieDays: 1, network: "Direct", joinUrl: "https://partnernetwork.ebay.com", nicheTags: ["physical", "general", "auction"] },
  ];

  const dynamic = await discoverPhysicalAffiliatePrograms();
  return [...seeded, ...dynamic];
}

/**
 * Dynamic AI affiliate program discovery (v8 spec — live discovery).
 * Stub: Will query affiliate networks for new high-commission AI programs.
 */
export async function discoverAIAffiliatePrograms(): Promise<AffiliateProgram[]> {
  console.log("[Affiliate] Dynamic AI affiliate discovery not yet implemented");
  return [];
}

/**
 * Dynamic physical affiliate program discovery (v8 spec — live discovery).
 * Stub: Will query affiliate networks for trending physical product programs.
 */
export async function discoverPhysicalAffiliatePrograms(): Promise<AffiliateProgram[]> {
  console.log("[Affiliate] Dynamic physical affiliate discovery not yet implemented");
  return [];
}
