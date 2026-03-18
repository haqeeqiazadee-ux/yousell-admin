/**
 * Admin Dashboard Layout Design Contract
 *
 * Phase C.8: Defines the structure of the refactored admin dashboard.
 * The dashboard is organized into engine-aware sections.
 *
 * Layout:
 * ┌──────────────────────────────────────────────────────┐
 * │ KPI Row (4 cards)                                    │
 * │ [Total Products] [HOT Products] [Active Engines] [Scan Status] │
 * ├──────────────────────────────────────────────────────┤
 * │ Engine Status Grid (2x4 or responsive grid)          │
 * │ [Discovery] [TikTok] [Scoring] [Clustering]          │
 * │ [Trends]    [Creators] [Ads]   [Opportunity]        │
 * ├──────────────────────────────────────────────────────┤
 * │ Two-column layout:                                   │
 * │ [Recent Activity Feed] | [System Health Panel]       │
 * └──────────────────────────────────────────────────────┘
 */

import type { EngineStatusCardProps } from '@/components/engines/types';
import type { EngineRunStatus } from '@/lib/api/types';

// ─── KPI Section ───────────────────────────────────────────

export interface DashboardKPI {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'flat';
  icon?: string;
  color?: string;
}

export interface DashboardKPIRowProps {
  kpis: DashboardKPI[];
}

// ─── Engine Grid Section ───────────────────────────────────

export interface DashboardEngineGridProps {
  engines: EngineStatusCardProps[];
}

// ─── Activity Feed Section ─────────────────────────────────

export interface ActivityItem {
  id: string;
  engine: string;
  action: string;
  timestamp: string;
  type: 'scan' | 'score' | 'match' | 'cluster' | 'trend' | 'ad' | 'system';
  metadata?: Record<string, unknown>;
}

export interface ActivityFeedProps {
  items: ActivityItem[];
  maxItems?: number;
}

// ─── System Health Section ─────────────────────────────────

export interface SystemHealthProps {
  engines: Array<{
    name: string;
    status: EngineRunStatus;
    healthy: boolean;
  }>;
  database: { connected: boolean; latency?: number };
  queues: { active: number; waiting: number; failed: number };
}

// ─── Dashboard Page Contract ───────────────────────────────

export interface AdminDashboardPageData {
  kpis: DashboardKPI[];
  engines: EngineStatusCardProps[];
  recentActivity: ActivityItem[];
  systemHealth: SystemHealthProps;
}
