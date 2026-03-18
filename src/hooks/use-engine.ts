/**
 * useEngine — Generic hook for engine data fetching
 *
 * Phase D.2: Provides typed data fetching, loading state,
 * error handling, and manual refresh for any engine endpoint.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { engineGet } from '@/lib/api/engine-client';
import { isApiError } from '@/lib/api/types';
import type { ApiError } from '@/lib/api/types';

interface UseEngineOptions {
  /** Whether to fetch immediately on mount (default: true) */
  immediate?: boolean;
  /** Polling interval in ms (0 = no polling) */
  pollInterval?: number;
}

interface UseEngineReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching data from an engine API endpoint.
 *
 * @example
 * const { data, loading, error, refresh } = useEngine<ProductRecord[]>(
 *   '/api/engine/discovery/products',
 *   { platform: 'tiktok', limit: '50' }
 * );
 */
export function useEngine<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  options: UseEngineOptions = {},
): UseEngineReturn<T> {
  const { immediate = true, pollInterval = 0 } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<ApiError | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await engineGet<T>(path, params);

    if (!mountedRef.current) return;

    if (isApiError(result)) {
      setError(result.error);
      setData(null);
    } else {
      setData(result.data);
      setError(null);
    }

    setLoading(false);
  }, [path, JSON.stringify(params)]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;

    if (immediate) {
      fetchData();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [fetchData, immediate]);

  // Polling
  useEffect(() => {
    if (pollInterval <= 0) return;

    const interval = setInterval(fetchData, pollInterval);
    return () => clearInterval(interval);
  }, [fetchData, pollInterval]);

  return { data, loading, error, refresh: fetchData };
}
