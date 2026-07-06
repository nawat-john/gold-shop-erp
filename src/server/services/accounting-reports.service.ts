// Accounting Reports Service — งบทดลอง, P&L, รายงาน VAT, สมุดเงินสด/ธนาคาร, ฐานะการเงินเบื้องต้น
// กติกา: อ่านอย่างเดียว (ไม่แก้ไขข้อมูล) — คำนวณจาก journal_lines ที่โพสต์แล้วเท่านั้น
import type { Db } from "@/server/db";
import { ACCOUNT_CODES } from "@/server/domain/chart-of-accounts";

export interface TrialBalanceRow {
  code: string;
  name: string;
  type: string;
  debitSatang: bigint;
  creditSatang: bigint;
  /** ยอดคงเหลือด้าน normal balance ของบัญชีนั้น (ASSET/EXPENSE=debit, อื่นๆ=credit) */
  balanceSatang: bigint;
}

export interface TrialBalanceReport {
  rows: TrialBalanceRow[];
  totalDebitSatang: bigint;
  totalCreditSatang: bigint;
  /** ต้องเท่ากันเสมอถ้าบัญชีคู่ถูกต้อง — ใช้เป็น invariant check รายวัน */
  isBalanced: boolean;
}

/** งบทดลอง — สรุปยอด debit/credit สะสมทุกบัญชี ณ วันที่กำหนด (หรือทั้งหมดถ้าไม่ระบุ) */
export async function getTrialBalance(
  db: Db,
  params: { asOfDate?: Date } = {},
): Promise<TrialBalanceReport> {
  const accounts = await db.account.findMany({ orderBy: { code: "asc" } });
  const lines = await db.journalLine.groupBy({
    by: ["accountId"],
    where: params.asOfDate
      ? { entry: { entryDate: { lte: params.asOfDate } } }
      : undefined,
    _sum: { debitSatang: true, creditSatang: true },
  });
  const sumsByAccountId = new Map(lines.map((l) => [l.accountId, l._sum]));

  let totalDebitSatang = 0n;
  let totalCreditSatang = 0n;

  const rows: TrialBalanceRow[] = accounts.map((acc) => {
    const sums = sumsByAccountId.get(acc.id);
    const debitSatang = sums?.debitSatang ?? 0n;
    const creditSatang = sums?.creditSatang ?? 0n;
    totalDebitSatang += debitSatang;
    totalCreditSatang += creditSatang;

    const isDebitNormal = acc.type === "ASSET" || acc.type === "EXPENSE";
    const balanceSatang = isDebitNormal
      ? debitSatang - creditSatang
      : creditSatang - debitSatang;

    return {
      code: acc.code,
      name: acc.name,
      type: acc.type,
      debitSatang,
      creditSatang,
      balanceSatang,
    };
  });

  return {
    rows,
    totalDebitSatang,
    totalCreditSatang,
    isBalanced: totalDebitSatang === totalCreditSatang,
  };
}

async function sumAccountCredit(
  db: Db,
  code: string,
  fromDate: Date,
  toDate: Date,
): Promise<bigint> {
  const account = await db.account.findUnique({ where: { code } });
  if (!account) return 0n;
  const agg = await db.journalLine.aggregate({
    where: {
      accountId: account.id,
      entry: { entryDate: { gte: fromDate, lte: toDate } },
    },
    _sum: { creditSatang: true },
  });
  return agg._sum.creditSatang ?? 0n;
}

async function sumAccountDebit(
  db: Db,
  code: string,
  fromDate: Date,
  toDate: Date,
): Promise<bigint> {
  const account = await db.account.findUnique({ where: { code } });
  if (!account) return 0n;
  const agg = await db.journalLine.aggregate({
    where: {
      accountId: account.id,
      entry: { entryDate: { gte: fromDate, lte: toDate } },
    },
    _sum: { debitSatang: true },
  });
  return agg._sum.debitSatang ?? 0n;
}

export interface ProfitAndLossReport {
  fromDate: Date;
  toDate: Date;
  goldRevenueSatang: bigint;
  cogsGoldSatang: bigint;
  goldProfitSatang: bigint;
  laborRevenueSatang: bigint;
  interestIncomeSatang: bigint;
  repairIncomeSatang: bigint;
  savingsPriceGainSatang: bigint;
  savingsPriceLossSatang: bigint;
  generalExpensesSatang: bigint;
  commissionExpenseSatang: bigint;
  cardFeeSatang: bigint;
  totalRevenueSatang: bigint;
  totalExpenseSatang: bigint;
  netProfitSatang: bigint;
}

