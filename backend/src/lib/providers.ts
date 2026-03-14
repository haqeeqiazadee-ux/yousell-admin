interface Product {
  external_id: string;
  title: string;
  price: number;
  url: string;
  image_url: string;
  sales_count: number;
  review_count: number;
  rating: number;
  source: string;
}

interface TrendKeyword {
  keyword: string;
  volume: number;
  growth: number;
}

export async function scrapePlatform(platform: string, query?: string): Promise<Product[]> {
  switch (platform) {
    case 'tiktok':
      return scrapeTikTok(query);
    case 'amazon':
      return scrapeAmazon(query);
    case 'shopify':
      return scrapeShopify(query);
    case 'pinterest':
      return scrapePinterest(query);
    default:
      console.warn(`Unknown platform: ${platform}`);
      return [];
  }
}

async function scrapeTikTok(query?: string): Promise<Product[]> {
  const apiKey = process.env.TIKTOK_API_KEY;
  if (!apiKey) {
    console.warn('TIKTOK_API_KEY not set, returning empty results');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.tiktok-shop.com/products/trending?query=${encodeURIComponent(query || '')}&limit=50`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    if (!response.ok) throw new Error(`TikTok API error: ${response.status}`);
    const data: any = await response.json();

    return (data.products || []).map((p: any) => ({
      external_id: p.id,
      title: p.title,
      price: p.price / 100,
      url: p.url,
      image_url: p.image_url || '',
      sales_count: p.sales_count || 0,
      review_count: p.review_count || 0,
      rating: p.rating || 0,
      source: 'tiktok',
    }));
  } catch (error) {
    console.error('TikTok scrape error:', error);
    return [];
  }
}

async function scrapeAmazon(query?: string): Promise<Product[]> {
  const apiKey = process.env.AMAZON_API_KEY;
  if (!apiKey) {
    console.warn('AMAZON_API_KEY not set, returning empty results');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.rainforestapi.com/request?api_key=${apiKey}&type=search&amazon_domain=amazon.com&search_term=${encodeURIComponent(query || 'trending products')}&sort_by=featured`,
      { signal: AbortSignal.timeout(30000) }
    );
    if (!response.ok) throw new Error(`Amazon API error: ${response.status}`);
    const data: any = await response.json();

    return (data.search_results || []).map((p: any) => ({
      external_id: p.asin,
      title: p.title,
      price: p.price?.value || 0,
      url: p.link,
      image_url: p.image || '',
      sales_count: p.sales_volume?.value || 0,
      review_count: p.ratings_total || 0,
      rating: p.rating || 0,
      source: 'amazon',
    }));
  } catch (error) {
    console.error('Amazon scrape error:', error);
    return [];
  }
}

async function scrapeShopify(query?: string): Promise<Product[]> {
  const apiKey = process.env.SHOPIFY_SCRAPER_KEY;
  if (!apiKey) {
    console.warn('SHOPIFY_SCRAPER_KEY not set, returning empty results');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.shopify-scraper.com/products?query=${encodeURIComponent(query || '')}&limit=50`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    if (!response.ok) throw new Error(`Shopify API error: ${response.status}`);
    const data: any = await response.json();

    return (data.products || []).map((p: any) => ({
      external_id: p.id?.toString(),
      title: p.title,
      price: parseFloat(p.price) || 0,
      url: p.url,
      image_url: p.image?.src || '',
      sales_count: p.sales_count || 0,
      review_count: p.reviews_count || 0,
      rating: p.rating || 0,
      source: 'shopify',
    }));
  } catch (error) {
    console.error('Shopify scrape error:', error);
    return [];
  }
}

async function scrapePinterest(query?: string): Promise<Product[]> {
  const apiKey = process.env.PINTEREST_API_KEY;
  if (!apiKey) {
    console.warn('PINTEREST_API_KEY not set, returning empty results');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.pinterest.com/v5/search/pins?query=${encodeURIComponent(query || 'trending products')}&page_size=50`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    if (!response.ok) throw new Error(`Pinterest API error: ${response.status}`);
    const data: any = await response.json();

    return (data.items || []).map((p: any) => ({
      external_id: p.id,
      title: p.title || p.description?.slice(0, 100),
      price: p.price?.value || 0,
      url: p.link || `https://pinterest.com/pin/${p.id}`,
      image_url: p.media?.images?.['600x']?.url || '',
      sales_count: 0,
      review_count: p.aggregated_pin_data?.aggregated_stats?.saves || 0,
      rating: 0,
      source: 'pinterest',
    }));
  } catch (error) {
    console.error('Pinterest scrape error:', error);
    return [];
  }
}

export async function fetchTrends(query?: string): Promise<TrendKeyword[]> {
  const apiKey = process.env.TIKTOK_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch(
      `https://api.tiktok-shop.com/trends?query=${encodeURIComponent(query || '')}&limit=20`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    if (!response.ok) return [];
    const data: any = await response.json();

    return (data.trends || []).map((t: any) => ({
      keyword: t.keyword,
      volume: t.volume || 0,
      growth: t.growth_rate || 0,
    }));
  } catch {
    return [];
  }
}
