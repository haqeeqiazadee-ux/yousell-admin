"use client";

import { Store } from "lucide-react";
import { PlatformProducts } from "@/components/platform-products";

export default function ShopifyPage() {
  return (
    <PlatformProducts
      title="Shopify"
      apiPath="/api/admin/products?platform=shopify"
      emptyIcon={Store}
      emptyMessage="No Shopify products connected"
      emptyDescription="Connect your Shopify store in Settings to sync and analyze your product catalog."
      statusBadge={{ label: "Shopify Provider", serviceKey: "apify" }}
    />
  );
}
