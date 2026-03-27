import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { Queue } from 'bullmq';
import { connection } from './lib/queue';
import { supabase } from './lib/supabase';
import { QUEUES } from './jobs/types';

const app = express();
const PORT = process.env.PORT || 4000;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(helmet());

// BUG-029 fix: Support multiple CORS origins (production + Netlify deploy previews)
const ALLOWED_ORIGINS = [
  FRONTEND_URL,
  ...(process.env.CORS_ALLOWED_ORIGINS?.split(',').map(s => s.trim()).filter(Boolean) || []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, health checks)
    if (!origin) return callback(null, true);
    // Check exact match or Netlify preview pattern
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      /^https:\/\/[a-z0-9-]+--[a-z0-9-]+\.netlify\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

// BUG-030 fix: Sanitize error logs to prevent API key leakage
function sanitizeError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  // Redact anything that looks like an API key, token, or secret
  return msg.replace(/(?:key|token|secret|password|authorization)[=:\s]+\S+/gi, '[REDACTED]')
    .replace(/(?:sk|pk|api|bearer)[-_][a-zA-Z0-9]{20,}/g, '[REDACTED]');
}

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const scanLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many scan requests, please try again later' },
});

app.use(generalLimiter);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.path === '/health') {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice(7);

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: 'Server authentication not configured' });
  }

  try {
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const { data: { user }, error } = await authClient.auth.getUser();
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    (req as any).user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

// BUG-016 fix: RBAC middleware — restrict admin-only endpoints to admin/super_admin roles
async function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Use the service-role client to bypass RLS and check role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return res.status(403).json({ error: 'Profile not found' });
    }

    if (profile.role !== 'admin' && profile.role !== 'super_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    (req as any).userRole = profile.role;
    next();
  } catch {
    return res.status(403).json({ error: 'Authorization check failed' });
  }
}

app.use(authMiddleware);

const scanQueue = new Queue('scan', { connection });
const trendQueue = new Queue(QUEUES.TREND_SCAN, { connection });
const influencerQueue = new Queue(QUEUES.INFLUENCER_DISCOVERY, { connection });
const supplierQueue = new Queue(QUEUES.SUPPLIER_DISCOVERY, { connection });
const tiktokDiscoveryQueue = new Queue(QUEUES.TIKTOK_DISCOVERY, { connection });
const tiktokProductExtractQueue = new Queue(QUEUES.TIKTOK_PRODUCT_EXTRACT, { connection });
const tiktokEngagementQueue = new Queue(QUEUES.TIKTOK_ENGAGEMENT_ANALYSIS, { connection });
const tiktokCrossMatchQueue = new Queue(QUEUES.TIKTOK_CROSS_MATCH, { connection });
const productClusteringQueue = new Queue(QUEUES.PRODUCT_CLUSTERING, { connection });
const trendDetectionQueue = new Queue(QUEUES.TREND_DETECTION, { connection });
const creatorMatchingQueue = new Queue(QUEUES.CREATOR_MATCHING, { connection });
const amazonIntelligenceQueue = new Queue(QUEUES.AMAZON_INTELLIGENCE, { connection });
const shopifyIntelligenceQueue = new Queue(QUEUES.SHOPIFY_INTELLIGENCE, { connection });
const adIntelligenceQueue = new Queue(QUEUES.AD_INTELLIGENCE, { connection });

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/scan', scanLimiter, requireAdmin, async (req, res) => {
  try {
    const { mode = 'quick', query = '' } = req.body;
    const userId = (req as any).user.id; // BUG-028 fix: use authenticated user

    const job = await scanQueue.add('scan-products', {
      mode,
      query,
      userId,
    });

    res.json({ jobId: job.id, status: 'queued' });
  } catch (error) {
    console.error('Failed to queue scan:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to queue scan' });
  }
});

app.get('/api/scan/history', requireAdmin, async (_req, res) => {
  try {
    const { data: scans, error } = await supabase
      .from('scan_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ scans });
  } catch (error) {
    console.error('Failed to fetch scan history:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to fetch scan history' });
  }
});

app.get('/api/scan/:jobId', requireAdmin, async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await scanQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress;

    res.json({
      jobId: job.id,
      status: state,
      progress,
      data: state === 'completed' ? job.returnvalue : null,
    });
  } catch (error) {
    console.error('Failed to get job status:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

app.post('/api/scan/:jobId/cancel', scanLimiter, requireAdmin, async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await scanQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    if (state === 'active') {
      await job.moveToFailed(new Error('Cancelled by user'), 'cancel');
    } else if (state === 'waiting' || state === 'delayed') {
      await job.remove();
    }

    res.json({ status: 'cancelled' });
  } catch (error) {
    console.error('Failed to cancel job:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to cancel job' });
  }
});

