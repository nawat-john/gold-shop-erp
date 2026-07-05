// Rate limiter instance สำหรับ production path — Redis + fail-open
import { logger } from "@/lib/logger";
import { redis } from "@/server/redis";
import {
  FailOpenRateLimiter,
  RedisRateLimiter,
} from "@/server/security/rate-limiter";

export const loginRateLimiter = new FailOpenRateLimiter(
  new RedisRateLimiter(redis),
  (error) => logger.error({ err: error }, "rate limiter ล้มเหลว — fail open"),
);
