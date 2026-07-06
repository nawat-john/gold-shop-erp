// Work Order Service — งานช่าง (สั่งทำ) และงานซ่อม (Phase 6)
// State machine: RECEIVED -> IN_PROGRESS -> COMPLETED -> DELIVERED, หรือ CANCELLED (จาก RECEIVED/IN_PROGRESS เท่านั้น)
// กติกา: ทุก transition เขียน work_order_events (append-only เหมือน pawn_events)
import type { Db } from "@/server/db";
import {
  WorkOrderStatus,
  WorkOrderEventType,
  WorkOrderType,
  type WorkOrder,
} from "@/generated/prisma/client";
import {
  allocateDocumentNumber,
  buildSequenceKey,
  formatDocumentNumber,
} from "./document-number.service";
import { writeAuditLog } from "./audit.service";

/** ล็อกแถวงานระดับ Postgres (FOR UPDATE) ก่อนอ่าน/แก้ไข — กัน transition ชนกัน */
async function lockWorkOrder(db: Db, workOrderId: string): Promise<WorkOrder> {
  const rows = await db.$queryRaw<{ id: string }[]>`
    SELECT id FROM work_orders WHERE id = ${workOrderId} FOR UPDATE
  `;
  if (rows.length === 0) {
    throw new Error("ไม่พบใบสั่งงานที่ระบุ");
  }
  return db.workOrder.findUniqueOrThrow({ where: { id: workOrderId } });
}

export interface CreateWorkOrderParams {
  branchId: string;
  customerId?: string | null;
  type: WorkOrderType;
  description: string;
  depositSatang?: bigint;
  toleranceMg?: bigint;
  serviceFeeSatang?: bigint;
  promisedAt?: Date | null;
  actorId: string;
  requestId?: string | null;
}

/** รับงานใหม่ (สั่งทำ/ซ่อม) */
export async function createWorkOrder(
  db: Db,
  params: CreateWorkOrderParams,
): Promise<WorkOrder> {
  const {
    branchId,
    customerId,
    type,
    description,
    depositSatang = 0n,
    toleranceMg = 0n,
    serviceFeeSatang = 0n,
    promisedAt,
    actorId,
    requestId,
  } = params;

  if (!description.trim()) throw new Error("กรุณาระบุรายละเอียดงาน");
  if (depositSatang < 0n) throw new Error("เงินมัดจำห้ามติดลบ");
  if (toleranceMg < 0n) throw new Error("ค่าเผื่อเศษทองห้ามติดลบ");
  if (serviceFeeSatang < 0n) throw new Error("ค่าบริการห้ามติดลบ");

  const branch = await db.branch.findUniqueOrThrow({ where: { id: branchId } });
  const yearBE = new Date().getFullYear() + 543;
  const prefix = type === WorkOrderType.CUSTOM_ORDER ? "WOC" : "WOR";
  const seqKey = buildSequenceKey(prefix, branch.code, yearBE);
  const nextNum = await allocateDocumentNumber(db, seqKey);
  const docNo = formatDocumentNumber(seqKey, nextNum);

  const workOrder = await db.workOrder.create({
    data: {
      docNo,
      branchId,
      customerId: customerId ?? null,
      type,
      status: WorkOrderStatus.RECEIVED,
      description,
      depositSatang,
      toleranceMg,
      serviceFeeSatang,
      promisedAt: promisedAt ?? null,
      createdBy: actorId,
    },
  });

  await db.workOrderEvent.create({
    data: {
      workOrderId: workOrder.id,
      eventType: WorkOrderEventType.RECEIVE,
      actorId,
      requestId,
    },
  });

  await writeAuditLog(db, {
    action: "workorder.create",
    entityType: "work_order",
    entityId: workOrder.id,
    actorId,
    branchId,
    requestId,
    after: { docNo, type },
  });

  return workOrder;
}

function assertStatus(workOrder: WorkOrder, expected: WorkOrderStatus): void {
  if (workOrder.status !== expected) {
    throw new Error(
      `ใบสั่งงานนี้ต้องอยู่ในสถานะ ${expected} (สถานะปัจจุบัน: ${workOrder.status})`,
    );
  }
}

export interface IssueGoldParams {
  workOrderId: string;
  weightMg: bigint;
  actorId: string;
  requestId?: string | null;
}

/** เบิกทองช่างไปขึ้นรูป (เฉพาะ CUSTOM_ORDER) — เบิกได้หลายครั้งสะสม และเลื่อนสถานะเป็น IN_PROGRESS อัตโนมัติ */
export async function issueGoldToCraftsman(db: Db, params: IssueGoldParams) {
  const { workOrderId, weightMg, actorId, requestId } = params;
  if (weightMg <= 0n) throw new Error("น้ำหนักทองที่เบิกต้องมากกว่า 0");

  const workOrder = await lockWorkOrder(db, workOrderId);
  if (workOrder.type !== WorkOrderType.CUSTOM_ORDER) {
    throw new Error("เบิกทองช่างได้เฉพาะงานสั่งทำ (CUSTOM_ORDER) เท่านั้น");
  }
  if (
    workOrder.status !== WorkOrderStatus.RECEIVED &&
    workOrder.status !== WorkOrderStatus.IN_PROGRESS
  ) {
    throw new Error(`ไม่สามารถเบิกทองช่างได้จากสถานะ ${workOrder.status}`);
  }

  await db.workOrderEvent.create({
    data: {
      workOrderId,
      eventType: WorkOrderEventType.GOLD_ISSUE,
      actorId,
      requestId,
      note: `เบิกทอง ${weightMg} มก.`,
    },
  });

  const updated = await db.workOrder.update({
    where: { id: workOrderId },
    data: {
      goldIssuedMg: { increment: weightMg },
      status: WorkOrderStatus.IN_PROGRESS,
    },
  });

  await writeAuditLog(db, {
    action: "workorder.gold_issue",
    entityType: "work_order",
    entityId: workOrderId,
    actorId,
    requestId,
    after: { weightMg: weightMg.toString() },
  });

  return updated;
}

