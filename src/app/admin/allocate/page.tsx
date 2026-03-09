"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, AlertTriangle, Zap } from "lucide-react";

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

interface TopProduct {
  id: string;
  title: string;
  platform: string;
  final_score: number;
}

export default function AllocatePage() {
  const [pending, setPending] = useState<AllocationRequest[]>([]);
  const [recent, setRecent] = useState<RecentAllocation[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [allocating, setAllocating] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAllocations = useCallback(async () => {
    setLoading(true);
    try {
      const [allocRes, productsRes, clientsRes] = await Promise.all([
        fetch("/api/admin/allocations"),
        fetch("/api/admin/products?limit=50&sort=final_score&order=desc"),
        fetch("/api/admin/clients"),
      ]);
      const allocData = await allocRes.json();
      setPending(allocData.pending || []);
      setRecent(allocData.recent || []);

      if (productsRes.ok) {
        const prodData = await productsRes.json();
        setTopProducts((prodData.products || prodData || []).slice(0, 50));
      }
      if (clientsRes.ok) {
        const clientData = await clientsRes.json();
        setClients(clientData.clients || clientData || []);
      }
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

      {/* Quick-Select & Allocate */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold font-outfit flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Allocate
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">Select top products:</span>
            {[5, 10, 25].map((count) => (
              <Button
                key={count}
                size="sm"
                variant="outline"
                onClick={() => {
                  const ids = new Set(topProducts.slice(0, count).map(p => p.id));
                  setSelectedProducts(ids);
                }}
              >
                Top {count}
              </Button>
            ))}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedProducts(new Set())}
            >
              Clear
            </Button>
          </div>

          {selectedProducts.size > 0 && (
            <div className="flex items-center gap-3">
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="rounded-md border px-3 py-2 text-sm flex-1 max-w-xs"
              >
                <option value="">Select client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <Button
                size="sm"
                disabled={!selectedClient || allocating}
                onClick={async () => {
                  setAllocating(true);
                  try {
                    await fetch('/api/admin/allocations', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        clientId: selectedClient,
                        productIds: Array.from(selectedProducts),
                      }),
                    });
                    setSelectedProducts(new Set());
                    setSelectedClient('');
                    fetchAllocations();
                  } catch {
                    // handle error
                  }
                  setAllocating(false);
                }}
              >
                {allocating ? 'Allocating...' : `Release ${selectedProducts.size} Products`}
              </Button>
            </div>
          )}

          {/* Top products mini-list */}
          {topProducts.length > 0 && (
            <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
              {topProducts.map((product) => (
                <label
                  key={product.id}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.id)}
                    onChange={(e) => {
                      const next = new Set(selectedProducts);
                      if (e.target.checked) next.add(product.id);
                      else next.delete(product.id);
                      setSelectedProducts(next);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm font-medium flex-1">{product.title}</span>
                  <Badge variant="outline" className="text-xs">{product.platform}</Badge>
                  <span className="text-sm font-bold">{product.final_score}</span>
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
