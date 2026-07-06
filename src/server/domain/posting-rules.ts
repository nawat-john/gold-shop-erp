// Posting Rules — สูตรแปลงเหตุการณ์ทางธุรกิจ (Phase 4-6) เป็นบรรทัดบัญชีคู่ (double-entry)
// กติกา: ทุกฟังก์ชันต้องคืนบรรทัดที่ debit รวม = credit รวมเสมอ (พิสูจน์ด้วย golden test ทุกเคส)
// เงิน = BIGINT สตางค์ เท่านั้น ห้าม float
//
// นโยบายบัญชีที่ทำให้ง่ายลงโดยเจตนา (ควรให้นักบัญชีทบทวนก่อนใช้งานจริง):
// - COGS/ตัดสต๊อกคำนวณเฉพาะสินค้า SERIALIZED ที่มี itemId (มี costSatang ตรงตัว)
//   สินค้า COUNTED ไม่มีการตัดต้นทุนอัตโนมัติ (ต้องใช้ weighted-average costing ซึ่งยังไม่ทำ)
// - ค่าคอมมิชชั่นจากบัตรเครดิต/เงินโอน gross เต็มจำนวนก่อนหักค่าธรรมเนียม แยกเป็นบรรทัดค่าธรรมเนียมต่างหาก
// - บัญชีออมทอง: มูลค่าหนี้สินคำนวณจากยอดเงินสดที่รับฝากสะสม (ไม่ mark-to-market ตามราคาตลาด)
//   ปิดบัญชีรับทองจึงรับรู้รายได้เท่ากับยอดฝากสะสม (ไม่ใช่มูลค่าตลาด ณ วันปิด) — ส่วนต่างเกิดเฉพาะตอนคืนเงินสด
//   (ปิดบัญชี/ผิดนัด) ซึ่งจะลงบัญชีกำไร/ขาดทุนส่วนต่างราคาให้อัตโนมัติ
// - งานช่างสั่งทำ (CUSTOM_ORDER) ยังไม่มีฟิลด์ราคาขายสุดท้ายในระบบ จึงลงบัญชีได้แค่เงินมัดจำตอนรับงาน/ยกเลิก
//   ไม่มีการรับรู้รายได้ตอนส่งมอบ (ต้องออกบิลขายแยกต่างหากในโมดูล POS เมื่อรู้ราคาสุดท้าย)
import { ACCOUNT_CODES, type AccountCode } from "./chart-of-accounts";

export interface PostingLine {
  accountCode: AccountCode;
  debitSatang: bigint;
  creditSatang: bigint;
  memo?: string;
}

function dr(
  accountCode: AccountCode,
  amountSatang: bigint,
  memo?: string,
): PostingLine {
  return { accountCode, debitSatang: amountSatang, creditSatang: 0n, memo };
}

function cr(
  accountCode: AccountCode,
  amountSatang: bigint,
  memo?: string,
): PostingLine {
  return { accountCode, debitSatang: 0n, creditSatang: amountSatang, memo };
}

/** สลับด้าน debit/credit — ใช้ทำรายการกลับรายการ (void/reversal) จากบรรทัดเดิมเป๊ะๆ */
export function reversePostingLine<
  T extends { debitSatang: bigint; creditSatang: bigint },
>(line: T): T {
  return {
    ...line,
    debitSatang: line.creditSatang,
    creditSatang: line.debitSatang,
  };
}

// ───────────────────────── Phase 4: POS (Sales / Purchase / Trade-In) ─────────────────────────

export interface PaymentLineInput {
  /** บัญชีเงินสด/ธนาคาร ที่ mapping จาก payment method แล้ว (CASH->cash, TRANSFER/CREDIT_CARD->bank) */
  accountCode: AccountCode;
  amountSatang: bigint;
  feeSatang?: bigint;
}

export interface SalesOrderPostingInput {
  paymentLines: PaymentLineInput[];
  goldRevenueSatang: bigint;
  netLaborRevenueSatang: bigint;
  vatSatang: bigint;
  /** ต้นทุนขายเฉพาะชิ้น SERIALIZED ที่มีต้นทุนตรงตัว (0 ถ้าไม่มี) */
  cogsSatang: bigint;
}