/** เริ่มดำเนินงาน (RECEIVED -> IN_PROGRESS) — ใช้กับงานซ่อมที่ไม่มีการเบิกทอง */
export async function startWork(
  db: Db,
  params: { workOrderId: string; actorId: string; requestId?: string | null },
) {
  const workOrder = await lockWorkOrder(db, params.workOrderId);
  assertStatus(workOrder, WorkOrderStatus.RECEIVED);

  await db.workOrderEvent.create({
    data: {
      workOrderId: params.workOrderId,
      eventType: WorkOrderEventType.STATUS_CHANGE,
      actorId: params.actorId,
      requestId: params.requestId,
      note: "เริ่มดำเนินงาน",
    },
  });

  const updated = await db.workOrder.update({
    where: { id: params.workOrderId },
    data: { status: WorkOrderStatus.IN_PROGRESS },
  });

  await writeAuditLog(db, {
    action: "workorder.start",
    entityType: "work_order",
    entityId: params.workOrderId,
    actorId: params.actorId,
    requestId: params.requestId,
  });

  return updated;
}

/** งานเสร็จพร้อมส่งมอบ (IN_PROGRESS -> COMPLETED) */
export async function completeWorkOrder(
  db: Db,
  params: { workOrderId: string; actorId: string; requestId?: string | null },
) {
  const workOrder = await lockWorkOrder(db, params.workOrderId);
  assertStatus(workOrder, WorkOrderStatus.IN_PROGRESS);

  const now = new Date();
  await db.workOrderEvent.create({
    data: {
      workOrderId: params.workOrderId,
      eventType: WorkOrderEventType.COMPLETE,
      actorId: params.actorId,
      requestId: params.requestId,
    },
  });

  const updated = await db.workOrder.update({
    where: { id: params.workOrderId },
    data: { status: WorkOrderStatus.COMPLETED, completedAt: now },
  });

  await writeAuditLog(db, {
    action: "workorder.complete",
    entityType: "work_order",
    entityId: params.workOrderId,
    actorId: params.actorId,
    requestId: params.requestId,
  });

  return updated;
}

/** ส่งมอบงานให้ลูกค้า (COMPLETED -> DELIVERED) */
export async function deliverWorkOrder(
  db: Db,
  params: { workOrderId: string; actorId: string; requestId?: string | null },
) {
  const workOrder = await lockWorkOrder(db, params.workOrderId);
  assertStatus(workOrder, WorkOrderStatus.COMPLETED);

  const now = new Date();
  await db.workOrderEvent.create({
    data: {
      workOrderId: params.workOrderId,
      eventType: WorkOrderEventType.DELIVER,
      actorId: params.actorId,
      requestId: params.requestId,
    },
  });

  const updated = await db.workOrder.update({
    where: { id: params.workOrderId },
    data: { status: WorkOrderStatus.DELIVERED, deliveredAt: now },
  });

  await writeAuditLog(db, {
    action: "workorder.deliver",
    entityType: "work_order",
    entityId: params.workOrderId,
    actorId: params.actorId,
    requestId: params.requestId,
  });

  return updated;
}

/** ยกเลิกใบสั่งงาน (ยกเลิกได้เฉพาะ RECEIVED/IN_PROGRESS เท่านั้น) */
export async function cancelWorkOrder(
  db: Db,
  params: {
    workOrderId: string;
    reason: string;
    actorId: string;
    requestId?: string | null;
  },
) {
  const { workOrderId, reason, actorId, requestId } = params;
  if (!reason.trim()) throw new Error("กรุณาระบุเหตุผลการยกเลิก");

  const workOrder = await lockWorkOrder(db, workOrderId);
  if (
    workOrder.status !== WorkOrderStatus.RECEIVED &&
    workOrder.status !== WorkOrderStatus.IN_PROGRESS
  ) {
    throw new Error(`ไม่สามารถยกเลิกใบสั่งงานได้จากสถานะ ${workOrder.status}`);
  }

  const now = new Date();
  await db.workOrderEvent.create({
    data: {
      workOrderId,
      eventType: WorkOrderEventType.CANCEL,
      actorId,
      requestId,
      note: reason,
    },
  });

  const updated = await db.workOrder.update({
    where: { id: workOrderId },
    data: { status: WorkOrderStatus.CANCELLED, cancelledAt: now },
  });

  await writeAuditLog(db, {
    action: "workorder.cancel",
    entityType: "work_order",
    entityId: workOrderId,
    actorId,
    requestId,
    after: { reason },
  });

  return updated;
}

/** คิวงาน — ใบสั่งงานที่ยังไม่เสร็จ (RECEIVED/IN_PROGRESS) เรียงตามกำหนดส่งใกล้สุดก่อน */
export async function getQueue(db: Db, params: { branchId?: string } = {}) {
  return db.workOrder.findMany({
    where: {
      status: { in: [WorkOrderStatus.RECEIVED, WorkOrderStatus.IN_PROGRESS] },
      ...(params.branchId ? { branchId: params.branchId } : {}),
    },
    orderBy: [{ promisedAt: "asc" }, { receivedAt: "asc" }],
  });
}
