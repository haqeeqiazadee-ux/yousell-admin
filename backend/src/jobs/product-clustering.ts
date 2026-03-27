/**
 * Product Clustering Worker
 * @engine clustering
 * @queue product-clustering
 *
 * Groups products into clusters based on keyword overlap in titles.
 * v7 spec Section 28: category similarity, keyword overlap.
 *
 * Phase 2 Batch 01 — Product Intelligence.
 */
import { Job } from "bullmq";
import { supabase } from "../lib/supabase";
import type { ProductClusteringJobData } from "./types";

export async function processProductClustering(
  job: Job<ProductClusteringJobData>
) {
  const { minScore = 30, similarityThreshold = 0.3 } = job.data;

  console.log(`[product-clustering] Starting (minScore=${minScore}, threshold=${similarityThreshold})`);

  // ── Step 1: Fetch all scored products ────────────────────
  const { data: products, error } = await supabase
    .from("products")
    .select("id, title, source, price, sales_count, score_overall, final_score")
    .gte("score_overall", minScore)
    .order("score_overall", { ascending: false })
    .limit(500);

  if (error || !products || products.length === 0) {
    console.log("[product-clustering] No products to cluster");
    return { clustersCreated: 0 };
  }

  await job.updateProgress(20);

  // ── Step 2: Extract keywords per product ─────────────────
  const productKeywords = products.map((p) => ({
    ...p,
    keywords: extractKeywords(p.title as string),
  }));

  // ── Step 3: Build clusters via keyword overlap ───────────
  const clusters = buildClusters(productKeywords, similarityThreshold);
  await job.updateProgress(60);

  // ── Step 4: Store clusters ───────────────────────────────
  let stored = 0;
  for (const cluster of clusters) {
    const platforms = [...new Set(cluster.members.map((m) => m.source as string))];
    const scores = cluster.members.map((m) => Number(m.score_overall || m.final_score || 0));
    const prices = cluster.members.map((m) => Number(m.price || 0)).filter((p) => p > 0);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Determine trend stage from avg score
    let trendStage = "emerging";
    if (avgScore >= 80) trendStage = "exploding";
    else if (avgScore >= 60) trendStage = "rising";
    else if (avgScore >= 40) trendStage = "emerging";

    const { data: clusterRow, error: clusterErr } = await supabase
      .from("product_clusters")
      .upsert({
        name: cluster.name,
        keywords: cluster.keywords,
        product_count: cluster.members.length,
        avg_score: Math.round(avgScore * 100) / 100,
        platforms,
        trend_stage: trendStage,
        total_sales: cluster.members.reduce((sum, m) => sum + Number(m.sales_count || 0), 0),
        price_range_min: prices.length > 0 ? Math.min(...prices) : 0,
        price_range_max: prices.length > 0 ? Math.max(...prices) : 0,
      }, { onConflict: "name" })
      .select("id")
      .single();

    if (clusterErr || !clusterRow) {
      console.error("[product-clustering] Cluster upsert error:", clusterErr?.message);
      continue;
    }

    // Insert members
    const memberRows = cluster.members.map((m) => ({
      cluster_id: clusterRow.id,
      product_id: m.id as string,
      similarity: m.similarity ?? 0,
    }));

    await supabase
      .from("product_cluster_members")
      .upsert(memberRows, { onConflict: "cluster_id,product_id" });

    stored++;
  }

  await job.updateProgress(100);
  console.log(`[product-clustering] Created ${stored} clusters from ${products.length} products`);

  return { clustersCreated: stored, productsProcessed: products.length };
}

// ── Helpers ────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "it", "this", "that", "new", "best",
  "top", "buy", "shop", "free", "sale", "hot", "set", "pack", "pcs",
  "pc", "lot", "mini", "pro", "max", "plus", "ultra",
]);

function extractKeywords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function keywordSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a);
  let overlap = 0;
  for (const word of b) {
    if (setA.has(word)) overlap++;
  }
  return overlap / Math.max(a.length, b.length);
}

interface ProductWithKeywords {
  id: unknown;
  title: unknown;
  source: unknown;
  price: unknown;
  sales_count: unknown;
  score_overall: unknown;
  final_score: unknown;
  keywords: string[];
  similarity?: number;
}

interface Cluster {
  name: string;
  keywords: string[];
  members: ProductWithKeywords[];
}

function buildClusters(
  products: ProductWithKeywords[],
  threshold: number
): Cluster[] {
  const assigned = new Set<number>();
  const clusters: Cluster[] = [];

  for (let i = 0; i < products.length; i++) {
    if (assigned.has(i)) continue;

    const leader = products[i];
    const members: ProductWithKeywords[] = [{ ...leader, similarity: 1 }];
    assigned.add(i);

    for (let j = i + 1; j < products.length; j++) {
      if (assigned.has(j)) continue;

      const sim = keywordSimilarity(leader.keywords, products[j].keywords);
      if (sim >= threshold) {
        members.push({ ...products[j], similarity: sim });
        assigned.add(j);
      }
    }

    if (members.length >= 2) {
      // Cluster name = top 3 most common keywords
      const wordFreq = new Map<string, number>();
      for (const m of members) {
        for (const kw of m.keywords) {
          wordFreq.set(kw, (wordFreq.get(kw) || 0) + 1);
        }
      }
      const topKeywords = [...wordFreq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([k]) => k);

      clusters.push({
        name: topKeywords.join(" + "),
        keywords: topKeywords,
        members,
      });
    }
  }

  return clusters;
}