// ── New job endpoints ────────────────────────────────────────

app.post('/api/trends', scanLimiter, requireAdmin, async (req, res) => {
  try {
    const { query = '' } = req.body;
    const userId = (req as any).user.id;
    const job = await trendQueue.add('trend-scan', { query, userId });
    res.json({ jobId: job.id, status: 'queued', queue: 'trend-scan' });
  } catch (error) {
    console.error('Failed to queue trend scan:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to queue trend scan' });
  }
});

app.post('/api/influencers/discover', scanLimiter, requireAdmin, async (req, res) => {
  try {
    const { niche } = req.body;
    const userId = (req as any).user.id;
    if (!niche) {
      return res.status(400).json({ error: 'niche is required' });
    }
    const job = await influencerQueue.add('influencer-discovery', { niche, userId });
    res.json({ jobId: job.id, status: 'queued', queue: 'influencer-discovery' });
  } catch (error) {
    console.error('Failed to queue influencer discovery:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to queue influencer discovery' });
  }
});

app.post('/api/suppliers/discover', scanLimiter, requireAdmin, async (req, res) => {
  try {
    const { productName, category } = req.body;
    const userId = (req as any).user.id;
    if (!productName) {
      return res.status(400).json({ error: 'productName is required' });
    }
    const job = await supplierQueue.add('supplier-discovery', { productName, category, userId });
    res.json({ jobId: job.id, status: 'queued', queue: 'supplier-discovery' });
  } catch (error) {
    console.error('Failed to queue supplier discovery:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to queue supplier discovery' });
  }
});

app.post('/api/tiktok/discover', scanLimiter, requireAdmin, async (req, res) => {
  try {
    const { query, limit } = req.body;
    const userId = (req as any).user.id;
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }
    const job = await tiktokDiscoveryQueue.add('tiktok-discovery', {
      query,
      limit: Math.min(Number(limit) || 30, 100),
      userId,
    });
    res.json({ jobId: job.id, status: 'queued', queue: 'tiktok-discovery' });
  } catch (error) {
    console.error('Failed to queue TikTok discovery:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to queue TikTok discovery' });
  }
});

app.get('/api/tiktok/videos', requireAdmin, async (req, res) => {
  try {
    const { query, limit = '50', has_product } = req.query;
    let q = supabase
      .from('tiktok_videos')
      .select('*')
      .order('views', { ascending: false })
      .limit(Math.min(Number(limit), 200));

    if (query) {
      q = q.eq('discovery_query', String(query));
    }
    if (has_product === 'true') {
      q = q.eq('has_product_link', true);
    }

    const { data, error } = await q;
    if (error) throw error;
    res.json({ videos: data });
  } catch (error) {
    console.error('Failed to fetch TikTok videos:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to fetch TikTok videos' });
  }
});

app.post('/api/tiktok/extract-products', scanLimiter, requireAdmin, async (req, res) => {
  try {
    const { discoveryQuery, minViews } = req.body;
    const userId = (req as any).user.id;
    const job = await tiktokProductExtractQueue.add('tiktok-product-extract', {
      discoveryQuery,
      minViews: Number(minViews) || 10000,
      userId,
    });
    res.json({ jobId: job.id, status: 'queued', queue: 'tiktok-product-extract' });
  } catch (error) {
    console.error('Failed to queue TikTok product extraction:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to queue TikTok product extraction' });
  }
});

app.post('/api/tiktok/engagement-analysis', scanLimiter, requireAdmin, async (req, res) => {
  try {
    const { hashtag, minVideoCount } = req.body;
    const userId = (req as any).user.id;
    const job = await tiktokEngagementQueue.add('tiktok-engagement-analysis', {
      hashtag,
      minVideoCount: Number(minVideoCount) || 3,
      userId,
    });
    res.json({ jobId: job.id, status: 'queued', queue: 'tiktok-engagement-analysis' });
  } catch (error) {
    console.error('Failed to queue TikTok engagement analysis:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to queue TikTok engagement analysis' });
  }
});

app.get('/api/tiktok/hashtag-signals', requireAdmin, async (req, res) => {
  try {
    const { hashtag, limit = '50' } = req.query;
    let q = supabase
      .from('tiktok_hashtag_signals')
      .select('*')
      .order('view_velocity', { ascending: false })
      .limit(Math.min(Number(limit), 200));

    if (hashtag) {
      q = q.eq('hashtag', String(hashtag));
    }

    const { data, error } = await q;
    if (error) throw error;
    res.json({ signals: data });
  } catch (error) {
    console.error('Failed to fetch hashtag signals:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to fetch hashtag signals' });
  }
});

