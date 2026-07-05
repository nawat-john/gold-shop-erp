// BullMQ queue definitions — worker process แยกต่างหาก (pnpm worker)
import { Queue } from "bullmq";
import Redis from "ioredis";
import { env } from "@/config/env";

export const GOLD_PRICE_QUEUE = "gold-price-fetch";

/** BullMQ ต้องการ connection ที่ maxRetriesPerRequest: null (ข้อกำหนดของ library) */
export function createBullConnection(): Redis {
  return new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
}

let goldPriceQueue: Queue | undefined;

export function getGoldPriceQueue(): Queue {
  goldPriceQueue ??= new Queue(GOLD_PRICE_QUEUE, {
    connection: createBullConnection(),
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: "exponential", delay: 5_000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    },
  });
  return goldPriceQueue;
}
