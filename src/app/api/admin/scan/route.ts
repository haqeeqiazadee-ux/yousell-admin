import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { authenticateAdmin } from '@/lib/auth/admin-api-auth';
import { runLiveDiscoveryScan } from '@/lib/engines/discovery';

// ── Pre-flight: verify critical env vars ──

function checkEnvVars(): string | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return 'NEXT_PUBLIC_SUPABASE_URL is not set. Add it to Netlify env vars and redeploy.';
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return 'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to Netlify env vars and redeploy.';
  return null;
}

// ── Mock product generation ──

type Platform = 'tiktok' | 'amazon' | 'shopify' | 'pinterest' | 'digital' | 'ai_affiliate' | 'physical_affiliate';

const PLATFORM_TEMPLATES: Record<Platform, Array<{ name: string; category: string; tags: string[] }>> = {
  tiktok: [
    { name: 'LED Sunset Projection Lamp', category: 'Home Decor', tags: ['viral', 'lighting', 'aesthetic'] },
    { name: 'Cloud Shaped Humidifier', category: 'Home & Garden', tags: ['trending', 'humidifier', 'cute'] },
    { name: 'Magnetic Phone Mount for Car', category: 'Accessories', tags: ['car', 'phone', 'magsafe'] },
    { name: 'Portable Blender USB Rechargeable', category: 'Kitchen', tags: ['health', 'smoothie', 'portable'] },
    { name: 'Star Projector Night Light', category: 'Home Decor', tags: ['bedroom', 'galaxy', 'ambiance'] },
    { name: 'Acupressure Mat and Pillow Set', category: 'Health & Wellness', tags: ['pain relief', 'relaxation', 'self-care'] },
    { name: 'Mini Waffle Maker', category: 'Kitchen Appliances', tags: ['breakfast', 'compact', 'gift'] },
    { name: 'Reusable Ice Cube Stones', category: 'Kitchen', tags: ['drinks', 'eco-friendly', 'whiskey'] },
  ],
  amazon: [
    { name: 'Ergonomic Laptop Stand Adjustable', category: 'Office', tags: ['WFH', 'posture', 'aluminum'] },
    { name: 'Smart Water Bottle with Temperature Display', category: 'Fitness', tags: ['hydration', 'LED', 'insulated'] },
    { name: 'Collapsible Silicone Food Containers Set', category: 'Kitchen', tags: ['meal prep', 'space-saving', 'BPA-free'] },
    { name: 'Wireless Earbuds with Active Noise Cancellation', category: 'Electronics', tags: ['audio', 'ANC', 'bluetooth'] },
    { name: 'UV Phone Sanitizer Box', category: 'Electronics', tags: ['hygiene', 'UV-C', 'wireless charging'] },
    { name: 'Bamboo Desk Organizer with Charging Station', category: 'Office', tags: ['organization', 'sustainable', 'USB'] },
    { name: 'Electric Milk Frother Handheld', category: 'Kitchen', tags: ['coffee', 'latte', 'battery-powered'] },
    { name: 'Resistance Bands Set with Door Anchor', category: 'Fitness', tags: ['workout', 'home gym', 'portable'] },
  ],
  shopify: [
    { name: 'Personalized Pet Portrait Canvas', category: 'Custom Gifts', tags: ['pets', 'art', 'personalized'] },
    { name: 'Minimalist Leather Wallet RFID Blocking', category: 'Accessories', tags: ['slim', 'RFID', 'genuine leather'] },
    { name: 'Organic Cotton Baby Swaddle Blankets', category: 'Baby', tags: ['organic', 'newborn', 'breathable'] },
    { name: 'Custom Name Necklace Gold Plated', category: 'Jewelry', tags: ['personalized', 'gift', '14k'] },
    { name: 'Handmade Soy Candle Gift Set', category: 'Home', tags: ['aromatherapy', 'eco-friendly', 'gift set'] },
    { name: 'Yoga Mat with Alignment Lines', category: 'Fitness', tags: ['non-slip', 'eco-friendly', 'thick'] },
  ],
  pinterest: [
    { name: 'Macrame Wall Hanging Kit DIY', category: 'Crafts', tags: ['DIY', 'boho', 'handmade'] },
    { name: 'Aesthetic Room Decor LED Neon Sign', category: 'Home Decor', tags: ['neon', 'wall art', 'Instagram'] },
    { name: 'Dried Flower Bouquet Arrangement', category: 'Home Decor', tags: ['flowers', 'minimalist', 'natural'] },
    { name: 'Ceramic Vase Set Modern Minimalist', category: 'Home Decor', tags: ['Scandinavian', 'pottery', 'display'] },
  ],
  digital: [
    { name: 'Notion Business Dashboard Template', category: 'Templates', tags: ['Notion', 'productivity', 'SaaS'] },
    { name: 'Instagram Reels Content Calendar', category: 'Social Media', tags: ['content plan', 'Canva', 'marketing'] },
    { name: 'Budget Planner Spreadsheet Google Sheets', category: 'Finance', tags: ['budgeting', 'spreadsheet', 'personal finance'] },
  ],
  ai_affiliate: [
    { name: 'Jasper AI - AI Writing Assistant', category: 'AI Tools', tags: ['copywriting', 'AI', 'marketing'] },
    { name: 'Midjourney Pro Subscription', category: 'AI Art', tags: ['image generation', 'AI art', 'design'] },
    { name: 'Synthesia - AI Video Platform', category: 'AI Video', tags: ['video', 'avatars', 'AI presenter'] },
  ],
  physical_affiliate: [
    { name: 'Standing Desk Converter Adjustable', category: 'Office', tags: ['ergonomic', 'height adjustable', 'monitor riser'] },
    { name: 'Air Purifier with HEPA Filter', category: 'Home', tags: ['clean air', 'allergy', 'quiet'] },
    { name: 'Robot Vacuum with Mapping Technology', category: 'Home', tags: ['smart home', 'automated', 'cleaning'] },
  ],
};

