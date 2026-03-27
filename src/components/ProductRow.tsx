"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MoreHorizontal, ExternalLink } from "lucide-react";
import Image from "next/image";

// ── AI Score Badge Thresholds (Section 4.2) ──
function getScoreBadge(score: number) {
  if (score >= 90) return { label: "Hot", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
  if (score >= 70) return { label: "Rising", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
  if (score >= 50) return { label: "Stable", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
  return { label: "Cooling", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
}

// ── Platform Badge Colors ──
const platformColors: Record<string, string> = {
  tiktok: "bg-pink-500/20 text-pink-400",
  amazon: "bg-orange-500/20 text-orange-400",
  shopify: "bg-green-500/20 text-green-400",
  pinterest: "bg-red-500/20 text-red-400",
  ebay: "bg-yellow-500/20 text-yellow-400",
  youtube: "bg-red-500/20 text-red-400",
  reddit: "bg-orange-500/20 text-orange-400",
};

export interface ProductRowData {
  id: string;
  title: string;
  imageUrl?: string;
  platform: string;
  category?: string;
  price?: number;
  currency?: string;
  change7d?: number;
  aiScore: number;
  trendScore?: number;
  isWatched?: boolean;
}

interface ProductRowProps {
  product: ProductRowData;
  onView?: (id: string) => void;
  onWatch?: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
}

export function ProductRow({
  product,
  onView,
  onWatch,
  selected,
  onSelect,
  className,
}: ProductRowProps) {
  const scoreBadge = getScoreBadge(product.aiScore);
  const platformClass = platformColors[product.platform.toLowerCase()] ?? "bg-gray-500/20 text-gray-400";

  return (
    <tr
      className={cn(
        "border-b border-[var(--surface-border)] hover:bg-[var(--state-hover-bg)] transition-colors cursor-pointer",
        selected && "bg-[var(--color-brand-800)]",
        className
      )}
      onClick={() => onView?.(product.id)}
    >
      {/* Checkbox */}
      <td className="px-3 py-3 w-10">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect?.(product.id);
          }}
          className="rounded border-[var(--surface-border)] bg-transparent"
        />
      </td>

      {/* Trend Score Donut */}
      <td className="px-2 py-3 w-12">
        {product.trendScore !== undefined && (
          <div className="relative w-8 h-8">
            <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90">
              <circle
                cx="18" cy="18" r="15"
                fill="none"
                stroke="var(--surface-border)"
                strokeWidth="3"
              />
              <circle
                cx="18" cy="18" r="15"
                fill="none"
                stroke={product.trendScore >= 70 ? "var(--color-success)" : product.trendScore >= 40 ? "var(--color-warning)" : "var(--color-neutral)"}
                strokeWidth="3"
                strokeDasharray={`${product.trendScore * 0.94} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono">
              {product.trendScore}
            </span>
          </div>
        )}
      </td>

      {/* Image */}
      <td className="px-2 py-3 w-12">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            width={40}
            height={40}
            className="rounded-md object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-md bg-[var(--surface-elevated)] flex items-center justify-center text-xs text-[var(--color-brand-200)]">
            N/A
          </div>
        )}
      </td>

      {/* Title */}
      <td className="px-3 py-3 max-w-[240px]">
        <p className="text-sm font-medium truncate">{product.title}</p>
        {product.category && (
          <p className="text-xs text-[var(--color-brand-200)] mt-0.5">{product.category}</p>
        )}
      </td>

      {/* Platform Badge */}
      <td className="px-3 py-3">
        <Badge variant="outline" className={cn("text-xs capitalize", platformClass)}>
          {product.platform}
        </Badge>
      </td>

      {/* Price */}
      <td className="px-3 py-3 text-sm font-mono">
        {product.price !== undefined
          ? `${product.currency ?? "£"}${product.price.toFixed(2)}`
          : "—"
        }
      </td>

      {/* 7d Change */}
      <td className="px-3 py-3 text-sm font-mono">
        {product.change7d !== undefined ? (
          <span className={cn(
            product.change7d > 0 ? "text-emerald-400" : product.change7d < 0 ? "text-red-400" : "text-[var(--color-neutral)]"
          )}>
            {product.change7d > 0 ? "+" : ""}{product.change7d.toFixed(1)}%
          </span>
        ) : "—"}
      </td>

      {/* AI Score Badge */}
      <td className="px-3 py-3">
        <Badge variant="outline" className={cn("text-xs font-medium", scoreBadge.color)}>
          {scoreBadge.label}
        </Badge>
      </td>

      {/* Actions */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onWatch?.(product.id);
            }}
          >
            <Star className={cn("h-3.5 w-3.5", product.isWatched && "fill-amber-400 text-amber-400")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(product.id);
            }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
