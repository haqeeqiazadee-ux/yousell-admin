/**
 * Engine Detail Page Layout Design Contract
 *
 * Phase C.9: Defines the standard structure for individual engine pages.
 * All engine detail pages follow this consistent layout.
 *
 * Layout:
 * ┌──────────────────────────────────────────────────────┐
 * │ Header Bar                                           │
 * │ [Engine Name] [Status Badge] [Health Dot]  [Actions] │
 * ├──────────────────────────────────────────────────────┤
 * │ Metrics Row (3-4 stat cards)                         │
 * │ [Metric 1] [Metric 2] [Metric 3] [Metric 4]        │
 * ├──────────────────────────────────────────────────────┤
 * │ Control Panel (collapsible)                          │
 * │ [Start/Stop] [Trigger Action] [Queue Status]         │
 * ├──────────────────────────────────────────────────────┤
 * │ Data Table (main content)                            │
 * │ [Search] [Filters]                                   │
 * │ ┌──────────────────────────────────────────────────┐ │
 * │ │ Column 1 │ Column 2 │ Column 3 │ ... │ Actions  │ │
 * │ │ ─────────┼──────────┼──────────┼─────┼──────────│ │
 * │ │ row data │ row data │ row data │ ... │ [btn]    │ │
 * │ └──────────────────────────────────────────────────┘ │
 * │ [Pagination]                                         │
 * └──────────────────────────────────────────────────────┘
 */

import type { EngineRunStatus } from '@/lib/api/types';

// ─── Header Bar ────────────────────────────────────────────

export interface EngineDetailHeaderProps {
  title: string;
  description?: string;
  status: EngineRunStatus;
  healthy: boolean;
  actions?: React.ReactNode;
}

// ─── Metrics Row ───────────────────────────────────────────

export interface EngineMetricCard {
  label: string;
  value: string | number;
  suffix?: string;
  change?: number;
  trend?: 'up' | 'down' | 'flat';
}

export interface EngineMetricsRowProps {
  metrics: EngineMetricCard[];
}

// ─── Engine Detail Page Contract ───────────────────────────

/**
 * Standard data shape for any engine detail page.
 * Each engine page maps its specific data into this contract.
 */
export interface EngineDetailPageData<T> {
  /** Header info */
  title: string;
  description: string;
  engineId: string;
  status: EngineRunStatus;
  healthy: boolean;
  /** Key metrics to display */
  metrics: EngineMetricCard[];
  /** Table data */
  tableData: T[];
  tableTotal: number;
  /** Loading state */
  loading: boolean;
}

// ─── Engine Page Map ───────────────────────────────────────
// Maps engine IDs to their admin page paths and display info

export const ENGINE_PAGE_MAP: Record<string, { path: string; title: string; description: string }> = {
  'discovery': {
    path: '/admin/scan',
    title: 'Discovery Engine',
    description: 'Multi-platform product discovery and scanning',
  },
  'tiktok-discovery': {
    path: '/admin/tiktok',
    title: 'TikTok Discovery',
    description: 'Viral product discovery on TikTok',
  },
  'scoring': {
    path: '/admin/products',
    title: 'Scoring Engine',
    description: 'Product scoring with trend, viral, and profit analysis',
  },
  'clustering': {
    path: '/admin/clusters',
    title: 'Clustering Engine',
    description: 'Product grouping by keyword similarity',
  },
  'trend-detection': {
    path: '/admin/trends',
    title: 'Trend Detection',
    description: 'Emerging trend analysis and keyword tracking',
  },
  'creator-matching': {
    path: '/admin/creator-matches',
    title: 'Creator Matching',
    description: 'Influencer-product pairing with ROI projections',
  },
  'ad-intelligence': {
    path: '/admin/ads',
    title: 'Ad Intelligence',
    description: 'Meta and TikTok ad campaign discovery',
  },
  'opportunity-feed': {
    path: '/admin',
    title: 'Opportunity Feed',
    description: 'Unified opportunity view with enrichment signals',
  },
} as const;
