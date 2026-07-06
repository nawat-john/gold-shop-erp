// Gold Savings Service — บัญชีออมทอง (ออมเงิน/ออมน้ำหนัก) (Phase 6)
// กติกา: ฝากด้วยราคาขายออก (ลูกค้าซื้อทอง), ปิดบัญชีคืนเงินด้วยราคารับซื้อคืน (ร้านซื้อทองคืน)
// savings_transactions เป็น ledger แบบ append-only เหมือน pawn_events/stock_movements
import type { Db } from "@/server/db";
import {
  SavingsAccountStatus,
  SavingsAccountType,
  SavingsTxType,
  type Prisma,
  type SavingsAccount,
} from "@/generated/prisma/client";
import {
  allocateDocumentNumber,
  buildSequenceKey,
  formatDocumentNumber,
} from "./document-number.service";
import { requireApproval } from "./approval.service";
import { writeAuditLog } from "./audit.service";
import { assertPeriodOpen } from "./accounting.service";
import {
  buildPriceSnapshot,
  getCurrentShopPrice,
} from "./price-snapshot.service";
import {
  convertCashToWeightMg,
  convertWeightToCashSatang,
} from "@/server/domain/savings";

/**
 * ล็อกแถวบัญชีระดับ Postgres (FOR UPDATE) ก่อนอ่าน/แก้ไข — กันฝาก/ปิดบัญชีชนกัน
 */
async function lockAccount(db: Db, accountId: string): Promise<SavingsAccount> {
  const rows = await db.$queryRaw<{ id: string }[]>`
    SELECT id FROM savings_accounts WHERE id = ${accountId} FOR UPDATE
  `;
  if (rows.length === 0) {
    throw new Error("ไม่พบบัญชีออมทองที่ระบุ");
  }
  return db.savingsAccount.findUniqueOrThrow({ where: { id: accountId } });
}

function assertActive(account: SavingsAccount): void {
  if (account.status !== SavingsAccountStatus.ACTIVE) {
    throw new Error(
      `บัญชีนี้ไม่ได้อยู่ในสถานะ ACTIVE (สถานะปัจจุบัน: ${account.status})`,
    );
  }
}

export interface OpenSavingsAccountParams {
  branchId: string;
  customerId?: string | null;
  accountType: SavingsAccountType;
  targetWeightMg?: bigint | null;
  actorId: string;
  requestId?: string | null;
}

/** เปิดบัญชีออมทองใหม่ */
export async function openAccount(
  db: Db,
  params: OpenSavingsAccountParams,
): Promise<SavingsAccount> {
  const {
    branchId,
    customerId,
    accountType,
    targetWeightMg,
    actorId,
    requestId,
  } = params;

  if (
    targetWeightMg !== undefined &&
    targetWeightMg !== null &&
    targetWeightMg <= 0n
  ) {
    throw new Error("เป้าหมายน้ำหนักทองต้องมากกว่า 0");
  }

  const now = new Date();
  await assertPeriodOpen(db, now);

  const branch = await db.branch.findUniqueOrThrow({ where: { id: branchId } });
  const yearBE = now.getFullYear() + 543;
  const seqKey = buildSequenceKey("SAV", branch.code, yearBE);
  const nextNum = await allocateDocumentNumber(db, seqKey);
  const docNo = formatDocumentNumber(seqKey, nextNum);

  const account = await db.savingsAccount.create({
    data: {
      docNo,
      branchId,
      customerId: customerId ?? null,
      accountType,
      status: SavingsAccountStatus.ACTIVE,
      targetWeightMg: targetWeightMg ?? null,
      createdBy: actorId,
    },
  });

  await db.savingsTransaction.create({
    data: {
      accountId: account.id,
      txType: SavingsTxType.OPEN,
      actorId,
      requestId,
    },
  });

  await writeAuditLog(db, {
    action: "savings.open",
    entityType: "savings_account",
    entityId: account.id,
    actorId,
    branchId,
    requestId,
    after: { docNo, accountType },
  });

  return account;
}

