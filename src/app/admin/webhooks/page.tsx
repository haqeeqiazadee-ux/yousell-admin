"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Webhook, Plus, Pencil, Trash2, Play,
  CheckCircle, XCircle, Clock, Activity, Globe,
} from "lucide-react";

/* ── Types ────────────────────────────────────────────────────── */

interface WebhookEntry {
  id: string;
  url: string;
  events: string[];
  status: "active" | "inactive";
  lastTriggered: string;
  successRate: number;
  totalDeliveries: number;
}

interface Delivery {
  id: string;
  webhookId: string;
  timestamp: string;
  event: string;
  statusCode: number;
  responseTime: number;
}

/* ── Mock Data ────────────────────────────────────────────────── */

const AVAILABLE_EVENTS = [
  "product.discovered",
  "product.scored",
  "product.tier_changed",
  "briefing.generated",
  "alert.triggered",
  "scan.completed",
  "client.budget_warning",
  "engine.health_changed",
];

const MOCK_WEBHOOKS: WebhookEntry[] = [
  {
    id: "wh-001",
    url: "https://hooks.slack.com/services/T00/B00/xxxxx",
    events: ["product.discovered", "alert.triggered"],
    status: "active",
    lastTriggered: "2026-03-27 09:42:18",
    successRate: 98.5,
    totalDeliveries: 1842,
  },
  {
    id: "wh-002",
    url: "https://api.partner.com/webhooks/yousell",
    events: ["product.scored", "product.tier_changed", "briefing.generated"],
    status: "active",
    lastTriggered: "2026-03-27 09:38:45",
    successRate: 99.2,
    totalDeliveries: 3420,
  },
  {
    id: "wh-003",
    url: "https://zapier.com/hooks/catch/12345/abcdef",
    events: ["scan.completed"],
    status: "inactive",
    lastTriggered: "2026-03-25 14:20:00",
    successRate: 94.8,
    totalDeliveries: 562,
  },
  {
    id: "wh-004",
    url: "https://internal.yousell.io/api/v2/events",
    events: ["product.discovered", "product.scored", "engine.health_changed", "client.budget_warning"],
    status: "active",
    lastTriggered: "2026-03-27 09:44:30",
    successRate: 99.8,
    totalDeliveries: 8940,
  },
];

const MOCK_DELIVERIES: Delivery[] = [
  { id: "del-001", webhookId: "wh-004", timestamp: "2026-03-27 09:44:30", event: "product.scored", statusCode: 200, responseTime: 142 },
  { id: "del-002", webhookId: "wh-001", timestamp: "2026-03-27 09:42:18", event: "alert.triggered", statusCode: 200, responseTime: 238 },
  { id: "del-003", webhookId: "wh-002", timestamp: "2026-03-27 09:38:45", event: "briefing.generated", statusCode: 200, responseTime: 312 },
  { id: "del-004", webhookId: "wh-004", timestamp: "2026-03-27 09:35:12", event: "engine.health_changed", statusCode: 200, responseTime: 98 },
  { id: "del-005", webhookId: "wh-001", timestamp: "2026-03-27 09:30:55", event: "product.discovered", statusCode: 502, responseTime: 5012 },
  { id: "del-006", webhookId: "wh-002", timestamp: "2026-03-27 09:28:40", event: "product.tier_changed", statusCode: 200, responseTime: 189 },
  { id: "del-007", webhookId: "wh-004", timestamp: "2026-03-27 09:25:18", event: "client.budget_warning", statusCode: 200, responseTime: 156 },
  { id: "del-008", webhookId: "wh-002", timestamp: "2026-03-27 09:20:05", event: "product.scored", statusCode: 408, responseTime: 30000 },
  { id: "del-009", webhookId: "wh-001", timestamp: "2026-03-27 09:15:32", event: "product.discovered", statusCode: 200, responseTime: 210 },
  { id: "del-010", webhookId: "wh-004", timestamp: "2026-03-27 09:10:48", event: "product.discovered", statusCode: 200, responseTime: 124 },
];

