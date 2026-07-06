// Accounting Service — ตัวเขียน journal กลาง (double-entry) + ปิดงวดบัญชี (period lock)
// กติกา: ทุกการโพสต์ต้องผ่าน postJournalEntry เท่านั้น (บังคับ debit=credit ก่อนเขียนจริง,
// เช็คซ้ำด้วย DEFERRABLE CONSTRAINT TRIGGER ระดับ DB ตอน COMMIT) และเช็คงวดบัญชีเปิดอยู่เสมอ
import type { Db } from "@/server/db";
import type { JournalEntry } from "@/generated/prisma/client";
import { logger } from "@/lib/logger";
import {
  allocateDocumentNumber,
  buildSequenceKey,
  formatDocumentNumber,
} from "./document-number.service";
import { requireApproval } from "./approval.service";
import { writeAuditLog } from "./audit.service";
import {
  buildSalesOrderPostingLines,
  buildPurchaseOrderPostingLines,
  buildTradeInPostingLines,
  buildPawnEventPostingLines,
  buildSavingsTxPostingLines,
  buildWorkOrderPostingLines,
  reversePostingLine,
  type PostingLine,
} from "@/server/domain/posting-rules";
import type { AccountCode } from "@/server/domain/chart-of-accounts";

function paymentAccountCode(method: string): AccountCode {
  return method === "CASH" ? "1000" : "1010";
}