export interface DepositParams {
  accountId: string;
  amountSatang: bigint;
  actorId: string;
  requestId?: string | null;
  depositDate?: Date;
}

/**
 * ฝากเงินเข้าบัญชี — CASH_SAVINGS สะสมเป็นเงินสดตรงๆ, WEIGHT_SAVINGS แปลงเป็นน้ำหนักทองทันที
 * ด้วยราคาขายออก ณ เวลาฝาก (บันทึก price snapshot ไว้ตรวจสอบย้อนหลังได้)
 */
export async function deposit(db: Db, params: DepositParams) {
  const {
    accountId,
    amountSatang,
    actorId,
    requestId,
    depositDate = new Date(),
  } = params;
  if (amountSatang <= 0n) throw new Error("จำนวนเงินฝากต้องมากกว่า 0");
  await assertPeriodOpen(db, depositDate);

  const account = await lockAccount(db, accountId);
  assertActive(account);

  if (account.accountType === SavingsAccountType.CASH_SAVINGS) {
    await db.savingsTransaction.create({
      data: {
        accountId,
        txType: SavingsTxType.DEPOSIT,
        amountSatang,
        actorId,
        requestId,
        createdAt: depositDate,
      },
    });

    const updated = await db.savingsAccount.update({
      where: { id: accountId },
      data: { balanceSatang: { increment: amountSatang } },
    });

    await writeAuditLog(db, {
      action: "savings.deposit",
      entityType: "savings_account",
      entityId: accountId,
      actorId,
      requestId,
      after: { amountSatang: amountSatang.toString() },
    });

    return { account: updated, weightAddedMg: null as bigint | null };
  }

  // WEIGHT_SAVINGS: แปลงเป็นน้ำหนักทองทันทีด้วยราคาขายออก ณ เวลาฝาก
  const priceSnapshot = await buildPriceSnapshot(db, depositDate);
  const sellPrice = BigInt(priceSnapshot.ornamentSell);
  const weightAddedMg = convertCashToWeightMg(amountSatang, sellPrice);

  await db.savingsTransaction.create({
    data: {
      accountId,
      txType: SavingsTxType.DEPOSIT,
      amountSatang,
      weightMg: weightAddedMg,
      priceSnapshot: priceSnapshot as unknown as Prisma.InputJsonValue,
      actorId,
      requestId,
      createdAt: depositDate,
    },
  });

  const updated = await db.savingsAccount.update({
    where: { id: accountId },
    data: { balanceWeightMg: { increment: weightAddedMg } },
  });

  await writeAuditLog(db, {
    action: "savings.deposit",
    entityType: "savings_account",
    entityId: accountId,
    actorId,
    requestId,
    after: {
      amountSatang: amountSatang.toString(),
      weightAddedMg: weightAddedMg.toString(),
    },
  });

  return { account: updated, weightAddedMg };
}

export interface CloseForGoldParams {
  accountId: string;
  actorId: string;
  requestId?: string | null;
  closeDate?: Date;
}

/** ปิดบัญชีรับทอง — ครบเป้า/ลูกค้าขอรับทอง (ครบตามแผนออมทอง) */
export async function closeForGold(db: Db, params: CloseForGoldParams) {
  const { accountId, actorId, requestId, closeDate = new Date() } = params;
  await assertPeriodOpen(db, closeDate);
  const account = await lockAccount(db, accountId);
  assertActive(account);

  const priceSnapshot = await buildPriceSnapshot(db, closeDate);
  const sellPrice = BigInt(priceSnapshot.ornamentSell);

  const entitledWeightMg =
    account.accountType === SavingsAccountType.WEIGHT_SAVINGS
      ? account.balanceWeightMg
      : convertCashToWeightMg(account.balanceSatang, sellPrice);

  await db.savingsTransaction.create({
    data: {
      accountId,
      txType: SavingsTxType.CLOSE_GOLD,
      weightMg: entitledWeightMg,
      priceSnapshot: priceSnapshot as unknown as Prisma.InputJsonValue,
      actorId,
      requestId,
      createdAt: closeDate,
    },
  });

  const updated = await db.savingsAccount.update({
    where: { id: accountId },
    data: {
      status: SavingsAccountStatus.CLOSED_GOLD,
      closedAt: closeDate,
      closedById: actorId,
    },
  });

  await writeAuditLog(db, {
    action: "savings.close_gold",
    entityType: "savings_account",
    entityId: accountId,
    actorId,
    requestId,
    after: { entitledWeightMg: entitledWeightMg.toString() },
  });

  return { account: updated, entitledWeightMg };
}

