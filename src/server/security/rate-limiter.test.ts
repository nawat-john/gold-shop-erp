import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryRateLimiter } from "./rate-limiter";

describe("InMemoryRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("อนุญาตจนถึง limit แล้วปฏิเสธ", async () => {
    const limiter = new InMemoryRateLimiter();
    for (let i = 0; i < 3; i++) {
      expect((await limiter.consume("k", 3, 60_000)).allowed).toBe(true);
    }
    const denied = await limiter.consume("k", 3, 60_000);
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterMs).toBeGreaterThan(0);
  });

  it("หมด window แล้วนับใหม่", async () => {
    const limiter = new InMemoryRateLimiter();
    await limiter.consume("k", 1, 60_000);
    expect((await limiter.consume("k", 1, 60_000)).allowed).toBe(false);

    vi.advanceTimersByTime(61_000);
    expect((await limiter.consume("k", 1, 60_000)).allowed).toBe(true);
  });

  it("คนละ key นับแยกกัน", async () => {
    const limiter = new InMemoryRateLimiter();
    await limiter.consume("a", 1, 60_000);
    expect((await limiter.consume("b", 1, 60_000)).allowed).toBe(true);
  });
});