const SCAN_PLATFORMS: Record<string, Platform[]> = {
  quick: ['tiktok', 'amazon'],
  full: ['tiktok', 'amazon', 'shopify', 'pinterest', 'digital', 'ai_affiliate', 'physical_affiliate'],
  client: ['tiktok', 'amazon'],
};

const PRODUCTS_PER_PLATFORM: Record<string, number> = {
  quick: 5,
  full: 4,
  client: 3,
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

const PRICE_RANGES: Record<Platform, [number, number]> = {
  tiktok: [8.99, 49.99],
  amazon: [12.99, 199.99],
  shopify: [14.99, 89.99],
  pinterest: [9.99, 69.99],
  digital: [4.99, 97.00],
  ai_affiliate: [12.00, 99.00],
  physical_affiliate: [29.99, 599.99],
};

function generateProducts(mode: string) {
  const platforms = SCAN_PLATFORMS[mode] || SCAN_PLATFORMS.quick;
  const perPlatform = PRODUCTS_PER_PLATFORM[mode] || 5;
  const products: Array<Record<string, unknown>> = [];

  for (const platform of platforms) {
    const templates = PLATFORM_TEMPLATES[platform];
    const count = Math.min(perPlatform, templates.length);
    const shuffled = [...templates].sort(() => Math.random() - 0.5).slice(0, count);

    for (const t of shuffled) {
      const trendScore = randomInt(30, 100);
      const viralScore = randomInt(20, 95);
      const profitScore = randomInt(25, 90);
      const finalScore = Math.round(trendScore * 0.40 + viralScore * 0.35 + profitScore * 0.25);
      const [minP, maxP] = PRICE_RANGES[platform];
      const price = randomFloat(minP, maxP);
      const cost = randomFloat(price * 0.2, price * 0.5);
      const margin = price > 0 ? Math.round(((price - cost) / price) * 100) : 0;

      const stages = ['emerging', 'rising', 'exploding', 'saturated'] as const;
      const stageIdx = trendScore >= 80 ? 2 : trendScore >= 60 ? 1 : trendScore >= 40 ? 0 : 3;

      products.push({
        title: t.name,
        description: `Trending ${t.category.toLowerCase()} product discovered on ${platform}. ${t.tags.map(tag => `#${tag}`).join(' ')}`,
        platform,
        status: 'draft',
        category: t.category,
        price,
        cost,
        margin_percent: margin,
        score_overall: finalScore,
        score_demand: randomInt(30, 95),
        score_competition: randomInt(20, 85),
        score_margin: profitScore,
        score_trend: trendScore,
        image_url: `https://picsum.photos/seed/${Math.random().toString(36).slice(2, 8)}/400/400`,
        channel: `scan-${mode}`,
        tags: t.tags,
        final_score: finalScore,
        trend_score: trendScore,
        viral_score: viralScore,
        profit_score: profitScore,
        trend_stage: stages[stageIdx],
        external_url: `https://example.com/${platform}/${t.name.toLowerCase().replace(/\s+/g, '-')}`,
      });
    }
  }

  return products;
}

// ── Self-contained scan (no Express backend needed) ──

async function runDirectScan(mode: string, userId: string, clientId?: string) {
  const admin = createAdminClient();

  // 1. Create scan_history record
  const { data: scan, error: scanErr } = await admin
    .from('scan_history')
    .insert({
      scan_mode: mode,
      status: 'running',
      progress: 0,
      triggered_by: userId,
      ...(clientId ? { client_id: clientId } : {}),
      cost_estimate: mode === 'full' ? 0.50 : mode === 'client' ? 0.30 : 0.10,
    })
    .select()
    .single();

  if (scanErr || !scan) {
    throw new Error(`scan_history insert failed: ${scanErr?.message || 'no data returned'}`);
  }

  const scanId = scan.id;

  try {
    // 2. Generate products
    const products = generateProducts(mode);

    // 3. Insert products into DB
    let insertedCount = 0;
    let productError: string | null = null;
    if (products.length > 0) {
      const { data: inserted, error: insertErr } = await admin
        .from('products')
        .insert(products.map(p => ({ ...p, created_by: userId })))
        .select('id, final_score');

      if (insertErr) {
        productError = insertErr.message;
        console.error('Product insert error:', insertErr);
      } else {
        insertedCount = inserted?.length ?? 0;
      }
    }

    const hotCount = products.filter(p => (p.final_score as number) >= 80).length;

    // 4. Mark completed (even if product insert had errors, the scan itself completed)
    await admin
      .from('scan_history')
      .update({
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString(),
        products_found: insertedCount,
        hot_products: hotCount,
      })
      .eq('id', scanId);

    return { scanId, productsFound: insertedCount, hotProducts: hotCount, productError };
  } catch (error) {
    await admin
      .from('scan_history')
      .update({ status: 'failed', progress: 0 })
      .eq('id', scanId);
    throw error;
  }
}

// ── Route handlers ──

export async function POST(req: NextRequest) {
  console.log('[SCAN] POST received');

  // Pre-flight: check env vars
  const envError = checkEnvVars();
  if (envError) {
    console.error('[SCAN] Env check failed:', envError);
    return NextResponse.json({ error: `Configuration error: ${envError}` }, { status: 500 });
  }
  console.log('[SCAN] Env vars OK');

  let user;
  try {
    user = await authenticateAdmin(req);
    console.log('[SCAN] Auth OK — user:', user.email, 'role:', user.role);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    console.error('[SCAN] Auth failed:', msg);
    return NextResponse.json({ error: `Auth failed: ${msg}` }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const mode = body.mode || 'quick';
  const clientId = body.clientId;
  const useAsync = body.async === true;
  const useLive = body.live !== false; // Default to live scan; set live:false for mock
  console.log('[SCAN] Starting scan, mode:', mode, 'live:', useLive, 'async:', useAsync);

  // Async mode: enqueue BullMQ job and return immediately
  if (useAsync) {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    try {
      const backendRes = await fetch(`${backendUrl}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.BACKEND_API_KEY || ''}`,
        },
        body: JSON.stringify({ mode, userId: user.id, clientId }),
        signal: AbortSignal.timeout(5000),
      });

      if (backendRes.ok) {
        const jobData = await backendRes.json();
        return NextResponse.json({
          async: true,
          jobId: jobData.jobId || jobData.id,
          message: 'Scan job enqueued — check /api/admin/scan/:jobId for status',
        });
      }
    } catch {
      console.log('[SCAN] Backend not reachable for async — falling through to sync');
    }
  }

  try {
    // Try live discovery scan first (uses real Apify/RapidAPI providers)
    if (useLive && (process.env.APIFY_API_TOKEN || process.env.RAPIDAPI_KEY)) {
      console.log('[SCAN] Using LIVE discovery engine');
      const result = await runLiveDiscoveryScan(mode as 'quick' | 'full' | 'client', user.id, clientId);
      console.log('[SCAN] Live scan completed:', result.totalStored, 'products stored');

      const warnings: string[] = [];
      for (const r of result.results) {
        if (r.errors.length > 0) {
          warnings.push(`${r.platform}: ${r.errors.join('; ')}`);
        }
      }

      // If live scan found nothing, fall back to mock
      if (result.totalFound === 0) {
        console.log('[SCAN] Live scan found 0 products, falling back to mock');
        const mockResult = await runDirectScan(mode, user.id, clientId);
        return NextResponse.json({
          jobId: mockResult.scanId,
          status: 'completed',
          progress: 100,
          step: 'Scan complete (mock fallback — no API results)',
          productsFound: mockResult.productsFound,
          hotProducts: mockResult.hotProducts,
          source: 'mock',
          ...(mockResult.productError ? { warning: mockResult.productError } : {}),
        });
      }

      return NextResponse.json({
        jobId: result.scanId,
        status: 'completed',
        progress: 100,
        step: 'Live scan complete!',
        productsFound: result.totalStored,
        hotProducts: result.hotProducts,
        source: 'live',
        platforms: result.results.map(r => ({ platform: r.platform, found: r.found, stored: r.stored })),
        ...(warnings.length > 0 ? { warnings } : {}),
      });
    }

    // Fallback: mock data scan
    console.log('[SCAN] No API keys configured, using mock scan');
    const result = await runDirectScan(mode, user.id, clientId);
    console.log('[SCAN] Mock scan completed:', result.productsFound, 'products');
    return NextResponse.json({
      jobId: result.scanId,
      status: 'completed',
      progress: 100,
      step: 'Scan complete!',
      productsFound: result.productsFound,
      hotProducts: result.hotProducts,
      source: 'mock',
      ...(result.productError ? { warning: `Products partially failed: ${result.productError}` } : {}),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SCAN] Scan failed:', msg);
    return NextResponse.json(
      { error: `Scan failed: ${msg}` },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await authenticateAdmin(req);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: `Auth failed: ${msg}` }, { status: 401 });
  }

  const jobId = req.nextUrl.searchParams.get('jobId');

  if (req.nextUrl.searchParams.get('check') === 'status') {
    return NextResponse.json({ configured: true });
  }

  // Use admin client for all queries to bypass RLS
  const admin = createAdminClient();

  if (jobId) {
    const { data: scan } = await admin
      .from('scan_history')
      .select('*')
      .eq('id', jobId)
      .single();

    if (scan) {
      return NextResponse.json({
        jobId: scan.id,
        status: scan.status,
        progress: scan.progress ?? (scan.status === 'completed' ? 100 : 0),
        step: scan.status === 'completed' ? 'Scan complete!' : scan.status === 'failed' ? 'Scan failed' : 'Processing...',
        productsFound: scan.products_found ?? 0,
        hotProducts: scan.hot_products ?? 0,
      });
    }

    return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
  }

  // No jobId — return scan history (using admin client to bypass RLS)
  const { data: scans, error } = await admin
    .from('scan_history')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: `Failed to fetch scan history: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ scans });
}

export async function DELETE(req: NextRequest) {
  try {
    await authenticateAdmin(req);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unauthorized';
    return NextResponse.json({ error: `Auth failed: ${msg}` }, { status: 401 });
  }

  const jobId = req.nextUrl.searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  const admin = createAdminClient();
  await admin
    .from('scan_history')
    .update({ status: 'failed', completed_at: new Date().toISOString() })
    .eq('id', jobId);

  return NextResponse.json({ status: 'cancelled' });
}
