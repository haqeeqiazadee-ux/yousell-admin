"use client";

import { useEffect, useState, useCallback } from "react";
import { EnginePageLayout } from "@/components/engines";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { UserSearch, Plus, AlertTriangle, ArrowUpDown, ChevronLeft, ChevronRight, Mail, Loader2, Check } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";
import { toast } from "sonner";

interface Influencer {
  id: string;
  username: string;
  platform: string;
  followers: number;
  email?: string;
  niche?: string;
  tier: "nano" | "micro" | "mid" | "macro";
  engagement_rate?: number;
  conversion_score?: number;
}

interface Product {
  id: string;
  title: string;
  platform: string;
  final_score?: number;
  category?: string;
}

const platformColors: Record<string, string> = {
  tiktok: "text-pink-500 border-pink-500/30",
  instagram: "text-purple-500 border-purple-500/30",
  youtube: "text-red-500 border-red-500/30",
  twitter: "text-blue-400 border-blue-400/30",
};

const tierColors: Record<string, string> = {
  nano: "text-gray-500 border-gray-500/30",
  micro: "text-blue-500 border-blue-500/30",
  mid: "text-purple-500 border-purple-500/30",
  macro: "text-yellow-600 border-yellow-500/30",
};

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

function getScoreBadge(score: number | undefined | null) {
  if (score == null) return { label: "N/A", color: "bg-gray-100 text-gray-500" };
  if (score >= 80) return { label: "HOT", color: "bg-red-100 text-red-700" };
  if (score >= 60) return { label: "WARM", color: "bg-orange-100 text-orange-700" };
  if (score >= 40) return { label: "WATCH", color: "bg-yellow-100 text-yellow-700" };
  return { label: "COLD", color: "bg-gray-100 text-gray-500" };
}

function hasSuspiciousEngagement(influencer: Influencer): boolean {
  if (!influencer.engagement_rate || !influencer.followers) return false;
  // Macro influencers (100k+) with >10% engagement rate is suspicious
  // Mid-tier (50k+) with >15% is suspicious
  // Any with >20% is suspicious
  if (influencer.engagement_rate > 20) return true;
  if (influencer.followers >= 100_000 && influencer.engagement_rate > 10) return true;
  if (influencer.followers >= 50_000 && influencer.engagement_rate > 15) return true;
  return false;
}

