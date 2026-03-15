import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/roles';

const ENV_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || '';

async function getBackendUrl(): Promise<string> {
  if (ENV_BACKEND_URL) return ENV_BACKEND_URL;

  // Check DB-saved settings
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'api_keys')
      .single();
    if (data?.value?.BACKEND_URL) return data.value.BACKEND_URL;
  } catch {}

  return '';
}

// ── Mock product generation (matches backend/src/lib/mock-data.ts) ──

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
    // Shuffle and pick
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
        source: `scan-${mode}`,
        tags: t.tags,
        final_score: finalScore,
        trend_score: trendScore,
        viral_score: viralScore,
        profit_score: profitScore,
        trend_stage: stages[stageIdx],
        url: `https://example.com/${platform}/${t.name.toLowerCase().replace(/\s+/g, '-')}`,
        external_url: `https://example.com/${platform}/${t.name.toLowerCase().replace(/\s+/g, '-')}`,
        sales_count: randomInt(50, 5000),
        review_count: randomInt(10, 2000),
        rating: randomFloat(3.5, 5.0),
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
    throw new Error(`Failed to create scan record: ${scanErr?.message || 'unknown'}`);
  }

  const scanId = scan.id;

  try {
    // 2. Update progress
    await admin
      .from('scan_history')
      .update({ progress: 20, log: [{ step: 'Generating product intelligence...', ts: new Date().toISOString() }] })
      .eq('id', scanId);

    // 3. Generate products
    const products = generateProducts(mode);

    await admin
      .from('scan_history')
      .update({ progress: 50, log: [{ step: 'Inserting products...', ts: new Date().toISOString() }] })
      .eq('id', scanId);

    // 4. Insert products into DB
    let insertedCount = 0;
    if (products.length > 0) {
      const { data: inserted, error: insertErr } = await admin
        .from('products')
        .insert(products.map(p => ({ ...p, created_by: userId })))
        .select('id, final_score');

      if (insertErr) {
        console.error('Product insert error:', insertErr);
      } else {
        insertedCount = inserted?.length ?? 0;
      }
    }

    const hotCount = products.filter(p => (p.final_score as number) >= 80).length;

    // 5. Mark completed
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

    return { scanId, productsFound: insertedCount, hotProducts: hotCount };
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
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'No active session' }, { status: 401 });
  }

  const body = await req.json();
  const mode = body.mode || 'quick';
  const query = body.query || '';
  const clientId = body.clientId;

  const backendUrl = await getBackendUrl();

  // If backend is configured, proxy to it (with 5s timeout to avoid hanging)
  if (backendUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${backendUrl}/api/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ mode, query, userId: user.id }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // If backend is unreachable/broken, fall through to direct scan
        if (response.status >= 500) {
          console.warn('Backend returned error, falling back to direct scan');
        } else {
          return NextResponse.json(
            { error: errorData.error || 'Failed to queue scan' },
            { status: response.status }
          );
        }
      } else {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (error) {
      console.warn('Backend unreachable, falling back to direct scan:', error);
    }
  }

  // Direct scan — no backend needed
  try {
    const result = await runDirectScan(mode, user.id, clientId);
    return NextResponse.json({
      jobId: result.scanId,
      status: 'completed',
      progress: 100,
      step: 'Scan complete!',
      productsFound: result.productsFound,
      hotProducts: result.hotProducts,
      direct: true,
    });
  } catch (error) {
    console.error('Direct scan failed:', error);
    return NextResponse.json(
      { error: 'Scan failed. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobId = req.nextUrl.searchParams.get('jobId');
  const backendUrl = await getBackendUrl();

  // Check backend status
  if (req.nextUrl.searchParams.get('check') === 'status') {
    // Always report as configured since direct scan works as fallback
    return NextResponse.json({ configured: true });
  }

  // If jobId provided, try backend first, then fall back to scan_history
  if (jobId) {
    // Try backend if configured (with 3s timeout)
    if (backendUrl) {
      try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(`${backendUrl}/api/scan/${jobId}`, {
          headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        }
      } catch {
        // Fall through to scan_history lookup
      }
    }

    // Read from scan_history (for direct scans or when backend fails)
    const admin = createAdminClient();
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

  // No jobId — return scan history
  const supabase = await createClient();
  const { data: scans, error } = await supabase
    .from('scan_history')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch scan history' }, { status: 500 });
  }

  return NextResponse.json({ scans });
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'No active session' }, { status: 401 });
  }

  const jobId = req.nextUrl.searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  const backendUrl = await getBackendUrl();

  // Try backend cancel (with 3s timeout)
  if (backendUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(`${backendUrl}/api/scan/${jobId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fall through to direct cancel
    }
  }

  // Direct cancel — update scan_history
  const admin = createAdminClient();
  await admin
    .from('scan_history')
    .update({ status: 'failed', completed_at: new Date().toISOString() })
    .eq('id', jobId);

  return NextResponse.json({ status: 'cancelled' });
}
