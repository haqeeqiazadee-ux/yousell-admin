"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Scan,
  Zap,
  Globe,
  Users,
  Clock,
  DollarSign,
} from "lucide-react";

interface ScanMode {
  key: "quick" | "full" | "client";
  label: string;
  description: string;
  duration: string;
  cost: string;
  icon: React.ReactNode;
  color: string;
}

interface ScanHistoryEntry {
  id: string;
  date: string;
  mode: string;
  duration: string;
  products_found: number;
  hot_products: number;
  cost_estimate: string;
  status: string;
}

const scanModes: ScanMode[] = [
  {
    key: "quick",
    label: "Quick Scan",
    description: "TikTok Creative Center + pytrends + Reddit only",
    duration: "2-4 min",
    cost: "~$0.05-0.20",
    icon: <Zap className="h-5 w-5" />,
    color: "text-yellow-500",
  },
  {
    key: "full",
    label: "Full Scan",
    description:
      "All seven channels, all viral signals, Claude Haiku + Sonnet top 5",
    duration: "15-30 min",
    cost: "~$0.50-2.00",
    icon: <Globe className="h-5 w-5" />,
    color: "text-blue-500",
  },
  {
    key: "client",
    label: "Client Scan",
    description: "Full pipeline scoped to one client niche",
    duration: "10-20 min",
    cost: "~$0.30-1.50",
    icon: <Users className="h-5 w-5" />,
    color: "text-purple-500",
  },
];

const statusColors: Record<string, string> = {
  completed: "text-green-500 border-green-500/30",
  running: "text-blue-500 border-blue-500/30",
  failed: "text-red-500 border-red-500/30",
  queued: "text-yellow-500 border-yellow-500/30",
};

export default function ScanPage() {
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ScanMode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanRunning, setScanRunning] = useState(false);
  const [engineReady, setEngineReady] = useState<boolean | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/scan");
      const data = await res.json();
      setHistory(data.scans || []);
      setEngineReady(data.engine_ready ?? true);
    } catch {
      setHistory([]);
      setEngineReady(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleScanClick = (mode: ScanMode) => {
    setSelectedMode(mode);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedMode) return;
    setConfirmOpen(false);
    setScanning(true);
    setScanRunning(true);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 8;
      });
    }, 500);

    try {
      const res = await fetch("/api/admin/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scan_mode: selectedMode.key }),
      });

      if (res.ok) {
        setProgress(100);
        fetchHistory();
      }
    } catch {
      // Scan failed silently
    } finally {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setScanning(false);
        setScanRunning(false);
        setProgress(0);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Engine Status Banner */}
      {engineReady === false && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-400">
          <strong>LIMITED</strong> — No scraping API keys configured (Apify / RapidAPI).
          Add them in Settings to enable live scans.
        </div>
      )}
      {engineReady === true && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
          <strong>LIVE</strong> — Scan engine connected and ready to discover products.
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-outfit tracking-tight">
          Scan Control Panel
        </h1>
        <p className="text-muted-foreground">
          Launch product discovery scans across all channels
        </p>
      </div>

      {/* Scan Mode Buttons */}
      <div className="grid gap-4 md:grid-cols-3">
        {scanModes.map((mode) => (
          <Card
            key={mode.key}
            className="relative overflow-hidden transition-shadow hover:shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${mode.color}`}
                >
                  {mode.icon}
                </div>
                <CardTitle className="text-lg font-outfit">
                  {mode.label}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {mode.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {mode.duration}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  {mode.cost}
                </span>
              </div>
              <Button
                className="w-full"
                onClick={() => handleScanClick(mode)}
                disabled={scanRunning}
              >
                <Scan className="h-4 w-4 mr-2" />
                {scanRunning ? "Scan in progress..." : `Run ${mode.label}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Scan</DialogTitle>
          </DialogHeader>
          {selectedMode && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You are about to launch a scan. Please review the details below.
              </p>
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mode</span>
                  <span className="text-sm">{selectedMode.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Est. Duration</span>
                  <span className="text-sm flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {selectedMode.duration}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Est. Cost</span>
                  <span className="text-sm flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    {selectedMode.cost}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleConfirm}>Confirm</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Progress Section */}
      {scanning && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-outfit flex items-center gap-2">
              <Scan className="h-4 w-4 animate-spin" />
              Scan in Progress
              {selectedMode && (
                <Badge variant="outline" className="ml-2">
                  {selectedMode.label}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Scanning channels...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scan History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-outfit">Scan History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Scan className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No scans yet</p>
              <p className="text-sm">
                Run your first scan to start discovering trending products.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Products Found</TableHead>
                  <TableHead className="text-right">Hot Products</TableHead>
                  <TableHead className="text-right">Cost Est.</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm">
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {entry.mode}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {entry.duration}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {entry.products_found}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {entry.hot_products}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {entry.cost_estimate}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          statusColors[entry.status] ||
                          "text-gray-500 border-gray-500/30"
                        }
                      >
                        {entry.status}
                      </Badge>
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
