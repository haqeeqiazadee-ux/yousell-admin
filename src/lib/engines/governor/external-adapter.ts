/**
 * YOUSELL External Engine API Adapter
 *
 * Routes engine operations to external HTTP API endpoints.
 * Any platform that provides an API can integrate as an engine replacement.
 *
 * Features:
 * - Standardized request/response format
 * - Auth support: Bearer, API key, custom header, none
 * - Circuit breaker for fault tolerance
 * - Configurable timeout per engine
 * - AES-256-GCM encrypted token storage
 */

import { getCircuitBreaker } from '@/lib/circuit-breaker';
import { decryptToken } from '@/lib/crypto';
import type { ExternalEngineRecord } from './types';
import type { DispatchContext, EngineOperationResult } from './types';

/** Standardized payload sent to external engine APIs */
export interface ExternalEngineRequest {
  operation: string;
  params: Record<string, unknown>;
  correlationId: string;
  timestamp: string;
  source: 'yousell-governor';
}

/** Expected response shape from external engine APIs */
export interface ExternalEngineResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Call an external engine API endpoint.
 *
 * Sends a POST with standardized JSON payload, handles auth,
 * applies circuit breaker protection and timeout.
 */
export async function callExternalEngine(
  engine: ExternalEngineRecord,
  operation: string,
  params: Record<string, unknown>,
  context: DispatchContext
): Promise<EngineOperationResult> {
  const startTime = Date.now();
  const breaker = getCircuitBreaker(`ext-${engine.engineKey}`, {
    failureThreshold: 3,
    resetTimeoutMs: 60_000,
  });

  try {
    const result = await breaker.execute(async () => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Correlation-Id': context.correlationId,
        'X-Source': 'yousell-governor',
      };

      // Apply authentication
      const authValue = buildAuthHeader(engine);
      if (authValue) {
        headers[engine.authHeaderName || 'Authorization'] = authValue;
      }

      // Add any custom headers from metadata
      const customHeaders = engine.metadata?.headers as Record<string, string> | undefined;
      if (customHeaders) {
        Object.assign(headers, customHeaders);
      }

      const payload: ExternalEngineRequest = {
        operation,
        params,
        correlationId: context.correlationId,
        timestamp: new Date().toISOString(),
        source: 'yousell-governor',
      };

      const response = await fetch(engine.apiEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(engine.timeoutMs || 30_000),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`External engine ${engine.engineKey} returned ${response.status}: ${errorText}`);
      }

      const body: ExternalEngineResponse = await response.json();
      return body;
    });

    return {
      success: result.success !== false,
      data: result.data,
      error: result.error,
      durationMs: Date.now() - startTime,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[External Adapter] ${engine.engineKey}.${operation} failed:`, message);

    return {
      success: false,
      error: message,
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Ping an external engine's health endpoint.
 * Returns true if the endpoint responds with 2xx.
 */
export async function checkExternalHealth(engine: ExternalEngineRecord): Promise<boolean> {
  if (!engine.healthEndpoint) return true; // No health endpoint = assume healthy

  try {
    const url = engine.healthEndpoint.startsWith('http')
      ? engine.healthEndpoint
      : `${engine.apiEndpoint.replace(/\/+$/, '')}${engine.healthEndpoint}`;

    const headers: Record<string, string> = {};
    const authValue = buildAuthHeader(engine);
    if (authValue) {
      headers[engine.authHeaderName || 'Authorization'] = authValue;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10_000),
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Build the auth header value based on engine auth type.
 */
function buildAuthHeader(engine: ExternalEngineRecord): string | null {
  if (engine.authType === 'none' || !engine.authTokenEncrypted) return null;

  const token = decryptToken(engine.authTokenEncrypted);

  switch (engine.authType) {
    case 'bearer':
      return `Bearer ${token}`;
    case 'api_key':
      return token;
    case 'header':
      return token;
    default:
      return null;
  }
}
