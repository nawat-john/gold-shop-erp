// Integration: BullMQ worker ดึงราคาทอง — queue จริง (Redis container) + Postgres จริง
// ครอบ: ประมวลผลสำเร็จ, retry with backoff เมื่อ feed ล่มชั่วคราว (Idempotent + dedupe)
import { Queue, QueueEvents, Worker } from "bullmq";
import Redis from "ioredis";
import { GenericContainer, type StartedTestContainer } from "testcontainers";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  MockGoldPriceFeedSource,
  type FeedQuote,
  type GoldPriceFeedSource,
} from "@/server/prices/feed-source";
import { fetchAndIngestGoldPrice } from "@/server/jobs/gold-price.job";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";

const QUEUE = "gold-price-test";

let db: TestDb;
let redisContainer: StartedTestContainer;
let connectionOpts: { host: string; port: number; maxRetriesPerRequest: null };

beforeAll(async () => {
  [db, redisContainer] = await Promise.all([
    startTestDb(),
    new GenericContainer("redis:7-alpine").withExposedPorts(6379).start(),
  ]);
  connectionOpts = {
    host: redisContainer.getHost(),
    port: redisContainer.getMappedPort(6379),
    maxRetriesPerRequest: null,
  };
}, 180_000);

afterAll(async () => {
  await stopTestDb(db);
  await redisContainer?.stop();
});

function makeWorker(source: GoldPriceFeedSource) {
  return new Worker(
    QUEUE,
    async () => {
      const result = await fetchAndIngestGoldPrice(db.prisma, source);
      return { ...result, changeBasisPoints: undefined };
    },
    { connection: new Redis(connectionOpts) },
  );
}

describe("gold price worker", () => {
  it("job สำเร็จ → feed ถูกบันทึกลง DB", async () => {
    const queue = new Queue(QUEUE, { connection: new Redis(connectionOpts) });
    const events = new QueueEvents(QUEUE, {
      connection: new Redis(connectionOpts),
    });
    await events.waitUntilReady();
    const worker = makeWorker(new MockGoldPriceFeedSource());

    try {
      const job = await queue.add("fetch", {});
      await job.waitUntilFinished(events, 30_000);

      const feeds = await db.prisma.goldPriceFeed.count({
        where: { source: "GTA" },
      });
      expect(feeds).toBeGreaterThanOrEqual(1);
    } finally {
      await worker.close();
      await events.close();
      await queue.close();
    }
  }, 60_000);

  it("feed ล่ม 2 ครั้งแรก → retry จน job สำเร็จ (attempts + backoff)", async () => {
    let calls = 0;
    const flaky: GoldPriceFeedSource = {
      async fetchLatest(): Promise<FeedQuote> {
        calls += 1;
        if (calls <= 2) throw new Error("feed ล่มชั่วคราว");
        return new MockGoldPriceFeedSource(
          5_200_000n,
          () => new Date("2026-07-05T12:00:00Z"),
        ).fetchLatest();
      },
    };

    const queue = new Queue(QUEUE, { connection: new Redis(connectionOpts) });
    const events = new QueueEvents(QUEUE, {
      connection: new Redis(connectionOpts),
    });
    await events.waitUntilReady();
    const worker = makeWorker(flaky);

    try {
      const job = await queue.add(
        "fetch-flaky",
        {},
        { attempts: 5, backoff: { type: "fixed", delay: 200 } },
      );
      await job.waitUntilFinished(events, 30_000);

      expect(calls).toBe(3); // ล้ม 2 + สำเร็จ 1
      const feed = await db.prisma.goldPriceFeed.findFirst({
        where: {
          source: "GTA",
          announcedAt: new Date("2026-07-05T12:00:00Z"),
        },
      });
      expect(feed).not.toBeNull();
    } finally {
      await worker.close();
      await events.close();
      await queue.close();
    }
  }, 60_000);
});
