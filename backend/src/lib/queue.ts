import { Queue, ConnectionOptions } from "bullmq";
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const connection: ConnectionOptions = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const scanQueue = new Queue("scan", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      age: 24 * 3600, // keep completed jobs for 24 hours
      count: 100,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // keep failed jobs for 7 days
    },
  },
});

console.log(`[Queue] Connected to Redis at ${REDIS_URL}`);
