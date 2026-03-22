"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Check,
  X,
  Send,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Copy,
} from "lucide-react";

interface ContentItem {
  id: string;
  client_id: string;
  product_id: string | null;
  content_type: string;
  channel: string | null;
  generated_content: string | null;
  status: string;
  error: string | null;
  requested_at: string;
  completed_at: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  generated: "bg-blue-100 text-blue-700",
  scheduled: "bg-purple-100 text-purple-700",
  published: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  rejected: "bg-gray-100 text-gray-500",
};

const contentTypeLabels: Record<string, string> = {
  product_description: "Description",
  social_post: "Social Post",
  ad_copy: "Ad Copy",
  email_sequence: "Email Seq",
  video_script: "Video Script",
  blog_post: "Blog Post",
  seo_listing: "SEO Listing",
};

export default function AdminContentPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (filter) params.set("status", filter);
      const res = await authFetch(`/api/admin/content?${params}`);
      const data = await res.json();
      setContent(data.content || []);
      setCounts(data.counts || {});
    } catch (err) {
      console.error("Failed to fetch content:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleAction = async (
    id: string,
    action: "approve" | "reject" | "schedule"
  ) => {
    setActionLoading(id);
    try {
      await authFetch("/api/admin/content", {
        method: "PATCH",
        body: JSON.stringify({ id, action }),
      });
      await fetchContent();
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const copyContent = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const totalContent = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content Management</h1>
        <p className="text-gray-500">Review, approve, and schedule AI-generated content across all clients</p>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total", count: totalContent, color: "" },
          { label: "Pending", count: counts.pending || 0, color: "text-yellow-600" },
          { label: "Generated", count: counts.generated || 0, color: "text-blue-600" },
          { label: "Scheduled", count: counts.scheduled || 0, color: "text-purple-600" },
          { label: "Published", count: counts.published || 0, color: "text-green-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button
          variant={filter === "" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("")}
        >
          All
        </Button>
        {["pending", "generated", "scheduled", "published", "failed"].map(
          (s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s] || 0})
            </Button>
          )
        )}
        <Button variant="ghost" size="sm" onClick={fetchContent} className="ml-auto">
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Content Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Content Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : content.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No content found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {content.map((item) => (
                  <>
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() =>
                        setExpandedId(expandedId === item.id ? null : item.id)
                      }
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {expandedId === item.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                          {contentTypeLabels[item.content_type] ||
                            item.content_type}
                        </div>
                      </TableCell>
                      <TableCell>{item.channel || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            statusColors[item.status] || "bg-gray-100"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.requested_at
                          ? new Date(item.requested_at).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div
                          className="flex gap-1 justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.status === "generated" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(item.id, "schedule")}
                                disabled={actionLoading === item.id}
                              >
                                <Send className="w-3 h-3 mr-1" /> Schedule
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600"
                                onClick={() => handleAction(item.id, "reject")}
                                disabled={actionLoading === item.id}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                          {item.status === "pending" && (
                            <Badge className="bg-yellow-50 text-yellow-600">
                              Generating...
                            </Badge>
                          )}
                          {item.status === "published" && (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedId === item.id && (
                      <TableRow key={`${item.id}-expanded`}>
                        <TableCell colSpan={5} className="bg-gray-50">
                          <div className="p-3 space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="text-xs text-gray-400">
                                ID: {item.id} | Client: {item.client_id?.slice(0, 8)}...
                              </div>
                              {item.generated_content && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    copyContent(item.generated_content!)
                                  }
                                >
                                  <Copy className="w-3 h-3 mr-1" /> Copy
                                </Button>
                              )}
                            </div>
                            {item.generated_content ? (
                              <pre className="whitespace-pre-wrap text-sm bg-white p-3 rounded border max-h-64 overflow-y-auto">
                                {item.generated_content}
                              </pre>
                            ) : item.error ? (
                              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                                Error: {item.error}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400 italic">
                                No content generated yet
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
