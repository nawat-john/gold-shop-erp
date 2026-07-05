// Step-up approval (maker-checker primitive) — โมดูลอื่นเรียกใช้กับ action เสี่ยง:
// void บิล, แก้ราคาเกิน limit, อนุมัติทองหลุด, ปรับสต๊อก ฯลฯ
// ผู้อนุมัติใส่ PIN (แยกจากรหัส login) + ต้องมี permission ของ action นั้น
import type { Db } from "@/server/db";
import type { PermissionCode } from "@/server/auth/permissions";
import {
  hashPassword,
  validateApprovalPin,
  verifyPassword,
} from "@/server/security/password";
import { writeAuditLog } from "./audit.service";
import { hasPermission } from "./rbac.service";

export async function setApprovalPin(
  db: Db,
  params: { userId: string; pin: string; actorId: string },
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const policy = validateApprovalPin(params.pin);
  if (!policy.ok) return { ok: false, reason: policy.reason };

  await db.user.update({
    where: { id: params.userId },
    data: { approvalPinHash: await hashPassword(params.pin) },
  });
  await writeAuditLog(db, {
    action: "approval.pin_set",
    entityType: "user",
    entityId: params.userId,
    actorId: params.actorId,
  });
  return { ok: true };
}

export interface ApprovalRequest {
  /** username ของผู้อนุมัติ (พิมพ์ที่หน้าจอตอนขออนุมัติ) */
  approverUsername: string;
  pin: string;
  /** permission ที่ action นี้ต้องการ เช่น "sale.void" */
  permission: PermissionCode;
  branchId?: string;
  /** ผู้ทำรายการ (maker) — ใช้ตรวจ segregation of duties */
  actorId: string;
  /** action ที่ขออนุมัติ — ลง audit log */
  action: string;
  /** true = ผู้อนุมัติต้องเป็นคนละคนกับผู้ทำรายการ */
  requireDifferentApprover?: boolean;
  requestId?: string | null;
}

export type ApprovalResult =
  | { ok: true; approverId: string }
  | {
      ok: false;
      reason:
        | "approver_not_found"
        | "no_pin_set"
        | "wrong_pin"
        | "no_permission"
        | "same_as_actor";
    };

export async function requireApproval(
  db: Db,
  req: ApprovalRequest,
): Promise<ApprovalResult> {
  const deny = async (
    reason: Exclude<ApprovalResult, { ok: true }>["reason"],
    approverId?: string,
  ): Promise<ApprovalResult> => {
    await writeAuditLog(db, {
      action: "approval.denied",
      entityType: "approval",
      actorId: req.actorId,
      branchId: req.branchId,
      requestId: req.requestId,
      after: {
        requestedAction: req.action,
        approverUsername: req.approverUsername,
        approverId: approverId ?? null,
        reason,
      },
    });
    return { ok: false, reason };
  };

  const approver = await db.user.findUnique({
    where: { username: req.approverUsername },
  });
  if (!approver || !approver.isActive) return deny("approver_not_found");
  if (req.requireDifferentApprover && approver.id === req.actorId) {
    return deny("same_as_actor", approver.id);
  }
  if (!approver.approvalPinHash) return deny("no_pin_set", approver.id);
  if (!(await verifyPassword(approver.approvalPinHash, req.pin))) {
    return deny("wrong_pin", approver.id);
  }
  if (!(await hasPermission(db, approver.id, req.permission, req.branchId))) {
    return deny("no_permission", approver.id);
  }

  await writeAuditLog(db, {
    action: "approval.granted",
    entityType: "approval",
    actorId: req.actorId,
    branchId: req.branchId,
    requestId: req.requestId,
    after: {
      requestedAction: req.action,
      approverId: approver.id,
      permission: req.permission,
    },
  });
  return { ok: true, approverId: approver.id };
}
