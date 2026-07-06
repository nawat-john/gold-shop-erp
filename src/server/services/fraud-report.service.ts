// Fraud Report Service — รายงานอ่านอย่างเดียวสำหรับ Fraud Dashboard (Phase 8)
// กติกา: ไม่แก้ไขข้อมูล, คำนวณจาก audit_logs + คอลัมน์ที่ query ได้จริงบน SalesOrder/PurchaseOrder/StockCount
// สูตรตัดสิน "ผิดปกติ" เป็น pure function อยู่ที่ src/server/domain/fraud-scoring.ts
import type { Db } from "@/server/db";
import { getNumberSetting, SETTING_KEYS } from "./settings.service";
import {
  computeVoidRatePercent,
  isVoidRateAnomalous,
  isStockAdjustCountAnomalous,
  isOffHours,
} from "@/server/domain/fraud-scoring";

const MIN_SAMPLE_SIZE = 5;

export interface VoidLeaderboardRow {
  actorId: string;
  actorName: string;
  totalCount: number;
  voidCount: number;
  voidRatePercent: number;
  flagged: boolean;
}

/** จัดอันดับพนักงานตามอัตรา void ของบิลที่ตัวเองสร้าง (ขาย+รับซื้อ) ในช่วงเวลา/สาขาที่กำหนด */
export async function getVoidLeaderboard(
  db: Db,
  params: { fromDate: Date; toDate: Date; branchId?: string },
): Promise<VoidLeaderboardRow[]> {
  const { fromDate, toDate, branchId } = params;
  const thresholdPercent = await getNumberSetting(
    db,
    SETTING_KEYS.fraudVoidRateAlertPercent,
    20,
  );

  const where = {
    createdAt: { gte: fromDate, lte: toDate },
    ...(branchId ? { branchId } : {}),
  };

  const [salesOrders, purchaseOrders] = await Promise.all([
    db.salesOrder.findMany({
      where,
      select: { createdBy: true, status: true },
    }),
    db.purchaseOrder.findMany({
      where,
      select: { createdBy: true, status: true },
    }),
  ]);

  const byActor = new Map<string, { total: number; voided: number }>();
  for (const order of [...salesOrders, ...purchaseOrders]) {
    const entry = byActor.get(order.createdBy) ?? { total: 0, voided: 0 };
    entry.total += 1;
    if (order.status === "VOIDED") entry.voided += 1;
    byActor.set(order.createdBy, entry);
  }

  const actorIds = Array.from(byActor.keys());
  const users = await db.user.findMany({
    where: { id: { in: actorIds } },
    select: { id: true, displayName: true },
  });
  const nameById = new Map(users.map((u) => [u.id, u.displayName]));

  const rows: VoidLeaderboardRow[] = actorIds.map((actorId) => {
    const { total, voided } = byActor.get(actorId)!;
    return {
      actorId,
      actorName: nameById.get(actorId) ?? actorId,
      totalCount: total,
      voidCount: voided,
      voidRatePercent: computeVoidRatePercent(voided, total),
      flagged: isVoidRateAnomalous({
        voidCount: voided,
        totalCount: total,
        thresholdPercent,
        minSampleSize: MIN_SAMPLE_SIZE,
      }),
    };
  });

  return rows.sort((a, b) => b.voidRatePercent - a.voidRatePercent);
}

export interface StockAdjustLeaderboardRow {
  approverId: string;
  approverName: string;
  approvalCount: number;
  totalMagnitudeSatang: bigint;
  flagged: boolean;
}

/** จัดอันดับผู้อนุมัติปรับสต๊อก (stock count) ตามจำนวนครั้งที่อนุมัติ + มูลค่ารวมที่ปรับ */
export async function getStockAdjustLeaderboard(
  db: Db,
  params: { fromDate: Date; toDate: Date; branchId?: string },
): Promise<StockAdjustLeaderboardRow[]> {
  const { fromDate, toDate, branchId } = params;
  const thresholdCount = await getNumberSetting(
    db,
    SETTING_KEYS.fraudStockAdjustAlertCount,
    5,
  );

  const counts = await db.stockCount.findMany({
    where: {
      status: "APPROVED",
      closedAt: { gte: fromDate, lte: toDate },
      approvedBy: { not: null },
      ...(branchId ? { branchId } : {}),
    },
    select: { id: true, approvedBy: true },
  });
  if (counts.length === 0) return [];

  const movementSums = await db.stockMovement.groupBy({
    by: ["refId"],
    where: { refType: "stock_count", refId: { in: counts.map((c) => c.id) } },
    _sum: { costSatang: true },
  });
  const magnitudeByCountId = new Map(
    movementSums.map((m) => [m.refId, m._sum.costSatang ?? 0n]),
  );

  const byApprover = new Map<
    string,
    { approvalCount: number; magnitude: bigint }
  >();
  for (const count of counts) {
    const approverId = count.approvedBy!;
    const entry = byApprover.get(approverId) ?? {
      approvalCount: 0,
      magnitude: 0n,
    };
    entry.approvalCount += 1;
    const magnitude = magnitudeByCountId.get(count.id) ?? 0n;
    entry.magnitude += magnitude < 0n ? -magnitude : magnitude;
    byApprover.set(approverId, entry);
  }

  const approverIds = Array.from(byApprover.keys());
  const users = await db.user.findMany({
    where: { id: { in: approverIds } },
    select: { id: true, displayName: true },
  });
  const nameById = new Map(users.map((u) => [u.id, u.displayName]));

  const rows: StockAdjustLeaderboardRow[] = approverIds.map((approverId) => {
    const { approvalCount, magnitude } = byApprover.get(approverId)!;
    return {
      approverId,
      approverName: nameById.get(approverId) ?? approverId,
      approvalCount,
      totalMagnitudeSatang: magnitude,
      flagged: isStockAdjustCountAnomalous(approvalCount, thresholdCount),
    };
  });

  return rows.sort((a, b) => b.approvalCount - a.approvalCount);
}

export interface OffHoursActivityRow {
  createdAt: Date;
  actorId: string | null;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string | null;
  branchId: string | null;
}

/** รายการ void/ปรับสต๊อกที่เกิดนอกเวลาทำการ (ก่อน 08:00 หรือหลัง 20:00) */
export async function getOffHoursActivity(
  db: Db,
  params: { fromDate: Date; toDate: Date; branchId?: string },
): Promise<OffHoursActivityRow[]> {
  const { fromDate, toDate, branchId } = params;

  const logs = await db.auditLog.findMany({
    where: {
      createdAt: { gte: fromDate, lte: toDate },
      ...(branchId ? { branchId } : {}),
      OR: [
        { action: { startsWith: "pos.void_" } },
        { action: "stock_count.approve" },
        { action: "cash_transfer.send" },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const offHoursLogs = logs.filter((log) => isOffHours(log.createdAt));

  const actorIds = Array.from(
    new Set(
      offHoursLogs.map((l) => l.actorId).filter((id): id is string => !!id),
    ),
  );
  const users = await db.user.findMany({
    where: { id: { in: actorIds } },
    select: { id: true, displayName: true },
  });
  const nameById = new Map(users.map((u) => [u.id, u.displayName]));

  return offHoursLogs.map((log) => ({
    createdAt: log.createdAt,
    actorId: log.actorId,
    actorName: log.actorId
      ? (nameById.get(log.actorId) ?? log.actorId)
      : "ระบบ",
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    branchId: log.branchId,
  }));
}
