"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { authFetch } from "@/lib/auth-fetch";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Package, Zap, Eye, EyeOff, CheckCircle, XCircle,
  Search, Filter, ArrowUpDown
} from "lucide-react";

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
  visible_to_client: boolean;
}

interface TopProduct {
  id: string;
  title: string;
  platform: string;
  final_score: number;
  trend_stage?: string;
  category?: string;
}

export default function AllocatePage() {
  const [pending, setPending] = useState<AllocationRequest[]>([]);
  const [recent, setRecent] = useState<RecentAllocation[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [allocating, setAllocating] = useState(false);
  const [visibleToClient, setVisibleToClient] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"score" | "name">("score");
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  const fetchAllocations = useCallback(async () => {
    setLoading(true);
    try {
      const [allocRes, productsRes, clientsRes] = await Promise.all([
        authFetch("/api/admin/allocations"),
        authFetch("/api/admin/products?limit=50&sort=final_score&order=desc"),
        authFetch("/api/admin/clients"),
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
      toast.error("Failed to load allocation data");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAllocations();
  }, [fetchAllocations]);

  // Realtime: auto-refresh on allocation/request changes
  useEffect(() => {
    const sb = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
    let timer: ReturnType<typeof setTimeout> | null = null;
    const debouncedFetch = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fetchAllocations(), 2000);
    };
    const channel = sb
      .channel("allocations-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "product_allocations" }, debouncedFetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "product_requests" }, debouncedFetch)
      .subscribe();
    return () => {
      if (timer) clearTimeout(timer);
      sb.removeChannel(channel);
    };
  }, [fetchAllocations]);

  // Filter and sort products
  const filteredProducts = topProducts
    .filter((p) => {
      if (platformFilter !== "all" && p.platform !== platformFilter) return false;
      if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;
      return true;
    })
    .sort((a, b) =>
      sortBy === "score"
        ? (b.final_score || 0) - (a.final_score || 0)
        : a.title.localeCompare(b.title)
    );

  const platforms = [...new Set(topProducts.map((p) => p.platform))];

  async function handleAllocate() {
    if (!selectedClient) {
      toast.error("Please select a client");
      return;
    }
    if (selectedProducts.size === 0) {
      toast.error("Please select products to allocate");
      return;
    }

    setAllocating(true);
    try {
      const res = await authFetch("/api/admin/allocations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient,
          productIds: Array.from(selectedProducts),
          visible_to_client: visibleToClient,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const clientName = clients.find((c) => c.id === selectedClient)?.name || "client";
        toast.success(
          `${data.count || selectedProducts.size} products allocated to ${clientName}`
        );
        setSelectedProducts(new Set());
        setSelectedClient("");
        fetchAllocations();
      } else {
        const err = await res.json();
        toast.error(err.error || "Allocation failed");
      }
    } catch {
      toast.error("Failed to allocate products");
    }
    setAllocating(false);
  }

  async function handleRequestAction(requestId: string, action: "approved" | "rejected") {
    setProcessingRequest(requestId);
    try {
      const res = await authFetch("/api/admin/allocations/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status: action }),
      });

      if (res.ok) {
        toast.success(`Request ${action}`);
        fetchAllocations();
      } else {
        toast.error(`Failed to ${action === "approved" ? "approve" : "reject"} request`);
      }
    } catch {
      toast.error("Action failed");
    }
    setProcessingRequest(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Product Allocation
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Curate and push products to client dashboards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {selectedProducts.size} selected
          </span>
          <Badge variant="outline" className="text-xs">
            {topProducts.length} products available
          </Badge>
        </div>
      </div>

      {/* Quick-Select & Allocate */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Allocate
            </h2>
            <div className="flex items-center gap-2">
              {[5, 10, 25].map((count) => (
                <Button
                  key={count}
                  size="sm"
                  variant={
                    selectedProducts.size === count ? "default" : "outline"
                  }
                  onClick={() => {
                    const ids = new Set(
                      filteredProducts.slice(0, count).map((p) => p.id)
                    );
                    setSelectedProducts(ids);
                  }}
                >
                  Top {count}
                </Button>
              ))}
              {selectedProducts.size > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedProducts(new Set())}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Allocation controls */}
          <div className="flex items-center gap-3 flex-wrap bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="rounded-md border px-3 py-2 text-sm flex-1 max-w-xs bg-white dark:bg-gray-900"
            >
              <option value="">Select client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setVisibleToClient(!visibleToClient)}
              className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                visibleToClient
                  ? "border-green-500/30 text-green-600 bg-green-50"
                  : "border-gray-300 text-gray-500 bg-white"
              }`}
              title={
                visibleToClient
                  ? "Products will be visible to client"
                  : "Products hidden from client"
              }
            >
              {visibleToClient ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
              {visibleToClient ? "Visible" : "Hidden"}
            </button>
            <Button
              disabled={
                !selectedClient || allocating || selectedProducts.size === 0
              }
              onClick={handleAllocate}
            >
              {allocating
                ? "Allocating..."
                : `Release ${selectedProducts.size} Product${selectedProducts.size !== 1 ? "s" : ""}`}
            </Button>
          </div>

          {/* Search & filter bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-md border pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-900"
              />
            </div>
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="rounded-md border px-2 py-2 text-xs bg-white dark:bg-gray-900"
              >
                <option value="all">All Platforms</option>
                {platforms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() =>
                setSortBy(sortBy === "score" ? "name" : "score")
              }
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-2 rounded-md border bg-white dark:bg-gray-900"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              {sortBy === "score" ? "By Score" : "By Name"}
            </button>
          </div>

          {/* Product list */}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-400">
                {searchQuery
                  ? "No products match your search"
                  : "No products available. Run a scan first."}
              </p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto border rounded-lg divide-y">
              {filteredProducts.map((product) => (
                <label
                  key={product.id}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                    selectedProducts.has(product.id)
                      ? "bg-blue-50 dark:bg-blue-950/20"
                      : "hover:bg-muted/50"
                  }`}
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
                  <span className="text-sm font-medium flex-1 truncate">
                    {product.title}
                  </span>
                  {product.trend_stage && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        product.trend_stage === "exploding"
                          ? "bg-red-50 text-red-600"
                          : product.trend_stage === "rising"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {product.trend_stage}
                    </span>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {product.platform}
                  </Badge>
                  <span
                    className={`text-sm font-bold min-w-[2rem] text-right ${
                      product.final_score >= 80
                        ? "text-red-600"
                        : product.final_score >= 60
                          ? "text-amber-600"
                          : "text-gray-600"
                    }`}
                  >
                    {Math.round(product.final_score)}
                  </span>
                </label>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pending Requests</h2>
              {pending.length > 0 && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  {pending.length} pending
                </Badge>
              )}
            </div>
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
                <p className="text-xs mt-1 text-gray-400">
                  Requests from clients will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
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
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={processingRequest === req.id}
                        onClick={() =>
                          handleRequestAction(req.id, "approved")
                        }
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                        disabled={processingRequest === req.id}
                        onClick={() =>
                          handleRequestAction(req.id, "rejected")
                        }
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Allocations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Allocations</h2>
              {recent.length > 0 && (
                <span className="text-xs text-gray-400">
                  {recent.length} total
                </span>
              )}
            </div>
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
                <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No recent allocations</p>
                <p className="text-xs mt-1 text-gray-400">
                  Use Quick Allocate above to push products to clients
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {recent.map((alloc) => (
                  <div
                    key={alloc.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {alloc.product_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {alloc.client_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {alloc.platform}
                      </Badge>
                      {alloc.visible_to_client ? (
                        <Eye className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                      )}
                      <p className="text-xs text-muted-foreground">
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
