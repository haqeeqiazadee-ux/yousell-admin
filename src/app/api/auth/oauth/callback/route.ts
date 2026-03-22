import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { encryptToken } from '@/lib/crypto'

// Exchange authorization code for tokens per channel type
async function exchangeToken(channelType: string, code: string, redirectUri: string, stateData?: Record<string, unknown>): Promise<{
  accessToken: string
  refreshToken?: string
  expiresAt?: string
  shopName?: string
  metadata?: Record<string, unknown>
}> {
  if (channelType === 'shopify') {
    const clientId = process.env.SHOPIFY_CLIENT_ID
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET
    if (!clientId || !clientSecret) throw new Error('Shopify OAuth not configured')

    // Shopify token exchange requires the shop domain from the state/query
    const shopDomain = (stateData?.shopDomain as string) || ''
    if (!shopDomain) throw new Error('Shop domain missing from OAuth state')

    const res = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    })
    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Shopify token exchange failed (${res.status}): ${errText}`)
    }
    const data = await res.json()
    return {
      accessToken: data.access_token,
      shopName: shopDomain,
      metadata: { shop_domain: shopDomain, scope: data.scope },
    }
  }

  if (channelType === 'tiktok_shop') {
    const appKey = process.env.TIKTOK_SHOP_APP_KEY
    const appSecret = process.env.TIKTOK_SHOP_APP_SECRET
    if (!appKey || !appSecret) throw new Error('TikTok Shop OAuth not configured')

    const res = await fetch('https://auth.tiktok-shops.com/api/v2/token/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_key: appKey, app_secret: appSecret, auth_code: code, grant_type: 'authorized_code' }),
    })
    const data = await res.json()
    return {
      accessToken: data.data?.access_token || '',
      refreshToken: data.data?.refresh_token,
      expiresAt: data.data?.access_token_expire_in
        ? new Date(Date.now() + data.data.access_token_expire_in * 1000).toISOString()
        : undefined,
      shopName: data.data?.shop_name,
      metadata: { shop_id: data.data?.shop_id },
    }
  }

  if (channelType === 'amazon') {
    const clientId = process.env.AMAZON_SP_CLIENT_ID
    const clientSecret = process.env.AMAZON_SP_CLIENT_SECRET
    if (!clientId || !clientSecret) throw new Error('Amazon SP-API OAuth not configured')

    const res = await fetch('https://api.amazon.com/auth/o2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })
    const data = await res.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : undefined,
    }
  }

  throw new Error(`Unsupported channel: ${channelType}`)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || ''
  const dashboardUrl = `${baseUrl}/dashboard/integrations`

  if (errorParam) {
    return NextResponse.redirect(`${dashboardUrl}?error=${encodeURIComponent(errorParam)}`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${dashboardUrl}?error=missing_params`)
  }

  try {
    // Decode state
    const stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
    const { clientId, channelType, timestamp } = stateData

    // Verify state isn't too old (15 min max)
    if (Date.now() - timestamp > 15 * 60 * 1000) {
      return NextResponse.redirect(`${dashboardUrl}?error=expired`)
    }

    const redirectUri = `${baseUrl}/api/auth/oauth/callback`
    const tokens = await exchangeToken(channelType, code, redirectUri, stateData)

    // Encrypt tokens before storing
    const admin = createAdminClient()

    await admin
      .from('connected_channels')
      .upsert({
        client_id: clientId,
        channel_type: channelType,
        channel_name: tokens.shopName || channelType,
        access_token_encrypted: encryptToken(tokens.accessToken),
        refresh_token_encrypted: tokens.refreshToken ? encryptToken(tokens.refreshToken) : null,
        token_expires_at: tokens.expiresAt || null,
        scopes: [],
        metadata: tokens.metadata || {},
        status: 'active',
        connected_at: new Date().toISOString(),
        disconnected_at: null,
      }, {
        onConflict: 'client_id,channel_type',
      })

    return NextResponse.redirect(`${dashboardUrl}?connected=${channelType}`)
  } catch (err) {
    console.error('[OAuth Callback] Error:', err)
    return NextResponse.redirect(`${dashboardUrl}?error=token_exchange_failed`)
  }
}