/** งบกำไรขาดทุน แยกกำไรเนื้อทอง/ค่ากำเหน็จ/ดอกเบี้ย ตามช่วงวันที่ */
export async function getProfitAndLoss(
  db: Db,
  fromDate: Date,
  toDate: Date,
): Promise<ProfitAndLossReport> {
  const [
    goldRevenueSatang,
    cogsGoldSatang,
    laborRevenueSatang,
    interestIncomeSatang,
    repairIncomeSatang,
    savingsPriceGainSatang,
    savingsPriceLossSatang,
    generalExpensesSatang,
    commissionExpenseSatang,
    cardFeeSatang,
  ] = await Promise.all([
    sumAccountCredit(db, ACCOUNT_CODES.salesRevenueGold, fromDate, toDate),
    sumAccountDebit(db, ACCOUNT_CODES.cogsGold, fromDate, toDate),
    sumAccountCredit(db, ACCOUNT_CODES.salesRevenueLabor, fromDate, toDate),
    sumAccountCredit(db, ACCOUNT_CODES.interestIncomePawn, fromDate, toDate),
    sumAccountCredit(db, ACCOUNT_CODES.repairServiceIncome, fromDate, toDate),
    sumAccountCredit(db, ACCOUNT_CODES.savingsPriceGain, fromDate, toDate),
    sumAccountDebit(db, ACCOUNT_CODES.savingsPriceLoss, fromDate, toDate),
    sumAccountDebit(db, ACCOUNT_CODES.generalExpenses, fromDate, toDate),
    sumAccountDebit(db, ACCOUNT_CODES.commissionExpense, fromDate, toDate),
    sumAccountDebit(db, ACCOUNT_CODES.cardProcessingFee, fromDate, toDate),
  ]);

  const goldProfitSatang = goldRevenueSatang - cogsGoldSatang;
  const totalRevenueSatang =
    goldRevenueSatang +
    laborRevenueSatang +
    interestIncomeSatang +
    repairIncomeSatang +
    savingsPriceGainSatang;
  const totalExpenseSatang =
    cogsGoldSatang +
    savingsPriceLossSatang +
    generalExpensesSatang +
    commissionExpenseSatang +
    cardFeeSatang;

  return {
    fromDate,
    toDate,
    goldRevenueSatang,
    cogsGoldSatang,
    goldProfitSatang,
    laborRevenueSatang,
    interestIncomeSatang,
    repairIncomeSatang,
    savingsPriceGainSatang,
    savingsPriceLossSatang,
    generalExpensesSatang,
    commissionExpenseSatang,
    cardFeeSatang,
    totalRevenueSatang,
    totalExpenseSatang,
    netProfitSatang: totalRevenueSatang - totalExpenseSatang,
  };
}

export interface VatReport {
  fromDate: Date;
  toDate: Date;
  /** ภาษีขาย (Output VAT) จากค่ากำเหน็จ — ทองคำแท้ได้รับยกเว้น VAT */
  outputVatSatang: bigint;
  /** ภาษีซื้อ (Input VAT) — ระบบยังไม่ track ภาษีซื้อจากซัพพลายเออร์ (ข้อจำกัดที่ทราบ) */
  inputVatSatang: bigint;
  netVatPayableSatang: bigint;
}

/** รายงาน VAT สรุปสำหรับยื่น ภ.พ.30 — คำนวณจากบัญชีภาษีขายค้างจ่าย */
export async function getVatReport(
  db: Db,
  fromDate: Date,
  toDate: Date,
): Promise<VatReport> {
  const outputVatSatang = await sumAccountCredit(
    db,
    ACCOUNT_CODES.vatPayable,
    fromDate,
    toDate,
  );
  const inputVatSatang = 0n;

  return {
    fromDate,
    toDate,
    outputVatSatang,
    inputVatSatang,
    netVatPayableSatang: outputVatSatang - inputVatSatang,
  };
}

