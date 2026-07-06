// Cash Transfer Service — โอนเงินสดระหว่างสาขาแบบ 2-Step (เหมือน transfer.service.ts ของ)
// ขั้นตอน: Draft -> In Transit (ตัดเงินสดฝั่งต้นทางออกจากการควบคุม) -> Completed (รับเข้าปลายทาง) / Cancelled
// กติกา: ไม่ลงบัญชี (GL) เพราะเงินสดรวมทั้งบริษัทไม่เปลี่ยน — ดูหมายเหตุ schema.prisma model CashTransfer
// การส่งเงินออก (sendCashTransfer) ต้องมี PIN อนุมัติ (Maker-Checker) เหมือน stock.adjust/pawn.forfeit
// เพราะเป็นจุดที่เงินสดจริงออกจากการควบคุมของสาขาต้นทาง
import type { Db } from "@/server/db";
import { TransferStatus } from "@/generated/prisma/client";
import {
  allocateDocumentNumber,
  buildSequenceKey,
  formatDocumentNumber,
} from "./document-number.service";
import { requireApproval } from "./approval.service";
import { writeAuditLog } from "./audit.service";

export interface CreateCashTransferParams {
  fromBranchId: string;
  toBranchId: string;
  fromDrawerId?: string | null;
  toDrawerId?: string | null;
  amountSatang: bigint;
  note?: string | null;
  actorId: string;
  requestId?: string | null;
}

/** สร้างใบโอนเงินสดร่าง (DRAFT) ระหว่างสาขา */
export async function createCashTransfer(
  db: Db,
  params: CreateCashTransferParams,
) {
  const {
    fromBranchId,
    toBranchId,
    fromDrawerId,
    toDrawerId,
    amountSatang,
    note,
    actorId,
    requestId,
  } = params;

  if (fromBranchId === toBranchId) {
    throw new Error("สาขาต้นทางและปลายทางห้ามเป็นสาขาเดียวกัน");
  }
  if (amountSatang <= 0n) {
    throw new Error("จำนวนเงินโอนต้องมากกว่า 0");
  }

  const fromBranch = await db.branch.findUniqueOrThrow({
    where: { id: fromBranchId },
  });

  if (fromDrawerId) {
    const drawer = await db.cashDrawer.findFirst({
      where: { id: fromDrawerId, branchId: fromBranchId },
    });
    if (!drawer)
      throw new Error("ไม่พบลิ้นชักต้นทาง หรือลิ้นชักไม่ได้อยู่ในสาขาต้นทาง");
  }
  if (toDrawerId) {
    const drawer = await db.cashDrawer.findFirst({
      where: { id: toDrawerId, branchId: toBranchId },
    });
    if (!drawer)
      throw new Error("ไม่พบลิ้นชักปลายทาง หรือลิ้นชักไม่ได้อยู่ในสาขาปลายทาง");
  }

  const yearBE = new Date().getFullYear() + 543;
  const seqKey = buildSequenceKey("CTF", fromBranch.code, yearBE);
  const nextNum = await allocateDocumentNumber(db, seqKey);
  const docNo = formatDocumentNumber(seqKey, nextNum);

  const transfer = await db.cashTransfer.create({
    data: {
      docNo,
      fromBranchId,
      toBranchId,
      fromDrawerId: fromDrawerId ?? null,
      toDrawerId: toDrawerId ?? null,
      amountSatang,
      status: TransferStatus.DRAFT,
      createdBy: actorId,
      note: note ?? null,
    },
  });

  await writeAuditLog(db, {
    action: "cash_transfer.create",
    entityType: "cash_transfer",
    entityId: transfer.id,
    actorId,
    branchId: fromBranchId,
    requestId,
    after: {
      docNo,
      fromBranchId,
      toBranchId,
      amountSatang: amountSatang.toString(),
    },
  });

  return transfer;
}

export interface SendCashTransferParams {
  transferId: string;
  approverUsername: string;
  pin: string;
  actorId: string;
  requestId?: string | null;
}

