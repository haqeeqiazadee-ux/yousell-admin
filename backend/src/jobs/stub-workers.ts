/**
 * Stub Workers for v8 Spec Queues
 *
 * Remaining placeholder processors for queues not yet fully implemented.
 * Real implementations are in their own files.
 */
import { Job } from "bullmq";

function stubProcessor(queueName: string) {
  return async (job: Job) => {
    console.log(`[${queueName}] Stub processor invoked — job ${job.id}`, JSON.stringify(job.data).slice(0, 200));
    return { status: "stub", queue: queueName, jobId: job.id, message: "Not yet implemented — stub worker" };
  };
}

export const processTransform = stubProcessor("transform-queue");
export const processScoring = stubProcessor("scoring-queue");
export const processOrderTracking = stubProcessor("order-tracking-queue");
export const processFinancialModel = stubProcessor("financial-model");
export const processBlueprint = stubProcessor("blueprint-queue");
// processInfluencerOutreach — moved to influencer-outreach.ts (real implementation)
export const processInfluencerRefresh = stubProcessor("influencer-refresh");
export const processSupplierRefresh = stubProcessor("supplier-refresh");
export const processAffiliateRefresh = stubProcessor("affiliate-refresh");
export const processAffiliateContentGenerate = stubProcessor("affiliate-content-generate");
// processPushToTiktok — moved to push-to-tiktok.ts (real implementation)
// processPushToAmazon — moved to push-to-amazon.ts (real implementation)
