"use client";

import { ShoppingCart } from "lucide-react";
import { PlatformProducts } from "@/components/platform-products";

export default function AmazonPage() {
  return (
    <PlatformProducts
      title="Amazon"
      apiPath="/api/admin/amazon"
      emptyIcon={ShoppingCart}
      emptyMessage="No Amazon products discovered"
      emptyDescription="Configure your Amazon/RapidAPI key in Settings to start discovering Amazon product opportunities."
      statusBadge={{ label: "RapidAPI Provider", configured: false }}
    />
  );
}
