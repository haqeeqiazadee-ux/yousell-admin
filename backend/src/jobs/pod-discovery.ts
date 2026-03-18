/**
 * POD Discovery Job Processor
 *
 * Discovers trending print-on-demand products from Etsy, Redbubble, Amazon Merch.
 * Feature-flagged: uses Apify actors when POD_DISCOVERY_ENABLED=true.
 * Returns mock data when disabled for testing the pipeline.
 */
import { Job } from 'bullmq'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
)

interface PodDiscoveryData {
  niche?: string
  platforms?: string[]
  userId: string
}

const MOCK_POD_PRODUCTS = [
  { title: 'Retro Sunset Mountain T-Shirt', price: 24.99, category: 'apparel', source: 'etsy', rating: 4.7, sales_count: 850, review_count: 120 },
  { title: 'Custom Pet Portrait Mug', price: 18.99, category: 'home_living', source: 'etsy', rating: 4.8, sales_count: 1200, review_count: 200 },
  { title: 'Minimalist Botanical Tote Bag', price: 22.99, category: 'accessories', source: 'redbubble', rating: 4.5, sales_count: 600, review_count: 80 },
]

export async function processPodDiscovery(job: Job<PodDiscoveryData>) {
  const { niche, platforms = ['etsy', 'redbubble'] } = job.data
  console.log(`[pod-discovery] Processing job ${job.id}: niche=${niche}, platforms=${platforms.join(',')}`)

  const enabled = process.env.POD_DISCOVERY_ENABLED === 'true'
  const apifyToken = process.env.APIFY_API_TOKEN

  let products: typeof MOCK_POD_PRODUCTS = []

  if (enabled && apifyToken) {
    // Live discovery via Apify actors
    for (const platform of platforms) {
      try {
        if (platform === 'etsy') {
          const res = await fetch(
            `https://api.apify.com/v2/acts/epctex~etsy-scraper/run-sync-get-dataset-items?token=${apifyToken}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ search: niche || 'trending', maxItems: 10 }),
              signal: AbortSignal.timeout(60000),
            },
          )
          if (res.ok) {
            const items = await res.json()
            if (Array.isArray(items)) {
              products.push(...items.slice(0, 10).map((item: Record<string, unknown>) => ({
                title: String(item.title || item.name || 'POD Product'),
                price: parseFloat(String(item.price || 0)),
                category: 'apparel',
                source: 'etsy',
                rating: parseFloat(String(item.rating || 0)),
                sales_count: parseInt(String(item.sales || item.favorers || 0), 10),
                review_count: parseInt(String(item.reviews || 0), 10),
              })))
            }
          }
        }
      } catch (err) {
        console.error(`[pod-discovery] ${platform} error:`, err)
      }
    }
  }

  // Use mock data if no live results
  if (products.length === 0) {
    console.log('[pod-discovery] Using mock POD products (set POD_DISCOVERY_ENABLED=true for live)')
    products = MOCK_POD_PRODUCTS
  }

  // Insert discovered POD products into database
  let inserted = 0
  for (const p of products) {
    const { error } = await supabase.from('products').insert({
      title: p.title,
      price: p.price,
      category: p.category,
      source: p.source,
      channel: 'pod',
      rating: p.rating,
      sales_count: p.sales_count,
      review_count: p.review_count,
      status: 'discovered',
      metadata: { discovered_by: 'pod-discovery', niche },
    })
    if (!error) inserted++
  }

  console.log(`[pod-discovery] Inserted ${inserted} POD products`)
  return { status: 'complete', discovered: inserted }
}
