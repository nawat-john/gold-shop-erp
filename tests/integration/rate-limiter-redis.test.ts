// Integration test: RedisRateLimiter กับ Redis จริง (Testcontainers)
import Redis from "ioredis";
import { GenericContainer, type StartedTestContainer } from "testcontainers";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { RedisRateLimiter } from "@/server/security/rate-limiter";

let container: StartedTestContainer;
let redis: Redis;

beforeAll(async () => {
  container = await new GenericContainer("redis:7-alpine")
    .withExposedPorts(6379)
    .start();
  redis = new Redis({
    host: container.getHost(),
    port: container.getMappedPort(6379),
  });
}, 180_000);

afterAll(async () => {
  redis?.disconnect();
  await container?.stop();
});

describe("RedisRateLimiter", () => {
  it("อนุญาตจนถึง limit แล้วปฏิเสธพร้อม retryAfterMs", async () => {
    const limiter = new RedisRateLimiter(redis);

    for (let i = 0; i < 5; i++) {
      const r = await limiter.consume("login:ip:1.2.3.4", 5, 60_000);
      expect(r.allowed).toBe(true);
    }

    const denied = await limiter.consume("login:ip:1.2.3.4", 5, 60_000);
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterMs).toBeGreaterThan(0);
    expect(denied.retryAfterMs).toBeLessThanOrEqual(60_000);
  });

  it("คนละ key นับแยกกัน", async () => {
    const limiter = new RedisRateLimiter(redis);
    await limiter.consume("k:a", 1, 60_000);
    const other = await limiter.consume("k:b", 1, 60_000);
    expect(other.allowed).toBe(true);
  });

  it("key ใน Redis มี TTL (ไม่รั่วค้างถาวร)", async () => {
    const limiter = new RedisRateLimiter(redis);
    await limiter.consume("ttl-check", 5, 60_000);

    const keys = await redis.keys("rl:ttl-check:*");
    expect(keys.length).toBe(1);
    const ttl = await redis.pttl(keys[0]);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(60_000);
  });
});
