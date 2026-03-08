"use client";

import { FileText } from "lucide-react";
import { PlatformProducts } from "@/components/platform-products";

export default function DigitalProductsPage() {
  return (
    <PlatformProducts
      title="Digital Products"
      apiPath="/api/admin/digital"
      emptyIcon={FileText}
      emptyMessage="No products discovered"
      emptyDescription="Add your digital products to start selling downloads, courses, and other digital goods."
      statusBadge={{ label: "Digital Products", configured: false }}
    />
  );
}
