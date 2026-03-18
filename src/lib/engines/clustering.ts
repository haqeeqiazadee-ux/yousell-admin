/**
 * Product Clustering Engine — Groups similar products by keyword/tag overlap
 * and calculates cluster-level metrics. Runs directly in Next.js.
 *
 * Engine wrapper added in Phase B — provides lifecycle management and
 * event bus integration. Original runProductClustering() export preserved.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { getEventBus } from './event-bus';
import type { Engine, EngineConfig, EngineEvent, EngineStatus, ClusterUpdatedPayload } from './types';
import { ENGINE_EVENTS } from './types';

interface ClusterCandidate {
  id: string;
  title: string;
  tags: string[];
  platform: string;
  final_score: number;
  price: number;
  trend_stage: string;
}

/**
 * Run clustering analysis on all products above minScore.
 * Groups products by keyword similarity (Jaccard on tags + title words).
 */
export async function runProductClustering(
  minScore: number = 30,
  similarityThreshold: number = 0.3
): Promise<{
  clustersCreated: number;
  productsAssigned: number;
  errors: string[];
}> {
  const admin = createAdminClient();
  const errors: string[] = [];

  // Fetch eligible products
  const { data: products, error } = await admin
    .from('products')
    .select('id, title, tags, platform, final_score, price, trend_stage')
    .gte('final_score', minScore)
    .order('final_score', { ascending: false })
    .limit(500);

  if (error || !products || products.length === 0) {
    return { clustersCreated: 0, productsAssigned: 0, errors: error ? [error.message] : ['No products found'] };
  }

  // Build keyword sets for each product
  const candidates: ClusterCandidate[] = products.map(p => ({
    id: p.id,
    title: p.title,
    tags: [
      ...(p.tags || []),
      ...tokenize(p.title),
    ],
    platform: p.platform,
    final_score: p.final_score || 0,
    price: p.price || 0,
    trend_stage: p.trend_stage || 'emerging',
  }));

  // Greedy clustering: assign each product to the most similar existing cluster or create a new one
  const clusters: Array<{
    name: string;
    keywords: string[];
    members: Array<{ productId: string; similarity: number }>;
    platforms: Set<string>;
    scores: number[];
    prices: number[];
    trendStages: string[];
  }> = [];

  for (const product of candidates) {
    let bestCluster = -1;
    let bestSimilarity = 0;

    for (let i = 0; i < clusters.length; i++) {
      const sim = jaccardSimilarity(product.tags, clusters[i].keywords);
      if (sim > bestSimilarity && sim >= similarityThreshold) {
        bestSimilarity = sim;
        bestCluster = i;
      }
    }

    if (bestCluster >= 0) {
      // Add to existing cluster
      clusters[bestCluster].members.push({ productId: product.id, similarity: bestSimilarity });
      clusters[bestCluster].platforms.add(product.platform);
      clusters[bestCluster].scores.push(product.final_score);
      clusters[bestCluster].prices.push(product.price);
      clusters[bestCluster].trendStages.push(product.trend_stage);
      // Update keywords (union)
      for (const tag of product.tags) {
        if (!clusters[bestCluster].keywords.includes(tag)) {
          clusters[bestCluster].keywords.push(tag);
        }
      }
    } else {
      // Create new cluster
      clusters.push({
        name: generateClusterName(product.title, product.tags),
        keywords: [...product.tags],
        members: [{ productId: product.id, similarity: 1.0 }],
        platforms: new Set([product.platform]),
        scores: [product.final_score],
        prices: [product.price],
        trendStages: [product.trend_stage],
      });
    }
  }

  // Filter out single-member clusters (not meaningful)
  const meaningfulClusters = clusters.filter(c => c.members.length >= 2);

  // Store clusters
  let clustersCreated = 0;
  let productsAssigned = 0;

  for (const cluster of meaningfulClusters) {
    const avgScore = cluster.scores.reduce((a, b) => a + b, 0) / cluster.scores.length;
    const minPrice = Math.min(...cluster.prices.filter(p => p > 0));
    const maxPrice = Math.max(...cluster.prices);
    const dominantStage = mode(cluster.trendStages);

    // Upsert cluster
    const { data: clusterRow, error: clusterErr } = await admin
      .from('product_clusters')
      .upsert({
        name: cluster.name,
        keywords: cluster.keywords.slice(0, 20),
        product_count: cluster.members.length,
        avg_score: Math.round(avgScore * 100) / 100,
        platforms: [...cluster.platforms],
        trend_stage: dominantStage,
        total_views: 0,
        total_sales: 0,
        price_range_min: minPrice === Infinity ? 0 : minPrice,
        price_range_max: maxPrice === -Infinity ? 0 : maxPrice,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'name' })
      .select('id')
      .single();

    if (clusterErr || !clusterRow) {
      errors.push(`Cluster "${cluster.name}": ${clusterErr?.message}`);
      continue;
    }

    clustersCreated++;

    // Store members
    const memberRows = cluster.members.map(m => ({
      cluster_id: clusterRow.id,
      product_id: m.productId,
      similarity: Math.round(m.similarity * 10000) / 10000,
    }));

    const { error: memberErr } = await admin
      .from('product_cluster_members')
      .upsert(memberRows, { onConflict: 'cluster_id,product_id' });

    if (memberErr) {
      errors.push(`Members for "${cluster.name}": ${memberErr.message}`);
    } else {
      productsAssigned += memberRows.length;
    }
  }

  return { clustersCreated, productsAssigned, errors };
}

