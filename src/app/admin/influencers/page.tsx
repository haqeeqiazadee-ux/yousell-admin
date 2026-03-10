"use client";

import { useEffect, useState, useCallback } from "react";
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
import { UserSearch, Plus, AlertTriangle, ArrowUpDown } from "lucide-react";

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

  const fetchInfluencers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (platformFilter !== "all") params.set("platform", platformFilter);
    const res = await fetch(`/api/admin/influencers?${params}`);
    const data = await res.json();
    setInfluencers(data.influencers || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [platformFilter]);

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

  const sortedInfluencers = [...influencers].sort((a, b) => {
    const aVal = a[sortField] ?? 0;
    const bVal = b[sortField] ?? 0;
    return sortOrder === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const handleAddInfluencer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch("/api/admin/influencers", {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">
            Influencers
          </h1>
          <p className="text-muted-foreground">
            {total} influencer{total !== 1 ? "s" : ""} tracked
          </p>
        </div>
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
