/**
 * TikTok Engagement Analysis Worker
 *
 * Aggregates engagement signals from `tiktok_videos` per hashtag,
 * computes velocity metrics (growth rate, view velocity, creator
 * adoption), and stores time-series snapshots in `tiktok_hashtag_signals`.
 *
 * This powers the v7 spec requirement: "hashtag growth velocity,
 * video creation rate, comment sentiment, creator count".
 *
 * Phase 1 Batch 03 — TikTok Intelligence.
 */
import { Job } from "bullmq";
import { supabase } from "../lib/supabase";
import type { TikTokEngagementAnalysisJobData } from "./types";

export async function processTikTokEngagementAnalysis(
  job: Job<TikTokEngagementAnalysisJobData>
) {
  const { hashtag, minVideoCount = 3 } = job.data;

  console.log(
    `[tiktok-engagement] Starting analysis (hashtag=${hashtag || "all"}, min=${minVideoCount})`
  );

  // ── Step 1: Aggregate hashtag metrics from tiktok_videos ─
  const aggregates = await aggregateHashtagMetrics(hashtag, minVideoCount);
  await job.updateProgress(40);

  if (aggregates.length === 0) {
    console.log("[tiktok-engagement] No hashtags qualify for analysis");
    return { hashtagsAnalyzed: 0, snapshotsStored: 0 };
  }

  console.log(`[tiktok-engagement] Aggregated ${aggregates.length} hashtags`);

  // ── Step 2: Fetch previous snapshots for velocity calc ───
  const hashtagNames = aggregates.map((a) => a.hashtag);
  const previousSnapshots = await fetchPreviousSnapshots(hashtagNames);
  await job.updateProgress(60);

  // ── Step 3: Compute velocity + store snapshots ───────────
  const snapshots = aggregates.map((agg) => {
    const prev = previousSnapshots.get(agg.hashtag);
    return computeSnapshot(agg, prev);
  });

  const stored = await storeSnapshots(snapshots);
  await job.updateProgress(100);

  console.log(
    `[tiktok-engagement] Stored ${stored} hashtag signal snapshots`
  );

  return {
    hashtagsAnalyzed: aggregates.length,
    snapshotsStored: stored,
    topByVelocity: snapshots
      .sort((a, b) => b.view_velocity - a.view_velocity)
      .slice(0, 5)
      .map((s) => ({ hashtag: s.hashtag, velocity: s.view_velocity })),
  };
}

// ── Types ──────────────────────────────────────────────────

interface HashtagAggregate {
  hashtag: string;
  total_videos: number;
  total_views: number;
  total_likes: number;
  total_shares: number;
  total_comments: number;
  unique_creators: number;
  product_video_count: number;
  earliest_video: string;
  latest_video: string;
}

interface PreviousSnapshot {
  total_videos: number;
  total_views: number;
  unique_creators: number;
  snapshot_at: string;
}

interface SignalSnapshot {
  hashtag: string;
  total_videos: number;
  total_views: number;
  total_likes: number;
  total_shares: number;
  total_comments: number;
  unique_creators: number;
  video_growth_rate: number;
  view_velocity: number;
  creator_growth_rate: number;
  engagement_rate: number;
  product_video_pct: number;
  snapshot_at: string;
}

// ── Step 1: Aggregate from tiktok_videos ───────────────────

async function aggregateHashtagMetrics(
  specificHashtag: string | undefined,
  minVideoCount: number
): Promise<HashtagAggregate[]> {
  // Query all videos to aggregate by hashtag.
  // Supabase doesn't support GROUP BY on array elements directly,
  // so we fetch videos and aggregate in-memory.
  let query = supabase
    .from("tiktok_videos")
    .select(
      "hashtags, views, likes, shares, comments, author_username, has_product_link, create_time"
    )
    .order("views", { ascending: false })
    .limit(2000);

  const { data: videos, error } = await query;
  if (error || !videos) {
    console.error("[tiktok-engagement] DB query error:", error?.message);
    return [];
  }

  // Build per-hashtag aggregates
  const map = new Map<string, {
    videos: number;
    views: number;
    likes: number;
    shares: number;
    comments: number;
    creators: Set<string>;
    productVideos: number;
    earliest: string;
    latest: string;
  }>();

  for (const video of videos as Record<string, unknown>[]) {
    const hashtags = (video.hashtags as string[]) || [];
    for (const tag of hashtags) {
      const normalized = tag.toLowerCase().trim();
      if (!normalized) continue;
      if (specificHashtag && normalized !== specificHashtag.toLowerCase()) continue;

      let entry = map.get(normalized);
      if (!entry) {
        entry = {
          videos: 0, views: 0, likes: 0, shares: 0, comments: 0,
          creators: new Set(), productVideos: 0,
          earliest: (video.create_time as string) || "",
          latest: (video.create_time as string) || "",
        };
        map.set(normalized, entry);
      }

      entry.videos++;
      entry.views += Number(video.views || 0);
      entry.likes += Number(video.likes || 0);
      entry.shares += Number(video.shares || 0);
      entry.comments += Number(video.comments || 0);
      if (video.author_username) entry.creators.add(video.author_username as string);
      if (video.has_product_link) entry.productVideos++;

      const ct = (video.create_time as string) || "";
      if (ct && ct < entry.earliest) entry.earliest = ct;
      if (ct && ct > entry.latest) entry.latest = ct;
    }
  }

  // Filter by minimum video count and convert to array
  const results: HashtagAggregate[] = [];
  for (const [hashtag, data] of map) {
    if (data.videos < minVideoCount) continue;
    results.push({
      hashtag,
      total_videos: data.videos,
      total_views: data.views,
      total_likes: data.likes,
      total_shares: data.shares,
      total_comments: data.comments,
      unique_creators: data.creators.size,
      product_video_count: data.productVideos,
      earliest_video: data.earliest,
      latest_video: data.latest,
    });
  }

  return results.sort((a, b) => b.total_views - a.total_views);
}

