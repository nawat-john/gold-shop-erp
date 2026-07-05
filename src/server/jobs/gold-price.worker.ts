// Worker process — รันแยกจาก Next.js: `pnpm worker`
// ดึงราคาสมาคมทุก 5 นาที (repeatable job) + retry exponential backoff เมื่อ feed ล่ม
import { Worker } from "bullmq";
import { logger } from "@/lib/logger";
import { prisma } from "@/server/db";
import { MockGoldPriceFeedSource } from "@/server/prices/feed-source";
import { fetchAndIngestGoldPrice } from "./gold-price.job";
import {
  GOLD_PRICE_QUEUE,
  createBullConnection,
  getGoldPriceQueue,
} from "./queues";

const FETCH_INTERVAL_MS = 5 * 60 * 1000;

// dev/test ใช้ mock — feed จริงของสมาคมค้าทองคำ implement GoldPriceFeedSource เพิ่มภายหลัง
const feedSource = new MockGoldPriceFeedSource();

async function main() {
  const queue = getGoldPriceQueue();
  await queue.upsertJobScheduler(GOLD_PRICE_QUEUE, {
    every: FETCH_INTERVAL_MS,
  });

  const worker = new Worker(
    GOLD_PRICE_QUEUE,
    async () => {
      const result = await fetchAndIngestGoldPrice(prisma, feedSource);
      return {
        ...result,
        changeBasisPoints: result.changeBasisPoints.toString(),
      };
    },
    { connection: createBullConnection() },
  );

  worker.on("completed", (job, result) => {
    logger.info({ jobId: job.id, result }, "ดึงราคาทองสำเร็จ");
  });
  worker.on("failed", (job, error) => {
    logger.error(
      { jobId: job?.id, attempts: job?.attemptsMade, err: error },
      "ดึงราคาทองล้มเหลว — จะ retry ตาม backoff",
    );
  });

  logger.info(
    { queue: GOLD_PRICE_QUEUE, intervalMs: FETCH_INTERVAL_MS },
    "gold price worker เริ่มทำงาน",
  );

  const shutdown = async () => {
    await worker.close();
    await queue.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  logger.error({ err: error }, "worker เริ่มไม่สำเร็จ");
  process.exit(1);
});
