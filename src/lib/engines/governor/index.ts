/**
 * YOUSELL Engine Governor — Barrel Export
 *
 * @see docs/v9/V9_Engine_Governor_Architecture.md
 */

// Core singleton
export { EngineGovernor, getGovernor, resetGovernor } from './governor';

// Pipeline stages
export { GovernorGate } from './gate';
export { GovernorDispatch } from './dispatch';
export { GovernorMeter } from './meter';

// Cost manifests
export { ENGINE_COST_MANIFESTS, getEngineCostManifest, getOperationCost } from './cost-manifests';

// Envelope lifecycle
export {
  createBudgetEnvelope,
  updateBudgetEnvelope,
  archiveBudgetEnvelope,
  renewBudgetEnvelope,
} from './envelope-lifecycle';

// Plan allowances
export {
  PLAN_ALLOWANCE_TEMPLATES,
  buildEngineAllowances,
  getPlanGlobalCostCap,
  getPlanContentCredits,
} from './plan-allowances';

// AI Optimizer
export { GovernorAIOptimizer, getAIOptimizer } from './ai-optimizer';

// Route middleware
export { withGovernor } from './middleware';

// Types
export type {
  PlanId,
  CostTier,
  AutomationLevel,
  ExternalCostBreakdown,
  EngineOperationCost,
  EngineCostManifest,
  EngineAllowance,
  BudgetAlertThresholds,
  ClientBudgetEnvelope,
  GateDenialCode,
  GateResult,
  DispatchContext,
  EngineOperationResult,
  UsageLedgerEntry,
  GovernorExecuteContext,
  GovernorResponse,
  EngineSwapEntry,
  AIDecisionType,
  GovernorAIDecision,
  OverrideType,
  GovernorOverride,
  GovernorEventType,
} from './types';

// Event constants
export { GOVERNOR_EVENTS } from './types';
