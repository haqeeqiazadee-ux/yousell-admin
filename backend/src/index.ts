import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { Queue } from 'bullmq';
import { connection } from './lib/queue';
import { supabase } from './lib/supabase';

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

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
