/**
 * Content Creation Engine (V9 Engine 9)
 *
 * AI-generated marketing content: product descriptions, social posts,
 * ad copy, video scripts, email campaigns. Uses Claude Haiku for bulk
 * and Sonnet for premium content per G12.
 * Reads trend signals for keywords, creator matches for style.
 * Writes to content_queue and content_credits tables.
 *
 * V9 Tasks: 9.001–9.055
 * Comm #: 5.009, 6.005, 7.006, 14.006–14.009
 * @engine content-engine
 */

import { getEventBus } from './event-bus';
import type {
  Engine, EngineConfig, EngineEvent, EngineStatus,
} from './types';
import { ENGINE_EVENTS } from './types';
import type { SupabaseMinimalClient } from './db-types';

/** Content record */
export interface ContentRecord {
  id?: string;
  product_id: string;
  content_id: string;
  content_type: ContentType;
  platform: string;
  content: string;
  status: 'draft' | 'approved' | 'published' | 'archived';
  credits_cost: number;
  model_used: 'haiku' | 'sonnet';
  word_count: number;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

type ContentType = 'description' | 'social_post' | 'ad_copy' | 'video_script' | 'email' | 'image' | 'carousel' | 'short_video';

/** Credit costs per content type */
const CREDIT_COSTS: Record<ContentType, { haiku: number; sonnet: number }> = {
  description: { haiku: 1, sonnet: 3 },
  social_post: { haiku: 1, sonnet: 2 },
  ad_copy: { haiku: 2, sonnet: 5 },
  video_script: { haiku: 3, sonnet: 8 },
  email: { haiku: 2, sonnet: 5 },
  image: { haiku: 2, sonnet: 2 },       // Bannerbear generation
  carousel: { haiku: 5, sonnet: 5 },    // Multi-slide Bannerbear
  short_video: { haiku: 5, sonnet: 5 }, // Shotstack video rendering
};

/** Token limits per content type */
const TOKEN_LIMITS: Record<ContentType, number> = {
  description: 500,
  social_post: 200,
  ad_copy: 300,
  video_script: 1000,
  email: 500,
  image: 100,        // Caption/alt text only
  carousel: 300,     // Multi-slide captions
  short_video: 500,  // Video script narration
};

export class ContentCreationEngine implements Engine {
  private _status: EngineStatus = 'idle';
  private _dbClient: SupabaseMinimalClient | null = null;

  readonly config: EngineConfig = {
    name: 'content-engine',
    version: '2.0.0',
    dependencies: [],
    queues: ['content-generation', 'content-batch'],
    publishes: [
      ENGINE_EVENTS.CONTENT_GENERATED,
      ENGINE_EVENTS.CONTENT_BATCH_COMPLETE,
    ],
    subscribes: [
      ENGINE_EVENTS.BLUEPRINT_APPROVED,
      ENGINE_EVENTS.PRODUCT_ALLOCATED,
      ENGINE_EVENTS.PRODUCT_PUSHED,
    ],
  };

  setDbClient(client: SupabaseMinimalClient): void {
    this._dbClient = client;
  }

