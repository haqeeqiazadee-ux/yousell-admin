/**
 * Composite Scoring Engine
 *
 * Three independent scores combine into Final Opportunity Score:
 * - Trend Opportunity Score (40% weight)
 * - Early Viral Score (35% weight)
 * - Profitability Score (25% weight)
 */

export interface TrendScoreInputs {
  tiktokGrowth: number;       // 0-100
  influencerActivity: number;  // 0-100
  amazonDemand: number;        // 0-100
  competition: number;         // 0-100 (higher = more competitive = worse)
  profitMargin: number;        // 0-100
}

export interface ViralScoreInputs {
  microInfluencerConvergence: number;  // 0-100
  commentPurchaseIntent: number;       // 0-100
  hashtagAcceleration: number;         // 0-100
  creatorNicheExpansion: number;       // 0-100
  engagementVelocity: number;          // 0-100
  supplySideResponse: number;          // 0-100
}

export interface ProfitScoreInputs {
  margin: number;              // 0-100
  shippingFeasibility: number; // 0-100
  marketingEfficiency: number; // 0-100
  supplierReliability: number; // 0-100
  operationalRisk: number;     // 0-100 (higher = riskier = worse)
}

/** Trend Opportunity Score = (TikTok×0.35) + (Influencer×0.25) + (Amazon×0.20) − (Competition×0.10) + (Margin×0.10) */
export function calculateTrendScore(inputs: TrendScoreInputs): number {
  const raw =
    inputs.tiktokGrowth * 0.35 +
    inputs.influencerActivity * 0.25 +
    inputs.amazonDemand * 0.20 -
    inputs.competition * 0.10 +
    inputs.profitMargin * 0.10;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

/** Early Viral Score — weighted sum of six pre-viral signals */
export function calculateViralScore(inputs: ViralScoreInputs): number {
  const raw =
    inputs.microInfluencerConvergence * 0.25 +
    inputs.commentPurchaseIntent * 0.20 +
    inputs.hashtagAcceleration * 0.20 +
    inputs.creatorNicheExpansion * 0.15 +
    inputs.engagementVelocity * 0.10 +
    inputs.supplySideResponse * 0.10;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

/** Profitability Score = (Margin×0.40) + (Shipping×0.20) + (Marketing×0.20) + (Supplier×0.10) − (Risk×0.10) */
export function calculateProfitScore(inputs: ProfitScoreInputs): number {
  const raw =
    inputs.margin * 0.40 +
    inputs.shippingFeasibility * 0.20 +
    inputs.marketingEfficiency * 0.20 +
    inputs.supplierReliability * 0.10 -
    inputs.operationalRisk * 0.10;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

/** Final Opportunity Score = (Trend×0.40) + (Viral×0.35) + (Profit×0.25) */
export function calculateFinalScore(
  trendScore: number,
  viralScore: number,
  profitScore: number
): number {
  const raw = trendScore * 0.40 + viralScore * 0.35 + profitScore * 0.25;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

/** Get tier classification from Final Opportunity Score */
export function getTierFromScore(score: number): "hot" | "warm" | "watch" | "cold" {
  if (score >= 80) return "hot";
  if (score >= 60) return "warm";
  if (score >= 40) return "watch";
  return "cold";
}

/** Get trend stage from Early Viral Score */
export function getStageFromViralScore(
  score: number
): "emerging" | "rising" | "exploding" | "saturated" {
  if (score >= 70) return "emerging";
  if (score >= 50) return "rising";
  if (score >= 30) return "exploding";
  return "saturated";
}

/** Influencer Conversion Score */
export function calculateInfluencerConversionScore(inputs: {
  engagementRate: number;        // 0-100
  purchaseIntentRatio: number;   // 0-100
  productDemoQuality: number;    // 0-100
  audienceTrustSignals: number;  // 0-100
  usAudiencePct: number;         // 0-100
}): number {
  const raw =
    inputs.engagementRate * 0.30 +
    inputs.purchaseIntentRatio * 0.25 +
    inputs.productDemoQuality * 0.20 +
    inputs.audienceTrustSignals * 0.15 +
    inputs.usAudiencePct * 0.10;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

/** Generate plain-English explanation of a score */
export function explainScore(
  type: "trend" | "viral" | "profit" | "final",
  score: number,
  inputs: Record<string, number>
): string {
  const tier = getTierFromScore(score);
  const tierLabel = tier.toUpperCase();

  if (type === "final") {
    return `Final Opportunity Score: ${score}/100 (${tierLabel}). ` +
      `Trend score contributes ${Math.round((inputs.trendScore || 0) * 0.4)}, ` +
      `Viral score contributes ${Math.round((inputs.viralScore || 0) * 0.35)}, ` +
      `Profitability contributes ${Math.round((inputs.profitScore || 0) * 0.25)}.`;
  }

  if (type === "viral") {
    const stage = getStageFromViralScore(score);
    return `Early Viral Score: ${score}/100 — product is in "${stage}" stage. ` +
      `Strongest signal: ${getStrongestSignal(inputs)}.`;
  }

  return `${type.charAt(0).toUpperCase() + type.slice(1)} Score: ${score}/100 (${tierLabel}).`;
}

function getStrongestSignal(inputs: Record<string, number>): string {
  const labels: Record<string, string> = {
    microInfluencerConvergence: "micro-influencer convergence",
    commentPurchaseIntent: "comment purchase intent",
    hashtagAcceleration: "hashtag acceleration",
    creatorNicheExpansion: "creator niche expansion",
    engagementVelocity: "engagement velocity",
    supplySideResponse: "supply-side response",
  };
  let max = 0;
  let maxKey = "";
  for (const [key, val] of Object.entries(inputs)) {
    if (val > max && labels[key]) {
      max = val;
      maxKey = key;
    }
  }
  return labels[maxKey] || "unknown";
}
