"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  XCircle,
  Shield,
  Key,
  Server,
  Zap,
} from "lucide-react";

interface EnvKeyStatus {
  key: string;
  set: boolean;
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
}

interface SettingsData {
  providers: ProviderStatus[];
  settings: { key: string; value: Record<string, unknown> }[];
}

const categoryLabels: Record<string, { label: string; icon: typeof Key }> = {
  ai: { label: "AI & Core", icon: Zap },
  ecommerce: { label: "E-Commerce", icon: Server },
  trends: { label: "Trends & Research", icon: Key },
  social: { label: "Social Platforms", icon: Key },
  competitor: { label: "Competitor Intel", icon: Shield },
  email: { label: "Email", icon: Key },
};

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = data
    ? Array.from(new Set(data.providers.map((p) => p.category)))
    : [];

  const configuredCount = data?.providers.filter((p) => p.configured).length ?? 0;
  const totalCount = data?.providers.length ?? 0;

  return (
    <div className="space-y-6">
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
        <Tabs defaultValue="providers">
          <TabsList>
            <TabsTrigger value="providers">API Providers</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

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
                  Configure your API providers below. Environment variables are
                  set in your <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.local</code> file
                  or in Netlify&apos;s environment settings.
                </p>
                <p>
                  Providers marked with a green checkmark are ready to use.
                  Red indicates missing API keys.
                </p>
              </CardContent>
            </Card>

            {categories.map((category) => {
              const catInfo = categoryLabels[category] ?? {
                label: category,
                icon: Key,
              };
              const Icon = catInfo.icon;
              const providers = data!.providers.filter(
                (p) => p.category === category
              );

              return (
                <div key={category} className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {catInfo.label}
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
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {provider.description}
                              </p>
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
                          <div className="mt-3 space-y-1">
                            {provider.envKeys.map((envKey) => (
                              <div
                                key={envKey.key}
                                className="flex items-center justify-between text-xs"
                              >
                                <code className="bg-muted px-1 py-0.5 rounded">
                                  {envKey.key}
                                </code>
                                <span
                                  className={
                                    envKey.set
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }
                                >
                                  {envKey.set ? "Set" : "Missing"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>

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
                  <span>Server-side env vars only</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