app.post('/api/tiktok/cross-match', scanLimiter, requireAdmin, async (req, res) => {
  try {
    const { keywords, platforms, minTikTokScore } = req.body;
    const userId = (req as any).user.id;
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ error: 'keywords array is required' });
    }
    const job = await tiktokCrossMatchQueue.add('tiktok-cross-match', {
      keywords: keywords.slice(0, 20),
      platforms: platforms || ['amazon', 'shopify'],
      minTikTokScore: Number(minTikTokScore) || 40,
      userId,
    });
    res.json({ jobId: job.id, status: 'queued', queue: 'tiktok-cross-match' });
  } catch (error) {
    console.error('Failed to queue TikTok cross-match:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to queue TikTok cross-match' });
  }
});

// ── Phase 2: Product Intelligence ──────────────────────────

app.post('/api/products/cluster', scanLimiter, requireAdmin, async (req, res) => {
  try {
    const { minScore, similarityThreshold } = req.body;
    const userId = (req as any).user.id;
    const job = await productClusteringQueue.add('product-clustering', {
      minScore: Number(minScore) || 30,
      similarityThreshold: Number(similarityThreshold) || 0.3,
      userId,
    });
    res.json({ jobId: job.id, status: 'queued', queue: 'product-clustering' });
  } catch (error) {
    console.error('Failed to queue product clustering:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to queue product clustering' });
  }
});

app.get('/api/products/clusters', requireAdmin, async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('product_clusters')
      .select('*')
      .order('avg_score', { ascending: false })
      .limit(100);
    if (error) throw error;
    res.json({ clusters: data });
  } catch (error) {
    console.error('Failed to fetch clusters:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to fetch clusters' });
  }
});

app.post('/api/trends/detect', scanLimiter, requireAdmin, async (req, res) => {
  try {
    const { platform, minClusterSize } = req.body;
    const userId = (req as any).user.id;
    const job = await trendDetectionQueue.add('trend-detection', {
      platform,
      minClusterSize: Number(minClusterSize) || 3,
      userId,
    });
    res.json({ jobId: job.id, status: 'queued', queue: 'trend-detection' });
  } catch (error) {
    console.error('Failed to queue trend detection:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to queue trend detection' });
  }
});

// ── Phase 3: Creator Intelligence ──────────────────────────

app.post('/api/creators/match', scanLimiter, requireAdmin, async (req, res) => {
  try {
    const { productId, minProductScore, maxCreatorsPerProduct } = req.body;
    const userId = (req as any).user.id;
    const job = await creatorMatchingQueue.add('creator-matching', {
      productId,
      minProductScore: Number(minProductScore) || 60,
      maxCreatorsPerProduct: Number(maxCreatorsPerProduct) || 10,
      userId,
    });
    res.json({ jobId: job.id, status: 'queued', queue: 'creator-matching' });
  } catch (error) {
    console.error('Failed to queue creator matching:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to queue creator matching' });
  }
});

app.get('/api/creators/matches', requireAdmin, async (req, res) => {
  try {
    const { product_id } = req.query;
    let query = supabase
      .from('creator_product_matches')
      .select('*, products(title, source, price), influencers(username, platform, followers, engagement_rate)')
      .order('match_score', { ascending: false })
      .limit(100);

    if (product_id) query = query.eq('product_id', String(product_id));

    const { data, error } = await query;
    if (error) throw error;
    res.json({ matches: data });
  } catch (error) {
    console.error('Failed to fetch creator matches:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to fetch creator matches' });
  }
});

// ── Phase 4: Marketplace Intelligence ──────────────────────

app.post('/api/amazon/scan', scanLimiter, requireAdmin, async (req, res) => {
  try {
    const { query, limit } = req.body;
    const userId = (req as any).user.id;
    if (!query) return res.status(400).json({ error: 'query is required' });
    const job = await amazonIntelligenceQueue.add('amazon-intelligence', {
      query,
      limit: Number(limit) || 50,
      userId,
    });
    res.json({ jobId: job.id, status: 'queued', queue: 'amazon-intelligence' });
  } catch (error) {
    console.error('Failed to queue Amazon scan:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to queue Amazon scan' });
  }
});

app.post('/api/shopify/scan', scanLimiter, requireAdmin, async (req, res) => {
  try {
    const { niche, limit } = req.body;
    const userId = (req as any).user.id;
    if (!niche) return res.status(400).json({ error: 'niche is required' });
    const job = await shopifyIntelligenceQueue.add('shopify-intelligence', {
      niche,
      limit: Number(limit) || 20,
      userId,
    });
    res.json({ jobId: job.id, status: 'queued', queue: 'shopify-intelligence' });
  } catch (error) {
    console.error('Failed to queue Shopify scan:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to queue Shopify scan' });
  }
});

// ── Phase 5: Ad Intelligence ───────────────────────────────

