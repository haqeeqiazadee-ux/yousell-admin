import { createBrowserClient } from '@supabase/ssr'

let _client: ReturnType<typeof createBrowserClient> | null = null
function getSupabase() {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
  }
  return _client
}

/**
 * Authenticated fetch wrapper for admin API calls.
 * Automatically adds the Authorization header from the Supabase session.
 */
export async function authFetch(url: string, options?: RequestInit): Promise<Response> {
  const { data: { session } } = await getSupabase().auth.getSession()
  const headers = new Headers(options?.headers)
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }
  return fetch(url, { ...options, headers })
}
