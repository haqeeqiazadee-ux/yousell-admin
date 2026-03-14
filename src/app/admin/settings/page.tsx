"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORY_LABELS } from "@/lib/providers/config";
import {
  CheckCircle2,
  XCircle,
  Shield,
  Key,
  Server,
  Zap,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface EnvKeyStatus {
  key: string;
  set: boolean;
  source: "env" | "db" | null;
}

interface ProviderStatus {
  id: string;
  name: string;
  description: string;
  category: string;
  phase: number;
  freeQuota?: string;
  configured: boolean;
  envKeys: EnvKeyStatus[];
  pendingApproval?: boolean;
  fallback?: string;
}

interface SettingsData {
  providers: ProviderStatus[];
  settings: { key: string; value: Record<string, unknown> }[];
}

interface AutomationJob {
  job_name: string;
  status: "disabled" | "enabled" | "running" | "failed";
  trigger_type?: string;
  last_run?: string;
  next_run?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CATEGORY_ICONS: Record<string, typeof Key> = {
  ai: Zap,
  ecommerce: Server,
  trends: Key,
  social: Key,
  competitor: Shield,
  email: Key,
  influencer: Key,
  supplier: Key,
};

const JOB_LABELS: Record<string, { label: string; cost: string; frequency: string }> = {
  trend_scout_early_viral: {
    label: "Trend Scout + Early Viral",
    cost: "~$5-10/mo",
    frequency: "Every 6 hours",
  },
  tiktok_product_scan: {
    label: "TikTok Product Scan",
    cost: "~$3-8/mo",
    frequency: "Daily",
  },
  amazon_bsr_tracker: {
    label: "Amazon BSR Tracker",
    cost: "~$2-5/mo",
    frequency: "Daily",
  },
  pinterest_trend_scan: {
    label: "Pinterest Trend Scan",
    cost: "~$1-3/mo",
    frequency: "Daily",
  },
  google_trends_sync: {
    label: "Google Trends Sync",
    cost: "~$0/mo (free)",
    frequency: "Every 12 hours",
  },
  reddit_sentiment_scan: {
    label: "Reddit Sentiment Scan",
    cost: "~$0/mo (free)",
    frequency: "Every 6 hours",
  },
  digital_product_scan: {
    label: "Digital Product Scan",
    cost: "~$1-3/mo",
    frequency: "Daily",
  },
  ai_affiliate_match: {
    label: "AI Affiliate Match",
    cost: "~$0.50/mo",
    frequency: "Daily",
  },
  shopify_competitor_scan: {
    label: "Shopify Competitor Scan",
    cost: "~$2-5/mo",
    frequency: "Daily",
  },
  influencer_refresh: {
    label: "Influencer Refresh",
    cost: "~$1-3/mo",
    frequency: "Weekly",
  },
  supplier_refresh: {
    label: "Supplier Refresh",
    cost: "~$0.50/mo",
    frequency: "Weekly",
  },
};

function formatJobName(jobName: string): string {
  const meta = JOB_LABELS[jobName];
  if (meta) return meta.label;
  return jobName
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function statusBadge(status: AutomationJob["status"]) {
  const map: Record<
    string,
    { label: string; className: string }
  > = {
    disabled: {
      label: "Disabled",
      className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    },
    enabled: {
      label: "Enabled",
      className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    running: {
      label: "Running",
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    failed: {
      label: "Failed",
      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
  };
  const info = map[status] ?? map.disabled;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${info.className}`}
    >
      {info.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [togglingJobs, setTogglingJobs] = useState<Set<string>>(new Set());

  // API key editing state
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({});
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [savingProvider, setSavingProvider] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  /* Fetch providers */
  const fetchProviders = useCallback(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  /* Fetch automation jobs */
  const fetchJobs = useCallback(() => {
    setJobsLoading(true);
    fetch("/api/admin/automation")
      .then((res) => res.json())
      .then((d: AutomationJob[]) => {
        setJobs(Array.isArray(d) ? d : []);
        setJobsLoading(false);
      })
      .catch(() => setJobsLoading(false));
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  /* Master kill switch — disable ALL jobs */
  const killAllJobs = async () => {
    try {
      const res = await fetch("/api/admin/automation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ killSwitch: true }),
      });
      if (res.ok) {
        const updated: AutomationJob[] = await res.json();
        setJobs(Array.isArray(updated) ? updated : []);
      }
    } catch {}
  };

  /* Toggle a job */
  const toggleJob = async (jobName: string, currentStatus: string) => {
    const newStatus = currentStatus === "enabled" ? "disabled" : "enabled";
    setTogglingJobs((prev) => new Set(prev).add(jobName));

    try {
      const res = await fetch("/api/admin/automation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_name: jobName, status: newStatus }),
      });
      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) =>
            j.job_name === jobName ? { ...j, status: newStatus } : j
          )
        );
      }
    } finally {
      setTogglingJobs((prev) => {
        const next = new Set(prev);
        next.delete(jobName);
        return next;
      });
    }
  };

  /* Save API keys for a provider */
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveProviderKeys = async (provider: ProviderStatus) => {
    const apiKeys: Record<string, string> = {};
    let hasInput = false;

    for (const envKey of provider.envKeys) {
      const val = keyInputs[envKey.key];
      if (val !== undefined && val !== "") {
        apiKeys[envKey.key] = val;
        hasInput = true;
      }
    }

    if (!hasInput) return;

    setSavingProvider(provider.id);
    setSaveError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKeys }),
      });

      if (res.ok) {
        // Clear inputs and refresh data
        setKeyInputs((prev) => {
          const next = { ...prev };
          for (const envKey of provider.envKeys) {
            delete next[envKey.key];
          }
          return next;
        });
        setSaveSuccess(provider.id);
        setTimeout(() => setSaveSuccess(null), 2000);
        fetchProviders();
      } else {
        const err = await res.json().catch(() => ({ error: "Failed to save" }));
        setSaveError(`${provider.name}: ${err.error || "Failed to save"}`);
        setTimeout(() => setSaveError(null), 5000);
      }
    } catch {
      setSaveError(`${provider.name}: Network error`);
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setSavingProvider(null);
    }
  };

  /* Remove a saved DB key */
  const removeKey = async (envKeyName: string, providerId: string) => {
    setSavingProvider(providerId);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKeys: { [envKeyName]: "" } }),
      });
      if (res.ok) {
        fetchProviders();
      }
    } finally {
      setSavingProvider(null);
    }
  };

  const toggleKeyVisibility = (key: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  /* Check if a provider has unsaved input */
  const providerHasInput = (provider: ProviderStatus) => {
    return provider.envKeys.some((ek) => {
      const val = keyInputs[ek.key];
      return val !== undefined && val !== "";
    });
  };

  /* Derived data */
  const categories = data
    ? Array.from(new Set(data.providers.map((p) => p.category)))
    : [];

  const configuredCount = data?.providers.filter((p) => p.configured).length ?? 0;
  const totalCount = data?.providers.length ?? 0;

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Setup wizard and API provider configuration
          </p>
        </div>
        {!loading && data && (
          <Badge
            variant="outline"
            className={
              configuredCount === totalCount
                ? "text-green-500 border-green-500/30"
                : "text-yellow-500 border-yellow-500/30"
            }
          >
            {configuredCount}/{totalCount} Providers Connected
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      ) : (
        <Tabs defaultValue="providers" className="flex flex-col gap-2">
          <TabsList className="flex flex-row h-8">
            <TabsTrigger value="providers">API Providers</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* ====== API Providers Tab ====== */}
          <TabsContent value="providers" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Setup Wizard
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Configure your API providers below. Enter your API keys
                  directly or set them as environment variables in{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    .env.local
                  </code>{" "}
                  or Netlify&apos;s environment settings.
                </p>
                <p>
                  Providers marked with a green checkmark are ready to use. Red
                  indicates missing API keys.
                </p>
              </CardContent>
            </Card>

            {saveError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {saveError}
              </div>
            )}

            {categories.map((category) => {
              const catLabel =
                CATEGORY_LABELS[category] ?? category;
              const Icon = CATEGORY_ICONS[category] ?? Key;
              const providers = data!.providers.filter(
                (p) => p.category === category
              );

              return (
                <div key={category} className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {catLabel}
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {providers.map((provider) => (
                      <Card key={provider.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm">
                                  {provider.name}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1 py-0"
                                >
                                  Phase {provider.phase}
                                </Badge>
                                {provider.pendingApproval && (
                                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px] px-1.5 py-0 border-yellow-300">
                                    <AlertTriangle className="h-3 w-3 mr-0.5" />
                                    Pending Approval
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {provider.description}
                              </p>
                              {provider.pendingApproval && provider.fallback && (
                                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                  Fallback: {provider.fallback}
                                </p>
                              )}
                              {provider.freeQuota && (
                                <p className="text-xs text-green-500">
                                  {provider.freeQuota}
                                </p>
                              )}
                            </div>
                            {provider.configured ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                            )}
                          </div>

                          {/* API Key inputs */}
                          <div className="mt-3 space-y-2">
                            {provider.envKeys.map((envKey) => (
                              <div key={envKey.key} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <code className="bg-muted px-1 py-0.5 rounded">
                                    {envKey.key}
                                  </code>
                                  <span className="flex items-center gap-1.5">
                                    {envKey.set && (
                                      <span className={
                                        envKey.source === "env"
                                          ? "text-green-500"
                                          : "text-blue-500"
                                      }>
                                        {envKey.source === "env" ? "Set (env)" : "Set (saved)"}
                                      </span>
                                    )}
                                    {!envKey.set && (
                                      <span className="text-red-500">Missing</span>
                                    )}
                                  </span>
                                </div>

                                {/* Show input if not set via env var */}
                                {envKey.source !== "env" && (
                                  <div className="flex items-center gap-1.5">
                                    <div className="relative flex-1">
                                      <Input
                                        type={visibleKeys.has(envKey.key) ? "text" : "password"}
                                        placeholder={envKey.set ? "••••••••••••" : `Enter ${envKey.key}`}
                                        value={keyInputs[envKey.key] ?? ""}
                                        onChange={(e) =>
                                          setKeyInputs((prev) => ({
                                            ...prev,
                                            [envKey.key]: e.target.value,
                                          }))
                                        }
                                        className="h-7 text-xs pr-8 font-mono"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => toggleKeyVisibility(envKey.key)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                      >
                                        {visibleKeys.has(envKey.key) ? (
                                          <EyeOff className="h-3.5 w-3.5" />
                                        ) : (
                                          <Eye className="h-3.5 w-3.5" />
                                        )}
                                      </button>
                                    </div>
                                    {envKey.source === "db" && !keyInputs[envKey.key] && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => removeKey(envKey.key, provider.id)}
                                        disabled={savingProvider === provider.id}
                                      >
                                        Remove
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Save button for this provider */}
                          {provider.envKeys.some((ek) => ek.source !== "env") && (
                            <div className="mt-3 flex items-center gap-2">
                              <Button
                                size="sm"
                                className="h-7 text-xs"
                                disabled={
                                  !providerHasInput(provider) ||
                                  savingProvider === provider.id
                                }
                                onClick={() => saveProviderKeys(provider)}
                              >
                                {savingProvider === provider.id ? (
                                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                ) : (
                                  <Save className="h-3.5 w-3.5 mr-1" />
                                )}
                                Save Keys
                              </Button>
                              {saveSuccess === provider.id && (
                                <span className="text-xs text-green-500 flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Saved
                                </span>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* ====== Automation Tab ====== */}
          <TabsContent value="automation" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Automation Jobs
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  All jobs are{" "}
                  <span className="font-semibold text-foreground">
                    DISABLED
                  </span>{" "}
                  by default. Enable them individually.
                </p>
                {jobs.some((j) => j.status === "enabled" || j.status === "running") && (
                  <button
                    onClick={killAllJobs}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Master Kill Switch — Disable All Jobs
                  </button>
                )}
              </CardContent>
            </Card>

            {jobsLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-36" />
                <Skeleton className="h-36" />
                <Skeleton className="h-36" />
                <Skeleton className="h-36" />
              </div>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No automation jobs found. Jobs will appear here once the
                  automation system is configured.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {jobs.map((job) => {
                  const meta = JOB_LABELS[job.job_name];
                  const isToggling = togglingJobs.has(job.job_name);

                  return (
                    <Card key={job.job_name}>
                      <CardContent className="pt-4 space-y-3">
                        {/* Top row: name + status */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-sm">
                              {formatJobName(job.job_name)}
                            </h4>
                            <div className="flex items-center gap-2">
                              {statusBadge(job.status)}
                            </div>
                          </div>
                          <Switch
                            checked={
                              job.status === "enabled" ||
                              job.status === "running"
                            }
                            disabled={isToggling}
                            onCheckedChange={() =>
                              toggleJob(job.job_name, job.status)
                            }
                          />
                        </div>

                        {/* Details */}
                        <div className="space-y-1 text-xs text-muted-foreground">
                          {job.trigger_type && (
                            <div className="flex justify-between">
                              <span>Trigger</span>
                              <span className="text-foreground">
                                {job.trigger_type}
                              </span>
                            </div>
                          )}
                          {meta?.frequency && (
                            <div className="flex justify-between">
                              <span>Frequency</span>
                              <span className="text-foreground">
                                {meta.frequency}
                              </span>
                            </div>
                          )}
                          {meta?.cost && (
                            <div className="flex justify-between">
                              <span>Est. Cost</span>
                              <span className="text-foreground">
                                {meta.cost}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ====== System Tab ====== */}
          <TabsContent value="system" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform</span>
                  <span>Next.js 14 + Supabase</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hosting</span>
                  <span>Netlify</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Database</span>
                  <span>Supabase (PostgreSQL)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Authentication</span>
                  <span>Supabase Auth + RBAC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AI Engine</span>
                  <span>Claude (Anthropic)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost Model</span>
                  <span>Jobs disabled by default, manual trigger</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auth Method</span>
                  <span>Supabase Auth (email + OAuth)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RBAC</span>
                  <Badge
                    variant="outline"
                    className="text-green-500 border-green-500/30"
                  >
                    Enabled
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RLS Policies</span>
                  <Badge
                    variant="outline"
                    className="text-green-500 border-green-500/30"
                  >
                    Active
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    API Keys Storage
                  </span>
                  <span>Server env vars + encrypted DB</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