export interface CashBankLedgerRow {
  entryDate: Date;
  entryNo: string;
  description: string;
  debitSatang: bigint;
  creditSatang: bigint;
  runningBalanceSatang: bigint;
}

/** สมุดเงินสด/ธนาคาร — รายการเดินบัญชีพร้อมยอดคงเหลือสะสม (running balance) */
export async function getCashBankLedger(
  db: Db,
  accountCode: string,
  fromDate: Date,
  toDate: Date,
): Promise<CashBankLedgerRow[]> {
  const account = await db.account.findUnique({ where: { code: accountCode } });
  if (!account) return [];

  const lines = await db.journalLine.findMany({
    where: {
      accountId: account.id,
      entry: { entryDate: { gte: fromDate, lte: toDate } },
    },
    include: { entry: true },
    orderBy: [{ entry: { entryDate: "asc" } }, { id: "asc" }],
  });

  let runningBalanceSatang = 0n;
  return lines.map((line) => {
    runningBalanceSatang += line.debitSatang - line.creditSatang;
    return {
      entryDate: line.entry.entryDate,
      entryNo: line.entry.entryNo,
      description: line.entry.description,
      debitSatang: line.debitSatang,
      creditSatang: line.creditSatang,
      runningBalanceSatang,
    };
  });
}

export interface CashBankReconciliation {
  accountCode: string;
  ledgerBalanceSatang: bigint;
  actualCountedSatang: bigint;
  differenceSatang: bigint;
}

/**
 * กระทบยอดเงินสด/ธนาคาร — เทียบยอดตามบัญชีกับยอดนับจริง ณ วันที่กำหนด
 * (รายงานเปรียบเทียบเท่านั้น ไม่มีการนำเข้ารายการเดินบัญชีธนาคารจริงในเฟสนี้)
 */
export async function reconcileCashBank(
  db: Db,
  params: { accountCode: string; asOfDate: Date; actualCountedSatang: bigint },
): Promise<CashBankReconciliation> {
  const account = await db.account.findUnique({
    where: { code: params.accountCode },
  });
  if (!account) {
    return {
      accountCode: params.accountCode,
      ledgerBalanceSatang: 0n,
      actualCountedSatang: params.actualCountedSatang,
      differenceSatang: params.actualCountedSatang,
    };
  }

  const agg = await db.journalLine.aggregate({
    where: {
      accountId: account.id,
      entry: { entryDate: { lte: params.asOfDate } },
    },
    _sum: { debitSatang: true, creditSatang: true },
  });
  const ledgerBalanceSatang =
    (agg._sum.debitSatang ?? 0n) - (agg._sum.creditSatang ?? 0n);

  return {
    accountCode: params.accountCode,
    ledgerBalanceSatang,
    actualCountedSatang: params.actualCountedSatang,
    differenceSatang: params.actualCountedSatang - ledgerBalanceSatang,
  };
}

export interface BalanceSheetSummary {
  asOfDate: Date;
  totalAssetsSatang: bigint;
  totalLiabilitiesSatang: bigint;
  totalEquitySatang: bigint;
  assetRows: TrialBalanceRow[];
  liabilityRows: TrialBalanceRow[];
  equityRows: TrialBalanceRow[];
}

/** ฐานะการเงินเบื้องต้น (Balance Sheet เบื้องต้น) — จัดกลุ่มยอดคงเหลือตามประเภทบัญชี ณ วันที่กำหนด */
export async function getBalanceSheetSummary(
  db: Db,
  asOfDate: Date,
): Promise<BalanceSheetSummary> {
  const trialBalance = await getTrialBalance(db, { asOfDate });

  const assetRows = trialBalance.rows.filter((r) => r.type === "ASSET");
  const liabilityRows = trialBalance.rows.filter((r) => r.type === "LIABILITY");
  const equityRows = trialBalance.rows.filter((r) => r.type === "EQUITY");

  return {
    asOfDate,
    totalAssetsSatang: assetRows.reduce((s, r) => s + r.balanceSatang, 0n),
    totalLiabilitiesSatang: liabilityRows.reduce(
      (s, r) => s + r.balanceSatang,
      0n,
    ),
    totalEquitySatang: equityRows.reduce((s, r) => s + r.balanceSatang, 0n),
    assetRows,
    liabilityRows,
    equityRows,
  };
}
