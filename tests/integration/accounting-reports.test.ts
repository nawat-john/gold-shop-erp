// Integration Test: รายงานบัญชี — งบทดลอง, P&L, VAT, สมุดเงินสด/ธนาคาร, ฐานะการเงินเบื้องต้น (Phase 7)
// รันด้วย: pnpm test:integration tests/integration/accounting-reports.test.ts
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";
import { PaymentMethod, ProductTracking } from "@/generated/prisma/client";
import {
  getTrialBalance,
  getProfitAndLoss,
  getVatReport,
  getCashBankLedger,
  reconcileCashBank,
  getBalanceSheetSummary,
} from "@/server/services/accounting-reports.service";
import {
  postSalesOrder,
  postPurchaseOrder,
} from "@/server/services/accounting.service";
import { openShift } from "@/server/services/shift.service";
import {
  createSalesOrder,
  createPurchaseOrder,
} from "@/server/services/pos.service";
import { seedRbac } from "@/server/services/rbac-seed";
import { seedChartOfAccounts } from "@/server/services/accounting-seed";
import { ACCOUNT_CODES } from "@/server/domain/chart-of-accounts";

let db: TestDb;
let branchId: string;
let drawerId: string;
let shiftId: string;
let cashierId: string;

beforeAll(async () => {
  db = await startTestDb();
  await seedRbac(db.prisma);
  await seedChartOfAccounts(db.prisma);

  const branch = await db.prisma.branch.create({
    data: { code: "RPT01", name: "สาขาทดสอบรายงานบัญชี" },
  });
  branchId = branch.id;

  const drawer = await db.prisma.cashDrawer.create({
    data: { branchId, code: "DRAWER-RPT", name: "ลิ้นชักทดสอบรายงาน" },
  });
  drawerId = drawer.id;

  const cashier = await db.prisma.user.create({
    data: {
      username: "rpt-cashier",
      passwordHash: "$argon2id$dummy",
      displayName: "พนักงานทดสอบรายงาน",
    },
  });
  cashierId = cashier.id;

  await db.prisma.shopPriceAnnouncement.create({
    data: {
      barBuy: 4_000_000n,
      barSell: 4_010_000n,
      ornamentBuy: 3_920_000n,
      ornamentSell: 4_060_000n,
      announcedBy: cashierId,
    },
  });

  const shift = await openShift(db.prisma, {
    branchId,
    drawerId,
    openedById: cashierId,
    startCashSatang: 1_000_000n,
  });
  shiftId = shift.id;
}, 180_000);

afterAll(async () => {
  await stopTestDb(db);
});

