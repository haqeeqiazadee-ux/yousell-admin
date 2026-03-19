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
 * Authenticated fetch wrapper for dashboard API calls.
 * Automatically adds the Authorization header from the Supabase session.
 * Falls back to getUser() if getSession() returns no token (e.g. after OAuth redirect).
 */
export async function authFetch(url: string, options?: RequestInit): Promise<Response> {
  const supabase = getSupabase()
  let token: string | undefined

  // Try getSession first (reads from cookies, no server round-trip)
  const { data: { session } } = await supabase.auth.getSession()
  token = session?.access_token

  // If no session found, try refreshing — handles cases where cookies
  // were set by the server but the browser client hasn't picked them up yet
  if (!token) {
    const { data: { session: refreshed } } = await supabase.auth.refreshSession()
    token = refreshed?.access_token
  }

  const headers = new Headers(options?.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return fetch(url, { ...options, headers })
}
