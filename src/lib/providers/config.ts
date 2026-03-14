// Centralized provider configuration with status checking

export interface ProviderInfo {
  id: string;
  name: string;
  description: string;
  category: "ai" | "ecommerce" | "trends" | "social" | "competitor" | "email" | "influencer" | "supplier";
  envKeys: string[];
  docsUrl?: string;
  freeQuota?: string;
  phase: number;
  pendingApproval?: boolean;
  fallback?: string;
}

export const PROVIDERS: ProviderInfo[] = [
  // === AI & Core ===
  {
    id: "supabase",
    name: "Supabase",
    description: "Database, auth, and real-time subscriptions",
    category: "ai",
    envKeys: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    phase: 1,
  },
  {
    id: "anthropic",
    name: "Claude AI (Anthropic)",
    description: "AI-powered product analysis, scoring, and blueprints",
    category: "ai",
    envKeys: ["ANTHROPIC_API_KEY"],
    phase: 5,
  },
  {
    id: "resend",
    name: "Resend",
    description: "Transactional email for alerts, reports, and outreach",
    category: "email",
    envKeys: ["RESEND_API_KEY"],
    phase: 5,
  },
  {
    id: "apify",
    name: "Apify",
    description: "Web scraping for TikTok, Amazon, Pinterest, Shopify, supplier data",
    category: "ecommerce",
    envKeys: ["APIFY_API_TOKEN"],
    freeQuota: "$5/mo free tier",
    phase: 5,
  },
  // === E-Commerce (pending approval) ===
  {
    id: "tiktok",
    name: "TikTok Research API",
    description: "Official TikTok product data (pending approval)",
    category: "social",
    envKeys: ["TIKTOK_API_KEY"],
    phase: 8,
    pendingApproval: true,
    fallback: "Apify TikTok Shop + ScrapeCreators + TikTok Creative Center",
  },
  {
    id: "scrape_creators",
    name: "ScrapeCreators",
    description: "TikTok Shop product discovery (fallback)",
    category: "social",
    envKeys: ["SCRAPE_CREATORS_API_KEY"],
    freeQuota: "100 free requests/mo",
    phase: 8,
  },
  {
    id: "amazon_pa",
    name: "Amazon Product Advertising API",
    description: "Official Amazon product data (pending approval)",
    category: "ecommerce",
    envKeys: ["AMAZON_PA_API_KEY", "AMAZON_PA_API_SECRET", "AMAZON_ASSOCIATE_TAG"],
    phase: 9,
    pendingApproval: true,
    fallback: "Apify Amazon BSR + RapidAPI Real-Time Amazon",
  },
  {
    id: "rapidapi",
    name: "RapidAPI (Real-Time Amazon)",
    description: "Amazon product data via third-party API (fallback)",
    category: "ecommerce",
    envKeys: ["RAPIDAPI_KEY"],
    freeQuota: "500 free/mo",
    phase: 9,
  },
  // === Trends & Research ===
  {
    id: "reddit",
    name: "Reddit API",
    description: "Community sentiment and trend discovery",
    category: "trends",
    envKeys: ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET"],
    freeQuota: "Free (2 min signup)",
    phase: 7,
  },
  {
    id: "youtube",
    name: "YouTube Data API",
    description: "Video analytics for influencer discovery",
    category: "social",
    envKeys: ["YOUTUBE_API_KEY"],
    freeQuota: "10k units/day free",
    phase: 15,
  },
  {
    id: "product_hunt",
    name: "Product Hunt",
    description: "Digital product trend discovery",
    category: "trends",
    envKeys: ["PRODUCT_HUNT_API_KEY"],
    freeQuota: "Free (2 min signup)",
    phase: 11,
  },
  // === Social Platforms ===
  {
    id: "pinterest",
    name: "Pinterest Business API",
    description: "Pinterest product pins and trend data",
    category: "social",
    envKeys: ["PINTEREST_API_KEY"],
    freeQuota: "Free basic tier",
    phase: 10,
  },
  // === Competitor Intel ===
  {
    id: "serpapi",
    name: "SerpAPI",
    description: "Search engine results for competitor analysis",
    category: "competitor",
    envKeys: ["SERPAPI_KEY"],
    freeQuota: "100 free/mo",
    phase: 12,
  },
  // === Influencer ===
  {
    id: "ainfluencer",
    name: "Ainfluencer",
    description: "Influencer discovery and matching (100% free)",
    category: "influencer",
    envKeys: ["AINFLUENCER_API_KEY"],
    freeQuota: "100% free",
    phase: 15,
  },
  {
    id: "modash",
    name: "Modash",
    description: "Influencer analytics and audience data",
    category: "influencer",
    envKeys: ["MODASH_API_KEY"],
    freeQuota: "20 results/search free",
    phase: 15,
  },
  {
    id: "hypeauditor",
    name: "HypeAuditor",
    description: "Fake follower detection and audience quality",
    category: "influencer",
    envKeys: ["HYPEAUDITOR_API_KEY"],
    freeQuota: "Limited free tier",
    phase: 15,
  },
  // === Supplier ===
  {
    id: "alibaba",
    name: "Alibaba Open API",
    description: "Supplier discovery from Alibaba.com",
    category: "supplier",
    envKeys: ["ALIBABA_APP_KEY"],
    freeQuota: "Free (10 min signup)",
    phase: 15,
  },
  {
    id: "cj_dropshipping",
    name: "CJ Dropshipping",
    description: "Dropshipping supplier and product data",
    category: "supplier",
    envKeys: ["CJ_DROPSHIPPING_API_KEY"],
    freeQuota: "Free (5 min signup)",
    phase: 15,
  },
  {
    id: "faire",
    name: "Faire",
    description: "Wholesale supplier marketplace",
    category: "supplier",
    envKeys: ["FAIRE_API_KEY"],
    freeQuota: "Free (5 min signup)",
    phase: 15,
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  ai: "AI & Core",
  ecommerce: "E-Commerce",
  trends: "Trends & Research",
  social: "Social Platforms",
  competitor: "Competitor Intel",
  email: "Email",
  influencer: "Influencer Discovery",
  supplier: "Supplier Discovery",
};

// Static env var lookup — Next.js inlines process.env.KEY at build time,
// but NOT process.env[dynamicKey]. This map ensures all provider keys
// are resolved at build time without leaking to the client bundle.
export function getEnvVar(key: string): string | undefined {
  const ENV_MAP: Record<string, string | undefined> = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    APIFY_API_TOKEN: process.env.APIFY_API_TOKEN,
    RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
    TIKTOK_API_KEY: process.env.TIKTOK_API_KEY,
    SCRAPE_CREATORS_API_KEY: process.env.SCRAPE_CREATORS_API_KEY,
    AMAZON_PA_API_KEY: process.env.AMAZON_PA_API_KEY,
    AMAZON_PA_API_SECRET: process.env.AMAZON_PA_API_SECRET,
    AMAZON_ASSOCIATE_TAG: process.env.AMAZON_ASSOCIATE_TAG,
    REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    PINTEREST_API_KEY: process.env.PINTEREST_API_KEY,
    PRODUCT_HUNT_API_KEY: process.env.PRODUCT_HUNT_API_KEY,
    SERPAPI_KEY: process.env.SERPAPI_KEY,
    AINFLUENCER_API_KEY: process.env.AINFLUENCER_API_KEY,
    MODASH_API_KEY: process.env.MODASH_API_KEY,
    HYPEAUDITOR_API_KEY: process.env.HYPEAUDITOR_API_KEY,
    CJ_DROPSHIPPING_API_KEY: process.env.CJ_DROPSHIPPING_API_KEY,
    ALIBABA_APP_KEY: process.env.ALIBABA_APP_KEY,
    FAIRE_API_KEY: process.env.FAIRE_API_KEY,
  };
  return ENV_MAP[key];
}

export function getProviderStatus(envKeys: string[]): "connected" | "missing" {
  return envKeys.every((key) => !!getEnvVar(key))
    ? "connected"
    : "missing";
}
