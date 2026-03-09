"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, AlertTriangle } from "lucide-react";

interface AllocationRequest {
  id: string;
  client_name: string;
  platform: string;
  note: string;
  requested_at: string;
  status: "pending" | "approved" | "rejected";
}

interface RecentAllocation {
  id: string;
  client_name: string;
  product_name: string;
  platform: string;
  allocated_at: string;
}

export default function AllocatePage() {
  const [pending, setPending] = useState<AllocationRequest[]>([]);
  const [recent, setRecent] = useState<RecentAllocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllocations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/allocations");
      const data = await res.json();
      setPending(data.pending || []);
      setRecent(data.recent || []);
    } catch {
      // API may not exist yet
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllocations();
  }, [fetchAllocations]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-outfit tracking-tight">
          Product Allocation
        </h1>
        <p className="text-muted-foreground">
          Review and manage product allocation requests
        </p>
      </div>

      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          Connect client management to enable product allocation
        </p>
      </div>

      <div className="grid gap-6">
        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold font-outfit">
              Pending Requests
            </h2>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : pending.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No pending allocation requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{req.client_name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {req.platform}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(req.requested_at).toLocaleDateString()}
                        </span>
                      </div>
                      {req.note && (
                        <p className="text-xs text-muted-foreground">
                          {req.note}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Allocations */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold font-outfit">
              Recent Allocations
            </h2>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No recent allocations</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recent.map((alloc) => (
                  <div
                    key={alloc.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          {alloc.product_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {alloc.client_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {alloc.platform}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alloc.allocated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
