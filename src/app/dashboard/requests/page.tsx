"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Send,
  Clock,
  CheckCircle2,
  PackageCheck,
  Loader2,
} from "lucide-react";

interface ProductRequest {
  id: string;
  platform: string;
  note: string | null;
  status: "pending" | "reviewed" | "fulfilled";
  requested_at: string;
  reviewed_at: string | null;
  fulfilled_at: string | null;
  products_released: number;
}

const platforms = [
  { value: "tiktok", label: "TikTok Shop" },
  { value: "amazon", label: "Amazon" },
  { value: "shopify", label: "Shopify" },
  { value: "pinterest", label: "Pinterest" },
  { value: "digital", label: "Digital Products" },
  { value: "ai_affiliate", label: "AI Affiliate" },
  { value: "physical_affiliate", label: "Physical Affiliate" },
];

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline"; icon: React.ElementType }
> = {
  pending: { label: "Pending", variant: "secondary", icon: Clock },
  reviewed: { label: "Reviewed", variant: "outline", icon: CheckCircle2 },
  fulfilled: { label: "Fulfilled", variant: "default", icon: PackageCheck },
};

export default function ClientRequestsPage() {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [platform, setPlatform] = useState("");
  const [note, setNote] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  async function fetchRequests() {
    try {
      const res = await fetch("/api/dashboard/requests");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRequests();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!platform) return;

    setSubmitting(true);
    setSubmitSuccess(false);

    try {
      const res = await fetch("/api/dashboard/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, note: note || null }),
      });

      if (res.ok) {
        setPlatform("");
        setNote("");
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
        // Refresh the list
        setLoading(true);
        await fetchRequests();
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-outfit tracking-tight">
          Product Requests
        </h1>
        <p className="text-muted-foreground mt-1">
          Request new product recommendations from our team.
        </p>
      </div>

      {/* Request Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            New Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">Select a platform...</option>
                  {platforms.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note (optional)</Label>
                <Input
                  id="note"
                  placeholder="Any specific requirements or preferences..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={submitting || !platform} className="gap-2">
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Submit Request
              </Button>
              {submitSuccess && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Request submitted successfully!
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Request History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Request History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No requests yet</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                Submit your first product request above and our team will
                curate products for you.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Products Released</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => {
                    const config = statusConfig[req.status] ?? statusConfig.pending;
                    const StatusIcon = config.icon;
                    return (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium capitalize">
                          {req.platform.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                          {req.note || "--"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(req.requested_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {req.products_released}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