/* ── Helpers ──────────────────────────────────────────────────── */

function StatusCodeBadge({ code }: { code: number }) {
  if (code >= 200 && code < 300) return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-mono">{code}</Badge>;
  if (code >= 400 && code < 500) return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 font-mono">{code}</Badge>;
  return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 font-mono">{code}</Badge>;
}

/* ── Page Component ──────────────────────────────────────────── */

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState(MOCK_WEBHOOKS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newSecret, setNewSecret] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const handleAddWebhook = () => {
    if (!newUrl || selectedEvents.length === 0) return;
    const newWebhook: WebhookEntry = {
      id: `wh-${Date.now()}`,
      url: newUrl,
      events: selectedEvents,
      status: "active",
      lastTriggered: "Never",
      successRate: 100,
      totalDeliveries: 0,
    };
    setWebhooks([...webhooks, newWebhook]);
    setNewUrl("");
    setNewSecret("");
    setSelectedEvents([]);
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setWebhooks(webhooks.filter((w) => w.id !== id));
  };

  const handleToggle = (id: string) => {
    setWebhooks(webhooks.map((w) =>
      w.id === id ? { ...w, status: w.status === "active" ? "inactive" as const : "active" as const } : w
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage webhook endpoints and monitor deliveries</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Webhook</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Endpoint URL</Label>
                <Input
                  placeholder="https://example.com/webhooks"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Secret (optional)</Label>
                <Input
                  type="password"
                  placeholder="whsec_..."
                  value={newSecret}
                  onChange={(e) => setNewSecret(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Used to sign webhook payloads for verification</p>
              </div>
              <div className="space-y-2">
                <Label>Events</Label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {AVAILABLE_EVENTS.map((event) => (
                    <label key={event} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-muted/50">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event)}
                        onChange={() => toggleEvent(event)}
                        className="rounded border-input"
                      />
                      <span className="font-mono text-xs">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddWebhook} className="w-full" disabled={!newUrl || selectedEvents.length === 0}>
                Create Webhook
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Globe className="w-4 h-4" /> Total Webhooks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhooks.length}</div>
            <p className="text-xs text-muted-foreground">{webhooks.filter((w) => w.status === "active").length} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" /> Total Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhooks.reduce((s, w) => s + w.totalDeliveries, 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" /> Avg Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(webhooks.reduce((s, w) => s + w.successRate, 0) / webhooks.length).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Across all endpoints</p>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Webhook className="w-4 h-4" />
            Webhook Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Triggered</TableHead>
                <TableHead className="text-right">Success Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((wh) => (
                <TableRow key={wh.id}>
                  <TableCell className="font-mono text-xs max-w-[250px] truncate">{wh.url}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map((e) => (
                        <Badge key={e} variant="outline" className="text-[10px] font-mono">{e}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={wh.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }
                    >
                      {wh.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{wh.lastTriggered}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono font-medium ${wh.successRate >= 99 ? "text-green-600 dark:text-green-400" : wh.successRate >= 95 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                      {wh.successRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Delete" onClick={() => handleDelete(wh.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Test" onClick={() => handleToggle(wh.id)}>
                        <Play className="w-3.5 h-3.5 text-blue-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Status Code</TableHead>
                <TableHead className="text-right">Response Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_DELIVERIES.map((d) => (
                <TableRow key={d.id} className={d.statusCode >= 400 ? "bg-red-50/30 dark:bg-red-950/10" : ""}>
                  <TableCell className="font-mono text-xs">{d.timestamp}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-mono">{d.event}</Badge>
                  </TableCell>
                  <TableCell><StatusCodeBadge code={d.statusCode} /></TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono text-sm ${d.responseTime > 5000 ? "text-red-600 dark:text-red-400" : d.responseTime > 1000 ? "text-amber-600 dark:text-amber-400" : ""}`}>
                      {d.responseTime}ms
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
