"use client";

import { useState } from "react";
import {
  Search,
  Mail,
  Users,
  UserCheck,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { ConfidenceIndicator } from "@/components/ConfidenceIndicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ------------------------------------------------------------------ */
/*  Section 28.8 — Creator Discovery                                   */
/* ------------------------------------------------------------------ */

interface Creator {
  id: string;
  handle: string;
  name: string;
  initials: string;
  followers: string;
  platform: "TikTok" | "Instagram" | "YouTube";
  engRate: string;
  niche: string;
  productsTracked: number;
  lastPost: string;
  avatarColor: string;
  // profile panel data
  audienceBreakdown: { label: string; pct: number }[];
  engMetrics: { label: string; value: string }[];
  productHistory: string[];
  aiMatchScore: number;
}

const MOCK_CREATORS: Creator[] = [
  {
    id: "c-1",
    handle: "@glowupqueen",
    name: "Sarah Chen",
    initials: "SC",
    followers: "2.4M",
    platform: "TikTok",
    engRate: "6.8%",
    niche: "Beauty",
    productsTracked: 12,
    lastPost: "2h ago",
    avatarColor: "bg-pink-500",
    audienceBreakdown: [
      { label: "18-24", pct: 42 },
      { label: "25-34", pct: 35 },
      { label: "35+", pct: 23 },
    ],
    engMetrics: [
      { label: "Avg Views", value: "480K" },
      { label: "Avg Likes", value: "32K" },
      { label: "Avg Comments", value: "1.2K" },
      { label: "Avg Shares", value: "4.8K" },
    ],
    productHistory: [
      "LED Sunset Lamp",
      "Cloud Slides",
      "Portable Blender",
    ],
    aiMatchScore: 92,
  },
  {
    id: "c-2",
    handle: "@techreviews_uk",
    name: "James Miller",
    initials: "JM",
    followers: "890K",
    platform: "YouTube",
    engRate: "4.2%",
    niche: "Tech",
    productsTracked: 8,
    lastPost: "1d ago",
    avatarColor: "bg-blue-500",
    audienceBreakdown: [
      { label: "18-24", pct: 28 },
      { label: "25-34", pct: 45 },
      { label: "35+", pct: 27 },
    ],
    engMetrics: [
      { label: "Avg Views", value: "120K" },
      { label: "Avg Likes", value: "8.5K" },
      { label: "Avg Comments", value: "620" },
      { label: "Avg Shares", value: "1.1K" },
    ],
    productHistory: ["Mini Projector HD", "Magnetic Phone Mount"],
    aiMatchScore: 78,
  },
  {
    id: "c-3",
    handle: "@fitfam_nina",
    name: "Nina Rodriguez",
    initials: "NR",
    followers: "1.1M",
    platform: "Instagram",
    engRate: "5.5%",
    niche: "Fitness",
    productsTracked: 6,
    lastPost: "4h ago",
    avatarColor: "bg-emerald-500",
    audienceBreakdown: [
      { label: "18-24", pct: 38 },
      { label: "25-34", pct: 40 },
      { label: "35+", pct: 22 },
    ],
    engMetrics: [
      { label: "Avg Views", value: "210K" },
      { label: "Avg Likes", value: "18K" },
      { label: "Avg Comments", value: "980" },
      { label: "Avg Shares", value: "2.3K" },
    ],
    productHistory: ["Posture Corrector Pro", "Resistance Bands Set"],
    aiMatchScore: 85,
  },
  {
    id: "c-4",
    handle: "@homestyle_dan",
    name: "Daniel Park",
    initials: "DP",
    followers: "340K",
    platform: "TikTok",
    engRate: "8.1%",
    niche: "Home & Living",
    productsTracked: 15,
    lastPost: "6h ago",
    avatarColor: "bg-amber-500",
    audienceBreakdown: [
      { label: "18-24", pct: 22 },
      { label: "25-34", pct: 48 },
      { label: "35+", pct: 30 },
    ],
    engMetrics: [
      { label: "Avg Views", value: "95K" },
      { label: "Avg Likes", value: "7.8K" },
      { label: "Avg Comments", value: "540" },
      { label: "Avg Shares", value: "1.9K" },
    ],
    productHistory: [
      "LED Sunset Lamp",
      "Smart Aroma Diffuser",
      "Cloud Slides Ultra",
    ],
    aiMatchScore: 91,
  },
  {
    id: "c-5",
    handle: "@budget_finds",
    name: "Aisha Okonkwo",
    initials: "AO",
    followers: "78K",
    platform: "TikTok",
    engRate: "11.2%",
    niche: "Deals",
    productsTracked: 22,
    lastPost: "12h ago",
    avatarColor: "bg-violet-500",
    audienceBreakdown: [
      { label: "18-24", pct: 55 },
      { label: "25-34", pct: 30 },
      { label: "35+", pct: 15 },
    ],
    engMetrics: [
      { label: "Avg Views", value: "42K" },
      { label: "Avg Likes", value: "4.7K" },
      { label: "Avg Comments", value: "380" },
      { label: "Avg Shares", value: "2.1K" },
    ],
    productHistory: ["Portable Blender", "Electric Scalp Massager"],
    aiMatchScore: 74,
  },
  {
    id: "c-6",
    handle: "@luxe_lifestyle",
    name: "Emma Thompson",
    initials: "ET",
    followers: "5.2M",
    platform: "Instagram",
    engRate: "3.1%",
    niche: "Lifestyle",
    productsTracked: 4,
    lastPost: "2d ago",
    avatarColor: "bg-rose-500",
    audienceBreakdown: [
      { label: "18-24", pct: 30 },
      { label: "25-34", pct: 42 },
      { label: "35+", pct: 28 },
    ],
    engMetrics: [
      { label: "Avg Views", value: "850K" },
      { label: "Avg Likes", value: "45K" },
      { label: "Avg Comments", value: "2.8K" },
      { label: "Avg Shares", value: "6.2K" },
    ],
    productHistory: ["Smart Aroma Diffuser"],
    aiMatchScore: 67,
  },
  {
    id: "c-7",
    handle: "@gadget_guru",
    name: "Ryan Kim",
    initials: "RK",
    followers: "420K",
    platform: "YouTube",
    engRate: "5.8%",
    niche: "Tech",
    productsTracked: 10,
    lastPost: "3h ago",
    avatarColor: "bg-cyan-500",
    audienceBreakdown: [
      { label: "18-24", pct: 32 },
      { label: "25-34", pct: 40 },
      { label: "35+", pct: 28 },
    ],
    engMetrics: [
      { label: "Avg Views", value: "68K" },
      { label: "Avg Likes", value: "5.2K" },
      { label: "Avg Comments", value: "410" },
      { label: "Avg Shares", value: "890" },
    ],
    productHistory: [
      "Mini Projector HD",
      "Magnetic Phone Mount",
      "Electric Scalp Massager",
    ],
    aiMatchScore: 83,
  },
  {
    id: "c-8",
    handle: "@skincarebymel",
    name: "Mel Adams",
    initials: "MA",
    followers: "190K",
    platform: "TikTok",
    engRate: "9.4%",
    niche: "Beauty",
    productsTracked: 7,
    lastPost: "5h ago",
    avatarColor: "bg-fuchsia-500",
    audienceBreakdown: [
      { label: "18-24", pct: 48 },
      { label: "25-34", pct: 38 },
      { label: "35+", pct: 14 },
    ],
    engMetrics: [
      { label: "Avg Views", value: "55K" },
      { label: "Avg Likes", value: "5.1K" },
      { label: "Avg Comments", value: "620" },
      { label: "Avg Shares", value: "1.5K" },
    ],
    productHistory: ["LED Sunset Lamp", "Cloud Slides"],
    aiMatchScore: 88,
  },
  {
    id: "c-9",
    handle: "@outdoors_max",
    name: "Max Weber",
    initials: "MW",
    followers: "650K",
    platform: "YouTube",
    engRate: "4.6%",
    niche: "Outdoors",
    productsTracked: 3,
    lastPost: "1d ago",
    avatarColor: "bg-green-600",
    audienceBreakdown: [
      { label: "18-24", pct: 20 },
      { label: "25-34", pct: 35 },
      { label: "35+", pct: 45 },
    ],
    engMetrics: [
      { label: "Avg Views", value: "92K" },
      { label: "Avg Likes", value: "6.8K" },
      { label: "Avg Comments", value: "480" },
      { label: "Avg Shares", value: "1.3K" },
    ],
    productHistory: ["Portable Blender V2"],
    aiMatchScore: 62,
  },
  {
    id: "c-10",
    handle: "@deals_daily",
    name: "Priya Sharma",
    initials: "PS",
    followers: "52K",
    platform: "Instagram",
    engRate: "12.8%",
    niche: "Deals",
    productsTracked: 18,
    lastPost: "8h ago",
    avatarColor: "bg-orange-500",
    audienceBreakdown: [
      { label: "18-24", pct: 50 },
      { label: "25-34", pct: 35 },
      { label: "35+", pct: 15 },
    ],
    engMetrics: [
      { label: "Avg Views", value: "28K" },
      { label: "Avg Likes", value: "3.6K" },
      { label: "Avg Comments", value: "290" },
      { label: "Avg Shares", value: "1.8K" },
    ],
    productHistory: [
      "Posture Corrector Pro",
      "Cloud Slides Ultra",
      "Electric Scalp Massager",
    ],
    aiMatchScore: 79,
  },
];

const PLATFORM_BADGE: Record<string, string> = {
  TikTok: "bg-pink-500/15 text-pink-400",
  Instagram: "bg-purple-500/15 text-purple-400",
  YouTube: "bg-red-500/15 text-red-400",
};

export default function CreatorDiscoveryPage() {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [showOutreach, setShowOutreach] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [nicheFilter, setNicheFilter] = useState("all");
  const [engFilter, setEngFilter] = useState("all");

  // Filtering logic
  const filtered = MOCK_CREATORS.filter((c) => {
    if (
      searchQuery &&
      !c.handle.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    if (platformFilter !== "all" && c.platform !== platformFilter) return false;
    if (nicheFilter !== "all" && c.niche !== nicheFilter) return false;
    // Size filter by follower count
    if (sizeFilter !== "all") {
      const raw = c.followers.replace(/[^0-9.]/g, "");
      const mult = c.followers.includes("M") ? 1_000_000 : c.followers.includes("K") ? 1_000 : 1;
      const num = parseFloat(raw) * mult;
      if (sizeFilter === "mega" && num < 1_000_000) return false;
      if (sizeFilter === "macro" && (num < 100_000 || num >= 1_000_000)) return false;
      if (sizeFilter === "micro" && (num < 10_000 || num >= 100_000)) return false;
      if (sizeFilter === "nano" && num >= 10_000) return false;
    }
    // Engagement filter
    if (engFilter !== "all") {
      const rate = parseFloat(c.engRate);
      if (engFilter === "high" && rate < 8) return false;
      if (engFilter === "medium" && (rate < 4 || rate >= 8)) return false;
      if (engFilter === "low" && rate >= 4) return false;
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Creator Discovery</h1>
          <Badge variant="secondary" className="text-xs">
            2,341 creators tracked
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Find and connect with creators promoting products in your niches.
        </p>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={platformFilter}
          onValueChange={setPlatformFilter}
          className="w-36"
        >
          <SelectOption value="all">All Platforms</SelectOption>
          <SelectOption value="TikTok">TikTok</SelectOption>
          <SelectOption value="Instagram">Instagram</SelectOption>
          <SelectOption value="YouTube">YouTube</SelectOption>
        </Select>

        <Select
          value={sizeFilter}
          onValueChange={setSizeFilter}
          className="w-32"
        >
          <SelectOption value="all">All Sizes</SelectOption>
          <SelectOption value="mega">Mega (1M+)</SelectOption>
          <SelectOption value="macro">Macro (100K+)</SelectOption>
          <SelectOption value="micro">Micro (10K+)</SelectOption>
          <SelectOption value="nano">Nano (&lt;10K)</SelectOption>
        </Select>

        <Select
          value={nicheFilter}
          onValueChange={setNicheFilter}
          className="w-36"
        >
          <SelectOption value="all">All Niches</SelectOption>
          <SelectOption value="Beauty">Beauty</SelectOption>
          <SelectOption value="Tech">Tech</SelectOption>
          <SelectOption value="Fitness">Fitness</SelectOption>
          <SelectOption value="Home & Living">Home &amp; Living</SelectOption>
          <SelectOption value="Deals">Deals</SelectOption>
          <SelectOption value="Lifestyle">Lifestyle</SelectOption>
          <SelectOption value="Outdoors">Outdoors</SelectOption>
        </Select>

        <Select
          value={engFilter}
          onValueChange={setEngFilter}
          className="w-40"
        >
          <SelectOption value="all">All Engagement</SelectOption>
          <SelectOption value="high">High (8%+)</SelectOption>
          <SelectOption value="medium">Medium (4-8%)</SelectOption>
          <SelectOption value="low">Low (&lt;4%)</SelectOption>
        </Select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* ── Main Content: Table + Profile Panel ── */}
      <div className="flex gap-6">
        {/* Creator Table */}
        <div className={selectedCreator ? "flex-1 min-w-0" : "w-full"}>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creator</TableHead>
                    <TableHead>Followers</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Eng Rate</TableHead>
                    <TableHead>Niche</TableHead>
                    <TableHead className="text-right">Products</TableHead>
                    <TableHead>Last Post</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((creator) => (
                    <TableRow
                      key={creator.id}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedCreator(creator);
                        setShowOutreach(false);
                      }}
                      data-state={
                        selectedCreator?.id === creator.id
                          ? "selected"
                          : undefined
                      }
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${creator.avatarColor}`}
                          >
                            {creator.initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {creator.handle}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {creator.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {creator.followers}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${PLATFORM_BADGE[creator.platform]}`}
                        >
                          {creator.platform}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {creator.engRate}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{creator.niche}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {creator.productsTracked}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {creator.lastPost}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCreator(creator);
                              setShowOutreach(false);
                            }}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCreator(creator);
                              setShowOutreach(true);
                            }}
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                        No creators match your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* ── Creator Profile Panel (right side) ── */}
        {selectedCreator && (
          <div className="w-80 shrink-0 space-y-4">
            <Card>
              <CardContent className="space-y-4 pt-4">
                {/* Profile Header */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white ${selectedCreator.avatarColor}`}
                  >
                    {selectedCreator.initials}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedCreator.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCreator.handle}
                    </p>
                    <span
                      className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${PLATFORM_BADGE[selectedCreator.platform]}`}
                    >
                      {selectedCreator.platform} &bull;{" "}
                      {selectedCreator.followers}
                    </span>
                  </div>
                </div>

                {/* Audience Breakdown */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Audience Breakdown
                  </h4>
                  <div className="space-y-2">
                    {selectedCreator.audienceBreakdown.map((seg) => (
                      <div key={seg.label} className="flex items-center gap-2">
                        <span className="w-12 text-xs text-muted-foreground">
                          {seg.label}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${seg.pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs font-medium">
                          {seg.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Engagement Metrics */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Engagement Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCreator.engMetrics.map((m) => (
                      <div
                        key={m.label}
                        className="rounded-lg bg-muted/50 p-2 text-center"
                      >
                        <p className="text-sm font-bold">{m.value}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {m.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product History */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Product History
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCreator.productHistory.map((p) => (
                      <Badge key={p} variant="secondary" className="text-xs">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* AI Match Score */}
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    <span className="text-sm font-medium">AI Match Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">
                      {selectedCreator.aiMatchScore}%
                    </span>
                    <ConfidenceIndicator
                      confidence={selectedCreator.aiMatchScore}
                      size="md"
                    />
                  </div>
                </div>

                {/* Outreach Button */}
                <Button
                  className="w-full"
                  onClick={() => setShowOutreach(!showOutreach)}
                >
                  <Mail className="mr-1.5 h-4 w-4" />
                  Generate Outreach Email
                  <Sparkles className="ml-1 h-3 w-3" />
                </Button>

                {/* Outreach Email Preview */}
                {showOutreach && (
                  <div className="space-y-2 rounded-lg border border-dashed border-muted-foreground/25 p-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      AI-Generated Outreach Preview
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium text-muted-foreground">
                          Subject:
                        </span>{" "}
                        Collab Opportunity &mdash; Trending Products for{" "}
                        {selectedCreator.niche}
                      </p>
                      <div className="mt-2 rounded-md bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground">
                        <p>Hi {selectedCreator.name.split(" ")[0]},</p>
                        <p className="mt-2">
                          I came across your {selectedCreator.platform} content
                          and love your take on {selectedCreator.niche.toLowerCase()}{" "}
                          products. Your engagement rate of{" "}
                          {selectedCreator.engRate} is impressive!
                        </p>
                        <p className="mt-2">
                          We have several trending products that align perfectly
                          with your audience. Would you be interested in a
                          collaboration?
                        </p>
                        <p className="mt-2">
                          Looking forward to hearing from you!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