type SortField = "followers" | "engagement_rate" | "conversion_score";
type SortOrder = "asc" | "desc";

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("followers");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [newUsername, setNewUsername] = useState("");
  const [newPlatform, setNewPlatform] = useState("tiktok");
  const [newFollowers, setNewFollowers] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newNiche, setNewNiche] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Invite system state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteInfluencer, setInviteInfluencer] = useState<Influencer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [inviteSending, setInviteSending] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const fetchInfluencers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (platformFilter !== "all") params.set("platform", platformFilter);
    params.set("limit", String(pageSize));
    params.set("offset", String((page - 1) * pageSize));
    params.set("sort", sortField);
    params.set("order", sortOrder);
    const res = await authFetch(`/api/admin/influencers?${params}`);
    const data = await res.json();
    setInfluencers(data.influencers || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [platformFilter, page, sortField, sortOrder]);

  useEffect(() => {
    fetchInfluencers();
  }, [fetchInfluencers]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  }

  // Sorting is done server-side via API params
  const sortedInfluencers = influencers;

  const handleAddInfluencer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await authFetch("/api/admin/influencers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: newUsername,
        platform: newPlatform,
        followers: newFollowers ? parseInt(newFollowers, 10) : 0,
        email: newEmail || undefined,
        niche: newNiche || undefined,
      }),
    });

    if (res.ok) {
      setNewUsername("");
      setNewPlatform("tiktok");
      setNewFollowers("");
      setNewEmail("");
      setNewNiche("");
      setDialogOpen(false);
      fetchInfluencers();
    }
    setSubmitting(false);
  };

  const openInviteDialog = async (influencer: Influencer) => {
    setInviteInfluencer(influencer);
    setSelectedProductId("");
    setProductSearch("");
    setInviteDialogOpen(true);
    setProductsLoading(true);
    try {
      const res = await authFetch("/api/admin/products?sort=final_score&order=desc&limit=50");
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      toast.error("Failed to load products");
    }
    setProductsLoading(false);
  };

  const handleInvite = async () => {
    if (!inviteInfluencer || !selectedProductId) return;
    setInviteSending(true);
    try {
      const res = await authFetch("/api/admin/influencers/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          influencerId: inviteInfluencer.id,
          productId: selectedProductId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to send invite");
      } else if (data.emailSent) {
        toast.success(`Invite sent to ${inviteInfluencer.username}`);
        setInviteDialogOpen(false);
      } else {
        toast.success("Invite created (email service not configured — saved as draft)");
        setInviteDialogOpen(false);
      }
    } catch {
      toast.error("Failed to send invite");
    }
    setInviteSending(false);
  };

  const filteredProducts = products.filter(p =>
    !productSearch || p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <EnginePageLayout
      title="Influencers"
      engineId="influencer-discovery"
      description={`${total} influencer${total !== 1 ? "s" : ""} tracked`}
      status="idle"
      healthy={true}
    >
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Influencer
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Influencer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddInfluencer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="@username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <select
                  id="platform"
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="twitter">Twitter</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="followers">Followers</Label>
                <Input
                  id="followers"
                  type="number"
                  value={newFollowers}
                  onChange={(e) => setNewFollowers(e.target.value)}
                  placeholder="e.g. 50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="influencer@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="niche">Niche</Label>
                <Input
                  id="niche"
                  value={newNiche}
                  onChange={(e) => setNewNiche(e.target.value)}
                  placeholder="e.g. Fitness"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Adding..." : "Add Influencer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Platforms</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="twitter">Twitter</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : influencers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserSearch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No influencers yet</p>
              <p className="text-sm">
                Add influencers to start tracking their performance.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>
                    <button onClick={() => toggleSort("followers")} className="flex items-center gap-1 hover:text-foreground">
                      Followers <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>
                    <button onClick={() => toggleSort("engagement_rate")} className="flex items-center gap-1 hover:text-foreground">
                      Engagement Rate <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => toggleSort("conversion_score")} className="flex items-center gap-1 hover:text-foreground">
                      Score <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Invite</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInfluencers.map((influencer) => {
                  const badge = getScoreBadge(influencer.conversion_score);
                  const suspicious = hasSuspiciousEngagement(influencer);
                  return (
                    <TableRow key={influencer.id}>
                      <TableCell className="font-medium">
                        {influencer.username}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            platformColors[influencer.platform] ||
                            "text-gray-500 border-gray-500/30"
                          }
                        >
                          {influencer.platform}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatFollowers(influencer.followers)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            tierColors[influencer.tier] ||
                            "text-gray-500 border-gray-500/30"
                          }
                        >
                          {influencer.tier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {influencer.engagement_rate != null
                            ? `${influencer.engagement_rate.toFixed(1)}%`
                            : "\u2014"}
                          {suspicious && (
                            <span title="Suspiciously high engagement — possible fake followers"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" /></span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}>
                          {influencer.conversion_score != null ? `${influencer.conversion_score.toFixed(0)} ${badge.label}` : badge.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {influencer.email || "\u2014"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!influencer.email}
                          title={influencer.email ? "Send collaboration invite" : "No email on file"}
                          onClick={() => openInviteDialog(influencer)}
                        >
                          <Mail className="h-3.5 w-3.5 mr-1" />
                          Invite
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {!loading && total > pageSize && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {Math.ceil(total / pageSize)}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= Math.ceil(total / pageSize)}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog — Product Selector */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Invite {inviteInfluencer?.username} to Promote
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a product to send a personalized collaboration invite. An AI-generated outreach email will be sent to{" "}
              <span className="font-medium text-foreground">{inviteInfluencer?.email}</span>.
            </p>
            <Input
              placeholder="Search products..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
            {productsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No products found
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProductId(product.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors ${
                      selectedProductId === product.id
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted border border-transparent"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.platform} {product.category ? `· ${product.category}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {product.final_score != null && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          product.final_score >= 80 ? "bg-red-100 text-red-700" :
                          product.final_score >= 60 ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {product.final_score.toFixed(0)}
                        </span>
                      )}
                      {selectedProductId === product.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <Button
              className="w-full"
              disabled={!selectedProductId || inviteSending}
              onClick={handleInvite}
            >
              {inviteSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating & Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </EnginePageLayout>
  );
}
