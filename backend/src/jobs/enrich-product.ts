/**
 * Enrich Product Job
 * @engine discovery
 * @queue enrich-product
 *
 * Receives raw scraped products, calculates composite scores,
 * upserts into Supabase, and sends HOT product alerts.
 */
import { Job } from "bullmq";
import { supabase } from "../lib/supabase";
import { calculateCompositeScore, getStageFromScore } from "../lib/scoring";
import { sendProductAlert } from "../lib/email";
import type { EnrichProductJobData } from "./types";

export async function processEnrichProduct(job: Job<EnrichProductJobData>) {
  const { scanId, products } = job.data;

  const scored = products.map((p) => ({
    ...p,
    ...calculateCompositeScore(p),
  }));

  // Upsert all scored products
  const { error: upsertError } = await supabase
    .from("products")
    .upsert(
      scored.map((p) => ({
        external_id: p.external_id,
        title: p.title,
        price: p.price,
        url: p.url,
        image_url: p.image_url,
        sales_count: p.sales_count,
        review_count: p.review_count,
        rating: p.rating,
        source: p.source,
        final_score: p.final_score,
        trend_score: p.trend_score,
        viral_score: p.viral_score,
        profit_score: p.profit_score,
        score_overall: p.final_score,
        trend_stage: getStageFromScore(p.viral_score),
        scan_id: scanId,
      })),
      { onConflict: "source,external_id" }
    );

  if (upsertError) {
    console.error("Product upsert error:", upsertError);
  }

  await job.updateProgress(80);

  // Send alerts for HOT products (score >= 80)
  let alertsSent = 0;
  for (const p of scored) {
    if (p.final_score >= 80) {
      await sendProductAlert({
        title: p.title,
        price: p.price,
        viral_score: p.viral_score,
        source: p.source,
        url: p.url,
      });
      alertsSent++;
    }
  }

  await job.updateProgress(100);

  return {
    scanId,
    enriched: scored.length,
    hotProducts: alertsSent,
  };
}