export function buildSalesOrderPostingLines(
  input: SalesOrderPostingInput,
): PostingLine[] {
  const lines: PostingLine[] = [];
  for (const p of input.paymentLines) {
    const fee = p.feeSatang ?? 0n;
    const net = p.amountSatang - fee;
    if (net > 0n) lines.push(dr(p.accountCode, net, "รับชำระค่าสินค้า"));
    if (fee > 0n)
      lines.push(dr(ACCOUNT_CODES.cardProcessingFee, fee, "ค่าธรรมเนียมบัตร"));
  }
  if (input.goldRevenueSatang > 0n) {
    lines.push(cr(ACCOUNT_CODES.salesRevenueGold, input.goldRevenueSatang));
  }
  if (input.netLaborRevenueSatang > 0n) {
    lines.push(
      cr(ACCOUNT_CODES.salesRevenueLabor, input.netLaborRevenueSatang),
    );
  }
  if (input.vatSatang > 0n) {
    lines.push(cr(ACCOUNT_CODES.vatPayable, input.vatSatang));
  }
  if (input.cogsSatang > 0n) {
    lines.push(dr(ACCOUNT_CODES.cogsGold, input.cogsSatang));
    lines.push(cr(ACCOUNT_CODES.inventoryGold, input.cogsSatang));
  }
  return lines;
}

export interface PurchaseOrderPostingInput {
  paymentLines: PaymentLineInput[];
  totalCostSatang: bigint;
}

export function buildPurchaseOrderPostingLines(
  input: PurchaseOrderPostingInput,
): PostingLine[] {
  const lines: PostingLine[] = [];
  if (input.totalCostSatang > 0n) {
    lines.push(dr(ACCOUNT_CODES.inventoryGold, input.totalCostSatang));
  }
  for (const p of input.paymentLines) {
    if (p.amountSatang > 0n) lines.push(cr(p.accountCode, p.amountSatang));
  }
  return lines;
}

export interface TradeInPostingInput {
  purchaseCostSatang: bigint;
  goldRevenueSatang: bigint;
  netLaborRevenueSatang: bigint;
  vatSatang: bigint;
  cogsSatang: bigint;
  /** + = ลูกค้าจ่ายเพิ่มให้ร้าน, - = ร้านจ่ายคืนลูกค้า */
  netAmountSatang: bigint;
  settlementAccountCode: AccountCode;
}

export function buildTradeInPostingLines(
  input: TradeInPostingInput,
): PostingLine[] {
  const lines: PostingLine[] = [];
  if (input.purchaseCostSatang > 0n) {
    lines.push(dr(ACCOUNT_CODES.inventoryGold, input.purchaseCostSatang));
  }
  if (input.goldRevenueSatang > 0n) {
    lines.push(cr(ACCOUNT_CODES.salesRevenueGold, input.goldRevenueSatang));
  }
  if (input.netLaborRevenueSatang > 0n) {
    lines.push(
      cr(ACCOUNT_CODES.salesRevenueLabor, input.netLaborRevenueSatang),
    );
  }
  if (input.vatSatang > 0n) {
    lines.push(cr(ACCOUNT_CODES.vatPayable, input.vatSatang));
  }
  if (input.cogsSatang > 0n) {
    lines.push(dr(ACCOUNT_CODES.cogsGold, input.cogsSatang));
    lines.push(cr(ACCOUNT_CODES.inventoryGold, input.cogsSatang));
  }
  if (input.netAmountSatang > 0n) {
    lines.push(dr(input.settlementAccountCode, input.netAmountSatang));
  } else if (input.netAmountSatang < 0n) {
    lines.push(cr(input.settlementAccountCode, -input.netAmountSatang));
  }
  return lines;
}

// ───────────────────────── Phase 5: Pawn ─────────────────────────

export type PawnEventPostingType =
  | "OPEN"
  | "RENEW_INTEREST"
  | "REDEEM"
  | "FORFEIT"
  | "PRINCIPAL_INCREASE"
  | "PRINCIPAL_DECREASE"
  | "CANCEL";

export interface PawnEventPostingInput {
  eventType: PawnEventPostingType;
  principalBeforeSatang: bigint;
  principalAfterSatang: bigint;
  interestAmountSatang: bigint | null;
}

