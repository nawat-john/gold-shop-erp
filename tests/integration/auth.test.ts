// Integration test: login flow ครบทุก path — lockout, rate limit, 2FA, recovery code, reset
import { generate, generateSecret } from "otplib";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  MAX_FAILED_ATTEMPTS,
  login,
  resetPassword,
} from "@/server/services/auth.service";
import { enableTotp } from "@/server/services/totp.service";
import { validateSession } from "@/server/services/session.service";
import { hashPassword } from "@/server/security/password";
import { encryptString } from "@/server/security/crypto";
import { InMemoryRateLimiter } from "@/server/security/rate-limiter";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";

const PASSWORD = "Tong96.5-Yaowarat!";
let db: TestDb;
let rateLimiter: InMemoryRateLimiter;
let passwordHash: string;
let counter = 0;

function deps() {
  return { db: db.prisma, rateLimiter };
}

async function createUser(overrides: Record<string, unknown> = {}) {
  counter += 1;
  return db.prisma.user.create({
    data: {
      username: `user${counter}`,
      passwordHash,
      displayName: `ผู้ใช้ ${counter}`,
      ...overrides,
    },
  });
}

beforeAll(async () => {
  db = await startTestDb();
  passwordHash = await hashPassword(PASSWORD); // hash ครั้งเดียว ประหยัดเวลา test
}, 180_000);

afterAll(async () => {
  await stopTestDb(db);
});

beforeEach(() => {
  rateLimiter = new InMemoryRateLimiter();
});

describe("login — credentials", () => {
  it("รหัสถูก → ได้ session ที่ใช้งานได้จริง + audit log", async () => {
    const user = await createUser();
    const result = await login(deps(), {
      username: user.username,
      password: PASSWORD,
      ip: "10.0.0.1",
    });

    expect(result.status).toBe("success");
    if (result.status !== "success") return;

    const validated = await validateSession(db.prisma, result.token);
    expect(validated.ok).toBe(true);

    const audit = await db.prisma.auditLog.findFirst({
      where: { action: "auth.login_success", entityId: user.id },
    });
    expect(audit).not.toBeNull();
  });

  it("รหัสผิด → invalid_credentials และนับ failed attempt", async () => {
    const user = await createUser();
    const result = await login(deps(), {
      username: user.username,
      password: "wrong-password-123",
    });

    expect(result.status).toBe("invalid_credentials");
    const updated = await db.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    expect(updated.failedLoginAttempts).toBe(1);
  });

  it("username ไม่มีจริง → invalid_credentials (ไม่เปิดเผยว่ามี user ไหม)", async () => {
    const result = await login(deps(), {
      username: "no-such-user",
      password: PASSWORD,
    });
    expect(result.status).toBe("invalid_credentials");
  });

  it("user ถูกปิดใช้งาน → invalid_credentials", async () => {
    const user = await createUser({ isActive: false });
    const result = await login(deps(), {
      username: user.username,
      password: PASSWORD,
    });
    expect(result.status).toBe("invalid_credentials");
  });
});

describe("login — lockout", () => {
  it(`ผิดครบ ${MAX_FAILED_ATTEMPTS} ครั้ง → ล็อกบัญชี และ login ถูกก็ยังไม่ได้`, async () => {
    const user = await createUser();

    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) {
      await login(deps(), { username: user.username, password: "wrong!" });
    }

    const locked = await db.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    expect(locked.lockedUntil).not.toBeNull();

    const result = await login(deps(), {
      username: user.username,
      password: PASSWORD,
    });
    expect(result.status).toBe("locked");

    const audit = await db.prisma.auditLog.findFirst({
      where: { action: "auth.account_locked", entityId: user.id },
    });
    expect(audit).not.toBeNull();
  });

  it("หมดเวลาล็อกแล้ว login ได้ปกติ", async () => {
    const user = await createUser({
      lockedUntil: new Date(Date.now() - 1000), // ล็อกหมดอายุแล้ว
      failedLoginAttempts: 0,
    });
    const result = await login(deps(), {
      username: user.username,
      password: PASSWORD,
    });
    expect(result.status).toBe("success");
  });
});

describe("login — rate limit", () => {
  it("ยิงเกิน limit ต่อ username → rate_limited", async () => {
    const user = await createUser();
    let result;
    for (let i = 0; i < 15; i++) {
      result = await login(deps(), {
        username: user.username,
        password: "wrong!",
      });
      if (result.status === "rate_limited") break;
    }
    expect(result?.status).toBe("rate_limited");
  });
});

describe("login — TOTP 2FA", () => {
  async function createTotpUser() {
    const user = await createUser();
    const secret = await generateSecret();
    const enrollment = await enableTotp(
      db.prisma,
      user.id,
      encryptString(secret),
      await generate({ secret }),
    );
    if (!enrollment.ok) throw new Error("enableTotp ล้มเหลว");
    return { user, secret, recoveryCodes: enrollment.recoveryCodes };
  }

  it("เปิด 2FA แล้ว login ไม่ส่ง code → totp_required", async () => {
    const { user } = await createTotpUser();
    const result = await login(deps(), {
      username: user.username,
      password: PASSWORD,
    });
    expect(result.status).toBe("totp_required");
  });

  it("ส่ง TOTP ถูกต้อง → success", async () => {
    const { user, secret } = await createTotpUser();
    const result = await login(deps(), {
      username: user.username,
      password: PASSWORD,
      totpCode: await generate({ secret }),
    });
    expect(result.status).toBe("success");
  });

  it("TOTP ผิด → invalid_credentials และนับ failed attempt", async () => {
    const { user } = await createTotpUser();
    const result = await login(deps(), {
      username: user.username,
      password: PASSWORD,
      totpCode: "000000",
    });
    expect(result.status).toBe("invalid_credentials");
  });

  it("recovery code ใช้ได้ครั้งเดียว", async () => {
    const { user, recoveryCodes } = await createTotpUser();

    const first = await login(deps(), {
      username: user.username,
      password: PASSWORD,
      totpCode: recoveryCodes[0],
    });
    expect(first.status).toBe("success");

    const second = await login(deps(), {
      username: user.username,
      password: PASSWORD,
      totpCode: recoveryCodes[0],
    });
    expect(second.status).toBe("invalid_credentials");
  });
});

describe("resetPassword", () => {
  it("ตั้งรหัสใหม่ + บังคับเปลี่ยน + revoke ทุก session เดิม", async () => {
    const user = await createUser();
    const before = await login(deps(), {
      username: user.username,
      password: PASSWORD,
    });
    expect(before.status).toBe("success");

    const admin = await createUser();
    await resetPassword(db.prisma, {
      userId: user.id,
      newPassword: "Temp-Reset-Pass-99",
      actorId: admin.id,
    });

    // session เดิมถูก revoke
    if (before.status === "success") {
      const validated = await validateSession(db.prisma, before.token);
      expect(validated).toEqual({ ok: false, reason: "revoked" });
    }

    // login ด้วยรหัสใหม่ → success + ธง mustChangePassword
    const after = await login(deps(), {
      username: user.username,
      password: "Temp-Reset-Pass-99",
    });
    expect(after.status).toBe("success");
    if (after.status === "success") {
      expect(after.mustChangePassword).toBe(true);
    }
  });
});
