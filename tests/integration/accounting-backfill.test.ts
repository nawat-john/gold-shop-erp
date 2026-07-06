// Integration Test: Backfill ธุรกรรมย้อนหลังลง journal (Phase 7)
// ครอบคลุม: โพสต์ธุรกรรมเก่าที่ยังไม่เคยลงบัญชีให้ครบทุกโมดูล, รันซ้ำได้โดยไม่สร้างซ้ำ (idempotent)
// รันด้วย: pnpm test:integration tests/integration/accounting-backfill.test.ts
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";
import { PaymentMethod } from "@/generated/prisma/client";
import { backfillJournalEntries } from "@/server/services/accounting-backfill.service";
import { openShift } from "@/server/services/shift.service";
import { createPurchaseOrder } from "@/server/services/pos.service";
import { openContract } from "@/server/services/pawn.service";
import { openAccount, deposit } from "@/server/services/savings.service";
import { createWorkOrder } from "@/server/services/work-order.service";
import { seedRbac } from "@/server/services/rbac-seed";
import { seedChartOfAccounts } from "@/server/services/accounting-seed";

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
    data: { code: "BF01", name: "สาขาทดสอบ Backfill" },
  });
  branchId = branch.id;

  const drawer = await db.prisma.cashDrawer.create({
    data: { branchId, code: "DRAWER-BF", name: "ลิ้นชักทดสอบ Backfill" },
  });
  drawerId = drawer.id;

  const cashier = await db.prisma.user.create({
    data: {
      username: "bf-cashier",
      passwordHash: "$argon2id$dummy",
      displayName: "พนักงานทดสอบ Backfill",
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

describe("Accounting Backfill", () => {
  it("1. โพสต์ธุรกรรมเก่าจากทุกโมดูลย้อนหลังสำเร็จ และรันซ้ำได้โดยไม่สร้างซ้ำ", async () => {
    // สร้างธุรกรรมข้ามโมดูลโดยไม่เรียก postX ใดๆ (จำลองข้อมูลเก่าก่อนเปิดใช้บัญชีคู่)
    await createPurchaseOrder(db.prisma, {
      branchId,
      shiftId,
      customerName: "ลูกค้าทดสอบ Backfill",
      items: [
        {
          description: "สร้อยคอเก่า",
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

    await openContract(db.prisma, {
      branchId,
      customerName: "ลูกค้าขายฝาก Backfill",
      description: "แหวนทดสอบ Backfill",
      weightMg: 5000n,
      goldPurity: 96.5,
      principalSatang: 1_000_000n,
      annualInterestRatePercent: 10,
      termMonths: 1,
      actorId: cashierId,
    });

    const account = await openAccount(db.prisma, {
      branchId,
      accountType: "CASH_SAVINGS",
      actorId: cashierId,
    });
    await deposit(db.prisma, {
      accountId: account.id,
      amountSatang: 200_000n,
      actorId: cashierId,
    });

    await createWorkOrder(db.prisma, {
      branchId,
      type: "REPAIR",
      description: "ซ่อมทดสอบ Backfill",
      depositSatang: 50_000n,
      actorId: cashierId,
    });

    const before = await db.prisma.journalEntry.count();
    expect(before).toBe(0);

    const firstRun = await backfillJournalEntries(db.prisma, cashierId);
    expect(firstRun.failures).toEqual([]);
    expect(firstRun.postedCount).toBeGreaterThan(0);

    const afterFirst = await db.prisma.journalEntry.count();
    expect(afterFirst).toBe(firstRun.postedCount);

    // รันซ้ำ — ต้องไม่สร้างรายการซ้ำเพิ่ม (idempotent)
    const secondRun = await backfillJournalEntries(db.prisma, cashierId);
    expect(secondRun.failures).toEqual([]);
    const afterSecond = await db.prisma.journalEntry.count();
    expect(afterSecond).toBe(afterFirst);

    // ตรวจว่าลงบัญชีของสัญญาขายฝากจริง (OPEN event)
    const pawnEntry = await db.prisma.journalEntry.findFirst({
      where: { refType: "pawn_event" },
    });
    expect(pawnEntry).not.toBeNull();
  });
});
