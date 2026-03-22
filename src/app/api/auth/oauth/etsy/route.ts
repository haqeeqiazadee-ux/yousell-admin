/**
 * Etsy OAuth2 (PKCE) — Authorization + Callback
 *
 * Etsy requires PKCE (code_verifier/code_challenge).
 * GET:  Initiates OAuth2 PKCE flow
 * POST: Handles callback (exchanges code for tokens)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import {
  getEtsyConfig,
  exchangeCodeForToken,
  storeConnectedChannel,
} from '@/lib/engines/store-oauth';

function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

export async function GET(request: NextRequest) {
  const config = getEtsyConfig();
  const clientId = request.nextUrl.searchParams.get('client_id') || 'default';

  if (!config.clientId) {
    return NextResponse.json({ error: 'Etsy not configured' }, { status: 503 });
  }

  // Generate PKCE values
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Store verifier in state (in production, use server-side session or DB)
  const state = Buffer.from(JSON.stringify({
    clientId,
    codeVerifier,
  })).toString('base64url');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join('%20'),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return NextResponse.redirect(`${config.authorizeUrl}?${params.toString()}`);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, state } = body;

    if (!code || !state) {
      return NextResponse.json({ error: 'code and state required' }, { status: 400 });
    }

    // Decode state to get clientId and codeVerifier
    let stateData: { clientId: string; codeVerifier: string };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    } catch {
      return NextResponse.json({ error: 'Invalid state parameter' }, { status: 400 });
    }

    const config = getEtsyConfig();

    const tokens = await exchangeCodeForToken(config, code, stateData.codeVerifier);

    // Get shop info from Etsy
    let shopName = 'Unknown Shop';
    try {
      const meRes = await fetch('https://api.etsy.com/v3/application/users/me', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          'x-api-key': config.clientId,
        },
      });
      if (meRes.ok) {
        const me = await meRes.json();
        shopName = me.shop_name || me.login_name || 'Etsy Shop';
      }
    } catch {
      // Non-fatal — continue with default name
    }

    const expiresAt = tokens.expiresIn
      ? new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
      : undefined;

    const result = await storeConnectedChannel(
      stateData.clientId,
      'etsy',
      `https://www.etsy.com/shop/${shopName}`,
      tokens.accessToken,
      tokens.refreshToken,
      expiresAt,
      { shopName }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      platform: 'etsy',
      shopName,
    });
  } catch (error) {
    console.error('[Etsy OAuth] Error:', error);
    return NextResponse.json({ error: 'OAuth failed' }, { status: 500 });
  }
}
