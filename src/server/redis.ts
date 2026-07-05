// Redis singleton (ioredis) — ใช้กับ rate limiting และ BullMQ ในอนาคต
import Redis from "ioredis";
import { env } from "@/config/env";

function createRedis(): Redis {
  return new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 2,
    // อย่าให้ Redis ล่มพาระบบล่ม — ผู้เรียกต้องจัดการ error เอง (fail-open ตามบริบท)
    lazyConnect: true,
  });
}

const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis: Redis = globalForRedis.redis ?? createRedis();

if (env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
