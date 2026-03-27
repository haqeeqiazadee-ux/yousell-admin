"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageCircle, Bot, Plus, Settings, ToggleLeft, ToggleRight,
  Phone, Mail, Globe, MessageSquare, ChevronLeft, ChevronRight,
  Trash2, Zap, Users, Clock, ThumbsUp, AlertTriangle
} from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

interface ChatbotConfig {
  id: string;
  provider: string;
  model: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  channels: string[];
  escalation_threshold: number;
  max_bot_turns: number;
  enabled: boolean;
}

interface Intent {
  id: string;
  name: string;
  display_name: string;
  sample_phrases: string[];
  response_template: string;
  category: string;
  active: boolean;
  priority: number;
}

interface Conversation {
  id: string;
  customer_name: string;
  customer_email: string;
  channel: string;
  status: string;
  satisfaction_score: number;
  message_count: number;
  duration_seconds: number;
  escalated_to: string;
  created_at: string;
}

interface Metrics {
  totalConversations: number;
  open: number;
  resolved: number;
  escalated: number;
  avgSatisfaction: string;
}

const PAGE_SIZE = 25;

const CHANNEL_ICONS: Record<string, typeof Globe> = {
  website: Globe,
  email: Mail,
  whatsapp: Phone,
  sms: MessageSquare,
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  escalated: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  abandoned: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export default function ChatbotPage() {
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [intents, setIntents] = useState<Intent[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"intents" | "conversations" | "config">("intents");
  const [convoFilter, setConvoFilter] = useState("all");
  const [convoPage, setConvoPage] = useState(1);
  const [intentDialogOpen, setIntentDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [intentForm, setIntentForm] = useState({ name: "", displayName: "", samplePhrases: "", responseTemplate: "", category: "general" });
  const [configForm, setConfigForm] = useState({ provider: "claude", model: "claude-haiku-4-5-20251001", temperature: 0.7, maxTokens: 1024, maxBotTurns: 5, escalationThreshold: 0.3 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/chatbot");
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setIntents(data.intents || []);
        setConversations(data.conversations || []);
        setMetrics(data.metrics || null);
        if (data.config) {
          setConfigForm({
            provider: data.config.provider || "claude",
            model: data.config.model || "claude-haiku-4-5-20251001",
            temperature: data.config.temperature || 0.7,
            maxTokens: data.config.max_tokens || 1024,
            maxBotTurns: data.config.max_bot_turns || 5,
            escalationThreshold: data.config.escalation_threshold || 0.3,
          });
        }
      }
    } catch (err) {
      console.error("Error loading chatbot data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleBot = async () => {
    setSubmitting(true);
    await authFetch("/api/admin/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_config", enabled: !config?.enabled }),
    });
    await fetchData();
    setSubmitting(false);
  };

  const toggleIntent = async (id: string, active: boolean) => {
    await authFetch("/api/admin/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_intent", id, active }),
    });
    await fetchData();
  };

  const handleCreateIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await authFetch("/api/admin/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_intent",
        name: intentForm.name.toLowerCase().replace(/\s+/g, "-"),
        displayName: intentForm.displayName,
        samplePhrases: intentForm.samplePhrases.split(",").map(p => p.trim()).filter(Boolean),
        responseTemplate: intentForm.responseTemplate,
        category: intentForm.category,
      }),
    });
    if (res.ok) {
      setIntentForm({ name: "", displayName: "", samplePhrases: "", responseTemplate: "", category: "general" });
      setIntentDialogOpen(false);
      await fetchData();
    }
    setSubmitting(false);
  };

  const deleteIntent = async (id: string) => {
    await authFetch(`/api/admin/chatbot?id=${id}`, { method: "DELETE" });
    await fetchData();
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await authFetch("/api/admin/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_config", ...configForm }),
    });
    setConfigDialogOpen(false);
    await fetchData();
    setSubmitting(false);
  };

  const filteredConversations = convoFilter === "all"
    ? conversations
    : conversations.filter(c => c.status === convoFilter);

  const pagedConversations = filteredConversations.slice((convoPage - 1) * PAGE_SIZE, convoPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-purple-500" />
            Conversational AI
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Chatbot management, intents, and conversation monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={config?.enabled ? "default" : "outline"}
            onClick={toggleBot}
            disabled={submitting}
            className="gap-2"
          >
            {config?.enabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            {config?.enabled ? "Bot Active" : "Bot Disabled"}
          </Button>
          <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2"><Settings className="h-4 w-4" />Configure</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Bot Configuration</DialogTitle></DialogHeader>
              <form onSubmit={handleUpdateConfig} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <select value={configForm.provider} onChange={e => setConfigForm(f => ({ ...f, provider: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                      <option value="claude">Claude (Anthropic)</option>
                      <option value="gpt">GPT (OpenAI)</option>
                      <option value="dialogflow">Dialogflow (Google)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Input value={configForm.model} onChange={e => setConfigForm(f => ({ ...f, model: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Temperature</Label>
                    <Input type="number" step="0.1" min="0" max="2" value={configForm.temperature} onChange={e => setConfigForm(f => ({ ...f, temperature: parseFloat(e.target.value) }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Tokens</Label>
                    <Input type="number" value={configForm.maxTokens} onChange={e => setConfigForm(f => ({ ...f, maxTokens: parseInt(e.target.value) }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Bot Turns</Label>
                    <Input type="number" value={configForm.maxBotTurns} onChange={e => setConfigForm(f => ({ ...f, maxBotTurns: parseInt(e.target.value) }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Escalation Threshold</Label>
                    <Input type="number" step="0.05" min="0" max="1" value={configForm.escalationThreshold} onChange={e => setConfigForm(f => ({ ...f, escalationThreshold: parseFloat(e.target.value) }))} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Saving..." : "Save Configuration"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Conversations</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><MessageCircle className="w-5 h-5 text-blue-500" />{metrics?.totalConversations || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Resolution Rate</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><ThumbsUp className="w-5 h-5 text-green-500" />{metrics && metrics.totalConversations > 0 ? ((metrics.resolved / metrics.totalConversations) * 100).toFixed(0) : 0}%</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Open</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500" />{metrics?.open || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Escalated</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" />{metrics?.escalated || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg Satisfaction</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500" />{metrics?.avgSatisfaction || "0"}/5</div></CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(["intents", "conversations", "config"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm capitalize ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Intents Tab */}
      {tab === "intents" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Intent Manager</CardTitle>
            <Dialog open={intentDialogOpen} onOpenChange={setIntentDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Add Intent</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Intent</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateIntent} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name (slug)</Label>
                    <Input value={intentForm.name} onChange={e => setIntentForm(f => ({ ...f, name: e.target.value }))} placeholder="order-status" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input value={intentForm.displayName} onChange={e => setIntentForm(f => ({ ...f, displayName: e.target.value }))} placeholder="Order Status" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Sample Phrases (comma-separated)</Label>
                    <Input value={intentForm.samplePhrases} onChange={e => setIntentForm(f => ({ ...f, samplePhrases: e.target.value }))} placeholder="where is my order, track my package" />
                  </div>
                  <div className="space-y-2">
                    <Label>Response Template</Label>
                    <Input value={intentForm.responseTemplate} onChange={e => setIntentForm(f => ({ ...f, responseTemplate: e.target.value }))} placeholder="Let me look up your order..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select value={intentForm.category} onChange={e => setIntentForm(f => ({ ...f, category: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                      <option value="general">General</option>
                      <option value="order">Order</option>
                      <option value="product">Product</option>
                      <option value="support">Support</option>
                      <option value="billing">Billing</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Creating..." : "Create Intent"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : intents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No intents configured</p>
                <p className="text-sm">Add intents to train your chatbot</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Intent</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Sample Phrases</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {intents.map(intent => (
                    <TableRow key={intent.id}>
                      <TableCell className="font-medium">{intent.display_name}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs capitalize">{intent.category}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{(intent.sample_phrases || []).join(", ")}</TableCell>
                      <TableCell>
                        <button onClick={() => toggleIntent(intent.id, !intent.active)}>
                          {intent.active
                            ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 cursor-pointer">Active</Badge>
                            : <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 cursor-pointer">Inactive</Badge>}
                        </button>
                      </TableCell>
                      <TableCell>
                        <button onClick={() => deleteIntent(intent.id)} className="text-red-600 hover:text-red-800"><Trash2 size={14} /></button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Conversations Tab */}
      {tab === "conversations" && (
        <Card>
          <CardHeader>
            <CardTitle>Conversation Log</CardTitle>
            <div className="flex gap-2 mt-2">
              {["all", "open", "resolved", "escalated", "abandoned"].map(f => (
                <button key={f} onClick={() => { setConvoFilter(f); setConvoPage(1); }} className={`px-3 py-1 rounded-lg text-xs capitalize ${convoFilter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {f}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No conversations yet</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Satisfaction</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedConversations.map(convo => {
                      const ChannelIcon = CHANNEL_ICONS[convo.channel] || Globe;
                      return (
                        <TableRow key={convo.id}>
                          <TableCell className="font-medium">{convo.customer_name || convo.customer_email || "Anonymous"}</TableCell>
                          <TableCell><span className="flex items-center gap-1 text-sm capitalize"><ChannelIcon className="h-3 w-3" />{convo.channel}</span></TableCell>
                          <TableCell><Badge className={`text-xs ${STATUS_COLORS[convo.status] || ""}`}>{convo.status}</Badge></TableCell>
                          <TableCell>{convo.message_count}</TableCell>
                          <TableCell>{convo.duration_seconds ? `${Math.floor(convo.duration_seconds / 60)}m ${convo.duration_seconds % 60}s` : "—"}</TableCell>
                          <TableCell>{convo.satisfaction_score ? `${convo.satisfaction_score}/5` : "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(convo.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {filteredConversations.length > PAGE_SIZE && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <span className="text-xs text-muted-foreground">Showing {(convoPage - 1) * PAGE_SIZE + 1}–{Math.min(convoPage * PAGE_SIZE, filteredConversations.length)} of {filteredConversations.length}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setConvoPage(p => Math.max(1, p - 1))} disabled={convoPage === 1} className="flex items-center gap-1 text-xs disabled:opacity-50"><ChevronLeft className="h-4 w-4" /> Prev</button>
                      <button onClick={() => setConvoPage(p => p + 1)} disabled={convoPage >= Math.ceil(filteredConversations.length / PAGE_SIZE)} className="flex items-center gap-1 text-xs disabled:opacity-50">Next <ChevronRight className="h-4 w-4" /></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Config Tab */}
      {tab === "config" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Bot Settings</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Provider</span><span className="font-medium capitalize">{config?.provider || "Not configured"}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Model</span><span className="font-medium">{config?.model || "—"}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Temperature</span><span className="font-medium">{config?.temperature ?? "—"}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Max Tokens</span><span className="font-medium">{config?.max_tokens ?? "—"}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Max Bot Turns</span><span className="font-medium">{config?.max_bot_turns ?? "—"}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Escalation Threshold</span><span className="font-medium">{config?.escalation_threshold ?? "—"}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span>{config?.enabled ? <Badge className="bg-green-100 text-green-800">Active</Badge> : <Badge variant="outline">Disabled</Badge>}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Active Channels</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {["website", "email", "whatsapp", "sms"].map(ch => {
                  const Icon = CHANNEL_ICONS[ch] || Globe;
                  const active = (config?.channels || []).includes(ch);
                  return (
                    <div key={ch} className={`flex items-center gap-3 p-3 rounded-lg border ${active ? "border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800" : "border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"}`}>
                      <Icon className={`h-5 w-5 ${active ? "text-green-600" : "text-gray-400"}`} />
                      <span className="text-sm capitalize font-medium">{ch}</span>
                      <Badge className={`ml-auto text-xs ${active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>{active ? "On" : "Off"}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