  private getDb(): SupabaseMinimalClient {
    if (this._dbClient) return this._dbClient;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { supabaseAdmin } = require('../supabase');
    return supabaseAdmin;
  }

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
    if (event.type === ENGINE_EVENTS.BLUEPRINT_APPROVED) {
      console.log(`[ContentCreation] Blueprint approved, content generation eligible for launch content`);
    }
    if (event.type === ENGINE_EVENTS.PRODUCT_ALLOCATED) {
      console.log(`[ContentCreation] Product allocated to client, client-facing content generation eligible`);
    }
    if (event.type === ENGINE_EVENTS.PRODUCT_PUSHED) {
      console.log(`[ContentCreation] Product pushed to store, social media content generation eligible`);
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Generate content for a product on a specific platform.
   * Reads enrichment data from trend_signals and creator_product_matches.
   * Writes to content_queue table. Deducts credits.
   * V9 Tasks: 9.005–9.035
   */
  async generateContent(
    productId: string,
    input: {
      contentType: ContentType;
      platform: string;
      productTitle: string;
      productDescription: string;
      tier: string;
      clientId?: string;
    },
  ): Promise<{
    contentId: string;
    content: string;
    creditsCost: number;
    modelUsed: 'haiku' | 'sonnet';
  }> {
    this._status = 'running';
    try {
      const bus = getEventBus();
      const db = this.getDb();

      // Determine model: Sonnet for HOT products (premium), Haiku for rest (G12)
      const modelUsed: 'haiku' | 'sonnet' = input.tier === 'HOT' ? 'sonnet' : 'haiku';
      const creditsCost = CREDIT_COSTS[input.contentType]?.[modelUsed] || 2;
      const contentId = `cnt_${productId}_${input.contentType}_${Date.now()}`;

      // Comm #5.009: Read trending keywords for SEO optimization
      let trendingKeywords: string[] = [];
      try {
        const { data: trends } = await db
          .from('trend_signals')
          .select('keyword, score')
          .order('score', { ascending: false })
          .limit(5);
        trendingKeywords = (trends || []).map((t: { keyword: string }) => t.keyword);
      } catch {
        // Non-critical enrichment
      }

      // Comm #6.005: Read creator match data for content style hints
      let creatorContext = '';
      try {
        const { data: creators } = await db
          .from('creator_product_matches')
          .select('platform, match_score')
          .eq('product_id', productId)
          .order('match_score', { ascending: false })
          .limit(3);
        if (creators && creators.length > 0) {
          creatorContext = `Top matched creators on: ${creators.map((c: { platform: string }) => c.platform).join(', ')}`;
        }
      } catch {
        // Non-critical
      }

      // Comm #14.006–14.009: Read competitor data for USP differentiation
      let competitorContext = '';
      try {
        const { data: competitors } = await db
          .from('competitor_products')
          .select('store_name, price')
          .eq('product_id', productId)
          .limit(3);
        if (competitors && competitors.length > 0) {
          const avgCompPrice = competitors.reduce((s: number, c: { price: number }) => s + c.price, 0) / competitors.length;
          competitorContext = `Competitor avg price: $${avgCompPrice.toFixed(2)}`;
        }
      } catch {
        // Non-critical
      }

      // Build AI prompt (in production: calls Claude API)
      const systemPrompt = this.buildSystemPrompt(input.contentType, input.platform);
      const userPrompt = this.buildUserPrompt({
        productTitle: input.productTitle,
        productDescription: input.productDescription,
        contentType: input.contentType,
        platform: input.platform,
        trendingKeywords,
        creatorContext,
        competitorContext,
      });

      // Generate content via Claude API (Haiku for bulk, Sonnet for HOT tier)
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      let content: string;

      if (anthropicKey) {
        const model = modelUsed === 'sonnet' ? 'claude-sonnet-4-5-20250514' : 'claude-haiku-4-5-20251001';
        const maxTokens = TOKEN_LIMITS[input.contentType] || 400;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
          }),
        });

        if (response.ok) {
          const result = await response.json() as Record<string, unknown>;
          const textBlock = ((result.content as Array<Record<string, unknown>>)?.[0]);
          content = (textBlock?.text as string) || `[Generation failed — empty response]`;
        } else {
          console.error(`[ContentCreation] Claude API error: ${response.status}`);
          content = `[Generation failed — API error ${response.status}]`;
        }
      } else {
        // Fallback when ANTHROPIC_API_KEY not set (dev/test)
        content = `[AI-generated ${input.contentType} for "${input.productTitle}" on ${input.platform}]`;
      }

      // V9 Tasks 9.18-9.21: Media generation (image/video) when applicable
      let mediaUrl: string | undefined;
      try {
        if (input.contentType === 'image' || input.contentType === 'carousel') {
          const { isBannerbearConfigured, generateProductImage } = await import('../integrations/bannerbear/client');
          if (isBannerbearConfigured()) {
            const templateUid = process.env.BANNERBEAR_DEFAULT_TEMPLATE || '';
            if (templateUid) {
              const imageResult = await generateProductImage(templateUid, {
                title: input.productTitle,
                price: 0,
                description: input.productDescription,
              });
              mediaUrl = imageResult.imageUrl || imageResult.imageUrlPng;
              console.log(`[ContentCreation] Bannerbear image queued: ${imageResult.uid}`);
            }
          }
        } else if (input.contentType === 'short_video') {
          const { isShotstackConfigured, generateProductVideo } = await import('../integrations/shotstack/client');
          if (isShotstackConfigured()) {
            const videoResult = await generateProductVideo({
              title: input.productTitle,
              price: 0,
              imageUrls: [], // Would come from product images
              description: input.productDescription,
            });
            console.log(`[ContentCreation] Shotstack video render submitted: ${videoResult.id}`);
          }
        }
      } catch (mediaErr) {
        console.error('[ContentCreation] Media generation error:', mediaErr);
        // Non-fatal — text content still available
      }

