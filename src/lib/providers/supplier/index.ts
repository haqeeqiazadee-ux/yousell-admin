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
  productName: string,
  _category?: string
): Promise<SupplierResult[]> {
  if (PROVIDER === "apify" && process.env.APIFY_API_TOKEN) {
    return searchViaApify(productName);
  }
  if (PROVIDER === "cj_dropshipping" && process.env.CJ_DROPSHIPPING_API_KEY) {
    return searchViaCJDropshipping(productName);
  }
  return [];
}

async function searchViaApify(query: string): Promise<SupplierResult[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) return [];

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/epctex~alibaba-scraper/run-sync-get-dataset-items?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          search: query,
          maxItems: 15,
        }),
        signal: AbortSignal.timeout(60000),
      }
    );

    if (!res.ok) {
      console.error(`Apify Alibaba error: ${res.status}`);
      return [];
    }

    const items = await res.json();
    if (!Array.isArray(items)) return [];

    return items.slice(0, 15).map((item: Record<string, unknown>) => ({
      name: (item.companyName as string) || (item.supplier as string) || (item.title as string) || "Unknown",
      country: (item.country as string) || "China",
      moq: parseInt(String(item.moq || item.minOrder || 1), 10),
      unitPrice: parseFloat(String(item.price || item.unitPrice || 0)) || 0,
      shippingCost: parseFloat(String(item.shippingCost || 0)) || 0,
      leadTime: parseInt(String(item.leadTime || item.deliveryTime || 14), 10),
      whiteLabel: !!(item.whiteLabel || item.customization),
      dropship: !!(item.dropshipping || item.dropship),
      usWarehouse: !!(item.usWarehouse),
      certifications: Array.isArray(item.certifications) ? item.certifications as string[] : [],
      contact: (item.contactUrl as string) || (item.url as string) || "",
      platform: "alibaba",
    }));
  } catch (err) {
    console.error("Apify Alibaba search failed:", err);
    return [];
  }
}

async function searchViaCJDropshipping(_query: string): Promise<SupplierResult[]> {
  const apiKey = process.env.CJ_DROPSHIPPING_API_KEY;
  if (!apiKey) return [];
  // Placeholder — actual CJ Dropshipping API integration needed
  return [];
}
