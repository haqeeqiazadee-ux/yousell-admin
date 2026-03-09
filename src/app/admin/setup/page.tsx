"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  Database,
  Shield,
  Zap,
  Mail,
  Globe,
  Key,
} from "lucide-react";

interface StepStatus {
  label: string;
  description: string;
  icon: typeof Database;
  check: () => Promise<boolean>;
  configPath: string;
}

export default function SetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<Record<number, boolean | null>>({});
  const [checking, setChecking] = useState(true);

  const steps: StepStatus[] = [
    {
      label: "Supabase Connection",
      description: "Database and authentication backend",
      icon: Database,
      configPath: "/admin/settings",
      check: async () => {
        try {
          const res = await fetch("/api/admin/dashboard");
          const data = await res.json();
          return data.services?.supabase === true;
        } catch {
          return false;
        }
      },
    },
    {
      label: "Authentication & RBAC",
      description: "User roles and permissions system",
      icon: Shield,
      configPath: "/admin/settings",
      check: async () => {
        try {
          const res = await fetch("/api/admin/dashboard");
          const data = await res.json();
          return data.services?.auth === true;
        } catch {
          return false;
        }
      },
    },
    {
      label: "AI Engine (Claude)",
      description: "Anthropic API for AI-powered insights",
      icon: Zap,
      configPath: "/admin/settings",
      check: async () => {
        try {
          const res = await fetch("/api/admin/dashboard");
          const data = await res.json();
          return data.services?.ai === true;
        } catch {
          return false;
        }
      },
    },
    {
      label: "Email Notifications (Resend)",
      description: "Alert system for viral product detection",
      icon: Mail,
      configPath: "/admin/settings",
      check: async () => {
        try {
          const res = await fetch("/api/admin/dashboard");
          const data = await res.json();
          return data.services?.email === true;
        } catch {
          return false;
        }
      },
    },
    {
      label: "Scraping Providers (Apify)",
      description: "TikTok, Amazon, Shopify data collection",
      icon: Globe,
      configPath: "/admin/settings",
      check: async () => {
        try {
          const res = await fetch("/api/admin/dashboard");
          const data = await res.json();
          return data.services?.apify === true;
        } catch {
          return false;
        }
      },
    },
    {
      label: "API Provider Keys",
      description: "Verify all required API keys are configured",
      icon: Key,
      configPath: "/admin/settings",
      check: async () => {
        try {
          const res = await fetch("/api/admin/settings");
          const data = await res.json();
          const providers = data.providers || [];
          const configured = providers.filter((p: { configured: boolean }) => p.configured).length;
          return configured >= 3; // At least 3 providers configured
        } catch {
          return false;
        }
      },
    },
  ];

  useEffect(() => {
    async function runChecks() {
      setChecking(true);
      const dashRes = await fetch("/api/admin/dashboard").then(r => r.json()).catch(() => ({}));
      const settingsRes = await fetch("/api/admin/settings").then(r => r.json()).catch(() => ({}));

      const newResults: Record<number, boolean> = {};

      newResults[0] = dashRes.services?.supabase === true;
      newResults[1] = dashRes.services?.auth === true;
      newResults[2] = dashRes.services?.ai === true;
      newResults[3] = dashRes.services?.email === true;
      newResults[4] = dashRes.services?.apify === true;

      const providers = settingsRes.providers || [];
      const configured = providers.filter((p: { configured: boolean }) => p.configured).length;
      newResults[5] = configured >= 3;

      setResults(newResults);

      // Find first failing step
      const firstFail = Object.entries(newResults).find(([, v]) => !v);
      setCurrentStep(firstFail ? Number(firstFail[0]) : steps.length);
      setChecking(false);
    }
    runChecks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const passedCount = Object.values(results).filter(Boolean).length;
  const allPassed = passedCount === steps.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-outfit tracking-tight">
          Setup Wizard
        </h1>
        <p className="text-muted-foreground">
          Verify your platform is properly configured before running scans.
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Configuration Progress
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {checking ? "Checking..." : `${passedCount}/${steps.length} complete`}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: checking ? "0%" : `${(passedCount / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => {
          const status = results[i];
          const isActive = i === currentStep;

          return (
            <div
              key={step.label}
              className={`bg-white dark:bg-gray-900 rounded-xl border p-4 transition-all ${
                isActive
                  ? "border-blue-300 dark:border-blue-700 shadow-sm"
                  : "border-gray-200 dark:border-gray-800"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    status === true
                      ? "bg-emerald-50 dark:bg-emerald-900/20"
                      : status === false
                      ? "bg-red-50 dark:bg-red-900/20"
                      : "bg-gray-50 dark:bg-gray-800"
                  }`}
                >
                  {checking ? (
                    <Loader2 size={18} className="text-gray-400 animate-spin" />
                  ) : status === true ? (
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  ) : status === false ? (
                    <XCircle size={18} className="text-red-500" />
                  ) : (
                    <step.icon size={18} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
                {status === false && (
                  <button
                    onClick={() => router.push(step.configPath)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    Configure <ArrowRight size={12} />
                  </button>
                )}
                {status === true && (
                  <span className="text-xs font-medium text-emerald-600">Ready</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      {!checking && (
        <div className="flex gap-3">
          {allPassed ? (
            <button
              onClick={() => router.push("/admin")}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              Go to Dashboard <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Re-check Configuration
              </button>
              <button
                onClick={() => router.push("/admin/settings")}
                className="px-6 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg transition-colors"
              >
                Open Settings
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
