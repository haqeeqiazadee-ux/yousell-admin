"use client";

import { Music2 } from "lucide-react";
import { PlatformProducts } from "@/components/platform-products";

export default function TikTokPage() {
  return (
    <PlatformProducts
      title="TikTok Shop"
      apiPath="/api/admin/tiktok"
      emptyIcon={Music2}
      emptyMessage="No TikTok products discovered"
      emptyDescription="Configure your TikTok/Apify API key in Settings to start discovering trending TikTok Shop products."
      statusBadge={{ label: "Apify Provider", serviceKey: "apify" }}
    />
  );
}