export interface CloseForCashParams {
  accountId: string;
  actorId: string;
  requestId?: string | null;
  closeDate?: Date;
}

/** ปิดบัญชีรับเงินคืน — ลูกค้ายกเลิกกลางคัน (ไม่มีค่าปรับ) */
export async function closeForCash(db: Db, params: CloseForCashParams) {
  const { accountId, actorId, requestId, closeDate = new Date() } = params;
  await assertPeriodOpen(db, closeDate);
  const account = await lockAccount(db, accountId);
  assertActive(account);

  const { refundSatang, priceSnapshotJson } = await computeCashRefund(
    db,
    account,
    closeDate,
  );

  await db.savingsTransaction.create({
    data: {
      accountId,
      txType: SavingsTxType.CLOSE_CASH,
      amountSatang: refundSatang,
      priceSnapshot: priceSnapshotJson,
      actorId,
      requestId,
      createdAt: closeDate,
    },
  });

  const updated = await db.savingsAccount.update({
    where: { id: accountId },
    data: {
      status: SavingsAccountStatus.CLOSED_CASH,
      closedAt: closeDate,
      closedById: actorId,
    },
  });

  await writeAuditLog(db, {
    action: "savings.close_cash",
    entityType: "savings_account",
    entityId: accountId,
    actorId,
    requestId,
    after: { refundSatang: refundSatang.toString() },
  });

  return { account: updated, refundSatang };
}

export interface CloseDefaultedParams {
  accountId: string;
  approverUsername: string;
  pin: string;
  reason: string;
  actorId: string;
  requestId?: string | null;
  closeDate?: Date;
}

/** ปิดบัญชีเพราะลูกค้าผิดนัดไม่ฝากตามกำหนดต่อเนื่อง — ต้องมี PIN อนุมัติ (Maker-Checker) */
export async function closeDefaulted(db: Db, params: CloseDefaultedParams) {
  const {
    accountId,
    approverUsername,
    pin,
    reason,
    actorId,
    requestId,
    closeDate = new Date(),
  } = params;
  if (!reason.trim()) throw new Error("กรุณาระบุเหตุผลการปิดบัญชีกรณีผิดนัด");
  await assertPeriodOpen(db, closeDate);

  const account = await lockAccount(db, accountId);
  assertActive(account);

  const approval = await requireApproval(db, {
    approverUsername,
    pin,
    permission: "savings.cancel",
    branchId: account.branchId,
    actorId,
    action: `savings.close_defaulted:${accountId}`,
    requireDifferentApprover: true,
    requestId,
  });
  if (!approval.ok) {
    throw new Error(`ปิดบัญชีกรณีผิดนัดด้วย PIN ล้มเหลว: ${approval.reason}`);
  }

  const { refundSatang, priceSnapshotJson } = await computeCashRefund(
    db,
    account,
    closeDate,
  );

  await db.savingsTransaction.create({
    data: {
      accountId,
      txType: SavingsTxType.CLOSE_DEFAULTED,
      amountSatang: refundSatang,
      priceSnapshot: priceSnapshotJson,
      actorId,
      requestId,
      note: reason,
      createdAt: closeDate,
    },
  });

  const updated = await db.savingsAccount.update({
    where: { id: accountId },
    data: {
      status: SavingsAccountStatus.CLOSED_DEFAULTED,
      closedAt: closeDate,
      closedById: actorId,
    },
  });

  await writeAuditLog(db, {
    action: "savings.close_defaulted",
    entityType: "savings_account",
    entityId: accountId,
    actorId,
    requestId,
    after: {
      refundSatang: refundSatang.toString(),
      reason,
      approverId: approval.approverId,
    },
  });

  return { account: updated, refundSatang };
}

