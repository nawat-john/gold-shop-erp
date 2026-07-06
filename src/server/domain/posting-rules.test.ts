import { describe, expect, it } from "vitest";
import {
  buildSalesOrderPostingLines,
  buildPurchaseOrderPostingLines,
  buildTradeInPostingLines,
  buildPawnEventPostingLines,
  buildSavingsTxPostingLines,
  buildWorkOrderPostingLines,
  buildExpensePostingLines,
  buildCommissionPostingLines,
  reversePostingLine,
  type PostingLine,
} from "./posting-rules";
import { ACCOUNT_CODES } from "./chart-of-accounts";

/** ยืนยัน invariant หัวใจของบัญชีคู่: Σdebit = Σcredit เสมอ ทุก posting rule */
function assertBalanced(lines: PostingLine[]) {
  const totalDebit = lines.reduce((sum, l) => sum + l.debitSatang, 0n);
  const totalCredit = lines.reduce((sum, l) => sum + l.creditSatang, 0n);
  expect(totalDebit).toBe(totalCredit);
  // ทุกบรรทัดต้องเป็น debit หรือ credit อย่างใดอย่างหนึ่งเท่านั้น (ตรงกับ CHECK ระดับ DB)
  for (const l of lines) {
    const sides = [l.debitSatang > 0n, l.creditSatang > 0n].filter(
      Boolean,
    ).length;
    expect(sides).toBe(1);
  }
}

