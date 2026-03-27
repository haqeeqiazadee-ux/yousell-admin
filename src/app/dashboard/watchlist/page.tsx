"use client";

import { useState } from "react";
import {
  Bell,
  BellOff,
  Download,
  Share2,
  Trash2,
  Eye,
  Pencil,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ------------------------------------------------------------------ */
/*  Section 28.10 — Watchlist                                          */
/* ------------------------------------------------------------------ */

interface WatchlistItem {
  id: string;
  product: string;
  platform: string;
  score: number;
  scoreChange: number;
  lastActivity: string;
  alertStatus: boolean;
  tags: string[];
  alertConfig: AlertConfig;
}

interface AlertConfig {
  scorePlusMinus10: boolean;
  newViralVideo: boolean;
  adSpendSpike: boolean;
  competitorLaunch: boolean;
  pricePlusMinus: boolean;
  preViralSignal: boolean;
  method: "in-app" | "email" | "both";
}

const DEFAULT_ALERT_CONFIG: AlertConfig = {
  scorePlusMinus10: true,
  newViralVideo: true,
  adSpendSpike: false,
  competitorLaunch: false,
  pricePlusMinus: false,
  preViralSignal: false,
  method: "in-app",
};

const MOCK_WATCHLIST: WatchlistItem[] = [
  {
    id: "w-1",
    product: "Portable Blender V2",
    platform: "TikTok",
    score: 94,
    scoreChange: 5,
    lastActivity: "2h ago \u2014 New ad detected",
    alertStatus: true,
    tags: ["high-score", "new-activity"],
    alertConfig: {
      scorePlusMinus10: true,
      newViralVideo: true,
      adSpendSpike: true,
      competitorLaunch: true,
      pricePlusMinus: false,
      preViralSignal: true,
      method: "both",
    },
  },
  {
    id: "w-2",
    product: "LED Sunset Lamp",
    platform: "TikTok",
    score: 88,
    scoreChange: -3,
    lastActivity: "4h ago \u2014 Price dropped 12%",
    alertStatus: true,
    tags: ["high-score", "price-changed"],
    alertConfig: {
      scorePlusMinus10: true,
      newViralVideo: false,
      adSpendSpike: false,
      competitorLaunch: false,
      pricePlusMinus: true,
      preViralSignal: false,
      method: "email",
    },
  },
  {
    id: "w-3",
    product: "Cloud Slides Ultra",
    platform: "Amazon",
    score: 82,
    scoreChange: 8,
    lastActivity: "1h ago \u2014 Viral video (2.3M views)",
    alertStatus: true,
    tags: ["high-score", "new-activity"],
    alertConfig: {
      ...DEFAULT_ALERT_CONFIG,
      newViralVideo: true,
      adSpendSpike: true,
      method: "both",
    },
  },
  {
    id: "w-4",
    product: "Mini Projector HD",
    platform: "Meta",
    score: 76,
    scoreChange: 2,
    lastActivity: "6h ago \u2014 3 new ads launched",
    alertStatus: false,
    tags: ["new-activity"],
    alertConfig: { ...DEFAULT_ALERT_CONFIG },
  },
  {
    id: "w-5",
    product: "Smart Aroma Diffuser",
    platform: "YouTube",
    score: 71,
    scoreChange: -1,
    lastActivity: "1d ago \u2014 Competitor listed similar",
    alertStatus: true,
    tags: ["alerts-set"],
    alertConfig: {
      ...DEFAULT_ALERT_CONFIG,
      competitorLaunch: true,
      method: "in-app",
    },
  },
  {
    id: "w-6",
    product: "Posture Corrector Pro",
    platform: "Instagram",
    score: 68,
    scoreChange: 12,
    lastActivity: "3h ago \u2014 Score jumped +12",
    alertStatus: true,
    tags: ["new-activity", "alerts-set"],
    alertConfig: {
      ...DEFAULT_ALERT_CONFIG,
      scorePlusMinus10: true,
      preViralSignal: true,
      method: "both",
    },
  },
  {
    id: "w-7",
    product: "Electric Scalp Massager",
    platform: "TikTok",
    score: 63,
    scoreChange: 0,
    lastActivity: "2d ago \u2014 No recent changes",
    alertStatus: false,
    tags: [],
    alertConfig: { ...DEFAULT_ALERT_CONFIG },
  },
  {
    id: "w-8",
    product: "Magnetic Phone Mount",
    platform: "Amazon",
    score: 59,
    scoreChange: -5,
    lastActivity: "12h ago \u2014 Price increased 8%",
    alertStatus: true,
    tags: ["price-changed", "alerts-set"],
    alertConfig: {
      ...DEFAULT_ALERT_CONFIG,
      pricePlusMinus: true,
      method: "email",
    },
  },
];

const PLATFORM_BADGE: Record<string, string> = {
  TikTok: "bg-pink-500/15 text-pink-400",
  Amazon: "bg-amber-500/15 text-amber-400",
  Meta: "bg-blue-500/15 text-blue-400",
  YouTube: "bg-red-500/15 text-red-400",
  Instagram: "bg-purple-500/15 text-purple-400",
};

function scoreColor(score: number): string {
  if (score >= 85) return "text-emerald-400";
  if (score >= 70) return "text-amber-400";
  return "text-red-400";
}

function ScoreChangeBadge({ change }: { change: number }) {
  if (change === 0)
    return <span className="text-xs text-muted-foreground">&mdash;</span>;
  const isUp = change > 0;
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold ${
        isUp ? "text-emerald-400" : "text-red-400"
      }`}
    >
      {isUp ? "\u2191" : "\u2193"}
      {isUp ? "+" : ""}
      {change}
    </span>
  );
}

function AlertConfigModal({
  item,
  onSave,
}: {
  item: WatchlistItem;
  onSave: (id: string, config: AlertConfig) => void;
}) {
  const [config, setConfig] = useState<AlertConfig>({ ...item.alertConfig });

  const toggleField = (field: keyof AlertConfig) => {
    if (field === "method") return;
    setConfig((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-xs">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alert Settings &mdash; {item.product}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Alert type checkboxes */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Alert Types
            </h4>
            {(
              [
                ["scorePlusMinus10", "Score changes by \u00b110 points"],
                ["newViralVideo", "New viral video detected"],
                ["adSpendSpike", "Ad spend spike detected"],
                ["competitorLaunch", "Competitor launches similar product"],
                ["pricePlusMinus", "Price changes by \u00b1X%"],
                ["preViralSignal", "Pre-viral signal detected"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center gap-3">
                <Checkbox
                  checked={config[key] as boolean}
                  onCheckedChange={() => toggleField(key)}
                />
                <Label className="text-sm font-normal">{label}</Label>
              </div>
            ))}
          </div>

          {/* Alert method */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Alert Method
            </h4>
            <div className="flex flex-col gap-2">
              {(
                [
                  ["in-app", "In-App Notifications"],
                  ["email", "Email Notifications"],
                  ["both", "Both (In-App + Email)"],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className="flex items-center gap-3 text-sm cursor-pointer"
                >
                  <input
                    type="radio"
                    name="alert-method"
                    checked={config.method === value}
                    onChange={() =>
                      setConfig((prev) => ({ ...prev, method: value }))
                    }
                    className="h-4 w-4 accent-primary"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose
            render={<Button variant="outline" />}
          >
            Cancel
          </DialogClose>
          <DialogClose
            render={
              <Button onClick={() => onSave(item.id, config)} />
            }
          >
            Save Alerts
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function WatchlistPage() {
  const [items, setItems] = useState(MOCK_WATCHLIST);
  const [activeTab, setActiveTab] = useState("all");

  const handleSaveAlert = (id: string, config: AlertConfig) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, alertConfig: config, alertStatus: true }
          : item
      )
    );
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Filter items based on active tab
  const filtered = items.filter((item) => {
    switch (activeTab) {
      case "high-score":
        return item.score >= 80;
      case "price-changed":
        return item.tags.includes("price-changed");
      case "new-activity":
        return item.tags.includes("new-activity");
      case "alerts-set":
        return item.alertStatus;
      default:
        return true;
    }
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">My Watchlist</h1>
            <Badge variant="secondary" className="text-xs">
              {items.length} products saved
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Track products, set alerts, and monitor score changes.
          </p>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export watchlist
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-1.5 h-3.5 w-3.5" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Clear old products
          </Button>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <Tabs
        defaultValue="all"
        onValueChange={(val) => setActiveTab(val as string)}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="high-score">High Score</TabsTrigger>
          <TabsTrigger value="price-changed">Price Changed</TabsTrigger>
          <TabsTrigger value="new-activity">New Activity</TabsTrigger>
          <TabsTrigger value="alerts-set">Alerts Set</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Alerts</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.product}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${PLATFORM_BADGE[item.platform] ?? ""}`}
                        >
                          {item.platform}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`text-sm font-bold ${scoreColor(item.score)}`}
                        >
                          {item.score}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <ScoreChangeBadge change={item.scoreChange} />
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">
                        {item.lastActivity}
                      </TableCell>
                      <TableCell>
                        {item.alertStatus ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                            <Bell className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            <BellOff className="h-3 w-3" />
                            Off
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon-xs">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <AlertConfigModal
                            item={item}
                            onSave={handleSaveAlert}
                          />
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleRemove(item.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No products match this filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