// ── Step 2: Previous snapshots ─────────────────────────────

async function fetchPreviousSnapshots(
  hashtags: string[]
): Promise<Map<string, PreviousSnapshot>> {
  const map = new Map<string, PreviousSnapshot>();
  if (hashtags.length === 0) return map;

  // Get the most recent snapshot for each hashtag
  const { data, error } = await supabase
    .from("tiktok_hashtag_signals")
    .select("hashtag, total_videos, total_views, unique_creators, snapshot_at")
    .in("hashtag", hashtags)
    .order("snapshot_at", { ascending: false })
    .limit(hashtags.length);

  if (error || !data) return map;

  // Keep only the latest per hashtag
  for (const row of data as Record<string, unknown>[]) {
    const h = row.hashtag as string;
    if (!map.has(h)) {
      map.set(h, {
        total_videos: Number(row.total_videos || 0),
        total_views: Number(row.total_views || 0),
        unique_creators: Number(row.unique_creators || 0),
        snapshot_at: row.snapshot_at as string,
      });
    }
  }

  return map;
}

// ── Step 3: Compute velocity metrics ───────────────────────

function computeSnapshot(
  agg: HashtagAggregate,
  prev: PreviousSnapshot | undefined
): SignalSnapshot {
  const now = new Date().toISOString();

  // Video growth rate: % change in video count
  let videoGrowthRate = 0;
  if (prev && prev.total_videos > 0) {
    videoGrowthRate = ((agg.total_videos - prev.total_videos) / prev.total_videos) * 100;
  }

  // View velocity: average views per video per hour
  let viewVelocity = 0;
  if (agg.total_videos > 0 && agg.earliest_video && agg.latest_video) {
    const earliest = new Date(agg.earliest_video).getTime();
    const latest = new Date(agg.latest_video).getTime();
    const hoursSpan = Math.max(1, (latest - earliest) / (1000 * 60 * 60));
    viewVelocity = agg.total_views / agg.total_videos / hoursSpan;
  }

  // Creator growth rate
  let creatorGrowthRate = 0;
  if (prev && prev.unique_creators > 0) {
    creatorGrowthRate =
      ((agg.unique_creators - prev.unique_creators) / prev.unique_creators) * 100;
  }

  // Overall engagement rate
  const engagementRate =
    agg.total_views > 0
      ? (agg.total_likes + agg.total_comments + agg.total_shares) / agg.total_views
      : 0;

  // Product video percentage
  const productVideoPct =
    agg.total_videos > 0
      ? (agg.product_video_count / agg.total_videos) * 100
      : 0;

  return {
    hashtag: agg.hashtag,
    total_videos: agg.total_videos,
    total_views: agg.total_views,
    total_likes: agg.total_likes,
    total_shares: agg.total_shares,
    total_comments: agg.total_comments,
    unique_creators: agg.unique_creators,
    video_growth_rate: round4(videoGrowthRate),
    view_velocity: round2(viewVelocity),
    creator_growth_rate: round4(creatorGrowthRate),
    engagement_rate: round4(engagementRate),
    product_video_pct: round2(productVideoPct),
    snapshot_at: now,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

// ── Step 4: Store snapshots ────────────────────────────────

async function storeSnapshots(snapshots: SignalSnapshot[]): Promise<number> {
  if (snapshots.length === 0) return 0;

  const { error, count } = await supabase
    .from("tiktok_hashtag_signals")
    .upsert(snapshots, {
      onConflict: "hashtag,snapshot_at",
      ignoreDuplicates: false,
    })
    .select("id");

  if (error) {
    console.error("[tiktok-engagement] Store error:", error.message);
    return 0;
  }

  return count ?? snapshots.length;
}
