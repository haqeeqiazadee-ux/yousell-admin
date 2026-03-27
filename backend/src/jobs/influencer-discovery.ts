/**
 * Influencer Discovery Job
 * @engine influencer-discovery
 * @queue influencer-discovery
 *
 * Discovers influencers for a given product niche using configured providers
 * (Ainfluencer, Modash, Apify) and stores results in Supabase.
 */
import { Job } from "bullmq";
import { supabase } from "../lib/supabase";
import type { InfluencerDiscoveryJobData } from "./types";

interface InfluencerRecord {
  username: string;
  platform: string;
  followers: number;
  engagement_rate: number;
  niche: string;
  email: string | null;
  profile_url: string;
  scan_id: string | null;
  discovered_at: string;
}

export async function processInfluencerDiscovery(
  job: Job<InfluencerDiscoveryJobData>
) {
  const { niche, scanId } = job.data;

  // Dynamic import to avoid circular deps with frontend provider modules
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    console.warn("APIFY_API_TOKEN not set — skipping influencer discovery");
    return { discovered: 0 };
  }

  await job.updateProgress(10);

  let influencers: InfluencerRecord[] = [];

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          search: niche,
          resultsLimit: 15,
        }),
        signal: AbortSignal.timeout(60_000),
      }
    );

    if (!res.ok) {
      console.error(`Apify Influencer error: ${res.status}`);
      return { discovered: 0 };
    }

    const items = await res.json();
    if (!Array.isArray(items)) return { discovered: 0 };

    await job.updateProgress(60);

    influencers = items.slice(0, 15).map(
      (item: Record<string, unknown>): InfluencerRecord => ({
        username:
          (item.username as string) || (item.name as string) || "unknown",
        platform: "instagram",
        followers: parseInt(
          String(item.followersCount || item.followers || 0),
          10
        ),
        engagement_rate:
          parseFloat(String(item.engagementRate || 0)) || 0,
        niche,
        email:
          (item.email as string) ||
          (item.businessEmail as string) ||
          null,
        profile_url:
          (item.url as string) ||
          `https://instagram.com/${item.username || ""}`,
        scan_id: scanId || null,
        discovered_at: new Date().toISOString(),
      })
    );
  } catch (err) {
    console.error("Influencer discovery failed:", err);
    return { discovered: 0 };
  }

  if (influencers.length > 0) {
    const { error } = await supabase
      .from("influencers")
      .upsert(influencers, { onConflict: "platform,username" });

    if (error) {
      console.error("Influencer upsert error:", error);
    }
  }

  await job.updateProgress(100);

  return { discovered: influencers.length };
}
