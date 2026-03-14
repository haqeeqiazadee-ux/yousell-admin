/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.alicdn.com' },
      { protocol: 'https', hostname: '*.tiktokcdn.com' },
      { protocol: 'https', hostname: '*.shopify.com' },
      { protocol: 'https', hostname: '*.pinimg.com' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
    ],
  },
  // Expose server-side env vars so dynamic process.env[key] access works
  // on Netlify Functions (Next.js inlines static refs but not dynamic ones)
  env: {
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
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RAILWAY_API_SECRET: process.env.RAILWAY_API_SECRET,
  },
};

export default nextConfig;
