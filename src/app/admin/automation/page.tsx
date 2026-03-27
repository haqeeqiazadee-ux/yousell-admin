"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { toast } from "sonner";
import {
  Sparkles, Play, Pause, Clock, AlertTriangle, CheckCircle,
  XCircle, Timer, DollarSign, Database, ShieldAlert, Loader2,
  RefreshCcw
} from "lucide-react";

interface AutomationJob {
  id: string;
  job_name: string;
  status: "disabled" | "enabled" | "running" | "completed" | "failed";
  trigger_type: "manual" | "scheduled";
  cron_expression: string | null;
  started_at: string | null;
  completed_at: string | null;
  records_processed: number;
  api_cost_estimate: number;
  error_log: string | null;
  created_at: string;
}

const statusConfig: Record<string, { color: string; bg: string; icon: typeof CheckCircle; label: string }> = {
  disabled: { color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800", icon: Pause, label: "Disabled" },
  enabled: { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: Play, label: "Enabled" },
  running: { color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30", icon: Loader2, label: "Running" },
  completed: { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: CheckCircle, label: "Completed" },
  failed: { color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30", icon: XCircle, label: "Failed" },
};

function formatJobName(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AutomationPage() {
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await authFetch("/api/admin/automation");
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : data.jobs || []);
    } catch {
      toast.error("Failed to load automation jobs");
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const toggleJob = async (job: AutomationJob) => {
    const newStatus = job.status === "enabled" ? "disabled" : "enabled";
    setToggling(job.id);
    try {
      const res = await authFetch("/api/admin/automation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_name: job.job_name, status: newStatus }),
      });
      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
        );
        toast.success(`${formatJobName(job.job_name)} ${newStatus}`);
      } else {
        toast.error("Failed to toggle job");
      }
    } catch {
      toast.error("Failed to toggle job");
    }
    setToggling(null);
  };

  const killAll = async () => {
    try {
      const res = await authFetch("/api/admin/automation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ killSwitch: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
        toast.success("All automation jobs disabled");
      }
    } catch {
      toast.error("Failed to disable all jobs");
    }
  };

  const enabledCount = jobs.filter((j) => j.status === "enabled").length;
  const runningCount = jobs.filter((j) => j.status === "running").length;
  const totalCost = jobs.reduce((sum, j) => sum + Number(j.api_cost_estimate || 0), 0);
  const totalRecords = jobs.reduce((sum, j) => sum + (j.records_processed || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Automation</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage scheduled intelligence jobs — all disabled by default
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchJobs}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCcw size={14} /> Refresh
          </button>
          <button
            onClick={killAll}
            className="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 flex items-center gap-1.5 transition-colors"
          >
            <ShieldAlert size={14} /> Kill All
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 card-hover">
          <div className="gradient-emerald icon-circle-lg text-white mb-3" style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Play size={16} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{enabledCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Enabled Jobs</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 card-hover">
          <div className="gradient-blue icon-circle-lg text-white mb-3" style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Loader2 size={16} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{runningCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Running Now</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 card-hover">
          <div className="gradient-amber icon-circle-lg text-white mb-3" style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DollarSign size={16} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${totalCost.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total API Cost</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 card-hover">
          <div className="gradient-purple icon-circle-lg text-white mb-3" style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Database size={16} />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalRecords.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-0.5">Records Processed</p>
        </div>
      </div>

      {/* Cost Warning */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
        <span className="gradient-amber icon-circle text-white flex-shrink-0" style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AlertTriangle size={14} />
        </span>
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Cost Control</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            All automation jobs are disabled by default (manual-first cost control per v7 spec Rule 10).
            Enable jobs carefully — each scheduled run consumes API credits.
          </p>
        </div>
      </div>

      {/* Job List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <span className="gradient-coral icon-circle text-white" style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={14} />
          </span>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">
            Automation Jobs ({jobs.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No automation jobs found</p>
            <p className="text-xs text-gray-300 mt-1">Jobs are seeded during database migration</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {jobs.map((job) => {
              const sc = statusConfig[job.status] || statusConfig.disabled;
              const StatusIcon = sc.icon;
              return (
                <div key={job.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleJob(job)}
                    disabled={toggling === job.id || job.status === "running"}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      job.status === "enabled"
                        ? "bg-emerald-500"
                        : "bg-gray-300 dark:bg-gray-700"
                    } ${toggling === job.id ? "opacity-50" : ""}`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        job.status === "enabled" ? "translate-x-[1.375rem]" : "translate-x-0.5"
                      }`}
                    />
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatJobName(job.job_name)}
                      </p>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                        <StatusIcon size={10} className={job.status === "running" ? "animate-spin" : ""} />
                        {sc.label}
                      </span>
                      {job.trigger_type === "scheduled" && job.cron_expression && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Timer size={10} />
                          {job.cron_expression}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        {job.started_at ? `Last run: ${formatTime(job.started_at)}` : "Never run"}
                      </span>
                      {job.records_processed > 0 && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Database size={10} />
                          {job.records_processed.toLocaleString()} records
                        </span>
                      )}
                      {Number(job.api_cost_estimate) > 0 && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <DollarSign size={10} />
                          ${Number(job.api_cost_estimate).toFixed(4)}
                        </span>
                      )}
                    </div>
                    {job.error_log && job.status === "failed" && (
                      <p className="text-xs text-red-500 mt-1 truncate max-w-md">{job.error_log}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
