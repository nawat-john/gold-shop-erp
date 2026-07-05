// Audit log helper — ทุก mutation สำคัญต้องเรียกผ่านตัวนี้ "ภายใน transaction เดียวกัน"
// เพื่อให้ log กับข้อมูลจริง commit/rollback ด้วยกันเสมอ (ตาราง append-only ด้วย DB trigger)
import type { Db } from "@/server/db";
import type { Prisma } from "@/generated/prisma/client";

export interface AuditEntry {
  /** เช่น "user.create", "auth.login_failed", "settings.update" */
  action: string;
  entityType: string;
  entityId?: string | null;
  /** null = การกระทำโดยระบบ (job/seed) */
  actorId?: string | null;
  before?: Prisma.InputJsonValue | null;
  after?: Prisma.InputJsonValue | null;
  branchId?: string | null;
  requestId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

export async function writeAuditLog(db: Db, entry: AuditEntry): Promise<void> {
  await db.auditLog.create({
    data: {
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      actorId: entry.actorId ?? null,
      before: entry.before ?? undefined,
      after: entry.after ?? undefined,
      branchId: entry.branchId ?? null,
      requestId: entry.requestId ?? null,
      ip: entry.ip ?? null,
      userAgent: entry.userAgent ?? null,
    },
  });
}
