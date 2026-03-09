"use client";

import { HandCoins } from "lucide-react";
import { PlatformProducts } from "@/components/platform-products";

export default function PhysicalAffiliatesPage() {
  return (
    <PlatformProducts
      title="Physical Affiliate"
      apiPath="/api/admin/affiliates?type=physical"
      emptyIcon={HandCoins}
      emptyMessage="No products discovered"
      emptyDescription="Connect to physical product affiliate programs to start promoting tangible goods."
      statusBadge={{ label: "Physical Affiliates", configured: false }}
    />
  );
}
