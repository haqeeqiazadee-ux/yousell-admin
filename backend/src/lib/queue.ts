import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redactedUrl = REDIS_URL.replace(/:\/\/[^@]*@/, '://***@');
console.log('Connecting to Redis:', redactedUrl);

// Cast as any to resolve ioredis/BullMQ version mismatch
export const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
}) as any;

connection.on('connect', () => {
  console.log('Connected to Redis');
});

connection.on('error', (err) => {
  console.error('Redis connection error:', err);
});
