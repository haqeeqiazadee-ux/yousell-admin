/**
 * Supplier Discovery Job
 *
 * Discovers suppliers for a product via Apify (Alibaba scraper) or
 * CJ Dropshipping, and stores results in Supabase.
 */
import { Job } from "bullmq";
import { supabase } from "../lib/supabase";
import type { SupplierDiscoveryJobData } from "./types";

interface SupplierRecord {
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
  scan_id: string | null;
  discovered_at: string;
}

export async function processSupplierDiscovery(
  job: Job<SupplierDiscoveryJobData>
) {
  const { productName, scanId } = job.data;

  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    console.warn("APIFY_API_TOKEN not set — skipping supplier discovery");
    return { discovered: 0 };
  }

  await job.updateProgress(10);

  let suppliers: SupplierRecord[] = [];

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/epctex~alibaba-scraper/run-sync-get-dataset-items?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          search: productName,
          maxItems: 15,
        }),
        signal: AbortSignal.timeout(60_000),
      }
    );

    if (!res.ok) {
      console.error(`Apify Alibaba error: ${res.status}`);
      return { discovered: 0 };
    }

    const items = await res.json();
    if (!Array.isArray(items)) return { discovered: 0 };

    await job.updateProgress(60);

    suppliers = items.slice(0, 15).map(
      (item: Record<string, unknown>): SupplierRecord => ({
        name:
          (item.companyName as string) ||
          (item.supplier as string) ||
          (item.title as string) ||
          "Unknown",
        country: (item.country as string) || "China",
        moq: parseInt(String(item.moq || item.minOrder || 1), 10),
        unit_price:
          parseFloat(String(item.price || item.unitPrice || 0)) || 0,
        shipping_cost:
          parseFloat(String(item.shippingCost || 0)) || 0,
        lead_time: parseInt(
          String(item.leadTime || item.deliveryTime || 14),
          10
        ),
        white_label: !!(item.whiteLabel || item.customization),
        dropship: !!(item.dropshipping || item.dropship),
        us_warehouse: !!item.usWarehouse,
        certifications: Array.isArray(item.certifications)
          ? (item.certifications as string[])
          : [],
        contact:
          (item.contactUrl as string) || (item.url as string) || null,
        platform: "alibaba",
        scan_id: scanId || null,
        discovered_at: new Date().toISOString(),
      })
    );
  } catch (err) {
    console.error("Supplier discovery failed:", err);
    return { discovered: 0 };
  }

  if (suppliers.length > 0) {
    const { error } = await supabase
      .from("suppliers")
      .upsert(suppliers, { onConflict: "platform,name" });

    if (error) {
      console.error("Supplier upsert error:", error);
    }
  }

  await job.updateProgress(100);

  return { discovered: suppliers.length };
}
