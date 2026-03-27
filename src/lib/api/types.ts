/**
 * Shared API Response Types & Error Handling Contract
 *
 * Standard response envelope and error types used across all engine APIs.
 * Phase C.3: Contracts for consistent API consumption in the frontend.
 */

// ─── Response Envelope ─────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  error: null;
  status: number;
}

export interface ApiErrorResponse {
  data: null;
  error: ApiError;
  status: number;
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;

// ─── Error Types ───────────────────────────────────────────

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'ENGINE_UNAVAILABLE'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'INTERNAL_ERROR';

// ─── Pagination ────────────────────────────────────────────

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ─── Sort & Filter ─────────────────────────────────────────

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

// ─── Engine Status ─────────────────────────────────────────

export type EngineRunStatus = 'idle' | 'running' | 'paused' | 'error' | 'stopped';

export interface EngineStatusInfo {
  name: string;
  status: EngineRunStatus;
  healthy: boolean;
  lastRun?: string;
  lastError?: string;
  metrics?: EngineMetrics;
}

export interface EngineMetrics {
  totalRuns: number;
  successRate: number;
  avgDuration: number;
  lastDuration: number;
}

// ─── Type Guards ───────────────────────────────────────────

export function isApiError(result: ApiResult<unknown>): result is ApiErrorResponse {
  return result.error !== null;
}

export function isApiSuccess<T>(result: ApiResult<T>): result is ApiResponse<T> {
  return result.error === null;
}
