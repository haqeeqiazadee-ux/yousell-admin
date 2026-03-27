/**
 * BigCommerce OAuth2 — Authorization + Callback
 *
 * GET:  Initiates OAuth2 flow (redirects to BigCommerce)
 * POST: Handles callback (exchanges code for tokens)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getBigCommerceConfig,
  exchangeCodeForToken,
  storeConnectedChannel,
} from '@/lib/engines/store-oauth';

export async function GET(request: NextRequest) {
  const config = getBigCommerceConfig();
  const clientId = request.nextUrl.searchParams.get('client_id');
  const state = clientId || 'default';

  if (!config.clientId) {
    return NextResponse.json({ error: 'BigCommerce not configured' }, { status: 503 });
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    state,
  });

  return NextResponse.redirect(`${config.authorizeUrl}?${params.toString()}`);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, state } = body;

    if (!code) {
      return NextResponse.json({ error: 'Authorization code required' }, { status: 400 });
    }

    const config = getBigCommerceConfig();

    const tokens = await exchangeCodeForToken(config, code);

    // Store the connection
    const clientId = state || 'default';
    const storeHash = tokens.storeHash || 'unknown';
    const storeUrl = `https://api.bigcommerce.com/stores/${storeHash}`;

    const expiresAt = tokens.expiresIn
      ? new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
      : undefined;

    const result = await storeConnectedChannel(
      clientId,
      'bigcommerce',
      storeUrl,
      tokens.accessToken,
      tokens.refreshToken,
      expiresAt,
      { storeHash }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      platform: 'bigcommerce',
      storeHash,
    });
  } catch (error) {
    console.error('[BigCommerce OAuth] Error:', error);
    return NextResponse.json({ error: 'OAuth failed' }, { status: 500 });
  }
}
