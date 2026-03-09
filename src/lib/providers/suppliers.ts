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
  // Placeholder — actual Apify Alibaba/AliExpress actor integration needed
  return [];
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