app.post('/api/ads/discover', scanLimiter, requireAdmin, async (req, res) => {
  try {
    const { query, platforms, limit } = req.body;
    const userId = (req as any).user.id;
    if (!query) return res.status(400).json({ error: 'query is required' });
    const job = await adIntelligenceQueue.add('ad-intelligence', {
      query,
      platforms: platforms || ['tiktok', 'facebook'],
      limit: Number(limit) || 20,
      userId,
    });
    res.json({ jobId: job.id, status: 'queued', queue: 'ad-intelligence' });
  } catch (error) {
    console.error('Failed to queue ad discovery:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to queue ad discovery' });
  }
});

app.get('/api/ads', requireAdmin, async (req, res) => {
  try {
    const { platform, scaling_only, limit: lim = '50' } = req.query;
    let query = supabase
      .from('ads')
      .select('*')
      .order('impressions', { ascending: false })
      .limit(Math.min(Number(lim), 200));

    if (platform) query = query.eq('platform', String(platform));
    if (scaling_only === 'true') query = query.eq('is_scaling', true);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ ads: data });
  } catch (error) {
    console.error('Failed to fetch ads:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

// ── Content Distribution ─────────────────────────────────

const distributionQueue = new Queue(QUEUES.DISTRIBUTION_QUEUE, { connection });
const pushToShopifyQueue = new Queue(QUEUES.PUSH_TO_SHOPIFY, { connection });
const pushToTiktokQueue = new Queue(QUEUES.PUSH_TO_TIKTOK, { connection });
const pushToAmazonQueue = new Queue(QUEUES.PUSH_TO_AMAZON, { connection });

app.post('/api/content/distribute', async (req, res) => {
  try {
    const { content_id, channels, scheduled_at, client_id } = req.body;
    if (!content_id || !client_id) {
      return res.status(400).json({ error: 'content_id and client_id are required' });
    }
    const job = await distributionQueue.add('distribution', {
      content_id,
      channels: channels || ['ayrshare'],
      scheduled_at,
      client_id,
    }, {
      delay: scheduled_at ? Math.max(0, new Date(scheduled_at).getTime() - Date.now()) : 0,
    });
    res.json({ jobId: job.id, status: 'queued', queue: 'distribution-queue' });
  } catch (error) {
    console.error('Failed to queue distribution:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to queue distribution' });
  }
});

// ── Store Push Endpoints ─────────────────────────────────

app.post('/api/shopify/push', async (req, res) => {
  try {
    const { product_id, client_id } = req.body;
    if (!product_id || !client_id) {
      return res.status(400).json({ error: 'product_id and client_id required' });
    }

    // Create shop_products record
    const { data: shopProduct, error } = await supabase
      .from('shop_products')
      .insert({
        product_id,
        client_id,
        channel_type: 'shopify',
        push_status: 'pending',
      })
      .select('id')
      .single();

    if (error) throw error;

    const job = await pushToShopifyQueue.add('push-to-shopify', {
      product_id,
      client_id,
      shop_product_id: shopProduct.id,
    });

    res.json({ jobId: job.id, shop_product_id: shopProduct.id, status: 'queued' });
  } catch (error) {
    console.error('Failed to queue Shopify push:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to queue Shopify push' });
  }
});

app.post('/api/tiktok/push', async (req, res) => {
  try {
    const { product_id, client_id } = req.body;
    if (!product_id || !client_id) {
      return res.status(400).json({ error: 'product_id and client_id required' });
    }

    const { data: shopProduct, error } = await supabase
      .from('shop_products')
      .insert({
        product_id,
        client_id,
        channel_type: 'tiktok-shop',
        push_status: 'pending',
      })
      .select('id')
      .single();

    if (error) throw error;

    const job = await pushToTiktokQueue.add('push-to-tiktok', {
      product_id,
      client_id,
      shop_product_id: shopProduct.id,
    });

    res.json({ jobId: job.id, shop_product_id: shopProduct.id, status: 'queued' });
  } catch (error) {
    console.error('Failed to queue TikTok push:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to queue TikTok push' });
  }
});

app.post('/api/amazon/push', async (req, res) => {
  try {
    const { product_id, client_id } = req.body;
    if (!product_id || !client_id) {
      return res.status(400).json({ error: 'product_id and client_id required' });
    }

    const { data: shopProduct, error } = await supabase
      .from('shop_products')
      .insert({
        product_id,
        client_id,
        channel_type: 'amazon',
        push_status: 'pending',
      })
      .select('id')
      .single();

    if (error) throw error;

    const job = await pushToAmazonQueue.add('push-to-amazon', {
      product_id,
      client_id,
      shop_product_id: shopProduct.id,
    });

    res.json({ jobId: job.id, shop_product_id: shopProduct.id, status: 'queued' });
  } catch (error) {
    console.error('Failed to queue Amazon push:', sanitizeError(error));
    res.status(500).json({ error: 'Failed to queue Amazon push' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