/** คำนวณยอดเงินคืนตอนปิดบัญชี (ใช้ร่วมกันทั้งยกเลิกปกติและผิดนัด) */
async function computeCashRefund(
  db: Db,
  account: SavingsAccount,
  closeDate: Date,
): Promise<{
  refundSatang: bigint;
  priceSnapshotJson: Prisma.InputJsonValue | undefined;
}> {
  if (account.accountType === SavingsAccountType.CASH_SAVINGS) {
    return {
      refundSatang: account.balanceSatang,
      priceSnapshotJson: undefined,
    };
  }

  const priceSnapshot = await buildPriceSnapshot(db, closeDate);
  const buyPrice = BigInt(priceSnapshot.ornamentBuy);
  const refundSatang = convertWeightToCashSatang(
    account.balanceWeightMg,
    buyPrice,
  );
  return {
    refundSatang,
    priceSnapshotJson: priceSnapshot as unknown as Prisma.InputJsonValue,
  };
}

/** รายการเดินบัญชี (statement) เรียงล่าสุดก่อน */
export async function getStatement(db: Db, accountId: string) {
  return db.savingsTransaction.findMany({
    where: { accountId },
    orderBy: { createdAt: "desc" },
  });
}

export interface SavingsLiabilityReport {
  cashSavingsTotalSatang: bigint;
  cashSavingsAccountCount: number;
  weightSavingsTotalWeightMg: bigint;
  weightSavingsAccountCount: number;
  /** มูลค่าภาระผูกพันของบัญชีออมน้ำหนัก ถ้าลูกค้ามารับทองวันนี้ (ราคาขายออกปัจจุบัน) */
  weightSavingsEstimatedLiabilitySatang: bigint;
  totalEstimatedLiabilitySatang: bigint;
  priceAnnouncedAt: Date | null;
  feedStale: boolean;
}

/** รายงานภาระผูกพัน (Liability Report) — ยอดที่ร้านติดค้างลูกค้าจากบัญชีออมทองที่ยัง ACTIVE ทั้งหมด */
export async function getLiabilityReport(
  db: Db,
  branchId?: string,
): Promise<SavingsLiabilityReport> {
  const priceResult = await getCurrentShopPrice(db);
  const ornamentSell = priceResult?.announcement.ornamentSell ?? 0n;

  const activeAccounts = await db.savingsAccount.findMany({
    where: {
      status: SavingsAccountStatus.ACTIVE,
      ...(branchId ? { branchId } : {}),
    },
  });

  let cashSavingsTotalSatang = 0n;
  let cashSavingsAccountCount = 0;
  let weightSavingsTotalWeightMg = 0n;
  let weightSavingsAccountCount = 0;

  for (const acc of activeAccounts) {
    if (acc.accountType === SavingsAccountType.CASH_SAVINGS) {
      cashSavingsTotalSatang += acc.balanceSatang;
      cashSavingsAccountCount += 1;
    } else {
      weightSavingsTotalWeightMg += acc.balanceWeightMg;
      weightSavingsAccountCount += 1;
    }
  }

  const weightSavingsEstimatedLiabilitySatang =
    ornamentSell > 0n
      ? convertWeightToCashSatang(weightSavingsTotalWeightMg, ornamentSell)
      : 0n;

  return {
    cashSavingsTotalSatang,
    cashSavingsAccountCount,
    weightSavingsTotalWeightMg,
    weightSavingsAccountCount,
    weightSavingsEstimatedLiabilitySatang,
    totalEstimatedLiabilitySatang:
      cashSavingsTotalSatang + weightSavingsEstimatedLiabilitySatang,
    priceAnnouncedAt: priceResult?.announcement.announcedAt ?? null,
    feedStale: priceResult?.feedStale ?? true,
  };
}
