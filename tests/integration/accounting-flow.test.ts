// Integration Test: บัญชีคู่ (Double-Entry) + ปิดงวดบัญชี (Phase 7)
// ครอบคลุม: ledger writer กลาง (balance/idempotent/period-lock), DB-level balance trigger,
// posting rule จริงของ POS/ขายฝาก/ออมทอง/งานช่าง, void reversal, ปิด/เปิดงวดบัญชี
// รันด้วย: pnpm test:integration tests/integration/accounting-flow.test.ts
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";
import { PaymentMethod, ProductTracking } from "@/generated/prisma/client";
import {
  postJournalEntry,
  postSalesOrder,
  postVoidSalesOrder,
  postPurchaseOrder,
  postTradeIn,
  postPawnEvent,
  postSavingsTransaction,
  postWorkOrderEvent,
  lockPeriod,
  unlockPeriod,
  assertPeriodOpen,
  getOrCreatePeriod,
} from "@/server/services/accounting.service";
import { openShift } from "@/server/services/shift.service";
import {
  createSalesOrder,
  createPurchaseOrder,
  createTradeIn,
  voidOrder,
} from "@/server/services/pos.service";
import { openContract, renewInterest } from "@/server/services/pawn.service";
import {
  openAccount,
  deposit as savingsDeposit,
  closeForCash,
} from "@/server/services/savings.service";
import {
  createWorkOrder,
  startWork,
  completeWorkOrder,
  deliverWorkOrder,
} from "@/server/services/work-order.service";
import { setApprovalPin } from "@/server/services/approval.service";
import { seedRbac } from "@/server/services/rbac-seed";
import { seedChartOfAccounts } from "@/server/services/accounting-seed";
import { ACCOUNT_CODES } from "@/server/domain/chart-of-accounts";

let db: TestDb;
let branchId: string;
let drawerId: string;
let shiftId: string;
let cashierId: string;
let managerId: string;
const managerUsername = "acct-manager";

async function accountId(code: string): Promise<string> {
  const acc = await db.prisma.account.findUniqueOrThrow({ where: { code } });
  return acc.id;
}