function yearMonthKey(date: Date): string {
  const yearBE = date.getFullYear() + 543;
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${yearBE}-${month}`;
}

/** ดึงงวดบัญชีของวันที่ระบุ สร้างใหม่อัตโนมัติ (OPEN) ถ้ายังไม่มี */
export async function getOrCreatePeriod(db: Db, date: Date) {
  const yearMonth = yearMonthKey(date);
  return db.accountingPeriod.upsert({
    where: { yearMonth },
    update: {},
    create: { yearMonth, status: "OPEN" },
  });
}

/** ปฏิเสธการบันทึกธุรกรรมถ้างวดบัญชีของวันที่นั้นถูกปิด (LOCKED) แล้ว */
export async function assertPeriodOpen(db: Db, date: Date): Promise<void> {
  const period = await getOrCreatePeriod(db, date);
  if (period.status === "LOCKED") {
    throw new Error(
      `งวดบัญชี ${period.yearMonth} ถูกปิดแล้ว ไม่สามารถบันทึกธุรกรรมย้อนหลังในงวดนี้ได้`,
    );
  }
}

export interface LockPeriodParams {
  yearMonth: string;
  approverUsername: string;
  pin: string;
  actorId: string;
  requestId?: string | null;
}

/** ปิดงวดบัญชี — ต้องมี PIN อนุมัติ (Maker-Checker) */
export async function lockPeriod(db: Db, params: LockPeriodParams) {
  const period = await db.accountingPeriod.findUnique({
    where: { yearMonth: params.yearMonth },
  });
  if (!period) throw new Error("ไม่พบงวดบัญชีที่ระบุ");
  if (period.status === "LOCKED") throw new Error("งวดบัญชีนี้ถูกปิดไปแล้ว");

  const approval = await requireApproval(db, {
    approverUsername: params.approverUsername,
    pin: params.pin,
    permission: "accounting.period_lock",
    actorId: params.actorId,
    action: `accounting.lock_period:${params.yearMonth}`,
    requireDifferentApprover: true,
    requestId: params.requestId,
  });
  if (!approval.ok) {
    throw new Error(`ปิดงวดบัญชีด้วย PIN ล้มเหลว: ${approval.reason}`);
  }

  const updated = await db.accountingPeriod.update({
    where: { yearMonth: params.yearMonth },
    data: {
      status: "LOCKED",
      lockedAt: new Date(),
      lockedById: params.actorId,
    },
  });

  await writeAuditLog(db, {
    action: "accounting.lock_period",
    entityType: "accounting_period",
    entityId: updated.id,
    actorId: params.actorId,
    requestId: params.requestId,
    after: { yearMonth: params.yearMonth, approverId: approval.approverId },
  });

  return updated;
}

/** เปิดงวดบัญชีที่ปิดไปแล้วกลับมา (ใช้กรณีฉุกเฉิน/แก้ไขข้อผิดพลาด) — ต้องมี PIN อนุมัติ */
export async function unlockPeriod(db: Db, params: LockPeriodParams) {
  const period = await db.accountingPeriod.findUnique({
    where: { yearMonth: params.yearMonth },
  });
  if (!period) throw new Error("ไม่พบงวดบัญชีที่ระบุ");
  if (period.status === "OPEN") throw new Error("งวดบัญชีนี้เปิดอยู่แล้ว");

  const approval = await requireApproval(db, {
    approverUsername: params.approverUsername,
    pin: params.pin,
    permission: "accounting.period_unlock",
    actorId: params.actorId,
    action: `accounting.unlock_period:${params.yearMonth}`,
    requireDifferentApprover: true,
    requestId: params.requestId,
  });
  if (!approval.ok) {
    throw new Error(`เปิดงวดบัญชีด้วย PIN ล้มเหลว: ${approval.reason}`);
  }

  const updated = await db.accountingPeriod.update({
    where: { yearMonth: params.yearMonth },
    data: { status: "OPEN", lockedAt: null, lockedById: null },
  });

  await writeAuditLog(db, {
    action: "accounting.unlock_period",
    entityType: "accounting_period",
    entityId: updated.id,
    actorId: params.actorId,
    requestId: params.requestId,
    after: { yearMonth: params.yearMonth, approverId: approval.approverId },
  });

  return updated;
}

export interface PostJournalEntryParams {
  entryDate: Date;
  description: string;
  refType?: string | null;
  refId?: string | null;
  lines: PostingLine[];
  actorId: string;
  requestId?: string | null;
  isManual?: boolean;
  /** สาขาต้นทางของธุรกรรม — บังคับเสมอ เพราะหนึ่ง entry ผูกกับหนึ่งสาขา (ดูหมายเหตุ schema.prisma) */
  branchId: string;
}

/**
 * เขียนใบสำคัญบัญชี — จุดเดียวที่ทุกโมดูลต้องเรียกผ่านเพื่อลง journal
 * - lines ว่าง (ไม่มีอะไรต้องลง เช่น ดอกเบี้ย 0, ไม่มีมัดจำ) -> คืน null ไม่สร้างอะไร
 * - refType+refId ซ้ำของเดิม -> idempotent คืนรายการเดิม ไม่โพสต์ซ้ำ (ใช้ backfill ได้ปลอดภัย)
 * - debit รวม != credit รวม -> throw ก่อนเขียน DB (เช็คซ้ำด้วย DB trigger ตอน commit)
 * - งวดบัญชีปิดแล้ว -> throw
 */
export async function postJournalEntry(
  db: Db,
  params: PostJournalEntryParams,
): Promise<JournalEntry | null> {
  const {
    entryDate,
    description,
    refType,
    refId,
    lines,
    actorId,
    requestId,
    isManual = false,
    branchId,
  } = params;

  if (lines.length === 0) return null;

  if (refType && refId) {
    const existing = await db.journalEntry.findFirst({
      where: { refType, refId },
    });
    if (existing) return existing;
  }

  const totalDebit = lines.reduce((sum, l) => sum + l.debitSatang, 0n);
  const totalCredit = lines.reduce((sum, l) => sum + l.creditSatang, 0n);
  if (totalDebit !== totalCredit) {
    throw new Error(
      `รายการบัญชีไม่สมดุล: debit ${totalDebit} สตางค์ ไม่เท่ากับ credit ${totalCredit} สตางค์`,
    );
  }

  await assertPeriodOpen(db, entryDate);
  const period = await getOrCreatePeriod(db, entryDate);

  const yearBE = entryDate.getFullYear() + 543;
  const seqKey = buildSequenceKey("JE", "GL", yearBE);
  const nextNum = await allocateDocumentNumber(db, seqKey);
  const entryNo = formatDocumentNumber(seqKey, nextNum);

  const codes = Array.from(new Set(lines.map((l) => l.accountCode)));
  const accounts = await db.account.findMany({
    where: { code: { in: codes } },
  });
  const accountIdByCode = new Map(accounts.map((a) => [a.code, a.id]));
  for (const code of codes) {
    if (!accountIdByCode.has(code)) {
      throw new Error(
        `ไม่พบบัญชี ${code} ในผังบัญชี — กรุณา seed chart of accounts ก่อน`,
      );
    }
  }

  const entry = await db.journalEntry.create({
    data: {
      entryNo,
      periodId: period.id,
      branchId,
      entryDate,
      description,
      refType: refType ?? null,
      refId: refId ?? null,
      isManual,
      createdBy: actorId,
    },
  });

  await db.journalLine.createMany({
    data: lines.map((l) => ({
      entryId: entry.id,
      accountId: accountIdByCode.get(l.accountCode)!,
      debitSatang: l.debitSatang,
      creditSatang: l.creditSatang,
      memo: l.memo ?? null,
    })),
  });

  await writeAuditLog(db, {
    action: "accounting.post",
    entityType: "journal_entry",
    entityId: entry.id,
    actorId,
    requestId,
    after: {
      entryNo,
      refType: refType ?? null,
      refId: refId ?? null,
      totalDebitSatang: totalDebit.toString(),
    },
  });

  return entry;
}

/** กลับรายการ (reversal) จากรายการเดิมทุกบรรทัดแบบเป๊ะๆ — ใช้กับ void บิล */
async function postVoidEntry(
  db: Db,
  params: {
    originalRefType: string;
    originalRefId: string;
    voidRefType: string;
    description: string;
    entryDate: Date;
    actorId: string;
    requestId?: string | null;
    branchId: string;
  },
): Promise<JournalEntry | null> {
  const original = await db.journalEntry.findFirst({
    where: { refType: params.originalRefType, refId: params.originalRefId },
    include: { lines: { include: { account: true } } },
  });
  if (!original) return null;

  const reversedLines: PostingLine[] = original.lines.map((l) =>
    reversePostingLine({
      accountCode: l.account.code as AccountCode,
      debitSatang: l.debitSatang,
      creditSatang: l.creditSatang,
      memo: l.memo ?? undefined,
    }),
  );

  return postJournalEntry(db, {
    entryDate: params.entryDate,
    description: params.description,
    refType: params.voidRefType,
    refId: params.originalRefId,
    lines: reversedLines,
    actorId: params.actorId,
    requestId: params.requestId,
    branchId: params.branchId,
  });
}

// ───────────────────────── Phase 4: POS ─────────────────────────

export async function postSalesOrder(
  db: Db,
  salesOrderId: string,
  actorId: string,
  requestId?: string | null,
) {
  const order = await db.salesOrder.findUniqueOrThrow({
    where: { id: salesOrderId },
    include: { items: { include: { item: true } }, payments: true },
  });

  const goldRevenueSatang = order.items.reduce(
    (s, i) => s + i.goldPriceSatang,
    0n,
  );
  const vatSatang = order.items.reduce((s, i) => s + i.vatAmountSatang, 0n);
  const netLaborRevenueSatang = order.items.reduce(
    (s, i) => s + (i.laborChargeSatang - i.vatAmountSatang),
    0n,
  );
  const cogsSatang = order.items.reduce(
    (s, i) => s + (i.item ? i.item.costSatang : 0n),
    0n,
  );

  const lines = buildSalesOrderPostingLines({
    paymentLines: order.payments.map((p) => ({
      accountCode: paymentAccountCode(p.paymentMethod),
      amountSatang: p.amountSatang,
      feeSatang: p.feeSatang,
    })),
    goldRevenueSatang,
    netLaborRevenueSatang,
    vatSatang,
    cogsSatang,
  });

  return postJournalEntry(db, {
    entryDate: order.createdAt,
    description: `บิลขาย ${order.docNo}`,
    refType: "sales_order",
    refId: order.id,
    lines,
    actorId,
    requestId,
    branchId: order.branchId,
  });
}

export async function postVoidSalesOrder(
  db: Db,
  salesOrderId: string,
  actorId: string,
  requestId?: string | null,
) {
  const order = await db.salesOrder.findUniqueOrThrow({
    where: { id: salesOrderId },
  });
  return postVoidEntry(db, {
    originalRefType: "sales_order",
    originalRefId: salesOrderId,
    voidRefType: "sales_order_void",
    description: `Void บิลขาย ${order.docNo}`,
    entryDate: new Date(),
    actorId,
    requestId,
    branchId: order.branchId,
  });
}

export async function postPurchaseOrder(
  db: Db,
  purchaseOrderId: string,
  actorId: string,
  requestId?: string | null,
) {
  const order = await db.purchaseOrder.findUniqueOrThrow({
    where: { id: purchaseOrderId },
    include: { payments: true },
  });

  const lines = buildPurchaseOrderPostingLines({
    paymentLines: order.payments.map((p) => ({
      accountCode: paymentAccountCode(p.paymentMethod),
      amountSatang: p.amountSatang,
    })),
    totalCostSatang: order.totalAmountSatang,
  });

  return postJournalEntry(db, {
    entryDate: order.createdAt,
    description: `บิลรับซื้อ ${order.docNo}`,
    refType: "purchase_order",
    refId: order.id,
    lines,
    actorId,
    requestId,
    branchId: order.branchId,
  });
}

export async function postVoidPurchaseOrder(
  db: Db,
  purchaseOrderId: string,
  actorId: string,
  requestId?: string | null,
) {
  const order = await db.purchaseOrder.findUniqueOrThrow({
    where: { id: purchaseOrderId },
  });
  return postVoidEntry(db, {
    originalRefType: "purchase_order",
    originalRefId: purchaseOrderId,
    voidRefType: "purchase_order_void",
    description: `Void บิลรับซื้อ ${order.docNo}`,
    entryDate: new Date(),
    actorId,
    requestId,
    branchId: order.branchId,
  });
}

export async function postTradeIn(
  db: Db,
  tradeInId: string,
  actorId: string,
  requestId?: string | null,
) {
  const tradeIn = await db.tradeIn.findUniqueOrThrow({
    where: { id: tradeInId },
    include: {
      salesOrder: { include: { items: { include: { item: true } } } },
      purchaseOrder: true,
      payments: true,
    },
  });

  const goldRevenueSatang = tradeIn.salesOrder.items.reduce(
    (s, i) => s + i.goldPriceSatang,
    0n,
  );
  const vatSatang = tradeIn.salesOrder.items.reduce(
    (s, i) => s + i.vatAmountSatang,
    0n,
  );
  const netLaborRevenueSatang = tradeIn.salesOrder.items.reduce(
    (s, i) => s + (i.laborChargeSatang - i.vatAmountSatang),
    0n,
  );
  const cogsSatang = tradeIn.salesOrder.items.reduce(
    (s, i) => s + (i.item ? i.item.costSatang : 0n),
    0n,
  );

  // ธุรกรรมเปลี่ยนทองมักตั้งถิ่นฐานส่วนต่างด้วยช่องทางเดียว — ใช้ช่องทางแรกที่บันทึกไว้ (ถ้าไม่มี default เป็นเงินสด)
  const settlementAccountCode = paymentAccountCode(
    tradeIn.payments[0]?.paymentMethod ?? "CASH",
  );

  const lines = buildTradeInPostingLines({
    purchaseCostSatang: tradeIn.purchaseOrder.totalAmountSatang,
    goldRevenueSatang,
    netLaborRevenueSatang,
    vatSatang,
    cogsSatang,
    netAmountSatang: tradeIn.netAmountSatang,
    settlementAccountCode,
  });

  return postJournalEntry(db, {
    entryDate: tradeIn.createdAt,
    description: `บิลเปลี่ยนทอง ${tradeIn.docNo}`,
    refType: "trade_in",
    refId: tradeIn.id,
    lines,
    actorId,
    requestId,
    branchId: tradeIn.salesOrder.branchId,
  });
}

export async function postVoidTradeIn(
  db: Db,
  tradeInId: string,
  actorId: string,
  requestId?: string | null,
) {
  const tradeIn = await db.tradeIn.findUniqueOrThrow({
    where: { id: tradeInId },
    include: { salesOrder: true },
  });
  return postVoidEntry(db, {
    originalRefType: "trade_in",
    originalRefId: tradeInId,
    voidRefType: "trade_in_void",
    description: `Void บิลเปลี่ยนทอง ${tradeIn.docNo}`,
    entryDate: new Date(),
    actorId,
    requestId,
    branchId: tradeIn.salesOrder.branchId,
  });
}

// ───────────────────────── Phase 5: Pawn ─────────────────────────

export async function postPawnEvent(
  db: Db,
  pawnEventId: bigint,
  actorId: string,
  requestId?: string | null,
) {
  const event = await db.pawnEvent.findUniqueOrThrow({
    where: { id: pawnEventId },
    include: { contract: true },
  });

  const lines = buildPawnEventPostingLines({
    eventType: event.eventType as
      | "OPEN"
      | "RENEW_INTEREST"
      | "REDEEM"
      | "FORFEIT"
      | "PRINCIPAL_INCREASE"
      | "PRINCIPAL_DECREASE"
      | "CANCEL",
    principalBeforeSatang: event.principalBeforeSatang,
    principalAfterSatang: event.principalAfterSatang,
    interestAmountSatang: event.interestAmountSatang,
  });

  return postJournalEntry(db, {
    entryDate: event.createdAt,
    description: `สัญญาขายฝาก ${event.contract.docNo} — ${event.eventType}`,
    refType: "pawn_event",
    refId: event.id.toString(),
    lines,
    actorId,
    requestId,
    branchId: event.contract.branchId,
  });
}

// ───────────────────────── Phase 6: Gold Savings ─────────────────────────

export async function postSavingsTransaction(
  db: Db,
  savingsTransactionId: bigint,
  actorId: string,
  requestId?: string | null,
) {
  const tx = await db.savingsTransaction.findUniqueOrThrow({
    where: { id: savingsTransactionId },
    include: { account: true },
  });

  let cumulativeDepositsSatang = 0n;
  if (
    tx.txType === "CLOSE_GOLD" ||
    tx.txType === "CLOSE_CASH" ||
    tx.txType === "CLOSE_DEFAULTED"
  ) {
    const agg = await db.savingsTransaction.aggregate({
      where: { accountId: tx.accountId, txType: "DEPOSIT" },
      _sum: { amountSatang: true },
    });
    cumulativeDepositsSatang = agg._sum.amountSatang ?? 0n;
  }

  const lines = buildSavingsTxPostingLines({
    txType: tx.txType as
      "OPEN" | "DEPOSIT" | "CLOSE_GOLD" | "CLOSE_CASH" | "CLOSE_DEFAULTED",
    amountSatang: tx.amountSatang,
    cumulativeDepositsSatang,
  });

  return postJournalEntry(db, {
    entryDate: tx.createdAt,
    description: `บัญชีออมทอง ${tx.account.docNo} — ${tx.txType}`,
    refType: "savings_transaction",
    refId: tx.id.toString(),
    lines,
    actorId,
    requestId,
    branchId: tx.account.branchId,
  });
}

// ───────────────────────── Phase 6: Work Orders ─────────────────────────

export async function postWorkOrderEvent(
  db: Db,
  workOrderEventId: bigint,
  actorId: string,
  requestId?: string | null,
) {
  const event = await db.workOrderEvent.findUniqueOrThrow({
    where: { id: workOrderEventId },
    include: { workOrder: true },
  });

  let postingEvent: "RECEIVE" | "DELIVER_REPAIR" | "CANCEL" | null = null;
  if (event.eventType === "RECEIVE") postingEvent = "RECEIVE";
  else if (event.eventType === "CANCEL") postingEvent = "CANCEL";
  else if (event.eventType === "DELIVER" && event.workOrder.type === "REPAIR") {
    postingEvent = "DELIVER_REPAIR";
  }
  // งานสั่งทำ (CUSTOM_ORDER) ยังไม่มีฟิลด์ราคาขายสุดท้าย จึงไม่ลงบัญชีรายได้ตอนส่งมอบ (ดูหมายเหตุ posting-rules.ts)
  if (!postingEvent) return null;

  const lines = buildWorkOrderPostingLines({
    event: postingEvent,
    depositSatang: event.workOrder.depositSatang,
    serviceFeeSatang: event.workOrder.serviceFeeSatang,
  });

  return postJournalEntry(db, {
    entryDate: event.createdAt,
    description: `ใบสั่งงาน ${event.workOrder.docNo} — ${event.eventType}`,
    refType: "work_order_event",
    refId: event.id.toString(),
    lines,
    actorId,
    requestId,
    branchId: event.workOrder.branchId,
  });
}

/** โพสต์ pawn_event ล่าสุดของสัญญานี้ — ใช้หลังเรียก pawn.service.ts ที่ commit ไปแล้ว (ไม่ต้องรู้ event id) */
export async function postLatestPawnEvent(
  db: Db,
  contractId: string,
  actorId: string,
  requestId?: string | null,
) {
  const event = await db.pawnEvent.findFirstOrThrow({
    where: { contractId },
    orderBy: { id: "desc" },
  });
  return postPawnEvent(db, event.id, actorId, requestId);
}

/** โพสต์ savings_transaction ล่าสุดของบัญชีนี้ — ใช้หลังเรียก savings.service.ts ที่ commit ไปแล้ว */
export async function postLatestSavingsTransaction(
  db: Db,
  accountId: string,
  actorId: string,
  requestId?: string | null,
) {
  const tx = await db.savingsTransaction.findFirstOrThrow({
    where: { accountId },
    orderBy: { id: "desc" },
  });
  return postSavingsTransaction(db, tx.id, actorId, requestId);
}

/** โพสต์ work_order_event ล่าสุดของใบสั่งงานนี้ — ใช้หลังเรียก work-order.service.ts ที่ commit ไปแล้ว */
export async function postLatestWorkOrderEvent(
  db: Db,
  workOrderId: string,
  actorId: string,
  requestId?: string | null,
) {
  const event = await db.workOrderEvent.findFirstOrThrow({
    where: { workOrderId },
    orderBy: { id: "desc" },
  });
  return postWorkOrderEvent(db, event.id, actorId, requestId);
}

/**
 * เรียกโพสต์บัญชีแบบไม่บล็อกธุรกรรมหลัก — ถ้าโพสต์ล้มเหลว (เช่น ตั้งค่าผังบัญชีผิด)
 * ธุรกรรมทางธุรกิจที่สำเร็จไปแล้ว (ขาย/ขายฝาก/ออมทอง/งานช่าง) จะไม่ถูกยกเลิกตามไปด้วย
 * เพราะบิลได้ commit ไปแล้วจริง — รายการที่ยังไม่ถูกโพสต์จะถูกจับได้โดย backfillJournalEntries ภายหลัง
 */
export async function postSafely(
  fn: () => Promise<unknown>,
  context: Record<string, unknown>,
): Promise<void> {
  try {
    await fn();
  } catch (err) {
    logger.error(
      { err, ...context },
      "accounting.post_failed — ธุรกรรมหลักสำเร็จแล้ว แต่โพสต์บัญชีไม่สำเร็จ จะถูกจับโดย backfill ภายหลัง",
    );
  }
}
