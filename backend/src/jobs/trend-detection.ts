/**
 * Trend Detection Worker
 *
 * Analyzes product clusters and individual products to detect
 * emerging trends. Updates trend_stage and triggers alerts for
 * pre-viral opportunities (score >= 70).
 *
 * v7 spec Section 29: "What products are starting to explode
 * in attention and have not yet reached mainstream adoption?"
 *
 * Phase 2 Batch 02 — Product Intelligence.
 */
import { Job } from "bullmq";
import { supabase } from "../lib/supabase";
import { sendProductAlert } from "../lib/email";
import { getTierFromScore, getStageFromScore } from "../lib/scoring";
import type { TrendDetectionJobData } from "./types";

export async function processTrendDetection(
  job: Job<TrendDetectionJobData>
) {
  const { platform, minClusterSize = 3 } = job.data;

  console.log(`[trend-detection] Starting (platform=${platform || "all"}, minCluster=${minClusterSize})`);

  // ── Step 1: Analyze product clusters ─────────────────────
  const { data: clusters, error: clusterErr } = await supabase
    .from("product_clusters")
    .select("id, name, keywords, product_count, avg_score, platforms, trend_stage")
    .gte("product_count", minClusterSize)
    .order("avg_score", { ascending: false })
    .limit(100);

  await job.updateProgress(20);

  let trendingClusters = 0;
  if (clusters && clusters.length > 0) {
    for (const cluster of clusters) {
      const score = Number(cluster.avg_score || 0);
      const newStage = getStageFromScore(score);
      const oldStage = cluster.trend_stage as string;

      // Update stage if changed
      if (newStage !== oldStage) {
        await supabase
          .from("product_clusters")
          .update({ trend_stage: newStage })
          .eq("id", cluster.id);
      }

      if (score >= 60) trendingClusters++;
    }
  }

  await job.updateProgress(40);

  // ── Step 2: Detect pre-viral individual products ─────────
  let productQuery = supabase
    .from("products")
    .select("id, title, source, price, url, score_overall, final_score, trend_stage")
    .gte("score_overall", 60)
    .order("score_overall", { ascending: false })
    .limit(200);

  if (platform) {
    productQuery = productQuery.eq("source", platform);
  }

  const { data: products, error: productErr } = await productQuery;
  await job.updateProgress(60);

  let preViral = 0;
  let stageUpdates = 0;
  let alertsSent = 0;

  if (products && products.length > 0) {
    for (const product of products) {
      const score = Number(product.score_overall || product.final_score || 0);
      const newStage = getStageFromScore(score);
      const oldStage = product.trend_stage as string;

      // Update trend stage
      if (newStage !== oldStage) {
        await supabase
          .from("products")
          .update({ trend_stage: newStage })
          .eq("id", product.id);
        stageUpdates++;
      }

      // Pre-viral detection (v7 spec: score >= 70)
      if (score >= 70) {
        preViral++;

        // Alert for 85+ products (v7 spec: immediate push + email)
        if (score >= 85) {
          await sendProductAlert({
            title: product.title as string,
            price: Number(product.price || 0),
            viral_score: score,
            source: product.source as string,
            url: (product.url as string) || "",
          });
          alertsSent++;
        }
      }
    }
  }

  await job.updateProgress(80);

  // ── Step 3: Store trend snapshot in trend_keywords ────────
  // Record the current trend state
  const trendSnapshot = {
    keyword: `trend-detection-${new Date().toISOString().slice(0, 10)}`,
    volume: products?.length || 0,
    growth: preViral,
    source: "trend-detection",
    fetched_at: new Date().toISOString(),
  };

  await supabase.from("trend_keywords").upsert(trendSnapshot, {
    onConflict: "keyword,source",
    ignoreDuplicates: false,
  });

  await job.updateProgress(100);

  console.log(
    `[trend-detection] Done: ${trendingClusters} trending clusters, ${preViral} pre-viral products, ${alertsSent} alerts sent`
  );

  return {
    trendingClusters,
    productsAnalyzed: products?.length || 0,
    preViralProducts: preViral,
    stageUpdates,
    alertsSent,
  };
}
