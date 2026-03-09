"use client";

import { PinIcon } from "lucide-react";
import { PlatformProducts } from "@/components/platform-products";

export default function PinterestPage() {
  return (
    <PlatformProducts
      title="Pinterest Commerce"
      apiPath="/api/admin/pinterest"
      emptyIcon={PinIcon}
      emptyMessage="No products discovered"
      emptyDescription="Connect your Pinterest Commerce account to start discovering and managing products."
      statusBadge={{ label: "Pinterest", configured: false }}
    />
  );
}
