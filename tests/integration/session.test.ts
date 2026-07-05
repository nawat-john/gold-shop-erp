// Integration test: session lifecycle ครบทุก path — create/validate/idle/absolute/revoke
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  SESSION_IDLE_TIMEOUT_MS,
  createSession,
  revokeAllUserSessions,
  revokeSession,
  validateSession,
} from "@/server/services/session.service";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";

let db: TestDb;
let userId: string;

beforeAll(async () => {
  db = await startTestDb();
  const user = await db.prisma.user.create({
    data: {
      username: "session-test-user",
      passwordHash: "$argon2id$dummy",
      displayName: "ผู้ใช้ทดสอบ session",
    },
  });
  userId = user.id;
}, 180_000);

afterAll(async () => {
  await stopTestDb(db);
});

describe("session lifecycle", () => {
  it("สร้างแล้ว validate ผ่าน — DB เก็บเฉพาะ hash ไม่ใช่ token ดิบ", async () => {
    const { token, session } = await createSession(db.prisma, { userId });

    expect(session.tokenHash).not.toBe(token);
    expect(session.tokenHash).toMatch(/^[0-9a-f]{64}$/);

    const result = await validateSession(db.prisma, token);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.user.username).toBe("session-test-user");
  });

  it("token มั่วต้องไม่ผ่าน", async () => {
    const result = await validateSession(db.prisma, "forged-token");
    expect(result).toEqual({ ok: false, reason: "not_found" });
  });

  it("idle เกิน 30 นาทีต้องหมดอายุ", async () => {
    const { token, session } = await createSession(db.prisma, { userId });
    await db.prisma.session.update({
      where: { id: session.id },
      data: {
        lastSeenAt: new Date(Date.now() - SESSION_IDLE_TIMEOUT_MS - 1000),
      },
    });

    const result = await validateSession(db.prisma, token);
    expect(result).toEqual({ ok: false, reason: "idle_expired" });
  });

  it("เกิน absolute timeout ต้องหมดอายุแม้ยัง active ตลอด", async () => {
    const { token, session } = await createSession(db.prisma, { userId });
    await db.prisma.session.update({
      where: { id: session.id },
      data: {
        // ยัง active อยู่ (lastSeenAt สด) แต่เปิดมานานเกิน 12 ชม.
        lastSeenAt: new Date(),
        absoluteExpiresAt: new Date(Date.now() - 1000),
      },
    });

    const result = await validateSession(db.prisma, token);
    expect(result).toEqual({ ok: false, reason: "absolute_expired" });
  });

  it("revoke แล้วใช้ต่อไม่ได้ทันที", async () => {
    const { token, session } = await createSession(db.prisma, { userId });
    await revokeSession(db.prisma, session.id);

    const result = await validateSession(db.prisma, token);
    expect(result).toEqual({ ok: false, reason: "revoked" });
  });

  it("revokeAllUserSessions ตัดทุก session ของ user", async () => {
    const s1 = await createSession(db.prisma, { userId });
    const s2 = await createSession(db.prisma, { userId });

    const count = await revokeAllUserSessions(db.prisma, userId);
    expect(count).toBeGreaterThanOrEqual(2);

    expect((await validateSession(db.prisma, s1.token)).ok).toBe(false);
    expect((await validateSession(db.prisma, s2.token)).ok).toBe(false);
  });

  it("user ถูกปิดใช้งาน → session ใช้ไม่ได้", async () => {
    const inactive = await db.prisma.user.create({
      data: {
        username: "inactive-user",
        passwordHash: "$argon2id$dummy",
        displayName: "ถูกปิดใช้งาน",
      },
    });
    const { token } = await createSession(db.prisma, { userId: inactive.id });
    await db.prisma.user.update({
      where: { id: inactive.id },
      data: { isActive: false },
    });

    const result = await validateSession(db.prisma, token);
    expect(result).toEqual({ ok: false, reason: "user_inactive" });
  });
});
