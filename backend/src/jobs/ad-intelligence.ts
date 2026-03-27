/**
 * Ad Intelligence Worker
 * @engine ad-intelligence
 * @queue ad-intelligence
 *
 * Discovers scaling ad campaigns on TikTok and Facebook/Meta.
 * Stores ad creative data and identifies products being heavily promoted.
 *
 * v7 spec: TikTok ads discovery, Facebook ads library.
 *
 * Phase 5 — Ad Intelligence.
 */
import { Job } from "bullmq";
import { supabase } from "../lib/supabase";
import type { AdIntelligenceJobData } from "./types";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

export async function processAdIntelligence(
  job: Job<AdIntelligenceJobData>
) {
  const {
    query,
    platforms = ["tiktok", "facebook"],
    limit = 20,
  } = job.data;

  console.log(
    `[ad-intelligence] Starting scan for "${query}" on ${platforms.join(", ")} (limit ${limit})`
  );

  const allAds: AdRecord[] = [];

  // ── Step 1: Scrape ads per platform ──────────────────────
  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i];
    const ads = await scrapeAds(platform, query, limit);
    allAds.push(...ads);
    await job.updateProgress(Math.round(((i + 1) / platforms.length) * 60));
  }

  if (allAds.length === 0) {
    console.log("[ad-intelligence] No ads discovered");
    return { query, adsFound: 0 };
  }

  // ── Step 2: Store ads in database ────────────────────────
  const { error } = await supabase.from("ads").upsert(
    allAds.map((ad) => ({
      external_id: ad.external_id,
      platform: ad.platform,
      advertiser_name: ad.advertiser_name,
      ad_text: ad.ad_text,
      landing_url: ad.landing_url,
      thumbnail_url: ad.thumbnail_url,
      impressions: ad.impressions,
      spend_estimate: ad.spend_estimate,
      days_running: ad.days_running,
      is_scaling: ad.is_scaling,
      discovery_query: query,
      discovered_at: new Date().toISOString(),
    })),
    { onConflict: "external_id,platform", ignoreDuplicates: false }
  );

  if (error) {
    console.error("[ad-intelligence] DB upsert error:", error.message);
  }

  await job.updateProgress(100);

  const scalingAds = allAds.filter((a) => a.is_scaling).length;
  console.log(
    `[ad-intelligence] Found ${allAds.length} ads (${scalingAds} scaling) for "${query}"`
  );

  return {
    query,
    adsFound: allAds.length,
    scalingAds,
    platforms,
  };
}

// ── Types ──────────────────────────────────────────────────

interface AdRecord {
  external_id: string;
  platform: string;
  advertiser_name: string;
  ad_text: string;
  landing_url: string;
  thumbnail_url: string;
  impressions: number;
  spend_estimate: number;
  days_running: number;
  is_scaling: boolean;
}

// ── Scraper ────────────────────────────────────────────────

async function scrapeAds(
  platform: string,
  query: string,
  limit: number
): Promise<AdRecord[]> {
  if (!APIFY_TOKEN) {
    console.warn(`[ad-intelligence] APIFY_API_TOKEN not set, skipping ${platform}`);
    return [];
  }

  // Use Facebook Ad Library API (free, no Apify needed for Facebook)
  if (platform === "facebook") {
    return scrapeFacebookAds(query, limit);
  }

  // TikTok ads via Apify
  return scrapeTikTokAds(query, limit);
}

async function scrapeTikTokAds(query: string, limit: number): Promise<AdRecord[]> {
  try {
    // TikTok Creative Center-inspired scraper
    const res = await fetch(
      `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchQueries: [query],
          resultsPerPage: Math.min(limit, 50),
          searchSection: "video",
        }),
        signal: AbortSignal.timeout(90_000),
      }
    );

    if (!res.ok) return [];

    const items: Record<string, unknown>[] = await res.json() as Record<string, unknown>[];
    if (!Array.isArray(items)) return [];

    // Filter for likely ads (sponsored content indicators)
    return items
      .filter((item) => {
        const text = String(item.text || item.desc || "").toLowerCase();
        return (
          text.includes("link in bio") ||
          text.includes("shop now") ||
          text.includes("use code") ||
          text.includes("discount") ||
          text.includes("available at") ||
          item.isAd === true ||
          item.commerceInfo != null
        );
      })
      .slice(0, limit)
      .map((item, i) => ({
        external_id: String(item.id || `tiktok-ad-${i}`),
        platform: "tiktok",
        advertiser_name: String(
          (item.authorMeta as Record<string, unknown>)?.name || item.author || ""
        ),
        ad_text: String(item.text || item.desc || ""),
        landing_url: String(
          item.webVideoUrl || item.url || ""
        ),
        thumbnail_url: String(item.cover || item.thumbnail || ""),
        impressions: Number(item.playCount || item.views || 0),
        spend_estimate: estimateSpend(Number(item.playCount || 0)),
        days_running: 1,
        is_scaling: Number(item.playCount || 0) > 100_000,
      }));
  } catch (err) {
    console.error("[ad-intelligence] TikTok ads scrape failed:", err);
    return [];
  }
}

async function scrapeFacebookAds(query: string, limit: number): Promise<AdRecord[]> {
  // Facebook Ad Library is free and public
  // Using Meta's Ad Library API endpoint
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn("[ad-intelligence] META_ACCESS_TOKEN not set, skipping Facebook");
    return [];
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/ads_archive?search_terms=${encodeURIComponent(query)}&ad_type=ALL&ad_reached_countries=US&fields=ad_creative_bodies,page_name,ad_delivery_start_time,impressions&limit=${limit}&access_token=${accessToken}`,
      { signal: AbortSignal.timeout(30_000) }
    );

    if (!res.ok) return [];
    const data: any = await res.json();
    const ads = data.data || [];

    return ads.map((ad: Record<string, unknown>, i: number) => {
      const startDate = ad.ad_delivery_start_time
        ? new Date(ad.ad_delivery_start_time as string)
        : new Date();
      const daysRunning = Math.max(
        1,
        Math.round((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      );

      return {
        external_id: String(ad.id || `fb-ad-${i}`),
        platform: "facebook",
        advertiser_name: String(ad.page_name || ""),
        ad_text: String(
          Array.isArray(ad.ad_creative_bodies)
            ? (ad.ad_creative_bodies as string[])[0]
            : ""
        ),
        landing_url: "",
        thumbnail_url: "",
        impressions: Number(
          (ad.impressions as Record<string, unknown>)?.upper_bound || 0
        ),
        spend_estimate: estimateSpend(
          Number((ad.impressions as Record<string, unknown>)?.upper_bound || 0)
        ),
        days_running: daysRunning,
        is_scaling: daysRunning >= 7,
      };
    });
  } catch (err) {
    console.error("[ad-intelligence] Facebook ads scrape failed:", err);
    return [];
  }
}

function estimateSpend(impressions: number): number {
  // Rough CPM estimate: $5-$15 per 1000 impressions
  const cpm = 8;
  return Math.round((impressions / 1000) * cpm * 100) / 100;
}
