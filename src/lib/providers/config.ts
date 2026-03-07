// Centralized provider configuration with status checking

export interface ProviderInfo {
  id: string;
  name: string;
  description: string;
  category: "ai" | "ecommerce" | "trends" | "social" | "competitor" | "email";
  envKeys: string[];
  docsUrl?: string;
  freeQuota?: string;
  phase: number;
}

export const PROVIDERS: ProviderInfo[] = [
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
    description: "Transactional email for alerts and reports",
    category: "email",
    envKeys: ["RESEND_API_KEY"],
    phase: 5,
  },
  {
    id: "apify",
    name: "Apify",
    description: "Web scraping for TikTok, Amazon, and supplier data",
    category: "ecommerce",
    envKeys: ["APIFY_API_TOKEN"],
    freeQuota: "$5/mo free tier",
    phase: 5,
  },
  {
    id: "tiktok",
    name: "TikTok Shop",
    description: "TikTok product discovery and trending analysis",
    category: "social",
    envKeys: ["TIKTOK_API_KEY"],
    phase: 8,
  },
  {
    id: "amazon_pa",
    name: "Amazon Product Advertising",
    description: "Official Amazon product data API",
    category: "ecommerce",
    envKeys: ["AMAZON_PA_API_KEY", "AMAZON_PA_API_SECRET", "AMAZON_ASSOCIATE_TAG"],
    phase: 9,
  },
  {
    id: "rapidapi",
    name: "RapidAPI",
    description: "Amazon product data via third-party API",
    category: "ecommerce",
    envKeys: ["RAPIDAPI_KEY"],
    freeQuota: "500 free/mo",
    phase: 9,
  },
  {
    id: "reddit",
    name: "Reddit API",
    description: "Community sentiment and trend discovery",
    category: "trends",
    envKeys: ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET"],
    phase: 7,
  },
  {
    id: "serpapi",
    name: "SerpAPI",
    description: "Search engine results for competitor analysis",
    category: "competitor",
    envKeys: ["SERPAPI_KEY"],
    freeQuota: "100 free/mo",
    phase: 12,
  },
  {
    id: "pinterest",
    name: "Pinterest",
    description: "Pinterest product pins and trend data",
    category: "social",
    envKeys: ["PINTEREST_APP_ID", "PINTEREST_APP_SECRET"],
    phase: 10,
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
];

export function getProviderStatus(envKeys: string[]): "connected" | "missing" {
  // In client-side code we can only check NEXT_PUBLIC_ vars
  // Server-side API route handles the full check
  return envKeys.every((key) => key.startsWith("NEXT_PUBLIC_") && process.env[key])
    ? "connected"
    : "missing";
}
