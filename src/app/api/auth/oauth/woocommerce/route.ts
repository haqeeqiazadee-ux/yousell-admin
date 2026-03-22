/**
 * WooCommerce OAuth — REST API Key Connection
 *
 * WooCommerce uses REST API keys (not OAuth2 code flow).
 * POST: Store WooCommerce API credentials for a client.
 * GET:  Redirect to WooCommerce key generation page.
 */

import { NextRequest, NextResponse } from 'next/server';
import { storeConnectedChannel, encryptToken } from '@/lib/engines/store-oauth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, storeUrl, consumerKey, consumerSecret } = body;

    if (!clientId || !storeUrl || !consumerKey || !consumerSecret) {
      return NextResponse.json(
        { error: 'clientId, storeUrl, consumerKey, and consumerSecret required' },
        { status: 400 }
      );
    }

    // Validate store URL format
    const normalizedUrl = storeUrl.replace(/\/+$/, '');

    // Test the credentials by calling WooCommerce REST API
    const testUrl = `${normalizedUrl}/wp-json/wc/v3/system_status`;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const testRes = await fetch(testUrl, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!testRes.ok) {
      return NextResponse.json(
        { error: 'WooCommerce credentials invalid — could not connect to store' },
        { status: 401 }
      );
    }

    // Store the credentials (encrypted)
    const result = await storeConnectedChannel(
      clientId,
      'woocommerce',
      normalizedUrl,
      consumerKey, // Stored as access_token (encrypted)
      consumerSecret, // Stored as refresh_token (encrypted — it's the secret key)
      undefined,
      { apiVersion: 'v3', connectionMethod: 'rest_api_keys' }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      platform: 'woocommerce',
      storeUrl: normalizedUrl,
    });
  } catch (error) {
    console.error('[WooCommerce OAuth] Error:', error);
    return NextResponse.json({ error: 'Connection failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const storeUrl = request.nextUrl.searchParams.get('store_url');
  if (!storeUrl) {
    return NextResponse.json({ error: 'store_url required' }, { status: 400 });
  }

  // Redirect to WooCommerce REST API key generation
  const callbackUrl = encodeURIComponent(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/woocommerce`
  );
  const authUrl = `${storeUrl}/wc-auth/v1/authorize?app_name=YouSell&scope=read_write&user_id=1&return_url=${callbackUrl}&callback_url=${callbackUrl}`;

  return NextResponse.redirect(authUrl);
}