describe("Posting Rules — enumerate ทุกชนิดธุรกรรม ต้อง debit=credit เสมอ", () => {
  describe("Sales Order (Phase 4)", () => {
    it("ชำระเงินสดล้วน ไม่มีค่าธรรมเนียม ไม่มี COGS", () => {
      const lines = buildSalesOrderPostingLines({
        paymentLines: [
          { accountCode: ACCOUNT_CODES.cash, amountSatang: 4_167_000n },
        ],
        goldRevenueSatang: 4_060_000n,
        netLaborRevenueSatang: 100_000n,
        vatSatang: 7_000n,
        cogsSatang: 0n,
      });
      assertBalanced(lines);
      expect(lines).toContainEqual(
        expect.objectContaining({
          accountCode: ACCOUNT_CODES.cash,
          debitSatang: 4_167_000n,
        }),
      );
    });

    it("ชำระบัตรเครดิตมีค่าธรรมเนียม + มี COGS (สินค้า SERIALIZED)", () => {
      const lines = buildSalesOrderPostingLines({
        paymentLines: [
          {
            accountCode: ACCOUNT_CODES.bank,
            amountSatang: 4_167_000n,
            feeSatang: 50_000n,
          },
        ],
        goldRevenueSatang: 4_060_000n,
        netLaborRevenueSatang: 100_000n,
        vatSatang: 7_000n,
        cogsSatang: 3_800_000n,
      });
      assertBalanced(lines);
      expect(lines).toContainEqual(
        expect.objectContaining({
          accountCode: ACCOUNT_CODES.cardProcessingFee,
          debitSatang: 50_000n,
        }),
      );
    });

    it("ชำระผสมเงินสด+ธนาคาร", () => {
      const lines = buildSalesOrderPostingLines({
        paymentLines: [
          { accountCode: ACCOUNT_CODES.cash, amountSatang: 2_000_000n },
          { accountCode: ACCOUNT_CODES.bank, amountSatang: 2_167_000n },
        ],
        goldRevenueSatang: 4_060_000n,
        netLaborRevenueSatang: 100_000n,
        vatSatang: 7_000n,
        cogsSatang: 0n,
      });
      assertBalanced(lines);
    });
  });

  describe("Purchase Order / Buyback (Phase 4)", () => {
    it("รับซื้อทองคืนชำระเงินสด", () => {
      const lines = buildPurchaseOrderPostingLines({
        paymentLines: [
          { accountCode: ACCOUNT_CODES.cash, amountSatang: 3_920_000n },
        ],
        totalCostSatang: 3_920_000n,
      });
      assertBalanced(lines);
    });

    it("รับซื้อทองคืนหลายชิ้น จ่ายหลายช่องทาง", () => {
      const lines = buildPurchaseOrderPostingLines({
        paymentLines: [
          { accountCode: ACCOUNT_CODES.cash, amountSatang: 2_000_000n },
          { accountCode: ACCOUNT_CODES.bank, amountSatang: 1_920_000n },
        ],
        totalCostSatang: 3_920_000n,
      });
      assertBalanced(lines);
    });
  });

  describe("Trade-In (Phase 4)", () => {
    it("ลูกค้าจ่ายเพิ่ม (net เป็นบวก)", () => {
      const lines = buildTradeInPostingLines({
        purchaseCostSatang: 3_920_000n,
        goldRevenueSatang: 4_060_000n,
        netLaborRevenueSatang: 100_000n,
        vatSatang: 7_000n,
        cogsSatang: 0n,
        netAmountSatang: 247_000n,
        settlementAccountCode: ACCOUNT_CODES.cash,
      });
      assertBalanced(lines);
    });

    it("ร้านจ่ายคืนลูกค้า (net เป็นลบ)", () => {
      const lines = buildTradeInPostingLines({
        purchaseCostSatang: 5_000_000n,
        goldRevenueSatang: 4_060_000n,
        netLaborRevenueSatang: 100_000n,
        vatSatang: 7_000n,
        cogsSatang: 0n,
        netAmountSatang: -833_000n,
        settlementAccountCode: ACCOUNT_CODES.cash,
      });
      assertBalanced(lines);
    });

    it("net เท่ากับ 0 พอดี (ไม่มีการจ่ายส่วนต่าง)", () => {
      const lines = buildTradeInPostingLines({
        purchaseCostSatang: 4_167_000n,
        goldRevenueSatang: 4_060_000n,
        netLaborRevenueSatang: 100_000n,
        vatSatang: 7_000n,
        cogsSatang: 0n,
        netAmountSatang: 0n,
        settlementAccountCode: ACCOUNT_CODES.cash,
      });
      assertBalanced(lines);
    });

    it("มี COGS ร่วมด้วย (ขายสินค้า SERIALIZED ในบิลเดียวกัน)", () => {
      const lines = buildTradeInPostingLines({
        purchaseCostSatang: 3_920_000n,
        goldRevenueSatang: 4_060_000n,
        netLaborRevenueSatang: 100_000n,
        vatSatang: 7_000n,
        cogsSatang: 3_500_000n,
        netAmountSatang: 247_000n,
        settlementAccountCode: ACCOUNT_CODES.bank,
      });
      assertBalanced(lines);
    });
  });

  describe("Pawn Contract Events (Phase 5)", () => {
    it("OPEN — เปิดสัญญาจ่ายเงินต้นให้ลูกค้า", () => {
      const lines = buildPawnEventPostingLines({
        eventType: "OPEN",
        principalBeforeSatang: 0n,
        principalAfterSatang: 10_000_000n,
        interestAmountSatang: null,
      });
      assertBalanced(lines);
    });

    it("RENEW_INTEREST — มีดอกเบี้ย", () => {
      const lines = buildPawnEventPostingLines({
        eventType: "RENEW_INTEREST",
        principalBeforeSatang: 10_000_000n,
        principalAfterSatang: 10_000_000n,
        interestAmountSatang: 123_288n,
      });
      assertBalanced(lines);
    });

    it("RENEW_INTEREST — ต่อดอกวันเดียวกัน ดอกเบี้ย 0 -> ไม่มีบรรทัดใดๆ", () => {
      const lines = buildPawnEventPostingLines({
        eventType: "RENEW_INTEREST",
        principalBeforeSatang: 10_000_000n,
        principalAfterSatang: 10_000_000n,
        interestAmountSatang: 0n,
      });
      expect(lines).toEqual([]);
    });

    it("REDEEM — ไถ่ถอนพร้อมดอกเบี้ยค้าง", () => {
      const lines = buildPawnEventPostingLines({
        eventType: "REDEEM",
        principalBeforeSatang: 10_000_000n,
        principalAfterSatang: 0n,
        interestAmountSatang: 41_096n,
      });
      assertBalanced(lines);
    });

    it("REDEEM — ไถ่ถอนวันเดียวกัน ไม่มีดอกเบี้ย", () => {
      const lines = buildPawnEventPostingLines({
        eventType: "REDEEM",
        principalBeforeSatang: 10_000_000n,
        principalAfterSatang: 0n,
        interestAmountSatang: 0n,
      });
      assertBalanced(lines);
    });

    it("FORFEIT — ทองหลุดโอนเข้าสต๊อกด้วยเงินต้นค้าง", () => {
      const lines = buildPawnEventPostingLines({
        eventType: "FORFEIT",
        principalBeforeSatang: 20_000_000n,
        principalAfterSatang: 0n,
        interestAmountSatang: null,
      });
      assertBalanced(lines);
    });

    it("PRINCIPAL_INCREASE — เพิ่มเงินต้นพร้อมเคลียร์ดอกเบี้ยค้าง", () => {
      const lines = buildPawnEventPostingLines({
        eventType: "PRINCIPAL_INCREASE",
        principalBeforeSatang: 5_000_000n,
        principalAfterSatang: 6_000_000n,
        interestAmountSatang: 13_698n,
      });
      assertBalanced(lines);
    });

    it("PRINCIPAL_DECREASE — ลดเงินต้น ไม่มีดอกเบี้ยค้าง", () => {
      const lines = buildPawnEventPostingLines({
        eventType: "PRINCIPAL_DECREASE",
        principalBeforeSatang: 6_000_000n,
        principalAfterSatang: 5_000_000n,
        interestAmountSatang: 0n,
      });
      assertBalanced(lines);
    });

    it("CANCEL — ยกเลิกสัญญาคืนเงินต้น", () => {
      const lines = buildPawnEventPostingLines({
        eventType: "CANCEL",
        principalBeforeSatang: 1_000_000n,
        principalAfterSatang: 1_000_000n,
        interestAmountSatang: null,
      });
      assertBalanced(lines);
    });
  });

  describe("Gold Savings Transactions (Phase 6)", () => {
    it("OPEN — เปิดบัญชียังไม่มีเงินเคลื่อนไหว", () => {
      const lines = buildSavingsTxPostingLines({
        txType: "OPEN",
        amountSatang: null,
        cumulativeDepositsSatang: 0n,
      });
      expect(lines).toEqual([]);
    });

    it("DEPOSIT — รับฝาก", () => {
      const lines = buildSavingsTxPostingLines({
        txType: "DEPOSIT",
        amountSatang: 1_000_000n,
        cumulativeDepositsSatang: 0n,
      });
      assertBalanced(lines);
    });

    it("CLOSE_GOLD — ปิดบัญชีรับทอง รับรู้รายได้เท่ายอดฝากสะสม", () => {
      const lines = buildSavingsTxPostingLines({
        txType: "CLOSE_GOLD",
        amountSatang: null,
        cumulativeDepositsSatang: 4_060_000n,
      });
      assertBalanced(lines);
    });

    it("CLOSE_CASH — คืนเงินมากกว่ายอดฝาก (ขาดทุนส่วนต่างราคา)", () => {
      const lines = buildSavingsTxPostingLines({
        txType: "CLOSE_CASH",
        amountSatang: 1_100_000n,
        cumulativeDepositsSatang: 1_000_000n,
      });
      assertBalanced(lines);
      expect(lines).toContainEqual(
        expect.objectContaining({
          accountCode: ACCOUNT_CODES.savingsPriceLoss,
          debitSatang: 100_000n,
        }),
      );
    });

    it("CLOSE_CASH — คืนเงินน้อยกว่ายอดฝาก (กำไรส่วนต่างราคา)", () => {
      const lines = buildSavingsTxPostingLines({
        txType: "CLOSE_CASH",
        amountSatang: 900_000n,
        cumulativeDepositsSatang: 1_000_000n,
      });
      assertBalanced(lines);
      expect(lines).toContainEqual(
        expect.objectContaining({
          accountCode: ACCOUNT_CODES.savingsPriceGain,
          creditSatang: 100_000n,
        }),
      );
    });

    it("CLOSE_CASH — คืนเงินเท่ายอดฝากพอดี (ไม่มีกำไร/ขาดทุน)", () => {
      const lines = buildSavingsTxPostingLines({
        txType: "CLOSE_CASH",
        amountSatang: 1_000_000n,
        cumulativeDepositsSatang: 1_000_000n,
      });
      assertBalanced(lines);
      expect(
        lines.some(
          (l) =>
            l.accountCode === ACCOUNT_CODES.savingsPriceGain ||
            l.accountCode === ACCOUNT_CODES.savingsPriceLoss,
        ),
      ).toBe(false);
    });

    it("CLOSE_DEFAULTED — ปิดบัญชีผิดนัด", () => {
      const lines = buildSavingsTxPostingLines({
        txType: "CLOSE_DEFAULTED",
        amountSatang: 200_000n,
        cumulativeDepositsSatang: 200_000n,
      });
      assertBalanced(lines);
    });
  });

  describe("Work Orders (Phase 6)", () => {
    it("RECEIVE — รับงานพร้อมมัดจำ", () => {
      const lines = buildWorkOrderPostingLines({
        event: "RECEIVE",
        depositSatang: 500_000n,
      });
      assertBalanced(lines);
    });

    it("RECEIVE — รับงานไม่มีมัดจำ -> ไม่มีบรรทัด", () => {
      const lines = buildWorkOrderPostingLines({
        event: "RECEIVE",
        depositSatang: 0n,
      });
      expect(lines).toEqual([]);
    });

    it("CANCEL — คืนมัดจำ", () => {
      const lines = buildWorkOrderPostingLines({
        event: "CANCEL",
        depositSatang: 500_000n,
      });
      assertBalanced(lines);
    });

    it("DELIVER_REPAIR — ค่าบริการมากกว่ามัดจำ", () => {
      const lines = buildWorkOrderPostingLines({
        event: "DELIVER_REPAIR",
        depositSatang: 100_000n,
        serviceFeeSatang: 250_000n,
      });
      assertBalanced(lines);
    });

    it("DELIVER_REPAIR — มัดจำมากกว่าค่าบริการ (คืนส่วนเกิน)", () => {
      const lines = buildWorkOrderPostingLines({
        event: "DELIVER_REPAIR",
        depositSatang: 300_000n,
        serviceFeeSatang: 200_000n,
      });
      assertBalanced(lines);
    });

    it("DELIVER_REPAIR — มัดจำเท่าค่าบริการพอดี", () => {
      const lines = buildWorkOrderPostingLines({
        event: "DELIVER_REPAIR",
        depositSatang: 200_000n,
        serviceFeeSatang: 200_000n,
      });
      assertBalanced(lines);
    });
  });

  describe("Expense & Commission", () => {
    it("บันทึกค่าใช้จ่ายทั่วไป", () => {
      const lines = buildExpensePostingLines({
        expenseAccountCode: ACCOUNT_CODES.generalExpenses,
        amountSatang: 500_000n,
        paymentAccountCode: ACCOUNT_CODES.cash,
      });
      assertBalanced(lines);
    });

    it("จำนวนเงินค่าใช้จ่าย 0 -> ไม่มีบรรทัด", () => {
      const lines = buildExpensePostingLines({
        expenseAccountCode: ACCOUNT_CODES.generalExpenses,
        amountSatang: 0n,
        paymentAccountCode: ACCOUNT_CODES.cash,
      });
      expect(lines).toEqual([]);
    });

    it("ค่าคอมมิชชั่นพนักงาน", () => {
      const lines = buildCommissionPostingLines(50_000n);
      assertBalanced(lines);
    });
  });

  describe("reversePostingLine", () => {
    it("สลับด้าน debit/credit ถูกต้อง", () => {
      const original = {
        debitSatang: 1000n,
        creditSatang: 0n,
        accountCode: ACCOUNT_CODES.cash,
      };
      const reversed = reversePostingLine(original);
      expect(reversed.debitSatang).toBe(0n);
      expect(reversed.creditSatang).toBe(1000n);
    });
  });
});
