/**
 * TikTok Discovery Worker
 * @engine tiktok-discovery
 * @queue tiktok-discovery
 *
 * Discovers trending TikTok videos for a given query/hashtag using
 * the Apify TikTok scraper.  Stores video-level data with engagement
 * signals and product link detection in the `tiktok_videos` table.
 *
 * This is the entry point for Phase 1 — TikTok Intelligence.
 * Downstream batches will add product extraction and engagement tracking.
 */
import { Job, Queue } from "bullmq";
import { connection } from "../lib/queue";
import { supabase } from "../lib/supabase";
import { QUEUES } from "./types";
import type { TikTokDiscoveryJobData, TikTokVideo } from "./types";

const extractQueue = new Queue(QUEUES.TIKTOK_PRODUCT_EXTRACT, { connection });

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR = "clockworks~tiktok-scraper";
const APIFY_TIMEOUT = 90_000; // 90s for larger result sets

export async function processTikTokDiscovery(
  job: Job<TikTokDiscoveryJobData>
) {
  const { query, limit = 30, userId } = job.data;

  console.log(`[tiktok-discovery] Starting discovery for "${query}" (limit ${limit})`);

  // ── Step 1: Fetch videos from Apify ──────────────────────
  const videos = await fetchTikTokVideos(query, limit);
  await job.updateProgress(50);

  if (videos.length === 0) {
    console.log("[tiktok-discovery] No videos returned from Apify");
    return { query, videosFound: 0, videosStored: 0 };
  }

  console.log(`[tiktok-discovery] Fetched ${videos.length} videos`);

  // ── Step 2: Upsert into tiktok_videos ────────────────────
  const stored = await upsertVideos(videos, query);
  await job.updateProgress(80);

  console.log(`[tiktok-discovery] Stored ${stored} videos for "${query}"`);

  // ── Step 3: Chain → product extraction ───────────────────
  const extractJob = await extractQueue.add("extract-from-discovery", {
    discoveryQuery: query,
    minViews: 10_000,
    userId,
  });
  await job.updateProgress(100);

  console.log(`[tiktok-discovery] Chained product extraction job ${extractJob.id}`);

  return {
    query,
    videosFound: videos.length,
    videosStored: stored,
    extractJobId: extractJob.id,
  };
}

// ── Apify fetcher ──────────────────────────────────────────

async function fetchTikTokVideos(
  query: string,
  limit: number
): Promise<TikTokVideo[]> {
  if (!APIFY_TOKEN) {
    console.warn("[tiktok-discovery] APIFY_API_TOKEN not set, skipping");
    return [];
  }

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchQueries: [query],
          resultsPerPage: Math.min(limit, 100),
          searchSection: "video", // videos, not shop listings
        }),
        signal: AbortSignal.timeout(APIFY_TIMEOUT),
      }
    );

    if (!res.ok) {
      console.error(
        `[tiktok-discovery] Apify error: ${res.status} ${res.statusText}`
      );
      return [];
    }

    const items: Record<string, unknown>[] = await res.json() as Record<string, unknown>[];
    if (!Array.isArray(items)) return [];

    return items.map(mapApifyItem);
  } catch (err) {
    console.error("[tiktok-discovery] Apify fetch failed:", err);
    return [];
  }
}

function mapApifyItem(item: Record<string, unknown>): TikTokVideo {
  const hashtags = extractHashtags(item);
  const productUrls = extractProductUrls(item);

  return {
    video_id: String(item.id || item.videoId || ""),
    url:
      (item.webVideoUrl as string) ||
      (item.url as string) ||
      "",
    description:
      (item.text as string) ||
      (item.desc as string) ||
      (item.description as string) ||
      "",
    author_username:
      ((item.authorMeta as Record<string, unknown>)?.name as string) ||
      (item.author as string) ||
      "",
    author_id:
      ((item.authorMeta as Record<string, unknown>)?.id as string) ||
      "",
    author_followers: Number(
      (item.authorMeta as Record<string, unknown>)?.fans ??
        (item.authorMeta as Record<string, unknown>)?.followers ??
        0
    ),
    views: Number(item.playCount ?? item.views ?? 0),
    likes: Number(item.diggCount ?? item.likes ?? 0),
    shares: Number(item.shareCount ?? item.shares ?? 0),
    comments: Number(item.commentCount ?? item.comments ?? 0),
    hashtags,
    music_title:
      ((item.musicMeta as Record<string, unknown>)?.musicName as string) ||
      (item.music as string) ||
      null,
    create_time: item.createTime
      ? new Date(Number(item.createTime) * 1000).toISOString()
      : new Date().toISOString(),
    thumbnail_url:
      (item.cover as string) ||
      (item.thumbnail as string) ||
      null,
    product_urls: productUrls,
    has_product_link: productUrls.length > 0,
  };
}

function extractHashtags(item: Record<string, unknown>): string[] {
  // Apify returns hashtags as array of objects or strings
  if (Array.isArray(item.hashtags)) {
    return (item.hashtags as unknown[]).map((h) =>
      typeof h === "string" ? h : String((h as Record<string, unknown>)?.name || h)
    );
  }

  // Fallback: extract from description text
  const text = (item.text as string) || (item.desc as string) || "";
  const matches = text.match(/#[\w\u00C0-\u024F]+/g);
  return matches ? matches.map((m) => m.slice(1)) : [];
}

function extractProductUrls(item: Record<string, unknown>): string[] {
  const urls: string[] = [];

  // Check for TikTok Shop product links
  if (item.productLink) urls.push(String(item.productLink));
  if (item.commerceInfo) {
    const commerce = item.commerceInfo as Record<string, unknown>;
    if (commerce.url) urls.push(String(commerce.url));
  }

  // Check for link-in-bio / sticker links
  if (Array.isArray(item.stickersOnItem)) {
    for (const sticker of item.stickersOnItem as Record<string, unknown>[]) {
      if (sticker.stickerType === "product" && sticker.url) {
        urls.push(String(sticker.url));
      }
    }
  }

  return urls;
}

// ── DB upsert ──────────────────────────────────────────────

async function upsertVideos(
  videos: TikTokVideo[],
  discoveryQuery: string
): Promise<number> {
  let stored = 0;

  // Batch upsert in groups of 25 to avoid payload limits
  for (let i = 0; i < videos.length; i += 25) {
    const batch = videos.slice(i, i + 25);

    const rows = batch
      .filter((v) => v.video_id) // skip items with no ID
      .map((v) => ({
        video_id: v.video_id,
        url: v.url,
        description: v.description,
        author_username: v.author_username,
        author_id: v.author_id,
        author_followers: v.author_followers,
        views: v.views,
        likes: v.likes,
        shares: v.shares,
        comments: v.comments,
        hashtags: v.hashtags,
        music_title: v.music_title,
        thumbnail_url: v.thumbnail_url,
        product_urls: v.product_urls,
        has_product_link: v.has_product_link,
        create_time: v.create_time,
        discovery_query: discoveryQuery,
      }));

    if (rows.length === 0) continue;

    const { error, count } = await supabase
      .from("tiktok_videos")
      .upsert(rows, { onConflict: "video_id", ignoreDuplicates: false })
      .select("id");

    if (error) {
      console.error("[tiktok-discovery] DB upsert error:", error.message);
    } else {
      stored += count ?? rows.length;
    }
  }

  return stored;
}
