// Rate limiter แบบ fixed window — ใช้กับ login (per-IP และ per-username)
// interface กลางเพื่อให้ test ฉีด in-memory ได้ ส่วน production ใช้ Redis
import type Redis from "ioredis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** มีค่าเมื่อ allowed=false — รออีกกี่ ms ถึงลองใหม่ได้ */
  retryAfterMs: number;
}

export interface RateLimiter {
  consume(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<RateLimitResult>;
}

export class RedisRateLimiter implements RateLimiter {
  constructor(private readonly redis: Redis) {}

  async consume(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<RateLimitResult> {
    const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
    const redisKey = `rl:${key}:${windowStart}`;

    const count = await this.redis.incr(redisKey);
    if (count === 1) {
      await this.redis.pexpire(redisKey, windowMs);
    }

    if (count > limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: windowStart + windowMs - Date.now(),
      };
    }
    return { allowed: true, remaining: limit - count, retryAfterMs: 0 };
  }
}

/**
 * Fail-open wrapper: Redis ล่มต้องไม่ทำให้ login ทั้งระบบพัง
 * (per-user lockout ใน DB ยังป้องกัน brute force อยู่) — แค่ log error ไว้
 */
export class FailOpenRateLimiter implements RateLimiter {
  constructor(
    private readonly inner: RateLimiter,
    private readonly onError: (error: unknown) => void = () => {},
  ) {}

  async consume(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<RateLimitResult> {
    try {
      return await this.inner.consume(key, limit, windowMs);
    } catch (error) {
      this.onError(error);
      return { allowed: true, remaining: 0, retryAfterMs: 0 };
    }
  }
}

/** สำหรับ unit/integration test — พฤติกรรมเดียวกับ Redis แต่อยู่ในหน่วยความจำ */
export class InMemoryRateLimiter implements RateLimiter {
  private counters = new Map<string, { count: number; windowStart: number }>();

  async consume(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<RateLimitResult> {
    const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
    const entry = this.counters.get(key);

    if (!entry || entry.windowStart !== windowStart) {
      this.counters.set(key, { count: 1, windowStart });
      return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
    }

    entry.count += 1;
    if (entry.count > limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: windowStart + windowMs - Date.now(),
      };
    }
    return { allowed: true, remaining: limit - entry.count, retryAfterMs: 0 };
  }

  reset(): void {
    this.counters.clear();
  }
}