beforeAll(async () => {
  db = await startTestDb();
  await seedRbac(db.prisma);
  await seedChartOfAccounts(db.prisma);

  const branch = await db.prisma.branch.create({
    data: { code: "ACC01", name: "สาขาทดสอบบัญชี" },
  });
  branchId = branch.id;

  const drawer = await db.prisma.cashDrawer.create({
    data: { branchId, code: "DRAWER-ACC", name: "ลิ้นชักทดสอบบัญชี" },
  });
  drawerId = drawer.id;

  const roleCashier = await db.prisma.role.findUniqueOrThrow({
    where: { code: "CASHIER" },
  });
  const roleManager = await db.prisma.role.findUniqueOrThrow({
    where: { code: "BRANCH_MANAGER" },
  });

  const cashier = await db.prisma.user.create({
    data: {
      username: "acct-cashier",
      passwordHash: "$argon2id$dummy",
      displayName: "พนักงานทดสอบบัญชี",
      userBranchRoles: { create: { branchId, roleId: roleCashier.id } },
    },
  });
  cashierId = cashier.id;

  const manager = await db.prisma.user.create({
    data: {
      username: managerUsername,
      passwordHash: "$argon2id$dummy",
      displayName: "ผู้จัดการทดสอบบัญชี",
      userBranchRoles: { create: { branchId, roleId: roleManager.id } },
    },
  });
  managerId = manager.id;

  await setApprovalPin(db.prisma, {
    userId: managerId,
    pin: "881234",
    actorId: managerId,
  });

  await db.prisma.shopPriceAnnouncement.create({
    data: {
      barBuy: 4_000_000n,
      barSell: 4_010_000n,
      ornamentBuy: 3_920_000n,
      ornamentSell: 4_060_000n,
      announcedBy: managerId,
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

describe("Accounting ledger writer (postJournalEntry)", () => {
  it("1. โพสต์รายการที่สมดุลสำเร็จ และ resolve รหัสบัญชีเป็น id ถูกต้อง", async () => {
    const entry = await postJournalEntry(db.prisma, {
      entryDate: new Date(),
      description: "ทดสอบโพสต์รายการพื้นฐาน",
      lines: [
        {
          accountCode: ACCOUNT_CODES.cash,
          debitSatang: 1000n,
          creditSatang: 0n,
        },
        {
          accountCode: ACCOUNT_CODES.salesRevenueGold,
          debitSatang: 0n,
          creditSatang: 1000n,
        },
      ],
      actorId: cashierId,
      branchId,
    });
    expect(entry).not.toBeNull();

    const lines = await db.prisma.journalLine.findMany({
      where: { entryId: entry!.id },
    });
    expect(lines).toHaveLength(2);
    const cashAccountId = await accountId(ACCOUNT_CODES.cash);
    const cashLine = lines.find((l) => l.accountId === cashAccountId);
    expect(cashLine?.debitSatang).toBe(1000n);
  });

  it("2. รายการไม่สมดุลต้องถูกปฏิเสธก่อนเขียน DB", async () => {
    await expect(
      postJournalEntry(db.prisma, {
        entryDate: new Date(),
        description: "ทดสอบไม่สมดุล",
        lines: [
          {
            accountCode: ACCOUNT_CODES.cash,
            debitSatang: 1000n,
            creditSatang: 0n,
          },
          {
            accountCode: ACCOUNT_CODES.salesRevenueGold,
            debitSatang: 0n,
            creditSatang: 999n,
          },
        ],
        actorId: cashierId,
        branchId,
      }),
    ).rejects.toThrow("ไม่สมดุล");
  });

  it("3. บรรทัดว่างเปล่า -> คืน null ไม่สร้างอะไร", async () => {
    const entry = await postJournalEntry(db.prisma, {
      entryDate: new Date(),
      description: "ไม่มีอะไรต้องลง",
      lines: [],
      actorId: cashierId,
      branchId,
    });
    expect(entry).toBeNull();
  });

  it("4. refType+refId ซ้ำ -> idempotent คืนรายการเดิม ไม่สร้างซ้ำ", async () => {
    const params = {
      entryDate: new Date(),
      description: "ทดสอบ idempotent",
      refType: "test_idempotent",
      refId: "fixed-ref-001",
      lines: [
        {
          accountCode: ACCOUNT_CODES.cash,
          debitSatang: 500n,
          creditSatang: 0n,
        },
        {
          accountCode: ACCOUNT_CODES.salesRevenueGold,
          debitSatang: 0n,
          creditSatang: 500n,
        },
      ],
      actorId: cashierId,
      branchId,
    };
    const first = await postJournalEntry(db.prisma, params);
    const second = await postJournalEntry(db.prisma, params);
    expect(second!.id).toBe(first!.id);

    const count = await db.prisma.journalEntry.count({
      where: { refType: "test_idempotent", refId: "fixed-ref-001" },
    });
    expect(count).toBe(1);
  });

  it("5. DB-level DEFERRED CONSTRAINT TRIGGER ปฏิเสธรายการไม่สมดุลที่แทรกตรงๆ (bypass application check)", async () => {
    await expect(
      db.prisma.$transaction(async (tx) => {
        const period = await getOrCreatePeriod(tx, new Date());
        const cashAccId = await accountId(ACCOUNT_CODES.cash);
        const entry = await tx.journalEntry.create({
          data: {
            entryNo: `TEST-RAW-${Date.now()}`,
            periodId: period.id,
            branchId,
            entryDate: new Date(),
            description: "ทดสอบ bypass",
            createdBy: cashierId,
          },
        });
        // แทรกบรรทัดเดียว debit ไม่มี credit คู่ -> ไม่สมดุล ต้องถูก DB trigger ปฏิเสธตอน commit
        await tx.journalLine.create({
          data: {
            entryId: entry.id,
            accountId: cashAccId,
            debitSatang: 1000n,
            creditSatang: 0n,
          },
        });
      }),
    ).rejects.toThrow();
  });
});

describe("Accounting Period Lock", () => {
  it("6. ปิดงวดบัญชีต้องใช้ PIN ที่ถูกต้อง แล้วบล็อกการโพสต์ย้อนหลังในงวดนั้น", async () => {
    const lockDate = new Date(Date.now() - 400 * 86_400_000); // ปีก่อนหน้า แน่นอนว่าไม่ชนงวดปัจจุบัน
    const period = await getOrCreatePeriod(db.prisma, lockDate);

    await expect(
      lockPeriod(db.prisma, {
        yearMonth: period.yearMonth,
        approverUsername: managerUsername,
        pin: "wrong-pin",
        actorId: cashierId,
      }),
    ).rejects.toThrow();

    const locked = await lockPeriod(db.prisma, {
      yearMonth: period.yearMonth,
      approverUsername: managerUsername,
      pin: "881234",
      actorId: cashierId,
    });
    expect(locked.status).toBe("LOCKED");

    await expect(assertPeriodOpen(db.prisma, lockDate)).rejects.toThrow(
      "ถูกปิดแล้ว",
    );

    await expect(
      postJournalEntry(db.prisma, {
        entryDate: lockDate,
        description: "ธุรกรรมย้อนหลังในงวดที่ปิดแล้ว",
        lines: [
          {
            accountCode: ACCOUNT_CODES.cash,
            debitSatang: 100n,
            creditSatang: 0n,
          },
          {
            accountCode: ACCOUNT_CODES.salesRevenueGold,
            debitSatang: 0n,
            creditSatang: 100n,
          },
        ],
        actorId: cashierId,
        branchId,
      }),
    ).rejects.toThrow("ถูกปิดแล้ว");

    const unlocked = await unlockPeriod(db.prisma, {
      yearMonth: period.yearMonth,
      approverUsername: managerUsername,
      pin: "881234",
      actorId: cashierId,
    });
    expect(unlocked.status).toBe("OPEN");
    await expect(assertPeriodOpen(db.prisma, lockDate)).resolves.not.toThrow();
  });
});

describe("Posting real transactions from Phase 4-6", () => {
  it("7. บิลขาย: Dr เงินสด / Cr รายได้ทอง+กำเหน็จ+VAT / Dr COGS-Cr สต๊อก (สินค้า SERIALIZED)", async () => {
    const category = await db.prisma.productCategory.create({
      data: { code: "ACC_JEWEL", name: "เครื่องประดับทดสอบบัญชี" },
    });
    const product = await db.prisma.product.create({
      data: {
        sku: "ACC-RING-001",
        name: "แหวนทดสอบบัญชี",
        categoryId: category.id,
        tracking: ProductTracking.SERIALIZED,
        goldPurity: 96.5,
      },
    });
    const item = await db.prisma.inventoryItem.create({
      data: {
        serialNo: "ACC-TAG-001",
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

    const entry = await postSalesOrder(db.prisma, order.id, cashierId);
    expect(entry).not.toBeNull();
    const lines = await db.prisma.journalLine.findMany({
      where: { entryId: entry!.id },
    });
    const totalDebit = lines.reduce((s, l) => s + l.debitSatang, 0n);
    const totalCredit = lines.reduce((s, l) => s + l.creditSatang, 0n);
    expect(totalDebit).toBe(totalCredit);

    const cogsAccountId = await accountId(ACCOUNT_CODES.cogsGold);
    const cogsLine = lines.find((l) => l.accountId === cogsAccountId);
    expect(cogsLine?.debitSatang).toBe(3_800_000n);

    // idempotent: โพสต์ซ้ำต้องได้ entry เดิม
    const again = await postSalesOrder(db.prisma, order.id, cashierId);
    expect(again!.id).toBe(entry!.id);
  });

  it("8. Void บิลขาย -> รายการกลับรายการทุกบรรทัดเป๊ะๆ และสมดุล", async () => {
    const category = await db.prisma.productCategory.create({
      data: { code: "ACC_VOID", name: "ทดสอบ Void" },
    });
    const product = await db.prisma.product.create({
      data: {
        sku: "ACC-VOID-001",
        name: "แหวน Void ทดสอบ",
        categoryId: category.id,
        tracking: ProductTracking.SERIALIZED,
        goldPurity: 96.5,
      },
    });
    const item = await db.prisma.inventoryItem.create({
      data: {
        serialNo: "ACC-VOID-TAG-001",
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
    const original = await postSalesOrder(db.prisma, order.id, cashierId);

    await voidOrder(db.prisma, {
      orderType: "SALES",
      orderId: order.id,
      voidedById: cashierId,
      voidReason: "ทดสอบ void บัญชี",
      approverUsername: managerUsername,
      pin: "881234",
    });

    const voidEntry = await postVoidSalesOrder(db.prisma, order.id, cashierId);
    expect(voidEntry).not.toBeNull();

    const originalLines = await db.prisma.journalLine.findMany({
      where: { entryId: original!.id },
      orderBy: { id: "asc" },
    });
    const voidLines = await db.prisma.journalLine.findMany({
      where: { entryId: voidEntry!.id },
      orderBy: { id: "asc" },
    });
    expect(voidLines).toHaveLength(originalLines.length);
    for (let i = 0; i < originalLines.length; i++) {
      expect(voidLines[i].accountId).toBe(originalLines[i].accountId);
      expect(voidLines[i].debitSatang).toBe(originalLines[i].creditSatang);
      expect(voidLines[i].creditSatang).toBe(originalLines[i].debitSatang);
    }
  });

  it("9. บิลรับซื้อทองคืน: Dr สต๊อก / Cr เงินสด", async () => {
    const order = await createPurchaseOrder(db.prisma, {
      branchId,
      shiftId,
      customerName: "ลูกค้าทดสอบบัญชี",
      items: [
        {
          description: "สร้อยคอชำรุด",
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

    const entry = await postPurchaseOrder(db.prisma, order.id, cashierId);
    expect(entry).not.toBeNull();
    const lines = await db.prisma.journalLine.findMany({
      where: { entryId: entry!.id },
    });
    const totalDebit = lines.reduce((s, l) => s + l.debitSatang, 0n);
    const totalCredit = lines.reduce((s, l) => s + l.creditSatang, 0n);
    expect(totalDebit).toBe(totalCredit);
    expect(totalDebit).toBe(3_920_000n);
  });

  it("10. บิลเปลี่ยนทอง (Trade-In): รายการรวมสมดุล", async () => {
    const category = await db.prisma.productCategory.create({
      data: { code: "ACC_TRADE", name: "ทดสอบเปลี่ยนทอง" },
    });
    const product = await db.prisma.product.create({
      data: {
        sku: "ACC-TRADE-001",
        name: "แหวนเปลี่ยนทองทดสอบ",
        categoryId: category.id,
        tracking: ProductTracking.SERIALIZED,
        goldPurity: 96.5,
      },
    });
    const item = await db.prisma.inventoryItem.create({
      data: {
        serialNo: "ACC-TRADE-TAG-001",
        productId: product.id,
        branchId,
        status: "IN_STOCK",
        weightMg: 15160n,
        goldPurity: 96.5,
        costSatang: 3_800_000n,
      },
    });

    const tradeIn = await createTradeIn(db.prisma, {
      branchId,
      shiftId,
      customerName: "ลูกค้าเปลี่ยนทอง",
      salesItems: [
        {
          productId: product.id,
          itemId: item.id,
          quantity: 1,
          laborChargeSatang: 107_000n,
        },
      ],
      purchaseItems: [
        {
          description: "กำไลเก่า",
          weightMg: 15160n,
          goldPurity: 96.5,
          unitPriceSatang: 258_000n,
          totalAmountSatang: 3_920_000n,
        },
      ],
      payments: [{ paymentMethod: PaymentMethod.CASH, amountSatang: 247_000n }],
      actorId: cashierId,
    });

    const entry = await postTradeIn(db.prisma, tradeIn.id, cashierId);
    expect(entry).not.toBeNull();
    const lines = await db.prisma.journalLine.findMany({
      where: { entryId: entry!.id },
    });
    const totalDebit = lines.reduce((s, l) => s + l.debitSatang, 0n);
    const totalCredit = lines.reduce((s, l) => s + l.creditSatang, 0n);
    expect(totalDebit).toBe(totalCredit);
  });

  it("11. สัญญาขายฝาก: เปิดสัญญา (OPEN) + ต่อดอก (RENEW_INTEREST) ลงบัญชีถูกต้อง", async () => {
    const contract = await openContract(db.prisma, {
      branchId,
      customerName: "ลูกค้าขายฝากทดสอบบัญชี",
      description: "สร้อยคอทดสอบบัญชี",
      weightMg: 15160n,
      goldPurity: 96.5,
      principalSatang: 5_000_000n,
      annualInterestRatePercent: 12,
      termMonths: 1,
      actorId: cashierId,
    });

    const openEvent = await db.prisma.pawnEvent.findFirstOrThrow({
      where: { contractId: contract.id, eventType: "OPEN" },
    });
    const openEntry = await postPawnEvent(db.prisma, openEvent.id, cashierId);
    expect(openEntry).not.toBeNull();
    const openLines = await db.prisma.journalLine.findMany({
      where: { entryId: openEntry!.id },
    });
    expect(openLines.reduce((s, l) => s + l.debitSatang, 0n)).toBe(5_000_000n);

    const paymentDate = new Date(
      contract.startDate.getTime() + 20 * 86_400_000,
    );
    await renewInterest(db.prisma, {
      contractId: contract.id,
      actorId: cashierId,
      paymentDate,
    });
    const renewEvent = await db.prisma.pawnEvent.findFirstOrThrow({
      where: { contractId: contract.id, eventType: "RENEW_INTEREST" },
    });
    const renewEntry = await postPawnEvent(db.prisma, renewEvent.id, cashierId);
    expect(renewEntry).not.toBeNull();
    const renewLines = await db.prisma.journalLine.findMany({
      where: { entryId: renewEntry!.id },
    });
    expect(renewLines.reduce((s, l) => s + l.debitSatang, 0n)).toBe(
      renewLines.reduce((s, l) => s + l.creditSatang, 0n),
    );
  });

  it("12. ออมทอง: ฝากเงิน (DEPOSIT) + ปิดบัญชียกเลิก (CLOSE_CASH) ลงบัญชีถูกต้อง", async () => {
    const account = await openAccount(db.prisma, {
      branchId,
      accountType: "CASH_SAVINGS",
      actorId: cashierId,
    });
    await savingsDeposit(db.prisma, {
      accountId: account.id,
      amountSatang: 500_000n,
      actorId: cashierId,
    });
    const depositTx = await db.prisma.savingsTransaction.findFirstOrThrow({
      where: { accountId: account.id, txType: "DEPOSIT" },
    });
    const depositEntry = await postSavingsTransaction(
      db.prisma,
      depositTx.id,
      cashierId,
    );
    expect(depositEntry).not.toBeNull();

    await closeForCash(db.prisma, {
      accountId: account.id,
      actorId: cashierId,
    });
    const closeTx = await db.prisma.savingsTransaction.findFirstOrThrow({
      where: { accountId: account.id, txType: "CLOSE_CASH" },
    });
    const closeEntry = await postSavingsTransaction(
      db.prisma,
      closeTx.id,
      cashierId,
    );
    expect(closeEntry).not.toBeNull();
    const closeLines = await db.prisma.journalLine.findMany({
      where: { entryId: closeEntry!.id },
    });
    expect(closeLines.reduce((s, l) => s + l.debitSatang, 0n)).toBe(
      closeLines.reduce((s, l) => s + l.creditSatang, 0n),
    );
  });

  it("13. งานช่างซ่อม: รับงานมัดจำ (RECEIVE) + ส่งมอบรับรายได้ (DELIVER) ลงบัญชีถูกต้อง", async () => {
    const wo = await createWorkOrder(db.prisma, {
      branchId,
      type: "REPAIR",
      description: "ซ่อมทดสอบบัญชี",
      depositSatang: 100_000n,
      serviceFeeSatang: 250_000n,
      actorId: cashierId,
    });
    const receiveEvent = await db.prisma.workOrderEvent.findFirstOrThrow({
      where: { workOrderId: wo.id, eventType: "RECEIVE" },
    });
    const receiveEntry = await postWorkOrderEvent(
      db.prisma,
      receiveEvent.id,
      cashierId,
    );
    expect(receiveEntry).not.toBeNull();

    await startWork(db.prisma, { workOrderId: wo.id, actorId: cashierId });
    await completeWorkOrder(db.prisma, {
      workOrderId: wo.id,
      actorId: cashierId,
    });
    await deliverWorkOrder(db.prisma, {
      workOrderId: wo.id,
      actorId: cashierId,
    });
    const deliverEvent = await db.prisma.workOrderEvent.findFirstOrThrow({
      where: { workOrderId: wo.id, eventType: "DELIVER" },
    });
    const deliverEntry = await postWorkOrderEvent(
      db.prisma,
      deliverEvent.id,
      cashierId,
    );
    expect(deliverEntry).not.toBeNull();
    const deliverLines = await db.prisma.journalLine.findMany({
      where: { entryId: deliverEntry!.id },
    });
    const repairIncomeAccountId = await accountId(
      ACCOUNT_CODES.repairServiceIncome,
    );
    const income = deliverLines.find(
      (l) => l.accountId === repairIncomeAccountId,
    );
    expect(income?.creditSatang).toBe(250_000n);
  });
});