// --- Utility functions ---

function tokenize(text: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'set', 'new']);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a.map(s => s.toLowerCase()));
  const setB = new Set(b.map(s => s.toLowerCase()));
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function generateClusterName(title: string, tags: string[]): string {
  // Use first 2-3 meaningful words from title + top tag
  const words = tokenize(title).slice(0, 3);
  if (tags.length > 0 && !words.includes(tags[0].toLowerCase())) {
    words.push(tags[0].toLowerCase());
  }
  return words.join(' ').replace(/^\w/, c => c.toUpperCase()) || 'General Cluster';
}

function mode(arr: string[]): string {
  const freq = new Map<string, number>();
  for (const item of arr) {
    freq.set(item, (freq.get(item) || 0) + 1);
  }
  let maxCount = 0;
  let result = arr[0] || 'emerging';
  for (const [item, count] of freq) {
    if (count > maxCount) {
      maxCount = count;
      result = item;
    }
  }
  return result;
}

// ─── Engine Interface Wrapper ──────────────────────────────

export class ClusteringEngine implements Engine {
  private _status: EngineStatus = 'idle';

  readonly config: EngineConfig = {
    name: 'clustering',
    version: '1.0.0',
    dependencies: [],
    queues: ['product-clustering'],
    publishes: [
      ENGINE_EVENTS.CLUSTER_UPDATED,
      ENGINE_EVENTS.CLUSTERS_REBUILT,
    ],
    subscribes: [
      ENGINE_EVENTS.PRODUCT_SCORED,
    ],
  };

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
    if (event.type === ENGINE_EVENTS.PRODUCT_SCORED) {
      // Could auto-recluster when scores change — manual-first per G10
      console.log(`[ClusteringEngine] Product scored from ${event.source}, reclustering deferred to manual trigger`);
    }
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * Run clustering and emit events for each cluster created/updated.
   * Wraps runProductClustering with event bus integration.
   */
  async runClustering(
    minScore: number = 30,
    similarityThreshold: number = 0.3,
  ): Promise<{ clustersCreated: number; productsAssigned: number; errors: string[] }> {
    this._status = 'running';
    try {
      const result = await runProductClustering(minScore, similarityThreshold);

      const bus = getEventBus();
      await bus.emit(
        ENGINE_EVENTS.CLUSTERS_REBUILT,
        {
          clustersCreated: result.clustersCreated,
          productsAssigned: result.productsAssigned,
          errors: result.errors,
        },
        'clustering',
      );

      return result;
    } finally {
      this._status = 'idle';
    }
  }
}