export function buildPawnEventPostingLines(
  input: PawnEventPostingInput,
): PostingLine[] {
  const lines: PostingLine[] = [];
  const interest = input.interestAmountSatang ?? 0n;

  switch (input.eventType) {
    case "OPEN":
      lines.push(
        dr(
          ACCOUNT_CODES.pawnLoansReceivable,
          input.principalAfterSatang,
          "เปิดสัญญาขายฝาก",
        ),
        cr(ACCOUNT_CODES.cash, input.principalAfterSatang),
      );
      break;
    case "CANCEL":
      lines.push(
        dr(
          ACCOUNT_CODES.cash,
          input.principalBeforeSatang,
          "ยกเลิกสัญญาขายฝาก",
        ),
        cr(ACCOUNT_CODES.pawnLoansReceivable, input.principalBeforeSatang),
      );
      break;
    case "RENEW_INTEREST":
      if (interest > 0n) {
        lines.push(
          dr(ACCOUNT_CODES.cash, interest, "รับชำระดอกเบี้ยขายฝาก"),
          cr(ACCOUNT_CODES.interestIncomePawn, interest),
        );
      }
      break;
    case "REDEEM":
      if (interest > 0n) {
        lines.push(cr(ACCOUNT_CODES.interestIncomePawn, interest));
      }
      lines.push(
        cr(ACCOUNT_CODES.pawnLoansReceivable, input.principalBeforeSatang),
        dr(
          ACCOUNT_CODES.cash,
          input.principalBeforeSatang + interest,
          "ไถ่ถอนขายฝาก",
        ),
      );
      break;
    case "FORFEIT":
      lines.push(
        dr(
          ACCOUNT_CODES.inventoryGold,
          input.principalBeforeSatang,
          "ทองหลุดขายฝาก",
        ),
        cr(ACCOUNT_CODES.pawnLoansReceivable, input.principalBeforeSatang),
      );
      break;
    case "PRINCIPAL_INCREASE": {
      if (interest > 0n) {
        lines.push(
          dr(ACCOUNT_CODES.cash, interest, "รับชำระดอกเบี้ยก่อนเพิ่มเงินต้น"),
          cr(ACCOUNT_CODES.interestIncomePawn, interest),
        );
      }
      const delta = input.principalAfterSatang - input.principalBeforeSatang;
      lines.push(
        dr(ACCOUNT_CODES.pawnLoansReceivable, delta, "เพิ่มเงินต้นขายฝาก"),
        cr(ACCOUNT_CODES.cash, delta),
      );
      break;
    }
    case "PRINCIPAL_DECREASE": {
      if (interest > 0n) {
        lines.push(
          dr(ACCOUNT_CODES.cash, interest, "รับชำระดอกเบี้ยก่อนลดเงินต้น"),
          cr(ACCOUNT_CODES.interestIncomePawn, interest),
        );
      }
      const delta = input.principalBeforeSatang - input.principalAfterSatang;
      lines.push(
        dr(ACCOUNT_CODES.cash, delta, "ลดเงินต้นขายฝาก"),
        cr(ACCOUNT_CODES.pawnLoansReceivable, delta),
      );
      break;
    }
  }
  return lines;
}

// ───────────────────────── Phase 6: Gold Savings ─────────────────────────

export type SavingsTxPostingType =
  "OPEN" | "DEPOSIT" | "CLOSE_GOLD" | "CLOSE_CASH" | "CLOSE_DEFAULTED";

export interface SavingsTxPostingInput {
  txType: SavingsTxPostingType;
  /** ยอดฝาก (DEPOSIT) หรือยอดคืนเงิน (CLOSE_CASH/CLOSE_DEFAULTED) */
  amountSatang: bigint | null;
  /** ยอดฝากสะสมทั้งหมดของบัญชีนี้ — ใช้เคลียร์หนี้สินตอนปิดบัญชี (CLOSE_*) */
  cumulativeDepositsSatang: bigint;
}

