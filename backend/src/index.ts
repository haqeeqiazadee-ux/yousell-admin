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

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

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

app.post('/api/scan', scanLimiter, async (req, res) => {
  try {
    const { mode = 'quick', query = '', userId } = req.body;

    const job = await scanQueue.add('scan-products', {
      mode,
      query,
      userId,
    });

    res.json({ jobId: job.id, status: 'queued' });
  } catch (error) {
    console.error('Failed to queue scan:', error);
    res.status(500).json({ error: 'Failed to queue scan' });
  }
});

app.get('/api/scan/history', async (_req, res) => {
  try {
    const { data: scans, error } = await supabase
      .from('scans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ scans });
  } catch (error) {
    console.error('Failed to fetch scan history:', error);
    res.status(500).json({ error: 'Failed to fetch scan history' });
  }
});

app.get('/api/scan/:jobId', async (req, res) => {
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
    console.error('Failed to get job status:', error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

app.post('/api/scan/:jobId/cancel', scanLimiter, async (req, res) => {
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
    console.error('Failed to cancel job:', error);
    res.status(500).json({ error: 'Failed to cancel job' });
  }
});

// ── New job endpoints ────────────────────────────────────────

app.post('/api/trends', scanLimiter, async (req, res) => {
  try {
    const { query = '', userId } = req.body;
    const job = await trendQueue.add('trend-scan', { query, userId });
    res.json({ jobId: job.id, status: 'queued', queue: 'trend-scan' });
  } catch (error) {
    console.error('Failed to queue trend scan:', error);
    res.status(500).json({ error: 'Failed to queue trend scan' });
  }
});

app.post('/api/influencers/discover', scanLimiter, async (req, res) => {
  try {
    const { niche, userId } = req.body;
    if (!niche) {
      return res.status(400).json({ error: 'niche is required' });
    }
    const job = await influencerQueue.add('influencer-discovery', { niche, userId });
    res.json({ jobId: job.id, status: 'queued', queue: 'influencer-discovery' });
  } catch (error) {
    console.error('Failed to queue influencer discovery:', error);
    res.status(500).json({ error: 'Failed to queue influencer discovery' });
  }
});

app.post('/api/suppliers/discover', scanLimiter, async (req, res) => {
  try {
    const { productName, category, userId } = req.body;
    if (!productName) {
      return res.status(400).json({ error: 'productName is required' });
    }
    const job = await supplierQueue.add('supplier-discovery', { productName, category, userId });
    res.json({ jobId: job.id, status: 'queued', queue: 'supplier-discovery' });
  } catch (error) {
    console.error('Failed to queue supplier discovery:', error);
    res.status(500).json({ error: 'Failed to queue supplier discovery' });
  }
});

app.post('/api/tiktok/discover', scanLimiter, async (req, res) => {
  try {
    const { query, limit, userId } = req.body;
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
    console.error('Failed to queue TikTok discovery:', error);
    res.status(500).json({ error: 'Failed to queue TikTok discovery' });
  }
});

app.get('/api/tiktok/videos', async (req, res) => {
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
    console.error('Failed to fetch TikTok videos:', error);
    res.status(500).json({ error: 'Failed to fetch TikTok videos' });
  }
});

app.post('/api/tiktok/extract-products', scanLimiter, async (req, res) => {
  try {
    const { discoveryQuery, minViews, userId } = req.body;
    const job = await tiktokProductExtractQueue.add('tiktok-product-extract', {
      discoveryQuery,
      minViews: Number(minViews) || 10000,
      userId,
    });
    res.json({ jobId: job.id, status: 'queued', queue: 'tiktok-product-extract' });
  } catch (error) {
    console.error('Failed to queue TikTok product extraction:', error);
    res.status(500).json({ error: 'Failed to queue TikTok product extraction' });
  }
});

app.post('/api/tiktok/engagement-analysis', scanLimiter, async (req, res) => {
  try {
    const { hashtag, minVideoCount, userId } = req.body;
    const job = await tiktokEngagementQueue.add('tiktok-engagement-analysis', {
      hashtag,
      minVideoCount: Number(minVideoCount) || 3,
      userId,
    });
    res.json({ jobId: job.id, status: 'queued', queue: 'tiktok-engagement-analysis' });
  } catch (error) {
    console.error('Failed to queue TikTok engagement analysis:', error);
    res.status(500).json({ error: 'Failed to queue TikTok engagement analysis' });
  }
});

app.get('/api/tiktok/hashtag-signals', async (req, res) => {
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
    console.error('Failed to fetch hashtag signals:', error);
    res.status(500).json({ error: 'Failed to fetch hashtag signals' });
  }
});

app.post('/api/tiktok/cross-match', scanLimiter, async (req, res) => {
  try {
    const { keywords, platforms, minTikTokScore, userId } = req.body;
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
    console.error('Failed to queue TikTok cross-match:', error);
    res.status(500).json({ error: 'Failed to queue TikTok cross-match' });
  }
});

// ── Phase 2: Product Intelligence ──────────────────────────

app.post('/api/products/cluster', scanLimiter, async (req, res) => {
  try {
    const { minScore, similarityThreshold, userId } = req.body;
    const job = await productClusteringQueue.add('product-clustering', {
      minScore: Number(minScore) || 30,
      similarityThreshold: Number(similarityThreshold) || 0.3,
      userId,
    });
    res.json({ jobId: job.id, status: 'queued', queue: 'product-clustering' });
  } catch (error) {
    console.error('Failed to queue product clustering:', error);
    res.status(500).json({ error: 'Failed to queue product clustering' });
  }
});

app.get('/api/products/clusters', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('product_clusters')
      .select('*')
      .order('avg_score', { ascending: false })
      .limit(100);
    if (error) throw error;
    res.json({ clusters: data });
  } catch (error) {
    console.error('Failed to fetch clusters:', error);
    res.status(500).json({ error: 'Failed to fetch clusters' });
  }
});

