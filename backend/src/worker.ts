/**
 * Worker entry point.
 *
 * Imports the job orchestration layer which registers all BullMQ workers.
 * Run this file to start processing jobs:
 *   npx ts-node-dev src/worker.ts
 *
 * Legacy "scan" queue jobs are forwarded to the new product-scan queue
 * for backwards compatibility with existing scan API.
 */
import { Worker, Job, Queue } from "bullmq";
import { connection } from "./lib/queue";
import { QUEUES } from "./jobs/types";

// Register all job workers — keep reference for graceful shutdown
import * as workers from "./jobs";

// ── Legacy compatibility ─────────────────────────────────────
// The existing POST /api/scan endpoint enqueues to the "scan" queue.
// This shim forwards those jobs to the new product-scan queue.

const productScanQueue = new Queue(QUEUES.PRODUCT_SCAN, { connection });

const legacyWorker = new Worker(
  "scan",
  async (job: Job) => {
    const forwarded = await productScanQueue.add("scan-products", job.data);
    console.log(
      `[legacy] Forwarded scan job ${job.id} → product-scan ${forwarded.id}`
    );
    return { forwardedTo: forwarded.id };
  },
  { connection, concurrency: 2 }
);

legacyWorker.on("completed", (job) => {
  console.log(`[legacy] Scan job ${job.id} forwarded`);
});

legacyWorker.on("failed", (job, error) => {
  console.error(`[legacy] Scan job ${job?.id} failed:`, error);
});

// ── Graceful shutdown ────────────────────────────────────────
// Wait for in-flight jobs to finish before exiting

async function gracefulShutdown(signal: string) {
  console.log(`\n[worker] Received ${signal}, shutting down gracefully...`);

  const allWorkers: Worker[] = [
    legacyWorker,
    ...Object.values(workers).filter((w): w is Worker => w instanceof Worker),
  ];

  try {
    await Promise.all(allWorkers.map((w) => w.close()));
    await connection.quit();
    console.log("[worker] All workers closed, Redis disconnected. Exiting.");
    process.exit(0);
  } catch (err) {
    console.error("[worker] Error during shutdown:", err);
    process.exit(1);
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

console.log("Worker process ready (legacy scan queue + new job queues)");
