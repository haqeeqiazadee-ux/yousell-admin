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
import { UserSearch, Plus } from "lucide-react";

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

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<string>("all");

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
                  <TableHead>Followers</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Engagement Rate</TableHead>
                  <TableHead>Conversion Score</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {influencers.map((influencer) => (
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
                      {influencer.engagement_rate != null
                        ? `${influencer.engagement_rate.toFixed(1)}%`
                        : "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {influencer.conversion_score != null
                        ? influencer.conversion_score.toFixed(1)
                        : "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {influencer.email || "\u2014"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
