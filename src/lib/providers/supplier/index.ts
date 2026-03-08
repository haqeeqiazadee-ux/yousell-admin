import type { ProviderConfig } from "../types";

const PROVIDER = process.env.SUPPLIER_PROVIDER || "apify";

export function getSupplierConfig(): ProviderConfig {
  return {
    name: PROVIDER,
    isConfigured: PROVIDER === "apify"
      ? !!process.env.APIFY_API_TOKEN
      : !!(process.env.ALIBABA_APP_KEY || process.env.CJ_DROPSHIPPING_API_KEY),
  };
}

export interface SupplierResult {
  name: string;
  country: string;
  moq: number;
  unitPrice: number;
  shippingCost: number;
  leadTime: number;
  whiteLabel: boolean;
  dropship: boolean;
  usWarehouse: boolean;
  certifications: string[];
  contact: string;
  platform: string;
}

/**
 * Search for suppliers matching a product.
 * Sources: Alibaba API, 1688.com (Apify), CJ Dropshipping, Syncee, Faire, Ankorstore, SerpAPI
 */
export async function searchSuppliers(
  _productName: string,
  _category?: string
): Promise<SupplierResult[]> {
  // TODO Phase 15: Implement Apify Alibaba Supplier actor
  // TODO: Implement CJ Dropshipping API
  // TODO: Implement Faire API
  // TODO: SerpAPI for supplier search
  return [];
}
