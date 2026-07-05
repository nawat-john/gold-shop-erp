// Session ฝั่ง server (ADR-003): cookie เก็บ token ดิบ, DB เก็บเฉพาะ SHA-256 hash
// - idle timeout 30 นาที (เลื่อนเมื่อ active), absolute timeout 12 ชม. (ไม่เลื่อน)
// - revoke ได้ทันทีจากหน้า admin เพราะทุก request ตรวจกับ DB
import { createHash, randomBytes } from "node:crypto";
import type { Db } from "@/server/db";
import type { Session } from "@/generated/prisma/client";

export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 นาที
export const SESSION_ABSOLUTE_TIMEOUT_MS = 12 * 60 * 60 * 1000; // 12 ชม.
/// ลดการเขียน DB: อัปเดต lastSeenAt เฉพาะเมื่อผ่านไปเกิน 1 นาที
const LAST_SEEN_UPDATE_INTERVAL_MS = 60 * 1000;

export const SESSION_COOKIE_NAME = "gold_session";

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export interface CreateSessionInput {
  userId: string;
  ip?: string | null;
  userAgent?: string | null;
}

export interface CreatedSession {
  /** token ดิบ — ใส่ cookie เท่านั้น ห้าม log/เก็บที่อื่น */
  token: string;
  session: Session;
}

export async function createSession(
  db: Db,
  input: CreateSessionInput,
  now: Date = new Date(),
): Promise<CreatedSession> {
  const token = randomBytes(32).toString("base64url");
  const session = await db.session.create({
    data: {
      tokenHash: hashSessionToken(token),
      userId: input.userId,
      lastSeenAt: now,
      absoluteExpiresAt: new Date(now.getTime() + SESSION_ABSOLUTE_TIMEOUT_MS),
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
  return { token, session };
}

export type SessionValidationFailure =
  | "not_found"
  | "revoked"
  | "absolute_expired"
  | "idle_expired"
  | "user_inactive";

export interface SessionUser {
  id: string;
  username: string;
  displayName: string;
  mustChangePassword: boolean;
}

export type ValidateSessionResult =
  | { ok: true; session: Session; user: SessionUser }
  | { ok: false; reason: SessionValidationFailure };

export async function validateSession(
  db: Db,
  token: string,
  now: Date = new Date(),
): Promise<ValidateSessionResult> {
  const session = await db.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          isActive: true,
          mustChangePassword: true,
        },
      },
    },
  });

  if (!session) return { ok: false, reason: "not_found" };
  if (session.revokedAt) return { ok: false, reason: "revoked" };
  if (now >= session.absoluteExpiresAt) {
    return { ok: false, reason: "absolute_expired" };
  }
  if (now.getTime() - session.lastSeenAt.getTime() > SESSION_IDLE_TIMEOUT_MS) {
    return { ok: false, reason: "idle_expired" };
  }
  if (!session.user.isActive) return { ok: false, reason: "user_inactive" };

  if (
    now.getTime() - session.lastSeenAt.getTime() >
    LAST_SEEN_UPDATE_INTERVAL_MS
  ) {
    await db.session.update({
      where: { id: session.id },
      data: { lastSeenAt: now },
    });
  }

  const { user, ...bare } = session;
  return {
    ok: true,
    session: bare as Session,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      mustChangePassword: user.mustChangePassword,
    },
  };
}

export async function revokeSession(db: Db, sessionId: string): Promise<void> {
  await db.session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  });
}

/** revoke ทุก session ของ user (ใช้ตอนปิดบัญชี/reset รหัสผ่าน/สงสัยถูกขโมย session) */
export async function revokeAllUserSessions(
  db: Db,
  userId: string,
): Promise<number> {
  const result = await db.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count;
}