app.post('/api/trends/detect', scanLimiter, async (req, res) => {
  try {
    const { platform, minClusterSize, userId } = req.body;
    const job = await trendDetectionQueue.add('trend-detection', {
      platform,
      minClusterSize: Number(minClusterSize) || 3,
      userId,
    });
    res.json({ jobId: job.id, status: 'queued', queue: 'trend-detection' });
  } catch (error) {
    console.error('Failed to queue trend detection:', error);
    res.status(500).json({ error: 'Failed to queue trend detection' });
  }
});

// ── Phase 3: Creator Intelligence ──────────────────────────

app.post('/api/creators/match', scanLimiter, async (req, res) => {
  try {
    const { productId, minProductScore, maxCreatorsPerProduct, userId } = req.body;
    const job = await creatorMatchingQueue.add('creator-matching', {
      productId,
      minProductScore: Number(minProductScore) || 60,
      maxCreatorsPerProduct: Number(maxCreatorsPerProduct) || 10,
      userId,
    });
    res.json({ jobId: job.id, status: 'queued', queue: 'creator-matching' });
  } catch (error) {
    console.error('Failed to queue creator matching:', error);
    res.status(500).json({ error: 'Failed to queue creator matching' });
  }
});

app.get('/api/creators/matches', async (req, res) => {
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
    console.error('Failed to fetch creator matches:', error);
    res.status(500).json({ error: 'Failed to fetch creator matches' });
  }
});

// ── Phase 4: Marketplace Intelligence ──────────────────────

app.post('/api/amazon/scan', scanLimiter, async (req, res) => {
  try {
    const { query, limit, userId } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });
    const job = await amazonIntelligenceQueue.add('amazon-intelligence', {
      query,
      limit: Number(limit) || 50,
      userId,
    });
    res.json({ jobId: job.id, status: 'queued', queue: 'amazon-intelligence' });
  } catch (error) {
    console.error('Failed to queue Amazon scan:', error);
    res.status(500).json({ error: 'Failed to queue Amazon scan' });
  }
});

app.post('/api/shopify/scan', scanLimiter, async (req, res) => {
  try {
    const { niche, limit, userId } = req.body;
    if (!niche) return res.status(400).json({ error: 'niche is required' });
    const job = await shopifyIntelligenceQueue.add('shopify-intelligence', {
      niche,
      limit: Number(limit) || 20,
      userId,
    });
    res.json({ jobId: job.id, status: 'queued', queue: 'shopify-intelligence' });
  } catch (error) {
    console.error('Failed to queue Shopify scan:', error);
    res.status(500).json({ error: 'Failed to queue Shopify scan' });
  }
});

// ── Phase 5: Ad Intelligence ───────────────────────────────

app.post('/api/ads/discover', scanLimiter, async (req, res) => {
  try {
    const { query, platforms, limit, userId } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });
    const job = await adIntelligenceQueue.add('ad-intelligence', {
      query,
      platforms: platforms || ['tiktok', 'facebook'],
      limit: Number(limit) || 20,
      userId,
    });
    res.json({ jobId: job.id, status: 'queued', queue: 'ad-intelligence' });
  } catch (error) {
    console.error('Failed to queue ad discovery:', error);
    res.status(500).json({ error: 'Failed to queue ad discovery' });
  }
});

app.get('/api/ads', async (req, res) => {
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
    console.error('Failed to fetch ads:', error);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
