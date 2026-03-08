import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { scanQueue } from "./lib/queue";
import { supabase } from "./lib/supabase";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);
const API_SECRET = process.env.API_SECRET || "";

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json());

/** API secret check – skipped for the health endpoint */
function apiSecretMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.path === "/health") {
    next();
    return;
  }

  if (!API_SECRET) {
    // No secret configured – allow all (dev mode)
    next();
    return;
  }

  const provided = req.headers["x-api-secret"] as string | undefined;
  if (provided !== API_SECRET) {
    res.status(401).json({ error: "Unauthorized – invalid or missing x-api-secret header" });
    return;
  }

  next();
}

app.use(apiSecretMiddleware);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/** Health check */
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/** Trigger a new scan */
app.post("/api/scan", async (req: Request, res: Response) => {
  try {
    const { scan_mode, client_id } = req.body as {
      scan_mode?: string;
      client_id?: string;
    };

    if (!scan_mode || !["quick", "full", "client"].includes(scan_mode)) {
      res.status(400).json({ error: "Invalid scan_mode. Must be quick, full, or client." });
      return;
    }

    if (scan_mode === "client" && !client_id) {
      res.status(400).json({ error: "client_id is required for client scans." });
      return;
    }

    // Insert a record into scan_history so the frontend can track it
    const scanRecord = {
      scan_mode,
      client_id: client_id || null,
      status: "queued",
      started_at: new Date().toISOString(),
      progress: 0,
    };

    const { data: insertedScan, error: dbError } = await supabase
      .from("scan_history")
      .insert(scanRecord)
      .select()
      .single();

    if (dbError) {
      console.error("[API] Failed to insert scan_history:", dbError.message);
    }

    const scanId = insertedScan?.id;

    // Add job to BullMQ queue
    const job = await scanQueue.add(
      "run-scan",
      {
        scan_mode,
        client_id: client_id || null,
        scan_id: scanId || null,
      },
      {
        jobId: scanId ? `scan-${scanId}` : undefined,
      }
    );

    console.log(`[API] Scan job queued: ${job.id} (mode=${scan_mode})`);

    res.json({
      job_id: job.id,
      scan_id: scanId || null,
      scan_mode,
      status: "queued",
    });
  } catch (err) {
    console.error("[API] Error creating scan job:", err);
    res.status(500).json({ error: "Failed to create scan job" });
  }
});

/** Get scan job status / progress */
app.get("/api/scan/:jobId", async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = await scanQueue.getJob(jobId);

    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    const state = await job.getState();
    const progress = job.progress as number;

    res.json({
      job_id: job.id,
      status: state,
      progress,
      data: job.data,
      result: job.returnvalue || null,
      failed_reason: job.failedReason || null,
      created_at: job.timestamp ? new Date(job.timestamp).toISOString() : null,
      finished_at: job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
    });
  } catch (err) {
    console.error("[API] Error fetching job:", err);
    res.status(500).json({ error: "Failed to fetch job status" });
  }
});

/** Get recent scan history from Supabase */
app.get("/api/scan/history", async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("scan_history")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[API] Supabase error fetching history:", error.message);
      res.status(500).json({ error: "Failed to fetch scan history" });
      return;
    }

    res.json({ scans: data });
  } catch (err) {
    console.error("[API] Error fetching scan history:", err);
    res.status(500).json({ error: "Failed to fetch scan history" });
  }
});

/** Get all automation jobs status */
app.get("/api/jobs", async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("automation_jobs")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("[API] Supabase error fetching jobs:", error.message);
      res.status(500).json({ error: "Failed to fetch automation jobs" });
      return;
    }

    res.json({ jobs: data || [] });
  } catch (err) {
    console.error("[API] Error fetching jobs:", err);
    res.status(500).json({ error: "Failed to fetch automation jobs" });
  }
});

/** Toggle an automation job on/off */
app.post("/api/jobs/:jobName/toggle", async (req: Request, res: Response) => {
  try {
    const { jobName } = req.params;

    // Fetch current state
    const { data: job, error: fetchError } = await supabase
      .from("automation_jobs")
      .select("*")
      .eq("name", jobName)
      .single();

    if (fetchError || !job) {
      res.status(404).json({ error: `Job '${jobName}' not found` });
      return;
    }

    const newEnabled = !job.enabled;

    const { data: updated, error: updateError } = await supabase
      .from("automation_jobs")
      .update({ enabled: newEnabled, updated_at: new Date().toISOString() })
      .eq("name", jobName)
      .select()
      .single();

    if (updateError) {
      console.error("[API] Failed to toggle job:", updateError.message);
      res.status(500).json({ error: "Failed to toggle job" });
      return;
    }

    console.log(`[API] Job '${jobName}' toggled to enabled=${newEnabled}`);
    res.json({ job: updated });
  } catch (err) {
    console.error("[API] Error toggling job:", err);
    res.status(500).json({ error: "Failed to toggle job" });
  }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`[Server] YouSell Admin backend running on port ${PORT}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/health`);
});
