/**
 * Stub Workers for v8 Spec Queues
 *
 * These are placeholder job processors for queues defined in the v8 spec
 * but not yet fully implemented. Each logs the job data and returns a
 * stub result. Replace with real implementations as each feature is built.
 *
 * All jobs are DISABLED by default per guardrail G10 (manual-first cost control).
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
// processContentQueue — moved to content-generation.ts (real implementation)
// processDistribution — moved to distribution.ts (real implementation)
export const processOrderTracking = stubProcessor("order-tracking-queue");
export const processFinancialModel = stubProcessor("financial-model");
export const processBlueprint = stubProcessor("blueprint-queue");
export const processNotification = stubProcessor("notification-queue");
export const processInfluencerOutreach = stubProcessor("influencer-outreach");
export const processInfluencerRefresh = stubProcessor("influencer-refresh");
export const processSupplierRefresh = stubProcessor("supplier-refresh");
export const processAffiliateRefresh = stubProcessor("affiliate-refresh");
export const processAffiliateContentGenerate = stubProcessor("affiliate-content-generate");
// processAffiliateCommissionTrack — moved to affiliate-commission.ts (real implementation)
export const processPodDiscovery = stubProcessor("pod-discovery");
export const processPodProvision = stubProcessor("pod-provision");
export const processPodFulfillmentSync = stubProcessor("pod-fulfillment-sync");
// processPushToShopify — moved to push-to-shopify.ts (real implementation)
export const processPushToTiktok = stubProcessor("push-to-tiktok");
export const processPushToAmazon = stubProcessor("push-to-amazon");