describe("Accounting Reports", () => {
  const fromDate = new Date(Date.now() - 86_400_000);
  const toDate = new Date(Date.now() + 86_400_000);

  it("1. งบทดลอง: Σdebit = Σcredit เสมอ (invariant) หลังโพสต์บิลขาย+รับซื้อ", async () => {
    const category = await db.prisma.productCategory.create({
      data: { code: "RPT_JEWEL", name: "ทดสอบรายงาน" },
    });
    const product = await db.prisma.product.create({
      data: {
        sku: "RPT-RING-001",
        name: "แหวนทดสอบรายงาน",
        categoryId: category.id,
        tracking: ProductTracking.SERIALIZED,
        goldPurity: 96.5,
      },
    });
    const item = await db.prisma.inventoryItem.create({
      data: {
        serialNo: "RPT-TAG-001",
        productId: product.id,
        branchId,
        status: "IN_STOCK",
        weightMg: 15160n,
        goldPurity: 96.5,
        costSatang: 3_800_000n,
      },
    });

    const order = await createSalesOrder(db.prisma, {
      branchId,
      shiftId,
      items: [
        {
          productId: product.id,
          itemId: item.id,
          quantity: 1,
          laborChargeSatang: 107_000n,
        },
      ],
      payments: [
        { paymentMethod: PaymentMethod.CASH, amountSatang: 4_167_000n },
      ],
      actorId: cashierId,
    });
    await postSalesOrder(db.prisma, order.id, cashierId);

    const purchaseOrder = await createPurchaseOrder(db.prisma, {
      branchId,
      shiftId,
      customerName: "ลูกค้าทดสอบรายงาน",
      items: [
        {
          description: "สร้อยเก่า",
          weightMg: 15160n,
          goldPurity: 96.5,
          unitPriceSatang: 258_000n,
          totalAmountSatang: 3_920_000n,
        },
      ],
      payments: [
        { paymentMethod: PaymentMethod.CASH, amountSatang: 3_920_000n },
      ],
      actorId: cashierId,
    });
    await postPurchaseOrder(db.prisma, purchaseOrder.id, cashierId);

    const trialBalance = await getTrialBalance(db.prisma);
    expect(trialBalance.isBalanced).toBe(true);
    expect(trialBalance.totalDebitSatang).toBe(trialBalance.totalCreditSatang);

    const cashRow = trialBalance.rows.find(
      (r) => r.code === ACCOUNT_CODES.cash,
    );
    // เงินสดรับจากขาย 4,167,000 - จ่ายซื้อคืน 3,920,000 = คงเหลือ 247,000
    expect(cashRow?.balanceSatang).toBe(247_000n);
  });

  it("2. งบกำไรขาดทุน: แยกกำไรทอง/ค่ากำเหน็จ/ต้นทุนถูกต้อง", async () => {
    const pnl = await getProfitAndLoss(db.prisma, fromDate, toDate);
    // กำไรเนื้อทอง = รายได้ทอง (4,060,000) - ต้นทุน (3,800,000) = 260,000
    expect(pnl.goldProfitSatang).toBe(
      pnl.goldRevenueSatang - pnl.cogsGoldSatang,
    );
    expect(pnl.goldProfitSatang).toBe(260_000n);
    expect(pnl.laborRevenueSatang).toBeGreaterThan(0n);
    expect(pnl.netProfitSatang).toBe(
      pnl.totalRevenueSatang - pnl.totalExpenseSatang,
    );
  });

  it("3. รายงาน VAT: output VAT ตรงกับยอดภาษีขายที่โพสต์ไว้", async () => {
    const vat = await getVatReport(db.prisma, fromDate, toDate);
    expect(vat.outputVatSatang).toBeGreaterThan(0n);
    expect(vat.inputVatSatang).toBe(0n);
    expect(vat.netVatPayableSatang).toBe(vat.outputVatSatang);
  });

  it("4. สมุดเงินสด: running balance สะสมถูกต้องตามลำดับเวลา", async () => {
    const ledger = await getCashBankLedger(
      db.prisma,
      ACCOUNT_CODES.cash,
      fromDate,
      toDate,
    );
    expect(ledger.length).toBeGreaterThanOrEqual(2);
    const lastRow = ledger[ledger.length - 1];
    expect(lastRow.runningBalanceSatang).toBe(247_000n);
  });

  it("5. กระทบยอดเงินสด: เทียบยอดบัญชีกับยอดนับจริง", async () => {
    const reconciliation = await reconcileCashBank(db.prisma, {
      accountCode: ACCOUNT_CODES.cash,
      asOfDate: toDate,
      actualCountedSatang: 250_000n,
    });
    expect(reconciliation.ledgerBalanceSatang).toBe(247_000n);
    expect(reconciliation.differenceSatang).toBe(3_000n);
  });

  it("6. ฐานะการเงินเบื้องต้น: จัดกลุ่มสินทรัพย์/หนี้สิน/ทุนถูกต้อง", async () => {
    const balanceSheet = await getBalanceSheetSummary(db.prisma, toDate);
    expect(balanceSheet.assetRows.length).toBeGreaterThan(0);
    const cashAsset = balanceSheet.assetRows.find(
      (r) => r.code === ACCOUNT_CODES.cash,
    );
    expect(cashAsset?.balanceSatang).toBe(247_000n);
    expect(balanceSheet.totalAssetsSatang).toBeGreaterThan(0n);
  });
});
