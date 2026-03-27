/**
 * YOUSELL Store OAuth — WooCommerce, BigCommerce, Etsy
 *
 * Shared OAuth helpers for third-party store platforms.
 * Tokens are stored encrypted in connected_channels table.
 *
 * @see docs/v9/V9_Engine_Task_Breakdown.md — Engine 10 P2 tasks
 */

import { createClient } from '@supabase/supabase-js';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { engineLogger } from '@/lib/logger';

const log = engineLogger('store-oauth');

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

// ─── Token Encryption ──────────────────────────────────────

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

export function encryptToken(token: string): string {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptToken(encryptedToken: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ─── OAuth Config ──────────────────────────────────────────

export interface OAuthConfig {
  platform: string;
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  redirectUri: string;
}

export function getWooCommerceConfig(): OAuthConfig {
  return {
    platform: 'woocommerce',
    clientId: process.env.WOOCOMMERCE_CLIENT_ID || '',
    clientSecret: process.env.WOOCOMMERCE_CLIENT_SECRET || '',
    authorizeUrl: '', // WooCommerce uses REST API keys, not OAuth2
    tokenUrl: '',
    scopes: ['read_write'],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/woocommerce/callback`,
  };
}

export function getBigCommerceConfig(): OAuthConfig {
  return {
    platform: 'bigcommerce',
    clientId: process.env.BIGCOMMERCE_CLIENT_ID || '',
    clientSecret: process.env.BIGCOMMERCE_CLIENT_SECRET || '',
    authorizeUrl: 'https://login.bigcommerce.com/oauth2/authorize',
    tokenUrl: 'https://login.bigcommerce.com/oauth2/token',
    scopes: ['store_v2_products', 'store_v2_orders', 'store_inventory'],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/bigcommerce/callback`,
  };
}

export function getEtsyConfig(): OAuthConfig {
  return {
    platform: 'etsy',
    clientId: process.env.ETSY_API_KEY || '',
    clientSecret: process.env.ETSY_SECRET || '',
    authorizeUrl: 'https://www.etsy.com/oauth/connect',
    tokenUrl: 'https://api.etsy.com/v3/public/oauth/token',
    scopes: ['listings_r', 'listings_w', 'transactions_r', 'shops_r'],
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/etsy/callback`,
  };
}

// ─── Token Exchange ────────────────────────────────────────

export async function exchangeCodeForToken(
  config: OAuthConfig,
  code: string,
  codeVerifier?: string
): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number; storeHash?: string }> {
  const body: Record<string, string> = {
    grant_type: 'authorization_code',
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: config.redirectUri,
  };

  if (codeVerifier) {
    body.code_verifier = codeVerifier;
  }

  log.info('Exchanging OAuth code for token', { provider: config.tokenUrl.includes('bigcommerce') ? 'bigcommerce' : config.tokenUrl.includes('etsy') ? 'etsy' : 'woocommerce' });

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    log.error('Token exchange failed', { status: response.status, error: text });
    throw new Error(`Token exchange failed: ${response.status} — ${text}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    storeHash: data.context?.replace('stores/', ''), // BigCommerce specific
  };
}

// ─── Store Connected Channel ───────────────────────────────

export async function storeConnectedChannel(
  clientId: string,
  platform: string,
  storeUrl: string,
  accessToken: string,
  refreshToken?: string,
  expiresAt?: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const supabase = getServiceClient();

  const { error } = await supabase
    .from('connected_channels')
    .upsert({
      client_id: clientId,
      platform,
      store_url: storeUrl,
      access_token: encryptToken(accessToken),
      refresh_token: refreshToken ? encryptToken(refreshToken) : null,
      token_expires_at: expiresAt,
      status: 'connected',
      metadata,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'client_id,platform' });

  if (error) {
    console.error(`[Store OAuth] Failed to store ${platform} channel:`, error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
