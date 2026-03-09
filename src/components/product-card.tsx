"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreBadge, TierBadge } from "@/components/score-badge";
import {
  Package,
  Eye,
  UserPlus,
  Archive,
  Users,
  Truck,
  Swords,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import type { Product, TrendStage } from "@/lib/types/product";

const platformColors: Record<string, string> = {
  tiktok: "bg-pink-100 text-pink-700 border-pink-200",
  amazon: "bg-orange-100 text-orange-700 border-orange-200",
  shopify: "bg-green-100 text-green-700 border-green-200",
  pinterest: "bg-red-100 text-red-700 border-red-200",
  digital: "bg-purple-100 text-purple-700 border-purple-200",
  ai_affiliate: "bg-cyan-100 text-cyan-700 border-cyan-200",
  physical_affiliate: "bg-emerald-100 text-emerald-700 border-emerald-200",
  manual: "bg-blue-100 text-blue-700 border-blue-200",
};

const stageConfig: Record<string, { label: string; color: string }> = {
  emerging: { label: "Emerging", color: "bg-green-100 text-green-700 border-green-200" },
  rising: { label: "Rising", color: "bg-blue-100 text-blue-700 border-blue-200" },
  exploding: { label: "Exploding", color: "bg-red-100 text-red-700 border-red-200" },
  saturated: { label: "Saturated", color: "bg-gray-100 text-gray-600 border-gray-200" },
};

interface ProductCardProps {
  product: Product;
  /** Top influencers for this product */
  influencers?: { username: string; avatar_url?: string; followers: number }[];
  /** Number of competitor stores */
  competitorCount?: number;
  /** Top competitor name */
  topCompetitor?: string;
  /** Number of verified suppliers */
  supplierCount?: number;
  /** Key metric label and value (e.g. "GMV" / "$45K") */
  keyMetric?: { label: string; value: string };
  onViewBlueprint?: (productId: string) => void;
  onAddToClient?: (productId: string) => void;
  onArchive?: (productId: string) => void;
}

export function ProductCard({
  product,
  influencers = [],
  competitorCount = 0,
  topCompetitor,
  supplierCount = 0,
  keyMetric,
  onViewBlueprint,
  onAddToClient,
  onArchive,
}: ProductCardProps) {
  const [expanded, setExpanded] = useState(false);
  const stage = stageConfig[product.trend_stage || ""] || null;
  const score = product.final_score ?? product.score_overall ?? 0;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">{product.title}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {/* Platform badge */}
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${platformColors[product.platform] || ""}`}
                  >
                    {product.platform}
                  </Badge>
                  {product.channel && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {product.channel.replace(/_/g, " ")}
                    </Badge>
                  )}
                  {/* Trend stage badge */}
                  {stage && (
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${stage.color}`}
                    >
                      {stage.label}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Score Gauge */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-bold text-lg ${
                    score >= 80
                      ? "border-red-500 text-red-600"
                      : score >= 60
                      ? "border-orange-400 text-orange-600"
                      : score >= 40
                      ? "border-yellow-400 text-yellow-600"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {score}
                </div>
                <TierBadge score={score} />
              </div>
            </div>

            {/* Key Metric */}
            {keyMetric && (
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium">{keyMetric.label}:</span> {keyMetric.value}
              </div>
            )}

            {/* Indicators Row */}
            <div className="flex items-center gap-4 mt-2">
              {/* Influencer Avatars */}
              {influencers.length > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-2">
                    {influencers.slice(0, 3).map((inf, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white flex items-center justify-center"
                        title={`${inf.username} (${(inf.followers / 1000).toFixed(0)}K)`}
                      >
                        {inf.avatar_url ? (
                          <img
                            src={inf.avatar_url}
                            alt={inf.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-[8px] text-white font-bold">
                            {inf.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground ml-1">
                    {influencers.length} creators
                  </span>
                </div>
              )}

              {/* Competitor count */}
              {competitorCount > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Swords className="h-3 w-3" />
                  <span>{competitorCount} stores</span>
                  {topCompetitor && (
                    <span className="truncate max-w-[80px]">({topCompetitor})</span>
                  )}
                </div>
              )}

              {/* Supplier indicator */}
              {supplierCount > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Truck className="h-3 w-3" />
                  <span>{supplierCount} suppliers</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Insight Excerpt */}
        {(product.ai_summary || product.ai_insight_haiku) && (
          <div className="px-4 pb-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? "Hide insight" : "AI Insight"}
            </button>
            {expanded && (
              <p className="text-xs text-muted-foreground mt-1 bg-muted/50 rounded p-2">
                {product.ai_insight_haiku || product.ai_summary}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex border-t divide-x">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 rounded-none h-9 text-xs gap-1"
            onClick={() => onViewBlueprint?.(product.id)}
          >
            <Eye className="h-3.5 w-3.5" />
            View Blueprint
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 rounded-none h-9 text-xs gap-1"
            onClick={() => onAddToClient?.(product.id)}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add to Client
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 rounded-none h-9 text-xs gap-1 text-muted-foreground"
            onClick={() => onArchive?.(product.id)}
          >
            <Archive className="h-3.5 w-3.5" />
            Archive
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
