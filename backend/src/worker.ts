import { Worker, Job } from 'bullmq';
import { connection } from './lib/queue';
import { supabase } from './lib/supabase';
import { scrapePlatform, fetchTrends } from './lib/providers';
import { calculateCompositeScore, getStageFromScore } from './lib/scoring';
import { sendScanCompleteAlert, sendProductAlert } from './lib/email';

interface ScanJobData {
  mode: 'quick' | 'full' | 'client';
  query: string;
  userId: string;
}

const SCAN_STEPS: Record<string, { platform: string; weight: number }[]> = {
  quick: [
    { platform: 'tiktok', weight: 40 },
    { platform: 'amazon', weight: 40 },
    { platform: 'trends', weight: 20 },
  ],
  full: [
    { platform: 'tiktok', weight: 20 },
    { platform: 'amazon', weight: 20 },
    { platform: 'shopify', weight: 20 },
    { platform: 'pinterest', weight: 20 },
    { platform: 'trends', weight: 20 },
  ],
  client: [
    { platform: 'tiktok', weight: 40 },
    { platform: 'amazon', weight: 40 },
    { platform: 'trends', weight: 20 },
  ],
};

const worker = new Worker(
  'scan',
  async (job: Job<ScanJobData>) => {
    const { mode, query, userId } = job.data;
    const steps = SCAN_STEPS[mode] || SCAN_STEPS.quick;

    const { data: scan, error: scanError } = await supabase
      .from('scans')
      .insert({
        mode,
        status: 'running',
        started_at: new Date().toISOString(),
        user_id: userId,
        job_id: job.id,
      })
      .select()
      .single();

    if (scanError) {
      throw new Error(`Failed to create scan record: ${scanError.message}`);
    }

    const startTime = Date.now();
    let totalProgress = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allProducts: any[] = [];

    try {
      for (const step of steps) {
        if (step.platform === 'trends') {
          const trends = await fetchTrends(query);
          if (trends.length > 0) {
            const { error: trendError } = await supabase
              .from('trend_keywords')
              .insert(
                trends.map((t) => ({
                  keyword: t.keyword,
                  volume: t.volume,
                  growth: t.growth,
                  source: 'tiktok',
                  scan_id: scan.id,
                  fetched_at: new Date().toISOString(),
                }))
              );
            if (trendError) {
              console.error('Trend insert error:', trendError);
            }
          }
        } else {
          const products = await scrapePlatform(step.platform, query);
          const scored = products.map((p) => ({
            ...p,
            ...calculateCompositeScore(p),
          }));
          allProducts.push(...scored);
        }

        totalProgress += step.weight;
        await job.updateProgress(totalProgress);
      }

      if (allProducts.length > 0) {
        const { error: upsertError } = await supabase
          .from('products')
          .upsert(
            allProducts.map((p) => ({
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
              score_overall: p.overall_score,
              trend_stage: getStageFromScore(p.viral_score as number),
              scan_id: scan.id,
            })),
            { onConflict: 'source,external_id' }
          );

        if (upsertError) {
          console.error('Product upsert error:', upsertError);
        }

        for (const p of allProducts) {
          if (p.final_score >= 80) {
            await sendProductAlert({
              title: p.title,
              price: p.price,
              viral_score: p.viral_score,
              source: p.source,
              url: p.url,
            });
          }
        }
      }

      const duration = Date.now() - startTime;

      await supabase
        .from('scans')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          product_count: allProducts.length,
          duration_ms: duration,
        })
        .eq('id', scan.id);

      const result = {
        scanId: scan.id,
        mode,
        totalProducts: allProducts.length,
        platforms: steps.filter((s) => s.platform !== 'trends').map((s) => s.platform),
        duration,
      };

      await sendScanCompleteAlert(result);

      return result;
    } catch (error) {
      await supabase
        .from('scans')
        .update({ status: 'failed', error: String(error) })
        .eq('id', scan.id);

      throw error;
    }
  },
  { connection, concurrency: 2 }
);

worker.on('completed', (job) => {
  console.log(`Scan job ${job.id} completed`);
});

worker.on('failed', (job, error) => {
  console.error(`Scan job ${job?.id} failed:`, error);
});

console.log('Worker started, waiting for scan jobs...');

export { worker };
