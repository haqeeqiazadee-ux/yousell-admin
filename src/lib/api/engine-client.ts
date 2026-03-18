/**
 * Engine API Client — Typed fetch wrapper for engine endpoints
 *
 * Phase D.1: Builds on existing authFetch to provide typed,
 * error-handled API calls to engine-namespaced routes.
 */

'use client';

import { authFetch } from '@/lib/auth-fetch';
import type { ApiResult, ApiErrorCode } from './types';

// ─── Core Client ───────────────────────────────────────────

/**
 * Make a typed GET request to an engine API endpoint.
 */
export async function engineGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<ApiResult<T>> {
  const url = buildUrl(path, params);
  return engineRequest<T>(url, { method: 'GET' });
}

/**
 * Make a typed POST request to an engine API endpoint.
 */
export async function enginePost<T>(
  path: string,
  body?: unknown,
): Promise<ApiResult<T>> {
  return engineRequest<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ─── Internal Request Handler ──────────────────────────────

async function engineRequest<T>(
  url: string,
  options: RequestInit,
): Promise<ApiResult<T>> {
  try {
    const response = await authFetch(url, options);

    if (!response.ok) {
      const errorBody = await safeParseJson(response);
      return {
        data: null,
        error: {
          code: httpStatusToErrorCode(response.status),
          message: typeof errorBody?.error === 'string' ? errorBody.error : typeof errorBody?.message === 'string' ? errorBody.message : response.statusText,
          details: errorBody ?? undefined,
        },
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      data: data as T,
      error: null,
      status: response.status,
    };
  } catch (err) {
    return {
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Network error',
      },
      status: 0,
    };
  }
}

// ─── Helpers ───────────────────────────────────────────────

function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  if (!params) return path;

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }

  const qs = searchParams.toString();
  return qs ? `${path}?${qs}` : path;
}

function httpStatusToErrorCode(status: number): ApiErrorCode {
  switch (status) {
    case 401: return 'UNAUTHORIZED';
    case 403: return 'FORBIDDEN';
    case 404: return 'NOT_FOUND';
    case 422: return 'VALIDATION_ERROR';
    case 429: return 'RATE_LIMITED';
    case 503: return 'ENGINE_UNAVAILABLE';
    default: return status >= 500 ? 'INTERNAL_ERROR' : 'EXTERNAL_SERVICE_ERROR';
  }
}

async function safeParseJson(response: Response): Promise<Record<string, unknown> | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

// ─── Convenience: Engine-specific path builders ────────────

export const enginePaths = {
  discovery: {
    scan: '/api/engine/discovery/scan',
    products: '/api/engine/discovery/products',
  },
  tiktok: {
    discover: '/api/engine/tiktok/discover',
    videos: '/api/engine/tiktok/videos',
  },
  scoring: {
    calculate: '/api/engine/scoring/calculate',
  },
  clustering: {
    clusters: '/api/engine/intelligence/clusters',
  },
  creators: {
    matches: '/api/engine/creators/matches',
    influencers: '/api/engine/creators/influencers',
  },
  suppliers: {
    list: '/api/engine/suppliers',
  },
  ads: {
    list: '/api/engine/ads',
  },
} as const;
