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

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
