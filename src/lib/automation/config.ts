/**
 * Automation Levels Configuration (v8 spec Section 6A)
 *
 * Three levels: Manual (1), Assisted (2), Auto-Pilot (3)
 * Five per-feature settings + hard guardrails.
 */

export type AutomationLevel = 1 | 2 | 3;

export const AUTOMATION_LEVELS = {
  1: { name: 'Manual',     description: 'System generates recommendations. Client initiates every action.' },
  2: { name: 'Assisted',   description: 'System prepares content/products, presents for approval. Client reviews and approves.' },
  3: { name: 'Auto-Pilot', description: 'System acts autonomously within client-defined rules. Client receives a digest of actions taken.' },
} as const;

export type AutomationFeature =
  | 'product_upload'
  | 'content_creation'
  | 'content_publishing'
  | 'influencer_outreach'
  | 'product_discovery';

export interface PerFeatureAutomation {
  product_upload: AutomationLevel;
  content_creation: AutomationLevel;
  content_publishing: AutomationLevel;
  influencer_outreach: AutomationLevel;
  product_discovery: AutomationLevel;
}

export const DEFAULT_AUTOMATION: PerFeatureAutomation = {
  product_upload: 1,
  content_creation: 1,
  content_publishing: 1,
  influencer_outreach: 1,
  product_discovery: 1,
};

// --- Hard Guardrails (Section 6A.3) ---
// These CANNOT be overridden by any automation level.

export interface AutomationGuardrails {
  dailySpendCap: number;            // Max API/credit spend per day ($)
  contentVolumeCapPerDay: number;    // Max posts published per day per platform
  productUploadCapPerDay: number;    // Max products pushed to store per day
  outreachCapPerDay: number;         // Max influencer emails per day
  pauseOnConsecutiveErrors: number;  // Auto-pause after N consecutive failures (default: 3)
}

export const DEFAULT_GUARDRAILS: AutomationGuardrails = {
  dailySpendCap: 50,
  contentVolumeCapPerDay: 10,
  productUploadCapPerDay: 5,
  outreachCapPerDay: 20,
  pauseOnConsecutiveErrors: 3,
};

// --- Soft Limits (Client-Configurable) ---

export interface AutomationSoftLimits {
  contentApprovalWindowHours: number;  // Content sits in queue before auto-publishing (default: 4)
  allowedCategories: string[];         // Only auto-push products in these categories
  priceRange: { min: number; max: number }; // Only auto-push within price range
  minimumScore: number;                // Only act on products above this score
  quietHoursStart?: string;            // HH:mm — no publishing during these hours
  quietHoursEnd?: string;
  weeklyDigestEnabled: boolean;        // Summary of auto-pilot actions every Monday
}

export const DEFAULT_SOFT_LIMITS: AutomationSoftLimits = {
  contentApprovalWindowHours: 4,
  allowedCategories: [],
  priceRange: { min: 0, max: 1000 },
  minimumScore: 60,
  weeklyDigestEnabled: true,
};

/**
 * Check if an action is allowed given the current automation level.
 * Returns whether the action should proceed, need approval, or be blocked.
 */
export function checkAutomationPermission(
  feature: AutomationFeature,
  config: PerFeatureAutomation,
): 'proceed' | 'needs_approval' | 'manual_only' {
  const level = config[feature];
  switch (level) {
    case 3: return 'proceed';
    case 2: return 'needs_approval';
    case 1:
    default: return 'manual_only';
  }
}

/**
 * Check if a guardrail limit has been exceeded.
 */
export function isGuardrailExceeded(
  guardrails: AutomationGuardrails,
  current: { dailySpend: number; contentToday: number; uploadsToday: number; outreachToday: number; consecutiveErrors: number },
): { exceeded: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (current.dailySpend >= guardrails.dailySpendCap)
    reasons.push(`Daily spend cap reached ($${current.dailySpend}/$${guardrails.dailySpendCap})`);
  if (current.contentToday >= guardrails.contentVolumeCapPerDay)
    reasons.push(`Content volume cap reached (${current.contentToday}/${guardrails.contentVolumeCapPerDay})`);
  if (current.uploadsToday >= guardrails.productUploadCapPerDay)
    reasons.push(`Product upload cap reached (${current.uploadsToday}/${guardrails.productUploadCapPerDay})`);
  if (current.outreachToday >= guardrails.outreachCapPerDay)
    reasons.push(`Outreach cap reached (${current.outreachToday}/${guardrails.outreachCapPerDay})`);
  if (current.consecutiveErrors >= guardrails.pauseOnConsecutiveErrors)
    reasons.push(`Auto-pilot paused: ${current.consecutiveErrors} consecutive errors`);

  return { exceeded: reasons.length > 0, reasons };
}
