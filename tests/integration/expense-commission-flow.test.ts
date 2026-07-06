// Integration Test: ค่าใช้จ่าย + ค่าคอมมิชชั่นพนักงาน (Phase 7)
// รันด้วย: pnpm test:integration tests/integration/expense-commission-flow.test.ts
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";
import { PaymentMethod, ProductTracking } from "@/generated/prisma/client";
import {
  recordExpense,
  getExpenseReport,
} from "@/server/services/expense.service";
import {
  awardCommissionForSalesOrder,
  getCommissionReport,
} from "@/server/services/commission.service";
import { postSalesOrder } from "@/server/services/accounting.service";
import { openShift } from "@/server/services/shift.service";
import { createSalesOrder } from "@/server/services/pos.service";
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
    data: { code: "EXP01", name: "สาขาทดสอบค่าใช้จ่าย" },
  });
  branchId = branch.id;

  const drawer = await db.prisma.cashDrawer.create({
    data: { branchId, code: "DRAWER-EXP", name: "ลิ้นชักทดสอบค่าใช้จ่าย" },
  });
  drawerId = drawer.id;

  const cashier = await db.prisma.user.create({
    data: {
      username: "exp-cashier",
      passwordHash: "$argon2id$dummy",
      displayName: "พนักงานทดสอบค่าใช้จ่าย",
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

describe("Expense recording", () => {
  it("1. บันทึกค่าใช้จ่ายและโพสต์บัญชี Dr ค่าใช้จ่าย / Cr เงินสด", async () => {
    const expense = await recordExpense(db.prisma, {
      branchId,
      expenseAccountCode: ACCOUNT_CODES.generalExpenses,
      amountSatang: 500_000n,
      description: "ค่าเช่าร้านประจำเดือน",
      expenseDate: new Date(),
      actorId: cashierId,
    });
    expect(expense.journalEntryId).not.toBeNull();

    const lines = await db.prisma.journalLine.findMany({
      where: { entryId: expense.journalEntryId! },
    });
    const totalDebit = lines.reduce((s, l) => s + l.debitSatang, 0n);
    const totalCredit = lines.reduce((s, l) => s + l.creditSatang, 0n);
    expect(totalDebit).toBe(totalCredit);
    expect(totalDebit).toBe(500_000n);
  });

  it("2. ปฏิเสธจำนวนเงิน 0 หรือติดลบ", async () => {
    await expect(
      recordExpense(db.prisma, {
        branchId,
        expenseAccountCode: ACCOUNT_CODES.generalExpenses,
        amountSatang: 0n,
        description: "ทดสอบ",
        expenseDate: new Date(),
        actorId: cashierId,
      }),
    ).rejects.toThrow("มากกว่า 0");
  });

  it("3. รายงานค่าใช้จ่ายรวมยอดถูกต้อง", async () => {
    const report = await getExpenseReport(db.prisma, {
      branchId,
      fromDate: new Date(Date.now() - 86_400_000),
      toDate: new Date(Date.now() + 86_400_000),
    });
    expect(report.totalSatang).toBeGreaterThanOrEqual(500_000n);
  });
});

describe("Commission", () => {
  it("4. อัตราคอมมิชชั่นเป็น 0 (ค่าเริ่มต้น) -> ไม่มีการให้คอมมิชชั่น", async () => {
    const category = await db.prisma.productCategory.create({
      data: { code: "EXP_JEWEL", name: "ทดสอบคอมมิชชั่น" },
    });
    const product = await db.prisma.product.create({
      data: {
        sku: "EXP-RING-001",
        name: "แหวนทดสอบคอมมิชชั่น",
        categoryId: category.id,
        tracking: ProductTracking.SERIALIZED,
        goldPurity: 96.5,
      },
    });
    const item = await db.prisma.inventoryItem.create({
      data: {
        serialNo: "EXP-TAG-001",
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

    const commission = await awardCommissionForSalesOrder(db.prisma, {
      salesOrderId: order.id,
      staffId: cashierId,
      actorId: cashierId,
    });
    expect(commission).toBeNull();
  });

  it("5. ตั้งอัตรา 5% -> คำนวณจากค่ากำเหน็จสุทธิ และโพสต์บัญชีถูกต้อง", async () => {
    await db.prisma.setting.upsert({
      where: { key: "commission.sale_rate_percent" },
      update: { value: 5 },
      create: { key: "commission.sale_rate_percent", value: 5 },
    });

    const category = await db.prisma.productCategory.create({
      data: { code: "EXP_JEWEL2", name: "ทดสอบคอมมิชชั่น 2" },
    });
    const product = await db.prisma.product.create({
      data: {
        sku: "EXP-RING-002",
        name: "แหวนทดสอบคอมมิชชั่น 2",
        categoryId: category.id,
        tracking: ProductTracking.SERIALIZED,
        goldPurity: 96.5,
      },
    });
    const item = await db.prisma.inventoryItem.create({
      data: {
        serialNo: "EXP-TAG-002",
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

    const commission = await awardCommissionForSalesOrder(db.prisma, {
      salesOrderId: order.id,
      staffId: cashierId,
      actorId: cashierId,
    });
    expect(commission).not.toBeNull();
    // ค่ากำเหน็จสุทธิ = 107,000 - 7,000 (VAT) = 100,000 -> คอมมิชชั่น 5% = 5,000 สตางค์
    expect(commission!.amountSatang).toBe(5_000n);

    const lines = await db.prisma.journalLine.findMany({
      where: { entry: { refType: "commission", refId: commission!.id } },
    });
    const totalDebit = lines.reduce((s, l) => s + l.debitSatang, 0n);
    const totalCredit = lines.reduce((s, l) => s + l.creditSatang, 0n);
    expect(totalDebit).toBe(totalCredit);
    expect(totalDebit).toBe(5_000n);

    // เรียกซ้ำต้องได้ commission เดิม ไม่สร้างซ้ำ
    const again = await awardCommissionForSalesOrder(db.prisma, {
      salesOrderId: order.id,
      staffId: cashierId,
      actorId: cashierId,
    });
    expect(again!.id).toBe(commission!.id);
  });

  it("6. รายงานคอมมิชชั่นรวมยอดถูกต้อง", async () => {
    const report = await getCommissionReport(db.prisma, {
      staffId: cashierId,
      fromDate: new Date(Date.now() - 86_400_000),
      toDate: new Date(Date.now() + 86_400_000),
    });
    expect(report.totalSatang).toBe(5_000n);
  });
});
