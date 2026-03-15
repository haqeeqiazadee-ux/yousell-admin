import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redactedUrl = REDIS_URL.replace(/:\/\/[^@]*@/, '://***@');
console.log('Connecting to Redis:', redactedUrl);

// Cast as any to resolve ioredis/BullMQ version mismatch
export const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
}) as any;

// Default job options: 3 retries with exponential backoff
export const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000,
  },
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
};

connection.on('connect', () => {
  console.log('Connected to Redis');
});

connection.on('error', (err: Error) => {
  console.error('Redis connection error:', err);
});
