import { getCachedProducts } from './cache';

export interface Supplier {
  name: string;
  country: string;
  moq: number;
  unit_price: number;
  shipping_cost: number;
  lead_time: number;
  white_label: boolean;
  dropship: boolean;
  us_warehouse: boolean;
  certifications: string[];
  contact: string | null;
  platform: string;
}

/**
 * Discover suppliers by product category
 * Batched by category per cost rules (never per-product)
 * Uses env var SUPPLIER_PROVIDER to select source
 */
export async function discoverSuppliers(productCategory: string): Promise<Supplier[]> {
  const provider = process.env.SUPPLIER_PROVIDER || 'apify';

  // Check 24h cache first
  const cached = await getCachedProducts('supplier', productCategory);
  if (cached) return cached as unknown as Supplier[];

  switch (provider) {
    case 'apify':
      return fetchFromApify(productCategory);
    case 'cj_dropshipping':
      return fetchFromCJDropshipping(productCategory);
    default:
      console.warn(`Unknown supplier provider: ${provider}`);
      return [];
  }
}

async function fetchFromApify(category: string): Promise<Supplier[]> {
  const token = process.env.APIFY_API_TOKEN || process.env.APIFY_TOKEN;
  if (!token) {
    console.warn('APIFY_API_TOKEN not set');
    return [];
  }

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/devcake~alibaba-products-scraper/run-sync-get-dataset-items?token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queries: [category],
          maxItems: 20,
        }),
        signal: AbortSignal.timeout(90000),
      }
    );

    if (!res.ok) {
      console.error(`Apify Alibaba error: ${res.status} ${res.statusText}`);
      return [];
    }

    const items = await res.json();
    if (!Array.isArray(items)) return [];

    return items.slice(0, 20).map((item: Record<string, unknown>) => {
      const priceMin = typeof item.price_min === 'number' ? item.price_min : parseFloat(String(item.price_min || '0')) || 0;
      const moqRaw = String(item.moq || '1');
      const moqNum = parseInt(moqRaw.replace(/[^\d]/g, ''), 10) || 1;

      return {
        name: (item.name as string) || 'Unknown Product',
        country: (item.countryCode as string) || 'CN',
        moq: moqNum,
        unit_price: priceMin,
        shipping_cost: 0,
        lead_time: 14,
        white_label: false,
        dropship: false,
        us_warehouse: false,
        certifications: (item.is_alibaba_guaranteed ? ['Alibaba Guaranteed'] : []) as string[],
        contact: (item.company_name as string) || null,
        platform: 'alibaba',
      };
    });
  } catch (err) {
    console.error('Apify Alibaba supplier search failed:', err);
    return [];
  }
}

async function fetchFromCJDropshipping(category: string): Promise<Supplier[]> {
  const apiKey = process.env.CJ_DROPSHIPPING_API_KEY;
  if (!apiKey) {
    console.warn('CJ_DROPSHIPPING_API_KEY not set');
    return [];
  }
  // Placeholder — actual CJ Dropshipping API integration needed
  return [];
}
