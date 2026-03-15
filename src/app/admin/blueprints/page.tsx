"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBadge } from "@/components/score-badge";
import {
  FileText,
  Download,
  Clock,
  ChevronRight,
} from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

interface Blueprint {
  id: string;
  product_id: string;
  positioning: string | null;
  product_page_content: string | null;
  pricing_strategy: string | null;
  video_script: string | null;
  ad_blueprint: string | null;
  launch_timeline: string | null;
  risk_notes: string | null;
  generated_at: string;
  generated_by: string;
  products: {
    id: string;
    title: string;
    platform: string;
    final_score: number;
    trend_stage: string;
  } | null;
}

export default function BlueprintsPage() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    authFetch("/api/admin/blueprints")
      .then((res) => res.json())
      .then((data) => {
        setBlueprints(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function downloadPdf(blueprintId: string) {
    window.open(`/api/admin/blueprints/${blueprintId}/pdf`, "_blank");
  }

  const sections = [
    { key: "positioning", label: "Market Positioning" },
    { key: "product_page_content", label: "Product Page Content" },
    { key: "pricing_strategy", label: "Pricing Strategy" },
    { key: "video_script", label: "Video Script" },
    { key: "ad_blueprint", label: "Ad Blueprint" },
    { key: "launch_timeline", label: "Launch Timeline" },
    { key: "risk_notes", label: "Risk Notes" },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">
            Launch Blueprints
          </h1>
          <p className="text-muted-foreground">
            AI-generated launch plans for high-scoring products (75+)
          </p>
        </div>
        <Badge variant="outline">
          {blueprints.length} Blueprint{blueprints.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : blueprints.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold">No Blueprints Yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Launch blueprints are generated on-demand by Claude Sonnet for
              products scoring 75+. Click &quot;View Blueprint&quot; on any qualifying
              product card to generate one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {blueprints.map((bp) => (
            <Card key={bp.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <CardTitle className="text-base">
                        {bp.products?.title || "Unknown Product"}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {bp.products?.platform && (
                          <Badge variant="outline" className="text-[10px]">
                            {bp.products.platform}
                          </Badge>
                        )}
                        {bp.products?.trend_stage && (
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {bp.products.trend_stage}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px]">
                          by {bp.generated_by}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {bp.products?.final_score != null && (
                      <ScoreBadge score={bp.products.final_score} showTier />
                    )}
                    <button
                      onClick={() => downloadPdf(bp.id)}
                      className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Clock className="h-3 w-3" />
                  Generated {new Date(bp.generated_at).toLocaleDateString()}
                </div>

                {expanded === bp.id ? (
                  <div className="space-y-4">
                    {sections.map(({ key, label }) => {
                      const value = bp[key];
                      if (!value) return null;
                      return (
                        <div key={key} className="space-y-1">
                          <h4 className="text-sm font-semibold text-foreground">
                            {label}
                          </h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {value}
                          </p>
                        </div>
                      );
                    })}
                    <button
                      onClick={() => setExpanded(null)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Collapse
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setExpanded(bp.id)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    View full blueprint <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
