/**
 * Shopify GraphQL Admin API Client
 *
 * Uses the 2025-01 API version (GraphQL-only for new apps since April 2025).
 * All product operations use the `productSet` mutation per Shopify best practices.
 *
 * @engine store-integration
 */

const SHOPIFY_API_VERSION = '2025-01'

export interface ShopifyClientConfig {
  shopDomain: string
  accessToken: string
}

export interface ShopifyGraphQLResponse<T = Record<string, unknown>> {
  data?: T
  errors?: Array<{
    message: string
    locations?: Array<{ line: number; column: number }>
    path?: string[]
    extensions?: Record<string, unknown>
  }>
  extensions?: {
    cost?: {
      requestedQueryCost: number
      actualQueryCost: number
      throttleStatus: {
        maximumAvailable: number
        currentlyAvailable: number
        restoreRate: number
      }
    }
  }
}

/**
 * Execute a GraphQL query/mutation against a Shopify store's Admin API.
 */
export async function shopifyGraphQL<T = Record<string, unknown>>(
  config: ShopifyClientConfig,
  query: string,
  variables?: Record<string, unknown>,
): Promise<ShopifyGraphQLResponse<T>> {
  const url = `https://${config.shopDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': config.accessToken,
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(30000),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new ShopifyAPIError(
      `Shopify API ${response.status}: ${text}`,
      response.status,
    )
  }

  const result = await response.json() as ShopifyGraphQLResponse<T>

  // Check for user errors in the response
  if (result.errors && result.errors.length > 0) {
    const messages = result.errors.map(e => e.message).join('; ')
    throw new ShopifyAPIError(`GraphQL errors: ${messages}`, 422)
  }

  return result
}

/**
 * Execute with automatic retry on throttle (429) and transient errors (5xx).
 * Max 3 attempts with exponential backoff.
 */
export async function shopifyGraphQLWithRetry<T = Record<string, unknown>>(
  config: ShopifyClientConfig,
  query: string,
  variables?: Record<string, unknown>,
  maxRetries = 3,
): Promise<ShopifyGraphQLResponse<T>> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await shopifyGraphQL<T>(config, query, variables)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      if (err instanceof ShopifyAPIError) {
        // Don't retry client errors (4xx) except 429
        if (err.statusCode >= 400 && err.statusCode < 500 && err.statusCode !== 429) {
          throw err
        }
      }

      // Wait before retry: 1s, 2s, 4s
      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
      }
    }
  }

  throw lastError || new Error('Shopify request failed after retries')
}

export class ShopifyAPIError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message)
    this.name = 'ShopifyAPIError'
  }
}
