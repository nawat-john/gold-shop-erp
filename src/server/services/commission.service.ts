// Commission Service — ค่าคอมมิชชั่นพนักงานขาย (Phase 7)
// กติกา: คำนวณจากค่ากำเหน็จสุทธิ (หลังหัก VAT) ของบิลขาย ไม่รวมเนื้อทอง (กำไรเนื้อทองบางมาก)
// อัตราปิดใช้งานเป็นค่าเริ่มต้น (0%) — ต้องตั้งค่า commission.sale_rate_percent ก่อนจึงจะเริ่มคำนวณ
import type { Db } from "@/server/db";
import { mulDivRoundHalfUp } from "@/server/domain/money";
import { getOrCreatePeriod, postJournalEntry } from "./accounting.service";
import { buildCommissionPostingLines } from "@/server/domain/posting-rules";
import { SETTING_KEYS, getNumberSetting } from "./settings.service";
import { writeAuditLog } from "./audit.service";

/**
 * ให้ค่าคอมมิชชั่นพนักงานสำหรับบิลขายที่สำเร็จแล้ว — ข้ามถ้าอัตราเป็น 0 หรือบิลนี้ให้ไปแล้ว
 * เรียกหลัง postSalesOrder (ไม่บล็อกบิลขายถ้าล้มเหลว — ดู postSafely ที่จุดเรียกใช้)
 */
export async function awardCommissionForSalesOrder(
  db: Db,
  params: {
    salesOrderId: string;
    staffId: string;
    actorId: string;
    requestId?: string | null;
  },
) {
  const existing = await db.commission.findUnique({
    where: { salesOrderId: params.salesOrderId },
  });
  if (existing) return existing;

  const ratePercent = await getNumberSetting(
    db,
    SETTING_KEYS.commissionSaleRatePercent,
    0,
  );
  if (ratePercent <= 0) return null;

  const order = await db.salesOrder.findUniqueOrThrow({
    where: { id: params.salesOrderId },
    include: { items: true },
  });
  if (order.status !== "COMPLETED") return null;

  const netLaborRevenueSatang = order.items.reduce(
    (sum, item) => sum + (item.laborChargeSatang - item.vatAmountSatang),
    0n,
  );
  const rateScaled = BigInt(Math.round(ratePercent * 100));
  const amountSatang = mulDivRoundHalfUp(
    netLaborRevenueSatang,
    rateScaled,
    10_000n,
  );
  if (amountSatang <= 0n) return null;

  const period = await getOrCreatePeriod(db, order.createdAt);

  const commission = await db.commission.create({
    data: {
      staffId: params.staffId,
      salesOrderId: params.salesOrderId,
      periodId: period.id,
      ratePercent,
      amountSatang,
    },
  });

  const lines = buildCommissionPostingLines(amountSatang);
  await postJournalEntry(db, {
    entryDate: order.createdAt,
    description: `ค่าคอมมิชชั่นบิลขาย ${order.docNo}`,
    refType: "commission",
    refId: commission.id,
    lines,
    actorId: params.actorId,
    requestId: params.requestId,
  });

  await writeAuditLog(db, {
    action: "commission.award",
    entityType: "commission",
    entityId: commission.id,
    actorId: params.actorId,
    requestId: params.requestId,
    after: {
      salesOrderId: params.salesOrderId,
      amountSatang: amountSatang.toString(),
    },
  });

  return commission;
}

/** รายงานค่าคอมมิชชั่นตามช่วงวันที่ แยกตามพนักงาน */
export async function getCommissionReport(
  db: Db,
  params: { staffId?: string; fromDate: Date; toDate: Date },
) {
  const commissions = await db.commission.findMany({
    where: {
      ...(params.staffId ? { staffId: params.staffId } : {}),
      createdAt: { gte: params.fromDate, lte: params.toDate },
    },
    include: { staff: true, salesOrder: true },
    orderBy: { createdAt: "desc" },
  });

  const totalSatang = commissions.reduce((sum, c) => sum + c.amountSatang, 0n);
  return { commissions, totalSatang };
}
