/**
 * Engine UI Component Interfaces
 *
 * Type contracts for engine-related UI components.
 * Phase C.4-C.6: Interfaces only — implementations come in Phase D.
 */

import type { EngineRunStatus, EngineMetrics } from '@/lib/api/types';

// ─── C.4: EngineStatusCard ─────────────────────────────────

/**
 * Compact card showing engine health at a glance.
 * Used in the admin dashboard grid.
 */
export interface EngineStatusCardProps {
  /** Engine display name */
  name: string;
  /** Machine name for API calls */
  engineId: string;
  /** Current engine status */
  status: EngineRunStatus;
  /** Whether the engine passed its health check */
  healthy: boolean;
  /** Number of queues this engine owns */
  queueCount: number;
  /** Last successful run timestamp (ISO) */
  lastRun?: string;
  /** Brief description of what this engine does */
  description?: string;
  /** Click handler to navigate to engine detail page */
  onClick?: () => void;
}

// ─── C.5: EngineDashboardPanel ─────────────────────────────

/**
 * Larger panel showing engine metrics for the dashboard.
 * Includes KPIs, recent activity, and quick actions.
 */
export interface EngineDashboardPanelProps {
  /** Engine display name */
  name: string;
  /** Machine name */
  engineId: string;
  /** Current status */
  status: EngineRunStatus;
  /** Performance metrics */
  metrics?: EngineMetrics;
  /** Key stats to display (e.g., "Products Found: 142") */
  stats: EngineStat[];
  /** Recent activity items */
  recentActivity?: EngineActivity[];
  /** Quick action buttons */
  actions?: EngineAction[];
}

export interface EngineStat {
  label: string;
  value: string | number;
  change?: number; // percentage change from last period
  trend?: 'up' | 'down' | 'flat';
}

export interface EngineActivity {
  id: string;
  message: string;
  timestamp: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface EngineAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
}

// ─── C.6: EngineControlPanel ───────────────────────────────

/**
 * Full control panel for an engine — start/stop, configure, view logs.
 * Used on engine detail pages.
 */
export interface EngineControlPanelProps {
  /** Engine display name */
  name: string;
  /** Machine name */
  engineId: string;
  /** Current status */
  status: EngineRunStatus;
  /** Whether the engine is healthy */
  healthy: boolean;
  /** Queue names owned by this engine */
  queues: string[];
  /** Event types this engine publishes */
  publishes: string[];
  /** Event types this engine subscribes to */
  subscribes: string[];
  /** Handler for start action */
  onStart?: () => void;
  /** Handler for stop action */
  onStop?: () => void;
  /** Handler for manual trigger (e.g., run scan, run clustering) */
  onTrigger?: (action: string) => void;
  /** Whether controls are disabled (e.g., insufficient permissions) */
  disabled?: boolean;
}

// ─── Engine Page Layout ────────────────────────────────────

/**
 * Standard layout wrapper for engine detail pages.
 * Provides consistent header, status bar, and content area.
 */
export interface EnginePageLayoutProps {
  /** Engine display name (shown in header) */
  title: string;
  /** Engine machine name */
  engineId: string;
  /** Brief description */
  description?: string;
  /** Current engine status */
  status: EngineRunStatus;
  /** Whether the engine is healthy */
  healthy: boolean;
  /** Page content (children) */
  children: React.ReactNode;
  /** Optional action buttons in the header */
  headerActions?: React.ReactNode;
}
