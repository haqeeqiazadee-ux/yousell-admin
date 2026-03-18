import { NextRequest, NextResponse } from 'next/server'
import { authenticateClient, requireEngine } from '@/lib/auth/client-api-auth'

// OAuth configuration per channel type
const OAUTH_CONFIG: Record<string, {
  authUrl: string
  scopes: string[]
  clientIdEnv: string
  clientSecretEnv: string
}> = {
  shopify: {
    authUrl: 'https://{shop}.myshopify.com/admin/oauth/authorize',
    scopes: ['read_products', 'write_products', 'read_orders', 'write_orders'],
    clientIdEnv: 'SHOPIFY_CLIENT_ID',
    clientSecretEnv: 'SHOPIFY_CLIENT_SECRET',
  },
  tiktok_shop: {
    authUrl: 'https://auth.tiktok-shops.com/oauth/authorize',
    scopes: ['product.read', 'product.edit', 'order.read'],
    clientIdEnv: 'TIKTOK_SHOP_APP_KEY',
    clientSecretEnv: 'TIKTOK_SHOP_APP_SECRET',
  },
  amazon: {
    authUrl: 'https://sellercentral.amazon.com/apps/authorize/consent',
    scopes: [],
    clientIdEnv: 'AMAZON_SP_CLIENT_ID',
    clientSecretEnv: 'AMAZON_SP_CLIENT_SECRET',
  },
}

export async function POST(request: NextRequest) {
  try {
    const client = await authenticateClient(request)
    requireEngine(client, 'store_integration')

    const { channelType, shopDomain } = await request.json()

    if (!channelType || !OAUTH_CONFIG[channelType]) {
      return NextResponse.json({ error: 'Invalid channel type' }, { status: 400 })
    }

    const config = OAUTH_CONFIG[channelType]
    const clientId = process.env[config.clientIdEnv]

    if (!clientId) {
      return NextResponse.json({
        error: `${channelType} OAuth not configured. Set ${config.clientIdEnv} in environment.`,
        notConfigured: true,
      }, { status: 422 })
    }

    // Generate state token for CSRF protection
    const state = Buffer.from(JSON.stringify({
      clientId: client.clientId,
      channelType,
      timestamp: Date.now(),
    })).toString('base64url')

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || ''
    const redirectUri = `${baseUrl}/api/auth/oauth/callback`

    let authUrl: string

    if (channelType === 'shopify') {
      if (!shopDomain) {
        return NextResponse.json({ error: 'Shopify store domain is required' }, { status: 400 })
      }
      const cleanDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')
      authUrl = `https://${cleanDomain}/admin/oauth/authorize?client_id=${clientId}&scope=${config.scopes.join(',')}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
    } else if (channelType === 'tiktok_shop') {
      authUrl = `https://auth.tiktok-shops.com/oauth/authorize?app_key=${clientId}&state=${state}`
    } else if (channelType === 'amazon') {
      authUrl = `https://sellercentral.amazon.com/apps/authorize/consent?application_id=${clientId}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`
    } else {
      return NextResponse.json({ error: 'Channel not supported' }, { status: 400 })
    }

    return NextResponse.json({ authUrl, state })
  } catch (err) {
    console.error('[Channel Connect] Error:', err)
    const message = err instanceof Error ? err.message : 'Internal error'
    const status = message.includes('Unauthorized') || message.includes('No Authorization') ? 401 : message.includes('Not a client') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
