"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Calendar, Play, Pause, Pencil, Clock,
  CheckCircle, XCircle, AlertTriangle, Timer,
  Search, Zap, Trash2, BarChart2,
} from "lucide-react";

/* ── Types ────────────────────────────────────────────────────── */

type JobStatus = "active" | "paused" | "failed";
type JobCategory = "Discovery" | "Scoring" | "Cleanup" | "Reporting";

interface ScheduledJob {
  id: string;
  name: string;
  category: JobCategory;
  cron: string;
  humanSchedule: string;
  lastRun: string;
  nextRun: string;
  status: JobStatus;
  duration: string;
}

/* ── Mock Data: 8 Scheduled Jobs ──────────────────────────────── */

const MOCK_JOBS: ScheduledJob[] = [
  {
    id: "job-001",
    name: "TikTok Product Discovery Scan",
    category: "Discovery",
    cron: "0 */2 * * *",
    humanSchedule: "Every 2 hours",
    lastRun: "2026-03-27 08:00:00",
    nextRun: "2026-03-27 10:00:00",
    status: "active",
    duration: "4m 32s",
  },
  {
    id: "job-002",
    name: "Multi-Platform Discovery Sweep",
    category: "Discovery",
    cron: "0 6,12,18 * * *",
    humanSchedule: "3x daily (06:00, 12:00, 18:00)",
    lastRun: "2026-03-27 06:00:00",
    nextRun: "2026-03-27 12:00:00",
    status: "active",
    duration: "12m 18s",
  },
  {
    id: "job-003",
    name: "Full Score Recalculation",
    category: "Scoring",
    cron: "30 3 * * *",
    humanSchedule: "Daily at 03:30",
    lastRun: "2026-03-27 03:30:00",
    nextRun: "2026-03-28 03:30:00",
    status: "active",
    duration: "8m 45s",
  },
  {
    id: "job-004",
    name: "Trend Stage Re-evaluation",
    category: "Scoring",
    cron: "0 */6 * * *",
    humanSchedule: "Every 6 hours",
    lastRun: "2026-03-27 06:00:00",
    nextRun: "2026-03-27 12:00:00",
    status: "active",
    duration: "2m 12s",
  },
  {
    id: "job-005",
    name: "Stale Product Cleanup",
    category: "Cleanup",
    cron: "0 2 * * 0",
    humanSchedule: "Weekly (Sunday 02:00)",
    lastRun: "2026-03-23 02:00:00",
    nextRun: "2026-03-30 02:00:00",
    status: "active",
    duration: "1m 48s",
  },
  {
    id: "job-006",
    name: "Log Rotation & Archival",
    category: "Cleanup",
    cron: "0 1 1 * *",
    humanSchedule: "Monthly (1st at 01:00)",
    lastRun: "2026-03-01 01:00:00",
    nextRun: "2026-04-01 01:00:00",
    status: "active",
    duration: "32s",
  },
  {
    id: "job-007",
    name: "Weekly Performance Report",
    category: "Reporting",
    cron: "0 9 * * 1",
    humanSchedule: "Weekly (Monday 09:00)",
    lastRun: "2026-03-24 09:00:00",
    nextRun: "2026-03-31 09:00:00",
    status: "paused",
    duration: "1m 05s",
  },
  {
    id: "job-008",
    name: "Daily Cost Summary Email",
    category: "Reporting",
    cron: "0 23 * * *",
    humanSchedule: "Daily at 23:00",
    lastRun: "2026-03-26 23:00:00",
    nextRun: "2026-03-27 23:00:00",
    status: "failed",
    duration: "15s",
  },
];

/* ── Helpers ──────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: JobStatus }) {
  if (status === "active") return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
  if (status === "paused") return <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"><Pause className="w-3 h-3 mr-1" />Paused</Badge>;
  return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
}

function CategoryIcon({ category }: { category: JobCategory }) {
  if (category === "Discovery") return <Search className="w-3.5 h-3.5" />;
  if (category === "Scoring") return <Zap className="w-3.5 h-3.5" />;
  if (category === "Cleanup") return <Trash2 className="w-3.5 h-3.5" />;
  return <BarChart2 className="w-3.5 h-3.5" />;
}

/* ── Page Component ──────────────────────────────────────────── */

export default function SchedulePage() {
  const [jobs, setJobs] = useState(MOCK_JOBS);

  const activeCount = jobs.filter((j) => j.status === "active").length;
  const pausedCount = jobs.filter((j) => j.status === "paused").length;
  const failedCount = jobs.filter((j) => j.status === "failed").length;

  const handleTogglePause = (id: string) => {
    setJobs(jobs.map((j) =>
      j.id === id
        ? { ...j, status: j.status === "paused" ? "active" as const : "paused" as const }
        : j
    ));
  };

  const handleRunNow = (id: string) => {
    setJobs(jobs.map((j) =>
      j.id === id
        ? { ...j, lastRun: new Date().toISOString().replace("T", " ").slice(0, 19), status: "active" as const }
        : j
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scheduled Jobs</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage recurring tasks and background processes</p>
        </div>
        <Badge variant="outline" className="text-xs">
          <Timer className="w-3 h-3 mr-1" />
          {activeCount} running
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Total Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground">Configured</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" /> Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeCount}</div>
            <p className="text-xs text-muted-foreground">Running on schedule</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Pause className="w-4 h-4 text-gray-500" /> Paused
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{pausedCount}</div>
            <p className="text-xs text-muted-foreground">Temporarily stopped</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{failedCount}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["Discovery", "Scoring", "Cleanup", "Reporting"] as JobCategory[]).map((cat) => {
          const catJobs = jobs.filter((j) => j.category === cat);
          return (
            <div key={cat} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              <CategoryIcon category={cat} />
              <div>
                <p className="text-sm font-medium">{cat}</p>
                <p className="text-xs text-muted-foreground">{catJobs.length} job{catJobs.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            All Scheduled Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Name</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id} className={job.status === "failed" ? "bg-red-50/30 dark:bg-red-950/10" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CategoryIcon category={job.category} />
                      <div>
                        <p className="font-medium text-sm">{job.name}</p>
                        <Badge variant="outline" className="text-[10px] mt-0.5">{job.category}</Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{job.humanSchedule}</p>
                      <p className="text-xs text-muted-foreground font-mono">{job.cron}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{job.lastRun}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {job.status === "paused" ? (
                      <span className="text-muted-foreground">--</span>
                    ) : (
                      job.nextRun
                    )}
                  </TableCell>
                  <TableCell><StatusBadge status={job.status} /></TableCell>
                  <TableCell className="text-right font-mono text-sm">{job.duration}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        title="Run Now"
                        onClick={() => handleRunNow(job.id)}
                      >
                        <Play className="w-3.5 h-3.5 text-green-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        title={job.status === "paused" ? "Resume" : "Pause"}
                        onClick={() => handleTogglePause(job.id)}
                      >
                        {job.status === "paused" ? (
                          <Play className="w-3.5 h-3.5 text-blue-500" />
                        ) : (
                          <Pause className="w-3.5 h-3.5 text-amber-500" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </div>
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
