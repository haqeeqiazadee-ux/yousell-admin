/**
 * TikTok Product Extraction Worker
 *
 * Reads discovered TikTok videos from `tiktok_videos`, extracts product
 * candidates based on product links and high-engagement signals, then
 * forwards them to the `enrich-product` queue for scoring and DB upsert.
 *
 * Phase 1 Batch 02 — TikTok Intelligence.
 */
import { Job, Queue } from "bullmq";
import { connection } from "../lib/queue";
import { supabase } from "../lib/supabase";
import { QUEUES } from "./types";
import type { TikTokProductExtractJobData, RawProduct } from "./types";

const enrichQueue = new Queue(QUEUES.ENRICH_PRODUCT, { connection });

export async function processTikTokProductExtract(
  job: Job<TikTokProductExtractJobData>
) {
  const { discoveryQuery, minViews = 10_000, userId } = job.data;

  console.log(
    `[tiktok-product-extract] Extracting products (query=${discoveryQuery || "all"}, minViews=${minViews})`
  );

  // ── Step 1: Fetch qualifying videos ──────────────────────
  const videos = await fetchQualifyingVideos(discoveryQuery, minViews);
  await job.updateProgress(30);

  if (videos.length === 0) {
    console.log("[tiktok-product-extract] No qualifying videos found");
    return { candidatesGenerated: 0, enrichJobId: null };
  }

  console.log(
    `[tiktok-product-extract] Found ${videos.length} qualifying videos`
  );

  // ── Step 2: Convert videos → product candidates ──────────
  const candidates = videosToProductCandidates(videos);
  await job.updateProgress(60);

  if (candidates.length === 0) {
    console.log("[tiktok-product-extract] No product candidates extracted");
    return { candidatesGenerated: 0, enrichJobId: null };
  }

  // ── Step 3: Forward to enrich-product queue ──────────────
  const enrichJob = await enrichQueue.add("enrich-tiktok-products", {
    scanId: `tiktok-extract-${Date.now()}`,
    products: candidates,
  });
  await job.updateProgress(90);

  // ── Step 4: Mark videos as processed ─────────────────────
  const videoIds = videos.map((v) => v.id);
  await markVideosProcessed(videoIds);
  await job.updateProgress(100);

  console.log(
    `[tiktok-product-extract] Generated ${candidates.length} candidates → enrich job ${enrichJob.id}`
  );

  return {
    candidatesGenerated: candidates.length,
    enrichJobId: enrichJob.id,
    videosProcessed: videos.length,
  };
}

// ── DB query ───────────────────────────────────────────────

interface VideoRow {
  id: string;
  video_id: string;
  url: string;
  description: string;
  author_username: string;
  author_followers: number;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  hashtags: string[];
  product_urls: string[];
  has_product_link: boolean;
  thumbnail_url: string | null;
  create_time: string;
}

async function fetchQualifyingVideos(
  discoveryQuery: string | undefined,
  minViews: number
): Promise<VideoRow[]> {
  let query = supabase
    .from("tiktok_videos")
    .select(
      "id, video_id, url, description, author_username, author_followers, views, likes, shares, comments, hashtags, product_urls, has_product_link, thumbnail_url, create_time"
    )
    .or(`has_product_link.eq.true,views.gte.${minViews}`)
    .order("views", { ascending: false })
    .limit(100);

  if (discoveryQuery) {
    query = query.eq("discovery_query", discoveryQuery);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[tiktok-product-extract] DB query error:", error.message);
    return [];
  }

  return (data || []) as VideoRow[];
}

// ── Video → Product conversion ─────────────────────────────

function videosToProductCandidates(videos: VideoRow[]): RawProduct[] {
  const seen = new Set<string>();
  const candidates: RawProduct[] = [];

  for (const video of videos) {
    // Generate a stable external_id from the TikTok video_id
    const externalId = `tiktok-video-${video.video_id}`;

    if (seen.has(externalId)) continue;
    seen.add(externalId);

    // Derive a product title from description (first line or first 80 chars)
    const title = deriveProductTitle(video.description, video.hashtags);
    if (!title) continue;

    // Estimate "sales" from engagement signals
    // High engagement = proxy for product interest
    const engagementScore = estimateEngagement(video);

    candidates.push({
      external_id: externalId,
      title,
      price: 0, // Unknown until marketplace cross-reference
      url: video.has_product_link && video.product_urls.length > 0
        ? video.product_urls[0]
        : video.url,
      image_url: video.thumbnail_url || "",
      sales_count: engagementScore,
      review_count: video.comments,
      rating: calculateEngagementRating(video),
      source: "tiktok",
    });
  }

  return candidates;
}

/**
 * Extract a meaningful product title from video description.
 * Strips hashtags from the end, takes the first meaningful line.
 */
function deriveProductTitle(description: string, hashtags: string[]): string {
  if (!description) return "";

  // Remove hashtags from the end
  let cleaned = description
    .replace(/#[\w\u00C0-\u024F]+/g, "")
    .trim();

  // Take first line only
  const firstLine = cleaned.split("\n")[0]?.trim() || "";

  // If too short after cleaning, use hashtags as fallback
  if (firstLine.length < 5 && hashtags.length > 0) {
    return hashtags.slice(0, 3).join(" ");
  }

  // Cap at 120 chars
  return firstLine.slice(0, 120) || "";
}

/**
 * Convert engagement metrics into a sales-proxy score (0–10000).
 * Used as sales_count for the scoring engine.
 */
function estimateEngagement(video: VideoRow): number {
  // Weighted engagement: likes(1) + shares(3) + comments(2)
  const weighted = video.likes + video.shares * 3 + video.comments * 2;

  // Normalize to 0–10000 scale (1M+ weighted engagement = 10000)
  return Math.min(10_000, Math.round(weighted / 100));
}

/**
 * Convert engagement rate into a rating proxy (0–5).
 * Used for the scoring engine's rating input.
 */
function calculateEngagementRating(video: VideoRow): number {
  if (video.views === 0) return 0;

  // Engagement rate = (likes + comments + shares) / views
  const rate = (video.likes + video.comments + video.shares) / video.views;

  // Map: 10%+ → 5.0, 5% → 4.0, 2% → 3.0, 1% → 2.0, <1% → 1.0
  if (rate >= 0.10) return 5.0;
  if (rate >= 0.05) return 4.5;
  if (rate >= 0.03) return 4.0;
  if (rate >= 0.02) return 3.5;
  if (rate >= 0.01) return 3.0;
  if (rate >= 0.005) return 2.0;
  return 1.0;
}

// ── Mark processed ─────────────────────────────────────────

async function markVideosProcessed(videoIds: string[]) {
  // Update metadata to track extraction timestamp
  const { error } = await supabase
    .from("tiktok_videos")
    .update({ updated_at: new Date().toISOString() })
    .in("id", videoIds);

  if (error) {
    console.error("[tiktok-product-extract] Mark processed error:", error.message);
  }
}