export function buildSavingsTxPostingLines(
  input: SavingsTxPostingInput,
): PostingLine[] {
  const lines: PostingLine[] = [];

  if (input.txType === "OPEN") {
    return lines; // เปิดบัญชียังไม่มีเงินเคลื่อนไหว
  }

  if (input.txType === "DEPOSIT") {
    const amount = input.amountSatang ?? 0n;
    if (amount > 0n) {
      lines.push(
        dr(ACCOUNT_CODES.cash, amount, "รับฝากออมทอง"),
        cr(ACCOUNT_CODES.customerDepositsSavings, amount),
      );
    }
    return lines;
  }

  if (input.txType === "CLOSE_GOLD") {
    const cumulative = input.cumulativeDepositsSatang;
    if (cumulative > 0n) {
      lines.push(
        dr(
          ACCOUNT_CODES.customerDepositsSavings,
          cumulative,
          "ปิดบัญชีออมทองรับทอง",
        ),
        cr(ACCOUNT_CODES.salesRevenueGold, cumulative),
      );
    }
    return lines;
  }

  // CLOSE_CASH / CLOSE_DEFAULTED — คืนเงินสด อาจต่างจากยอดฝากสะสมถ้าเป็นออมน้ำหนัก (ราคาทองเปลี่ยน)
  const refund = input.amountSatang ?? 0n;
  const cumulative = input.cumulativeDepositsSatang;
  const diff = refund - cumulative;

  if (cumulative > 0n) {
    lines.push(
      dr(
        ACCOUNT_CODES.customerDepositsSavings,
        cumulative,
        "ปิดบัญชีออมทองคืนเงิน",
      ),
    );
  }
  if (refund > 0n) {
    lines.push(cr(ACCOUNT_CODES.cash, refund));
  }
  if (diff > 0n) {
    lines.push(
      dr(ACCOUNT_CODES.savingsPriceLoss, diff, "ขาดทุนส่วนต่างราคาออมทอง"),
    );
  } else if (diff < 0n) {
    lines.push(
      cr(ACCOUNT_CODES.savingsPriceGain, -diff, "กำไรส่วนต่างราคาออมทอง"),
    );
  }
  return lines;
}

// ───────────────────────── Phase 6: Work Orders ─────────────────────────

export type WorkOrderPostingEvent = "RECEIVE" | "DELIVER_REPAIR" | "CANCEL";

export interface WorkOrderPostingInput {
  event: WorkOrderPostingEvent;
  depositSatang: bigint;
  /** เฉพาะ DELIVER_REPAIR */
  serviceFeeSatang?: bigint;
}

export function buildWorkOrderPostingLines(
  input: WorkOrderPostingInput,
): PostingLine[] {
  const lines: PostingLine[] = [];

  if (input.event === "RECEIVE") {
    if (input.depositSatang > 0n) {
      lines.push(
        dr(ACCOUNT_CODES.cash, input.depositSatang, "รับมัดจำงานช่าง"),
        cr(ACCOUNT_CODES.customerDepositsWorkOrders, input.depositSatang),
      );
    }
    return lines;
  }

  if (input.event === "CANCEL") {
    if (input.depositSatang > 0n) {
      lines.push(
        dr(
          ACCOUNT_CODES.customerDepositsWorkOrders,
          input.depositSatang,
          "คืนมัดจำงานช่าง",
        ),
        cr(ACCOUNT_CODES.cash, input.depositSatang),
      );
    }
    return lines;
  }

  // DELIVER_REPAIR
  const fee = input.serviceFeeSatang ?? 0n;
  const deposit = input.depositSatang;
  const remaining = fee - deposit;

  if (deposit > 0n) {
    lines.push(
      dr(ACCOUNT_CODES.customerDepositsWorkOrders, deposit, "ตัดมัดจำงานช่าง"),
    );
  }
  if (remaining > 0n) {
    lines.push(dr(ACCOUNT_CODES.cash, remaining, "รับชำระส่วนที่เหลือ"));
  } else if (remaining < 0n) {
    lines.push(cr(ACCOUNT_CODES.cash, -remaining, "คืนมัดจำส่วนเกิน"));
  }
  if (fee > 0n) {
    lines.push(cr(ACCOUNT_CODES.repairServiceIncome, fee));
  }
  return lines;
}

// ───────────────────────── Expense & Commission ─────────────────────────

export function buildExpensePostingLines(input: {
  expenseAccountCode: AccountCode;
  amountSatang: bigint;
  paymentAccountCode: AccountCode;
}): PostingLine[] {
  if (input.amountSatang <= 0n) return [];
  return [
    dr(input.expenseAccountCode, input.amountSatang),
    cr(input.paymentAccountCode, input.amountSatang),
  ];
}

export function buildCommissionPostingLines(
  amountSatang: bigint,
): PostingLine[] {
  if (amountSatang <= 0n) return [];
  return [
    dr(ACCOUNT_CODES.commissionExpense, amountSatang),
    cr(ACCOUNT_CODES.commissionPayable, amountSatang),
  ];
}