/**
 * ยืนยันการส่งเงิน (DRAFT -> IN_TRANSIT) — ต้องมี PIN อนุมัติ (Maker-Checker)
 * เพราะเป็นจุดที่เงินสดจริงออกจากลิ้นชัก/การควบคุมของสาขาต้นทาง
 */
export async function sendCashTransfer(db: Db, params: SendCashTransferParams) {
  const { transferId, approverUsername, pin, actorId, requestId } = params;

  const transfer = await db.cashTransfer.findUniqueOrThrow({
    where: { id: transferId },
  });

  if (transfer.status !== TransferStatus.DRAFT) {
    throw new Error(`ไม่สามารถยืนยันการส่งเงินได้จากสถานะ ${transfer.status}`);
  }

  const approval = await requireApproval(db, {
    approverUsername,
    pin,
    permission: "cash.transfer",
    branchId: transfer.fromBranchId,
    actorId,
    action: `cash_transfer.send:${transferId}`,
    requireDifferentApprover: true,
    requestId,
  });
  if (!approval.ok) {
    throw new Error(`การอนุมัติส่งเงินไม่ผ่าน: ${approval.reason}`);
  }

  const updated = await db.cashTransfer.update({
    where: { id: transferId },
    data: {
      status: TransferStatus.IN_TRANSIT,
      sentBy: actorId,
      sentAt: new Date(),
    },
  });

  await writeAuditLog(db, {
    action: "cash_transfer.send",
    entityType: "cash_transfer",
    entityId: transferId,
    actorId,
    branchId: transfer.fromBranchId,
    requestId,
    before: { status: TransferStatus.DRAFT },
    after: {
      status: TransferStatus.IN_TRANSIT,
      approverId: approval.approverId,
    },
  });

  return updated;
}

/** ยืนยันการรับเงินที่สาขาปลายทาง (IN_TRANSIT -> COMPLETED) */
export async function receiveCashTransfer(
  db: Db,
  params: { transferId: string; actorId: string; requestId?: string | null },
) {
  const { transferId, actorId, requestId } = params;

  const transfer = await db.cashTransfer.findUniqueOrThrow({
    where: { id: transferId },
  });

  if (transfer.status !== TransferStatus.IN_TRANSIT) {
    throw new Error(`ไม่สามารถรับเงินได้จากสถานะ ${transfer.status}`);
  }

  const updated = await db.cashTransfer.update({
    where: { id: transferId },
    data: {
      status: TransferStatus.COMPLETED,
      receivedBy: actorId,
      receivedAt: new Date(),
    },
  });

  await writeAuditLog(db, {
    action: "cash_transfer.receive",
    entityType: "cash_transfer",
    entityId: transferId,
    actorId,
    branchId: transfer.toBranchId,
    requestId,
    before: { status: TransferStatus.IN_TRANSIT },
    after: { status: TransferStatus.COMPLETED },
  });

  return updated;
}

/** ยกเลิกการโอนเงินสด (ยกเลิกได้ทั้งช่วง DRAFT และ IN_TRANSIT) */
export async function cancelCashTransfer(
  db: Db,
  params: { transferId: string; actorId: string; requestId?: string | null },
) {
  const { transferId, actorId, requestId } = params;

  const transfer = await db.cashTransfer.findUniqueOrThrow({
    where: { id: transferId },
  });

  if (
    transfer.status !== TransferStatus.DRAFT &&
    transfer.status !== TransferStatus.IN_TRANSIT
  ) {
    throw new Error(`ไม่สามารถยกเลิกการโอนเงินได้จากสถานะ ${transfer.status}`);
  }

  const updated = await db.cashTransfer.update({
    where: { id: transferId },
    data: { status: TransferStatus.CANCELLED },
  });

  await writeAuditLog(db, {
    action: "cash_transfer.cancel",
    entityType: "cash_transfer",
    entityId: transferId,
    actorId,
    branchId: transfer.fromBranchId,
    requestId,
    before: { status: transfer.status },
    after: { status: TransferStatus.CANCELLED },
  });

  return updated;
}
