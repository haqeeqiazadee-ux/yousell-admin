/**
 * Content Template Registry
 *
 * Single source of truth for all content templates, system prompts,
 * and credit cost mappings. Used by both:
 * - /api/dashboard/content/generate (sync generation)
 * - /backend/jobs/content-generation.ts (async generation)
 *
 * @see CLAUDE.md Section 7 — Scoring Engine (tier-based model selection)
 * @see src/lib/stripe.ts — CONTENT_CREDIT_COSTS for credit pricing
 */

export type ContentType =
  | 'product_description'
  | 'social_post'
  | 'ad_copy'
  | 'email_sequence'
  | 'video_script'
  | 'blog_post'
  | 'seo_listing';

export type ContentChannel =
  | 'tiktok'
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'pinterest'
  | 'amazon'
  | 'shopify'
  | 'ayrshare'
  | 'shopify_blog'
  | 'meta';

export interface ContentTemplate {
  /** Human-readable name */
  name: string;
  /** System prompt sent to Claude */
  systemPrompt: string;
  /** Max tokens for Claude response */
  maxTokens: number;
  /** Credit cost key (maps to CONTENT_CREDIT_COSTS) */
  creditType: string;
  /** Recommended channels for this content type */
  channels: ContentChannel[];
}

/**
 * Master template registry. Add new content types here.
 */
export const CONTENT_TEMPLATES: Record<ContentType, ContentTemplate> = {
  product_description: {
    name: 'Product Description',
    systemPrompt:
      'You are an expert e-commerce copywriter. Write a compelling product description that highlights benefits, uses power words, and drives conversions. Keep it under 200 words.',
    maxTokens: 400,
    creditType: 'caption',
    channels: ['shopify', 'amazon'],
  },
  social_post: {
    name: 'Social Post',
    systemPrompt:
      'You are a social media marketing expert. Write an engaging social media post that drives clicks and engagement. Include relevant hashtags. Keep it under 280 characters for Twitter compatibility.',
    maxTokens: 200,
    creditType: 'caption',
    channels: ['tiktok', 'instagram', 'facebook', 'twitter', 'pinterest'],
  },
  ad_copy: {
    name: 'Ad Copy',
    systemPrompt:
      'You are a direct-response advertising copywriter. Write ad copy with a strong hook, clear value proposition, and compelling CTA. Include a headline (under 40 chars) and body (under 125 chars).',
    maxTokens: 300,
    creditType: 'ad',
    channels: ['facebook', 'instagram', 'tiktok'],
  },
  email_sequence: {
    name: 'Email Sequence',
    systemPrompt:
      'You are an email marketing specialist. Write a 3-email welcome/launch sequence for a product. Each email should have a subject line and body. Focus on building interest, demonstrating value, and driving purchase.',
    maxTokens: 1000,
    creditType: 'email_sequence',
    channels: [],
  },
  video_script: {
    name: 'Video Script',
    systemPrompt:
      'You are a short-form video content strategist. Write a 30-60 second video script for TikTok/Reels that hooks viewers in the first 3 seconds, demonstrates the product, and ends with a CTA.',
    maxTokens: 500,
    creditType: 'short_video',
    channels: ['tiktok', 'instagram'],
  },
  blog_post: {
    name: 'Blog Post',
    systemPrompt:
      'You are an SEO content writer. Write a 500-800 word blog post about this product that naturally incorporates search keywords, provides genuine value to readers, and includes a compelling CTA at the end.',
    maxTokens: 1500,
    creditType: 'blog',
    channels: ['shopify_blog'],
  },
  seo_listing: {
    name: 'SEO Listing',
    systemPrompt:
      'You are an Amazon/marketplace SEO specialist. Write an optimized product listing with: title (under 200 chars with top keywords), 5 bullet points highlighting key features and benefits, and a keyword-rich description (under 2000 chars).',
    maxTokens: 800,
    creditType: 'caption',
    channels: ['amazon', 'shopify'],
  },
};

/**
 * Build the user prompt with product context enrichment.
 * Includes trending data, creator insights, and competitor info when available.
 */
export function buildContentPrompt(
  contentType: ContentType,
  product: {
    title: string;
    description?: string;
    price?: number;
    category?: string;
    source?: string;
    final_score?: number;
    trend_stage?: string;
  },
  enrichment?: {
    trendingKeywords?: string[];
    creatorInsights?: string;
    competitorPricing?: string;
    targetAudience?: string;
  },
): string {
  const lines: string[] = [
    `Generate ${CONTENT_TEMPLATES[contentType]?.name?.toLowerCase() || contentType.replace(/_/g, ' ')} for this product:`,
    '',
    `Product: ${product.title}`,
  ];

  if (product.description) lines.push(`Description: ${product.description}`);
  if (product.price) lines.push(`Price: $${product.price}`);
  if (product.category) lines.push(`Category: ${product.category}`);
  if (product.source) lines.push(`Source: ${product.source}`);
  if (product.final_score) lines.push(`Trend Score: ${product.final_score}/100`);
  if (product.trend_stage) lines.push(`Trend Stage: ${product.trend_stage}`);

  if (enrichment) {
    if (enrichment.trendingKeywords?.length) {
      lines.push('', `Trending Keywords: ${enrichment.trendingKeywords.join(', ')}`);
    }
    if (enrichment.creatorInsights) {
      lines.push(`Creator Insights: ${enrichment.creatorInsights}`);
    }
    if (enrichment.competitorPricing) {
      lines.push(`Competitor Pricing: ${enrichment.competitorPricing}`);
    }
    if (enrichment.targetAudience) {
      lines.push(`Target Audience: ${enrichment.targetAudience}`);
    }
  }

  return lines.join('\n');
}

/**
 * Select Claude model based on product tier.
 * HOT products get Sonnet (premium), everything else gets Haiku (cost-optimized).
 */
export function selectModel(tier?: string): { model: string; label: 'haiku' | 'sonnet' } {
  if (tier === 'HOT') {
    return { model: 'claude-sonnet-4-5-20250514', label: 'sonnet' };
  }
  return { model: 'claude-haiku-4-5-20251001', label: 'haiku' };
}

/**
 * Get credit cost for a content type.
 * Returns the credit type key to look up in CONTENT_CREDIT_COSTS.
 */
export function getCreditType(contentType: ContentType): string {
  return CONTENT_TEMPLATES[contentType]?.creditType || 'caption';
}

/**
 * Validate that a content type is supported.
 */
export function isValidContentType(type: string): type is ContentType {
  return type in CONTENT_TEMPLATES;
}
