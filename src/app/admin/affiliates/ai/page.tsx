"use client";

import { Bot } from "lucide-react";
import { PlatformProducts } from "@/components/platform-products";

export default function AIAffiliatesPage() {
  return (
    <PlatformProducts
      title="AI Affiliate Programs"
      apiPath="/api/admin/affiliates?type=ai"
      emptyIcon={Bot}
      emptyMessage="No products discovered"
      emptyDescription="Connect to AI affiliate programs to start promoting AI tools and services."
      statusBadge={{ label: "AI Affiliates", configured: false }}
    />
  );
}