      // Write content to DB
      const record: ContentRecord = {
        product_id: productId,
        content_id: contentId,
        content_type: input.contentType,
        platform: input.platform,
        content,
        status: 'draft',
        credits_cost: creditsCost,
        model_used: modelUsed,
        word_count: content.split(' ').length,
        metadata: {
          systemPrompt,
          trendingKeywords,
          creatorContext,
          competitorContext,
        },
        created_at: new Date().toISOString(),
      };

      await db
        .from('content_queue')
        .insert(record);

      // Deduct credits if client-generated
      if (input.clientId) {
        await db
          .from('content_credits')
          .update({
            credits_used: creditsCost, // In production: increment via RPC
          })
          .eq('client_id', input.clientId);
      }

      await bus.emit(
        ENGINE_EVENTS.CONTENT_GENERATED,
        {
          productId,
          contentType: input.contentType,
          platform: input.platform,
          creditsCost,
          contentId,
        },
        'content-engine',
      );

      return { contentId, content, creditsCost, modelUsed };
    } finally {
      this._status = 'idle';
    }
  }

  /**
   * Batch-generate content for multiple products.
   * V9 Tasks: 9.036–9.050
   */
  async batchGenerate(
    requests: Array<{
      productId: string;
      contentType: ContentType;
      platform: string;
      productTitle: string;
      productDescription: string;
      tier: string;
    }>,
  ): Promise<{ generated: number; failed: number; totalCredits: number; contentIds: string[] }> {
    this._status = 'running';
    try {
      const bus = getEventBus();
      let generated = 0;
      let failed = 0;
      let totalCredits = 0;
      const contentIds: string[] = [];

      for (const request of requests) {
        try {
          const result = await this.generateContent(request.productId, request);
          generated++;
          totalCredits += result.creditsCost;
          contentIds.push(result.contentId);
        } catch (err) {
          console.error(`[ContentCreation] Failed to generate ${request.contentType} for ${request.productId}:`, err);
          failed++;
        }
      }

      await bus.emit(
        ENGINE_EVENTS.CONTENT_BATCH_COMPLETE,
        { requestCount: requests.length, generated, failed, totalCredits },
        'content-engine',
      );

      return { generated, failed, totalCredits, contentIds };
    } finally {
      this._status = 'idle';
    }
  }

  // ─── Private Helpers ────────────────────────────────────

  private buildSystemPrompt(contentType: ContentType, platform: string): string {
    const prompts: Record<ContentType, string> = {
      description: `You are a conversion-focused product copywriter. Write compelling product descriptions for ${platform} that highlight benefits, use sensory language, and include a clear call-to-action. Keep it concise and scannable.`,
      social_post: `You are a viral social media content creator for ${platform}. Write engaging posts that stop the scroll, use trending formats, include relevant hashtags, and drive clicks. Match the platform's native content style.`,
      ad_copy: `You are a performance marketing copywriter. Write ad copy for ${platform} that follows the AIDA framework (Attention, Interest, Desire, Action). Include a hook, key benefits, social proof elements, and a strong CTA.`,
      video_script: `You are a video script writer for ${platform}. Write a script that hooks viewers in the first 3 seconds, demonstrates the product benefit, and ends with a clear CTA. Include visual directions and timing notes.`,
      email: `You are an email marketing specialist. Write a conversion-focused email with a compelling subject line, personalized opening, benefit-driven body, and clear CTA. Keep it scannable with short paragraphs.`,
      image: `You are a visual content strategist. Write a short, compelling caption and alt text for a product image on ${platform}. Keep it under 50 words.`,
      carousel: `You are a carousel content creator. Write captions for a 5-slide product carousel on ${platform}. Each slide needs a headline (under 10 words) and supporting text (under 25 words).`,
      short_video: `You are a short-form video strategist for ${platform}. Write a 30-second video narration script with scene descriptions, on-screen text, and timing notes. Hook in first 3 seconds.`,
    };
    return prompts[contentType] || prompts.description;
  }

  private buildUserPrompt(input: {
    productTitle: string;
    productDescription: string;
    contentType: ContentType;
    platform: string;
    trendingKeywords: string[];
    creatorContext: string;
    competitorContext: string;
  }): string {
    let prompt = `Create a ${input.contentType} for "${input.productTitle}" on ${input.platform}.\n\n`;
    prompt += `Product: ${input.productDescription}\n\n`;
    if (input.trendingKeywords.length > 0) {
      prompt += `Trending keywords to incorporate: ${input.trendingKeywords.join(', ')}\n`;
    }
    if (input.creatorContext) {
      prompt += `Creator context: ${input.creatorContext}\n`;
    }
    if (input.competitorContext) {
      prompt += `Competitive context: ${input.competitorContext}\n`;
    }
    return prompt;
  }
}

