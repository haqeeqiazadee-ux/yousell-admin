/**
 * Trend Scan Job
 *
 * Fetches trend keywords from configured providers and stores them
 * in the trend_keywords table.
 */
import { Job } from "bullmq";
import { supabase } from "../lib/supabase";
import { fetchTrends } from "../lib/providers";
import type { TrendScanJobData } from "./types";

export async function processTrendScan(job: Job<TrendScanJobData>) {
  const { query, scanId } = job.data;

  const trends = await fetchTrends(query);

  if (trends.length === 0) {
    return { stored: 0 };
  }

  const { error } = await supabase.from("trend_keywords").insert(
    trends.map((t) => ({
      keyword: t.keyword,
      volume: t.volume,
      growth: t.growth,
      source: "tiktok",
      scan_id: scanId || null,
      fetched_at: new Date().toISOString(),
    }))
  );

  if (error) {
    console.error("Trend insert error:", error);
  }

  await job.updateProgress(100);

  return { stored: trends.length };
}
