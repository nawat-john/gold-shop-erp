// Expense Service — บันทึกค่าใช้จ่ายของร้าน (Phase 7)
// กติกา: ค่าใช้จ่ายจ่ายเป็นเงินสด/ธนาคารทันที ไม่มีเจ้าหนี้ค้างจ่าย (บันทึกง่ายสำหรับร้านขนาดเล็ก)
import type { Db } from "@/server/db";
import {
  allocateDocumentNumber,
  buildSequenceKey,
  formatDocumentNumber,
} from "./document-number.service";
import { writeAuditLog } from "./audit.service";
import { postJournalEntry } from "./accounting.service";
import { buildExpensePostingLines } from "@/server/domain/posting-rules";
import {
  ACCOUNT_CODES,
  type AccountCode,
} from "@/server/domain/chart-of-accounts";

export interface RecordExpenseParams {
  branchId: string;
  /** บัญชีค่าใช้จ่ายที่จะ debit เช่น ACCOUNT_CODES.generalExpenses */
  expenseAccountCode: AccountCode;
  amountSatang: bigint;
  description: string;
  expenseDate: Date;
  /** จ่ายจากเงินสดหรือธนาคาร (default เงินสด) */
  paymentAccountCode?: AccountCode;
  actorId: string;
  requestId?: string | null;
}

/** บันทึกค่าใช้จ่าย — โพสต์บัญชีทันที Dr บัญชีค่าใช้จ่าย / Cr เงินสด-ธนาคาร */
export async function recordExpense(db: Db, params: RecordExpenseParams) {
  const {
    branchId,
    expenseAccountCode,
    amountSatang,
    description,
    expenseDate,
    paymentAccountCode = ACCOUNT_CODES.cash,
    actorId,
    requestId,
  } = params;

  if (amountSatang <= 0n) throw new Error("จำนวนเงินค่าใช้จ่ายต้องมากกว่า 0");
  if (!description.trim()) throw new Error("กรุณาระบุรายละเอียดค่าใช้จ่าย");

  const branch = await db.branch.findUniqueOrThrow({ where: { id: branchId } });
  const account = await db.account.findUniqueOrThrow({
    where: { code: expenseAccountCode },
  });
  const yearBE = expenseDate.getFullYear() + 543;
  const seqKey = buildSequenceKey("EXP", branch.code, yearBE);
  const nextNum = await allocateDocumentNumber(db, seqKey);
  const docNo = formatDocumentNumber(seqKey, nextNum);

  const expense = await db.expense.create({
    data: {
      docNo,
      branchId,
      accountId: account.id,
      amountSatang,
      description,
      expenseDate,
      createdBy: actorId,
    },
  });

  const lines = buildExpensePostingLines({
    expenseAccountCode,
    amountSatang,
    paymentAccountCode,
  });

  const entry = await postJournalEntry(db, {
    entryDate: expenseDate,
    description: `ค่าใช้จ่าย ${docNo}: ${description}`,
    refType: "expense",
    refId: expense.id,
    lines,
    actorId,
    requestId,
    branchId,
  });

  const finalExpense = entry
    ? await db.expense.update({
        where: { id: expense.id },
        data: { journalEntryId: entry.id },
      })
    : expense;

  await writeAuditLog(db, {
    action: "expense.record",
    entityType: "expense",
    entityId: expense.id,
    actorId,
    branchId,
    requestId,
    after: { docNo, amountSatang: amountSatang.toString(), expenseAccountCode },
  });

  return finalExpense;
}

/** รายงานค่าใช้จ่ายตามช่วงวันที่ */
export async function getExpenseReport(
  db: Db,
  params: { branchId?: string; fromDate: Date; toDate: Date },
) {
  const expenses = await db.expense.findMany({
    where: {
      ...(params.branchId ? { branchId: params.branchId } : {}),
      expenseDate: { gte: params.fromDate, lte: params.toDate },
    },
    include: { account: true, branch: true },
    orderBy: { expenseDate: "desc" },
  });

  const totalSatang = expenses.reduce((sum, e) => sum + e.amountSatang, 0n);
  return { expenses, totalSatang };
}
