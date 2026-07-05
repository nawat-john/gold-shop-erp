// Login service: rate limit → lockout → Argon2id verify → TOTP → session
// ทุก outcome เขียน audit log; ไม่เปิดเผยว่า username มีจริงไหม (ตอบ invalid_credentials เสมอ)
import type { Db } from "@/server/db";
import type { Session, User } from "@/generated/prisma/client";
import type { RateLimiter } from "@/server/security/rate-limiter";
import { hashPassword, verifyPassword } from "@/server/security/password";
import { writeAuditLog } from "./audit.service";
import { createSession } from "./session.service";
import { consumeRecoveryCode, verifyTotpCode } from "./totp.service";

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_MS = 15 * 60 * 1000; // 15 นาที
const IP_LIMIT = 20; // ครั้ง / 5 นาที / IP
const USERNAME_LIMIT = 10; // ครั้ง / 5 นาที / username
const RATE_WINDOW_MS = 5 * 60 * 1000;

/// hash จริงของข้อความคงที่ — ใช้ verify ทิ้งเมื่อ username ไม่มีจริง กัน timing attack
const DUMMY_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$8jEVsmSFsJOAG7wlM3LDOQ$Mh5xeTZRu4QsLTw2CBcYHFWlxnILumg9j4cDZV8HwFE";

export interface LoginDeps {
  db: Db;
  rateLimiter: RateLimiter;
}

export interface LoginInput {
  username: string;
  password: string;
  /** จำเป็นเมื่อ user เปิด 2FA — TOTP 6 หลัก หรือ recovery code */
  totpCode?: string;
  ip?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}

export type LoginResult =
  | {
      status: "success";
      token: string;
      session: Session;
      userId: string;
      mustChangePassword: boolean;
    }
  | { status: "invalid_credentials" }
  | { status: "locked"; lockedUntil: Date }
  | { status: "rate_limited"; retryAfterMs: number }
  /** รหัสผ่านถูกแต่ต้องส่ง TOTP มาด้วย */
  | { status: "totp_required" };

export async function login(
  deps: LoginDeps,
  input: LoginInput,
): Promise<LoginResult> {
  const { db, rateLimiter } = deps;
  const auditBase = {
    entityType: "user",
    requestId: input.requestId,
    ip: input.ip,
    userAgent: input.userAgent,
  };

  // 1) Rate limit ก่อนแตะ DB — per IP และ per username
  const ipCheck = input.ip
    ? await rateLimiter.consume(
        `login:ip:${input.ip}`,
        IP_LIMIT,
        RATE_WINDOW_MS,
      )
    : { allowed: true, remaining: 0, retryAfterMs: 0 };
  const userCheck = await rateLimiter.consume(
    `login:user:${input.username.toLowerCase()}`,
    USERNAME_LIMIT,
    RATE_WINDOW_MS,
  );
  if (!ipCheck.allowed || !userCheck.allowed) {
    return {
      status: "rate_limited",
      retryAfterMs: Math.max(ipCheck.retryAfterMs, userCheck.retryAfterMs),
    };
  }

  const user = await db.user.findUnique({
    where: { username: input.username },
  });

  // 2) username ไม่มีจริง/ถูกปิด → verify ทิ้งให้เวลาตอบใกล้เคียงกรณีปกติ
  if (!user || !user.isActive) {
    await verifyPassword(DUMMY_HASH, input.password);
    await writeAuditLog(db, {
      ...auditBase,
      action: "auth.login_failed",
      entityId: null,
      after: { username: input.username, reason: "unknown_or_inactive" },
    });
    return { status: "invalid_credentials" };
  }

  // 3) บัญชีถูกล็อกอยู่
  const now = new Date();
  if (user.lockedUntil && user.lockedUntil > now) {
    await writeAuditLog(db, {
      ...auditBase,
      action: "auth.login_blocked_locked",
      entityId: user.id,
      actorId: user.id,
    });
    return { status: "locked", lockedUntil: user.lockedUntil };
  }

  // 4) ตรวจรหัสผ่าน
  if (!(await verifyPassword(user.passwordHash, input.password))) {
    return recordFailedAttempt(db, user, auditBase, "wrong_password");
  }

  // 5) 2FA
  if (user.totpEnabled) {
    if (!input.totpCode) {
      return { status: "totp_required" };
    }
    const totpOk =
      user.totpSecretEnc !== null &&
      ((await verifyTotpCode(user.totpSecretEnc, input.totpCode)) ||
        (await consumeRecoveryCode(db, user.id, input.totpCode)));
    if (!totpOk) {
      return recordFailedAttempt(db, user, auditBase, "wrong_totp");
    }
  }

  // 6) สำเร็จ — ล้างตัวนับ, สร้าง session
  await db.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });
  const { token, session } = await createSession(db, {
    userId: user.id,
    ip: input.ip,
    userAgent: input.userAgent,
  });
  await writeAuditLog(db, {
    ...auditBase,
    action: "auth.login_success",
    entityId: user.id,
    actorId: user.id,
  });

  return {
    status: "success",
    token,
    session,
    userId: user.id,
    mustChangePassword: user.mustChangePassword,
  };
}

async function recordFailedAttempt(
  db: Db,
  user: User,
  auditBase: {
    entityType: string;
    requestId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
  },
  reason: "wrong_password" | "wrong_totp",
): Promise<LoginResult> {
  const attempts = user.failedLoginAttempts + 1;
  const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;

  await db.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: shouldLock ? 0 : attempts,
      lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MS) : undefined,
    },
  });
  await writeAuditLog(db, {
    ...auditBase,
    action: shouldLock ? "auth.account_locked" : "auth.login_failed",
    entityId: user.id,
    actorId: user.id,
    after: { reason, attempts },
  });

  return { status: "invalid_credentials" };
}

/**
 * Reset รหัสผ่านโดย admin: ตั้งรหัสชั่วคราว + บังคับเปลี่ยนเมื่อ login + revoke ทุก session
 * (การตรวจ permission อยู่ที่ชั้น action ผู้เรียก)
 */
export async function resetPassword(
  db: Db,
  params: {
    userId: string;
    newPassword: string;
    actorId: string;
    requestId?: string | null;
  },
): Promise<void> {
  const passwordHash = await hashPassword(params.newPassword);
  await db.user.update({
    where: { id: params.userId },
    data: {
      passwordHash,
      mustChangePassword: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });
  await db.session.updateMany({
    where: { userId: params.userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  await writeAuditLog(db, {
    action: "auth.password_reset",
    entityType: "user",
    entityId: params.userId,
    actorId: params.actorId,
    requestId: params.requestId,
  });
}
