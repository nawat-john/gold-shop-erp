// Integration Test: AMLO threshold trigger + บังคับ KYC (Phase 6)
// ครอบคลุม: ธุรกรรมต่ำกว่าเพดานไม่ทริกเกอร์, เกินเพดานไม่มี KYC ต้องถูกปฏิเสธ,
// เกินเพดานมี KYC สร้างแจ้งเตือน + ลงทะเบียนลูกค้าอัตโนมัติ, ตรงทะเบียนเฝ้าระวัง, ตรวจทาน/รายงาน
// รันด้วย: pnpm test:integration tests/integration/amlo-flow.test.ts
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";
import { AmloAlertStatus } from "@/generated/prisma/client";
import { openContract } from "@/server/services/pawn.service";
import { createPurchaseOrder } from "@/server/services/pos.service";
import {
  addWatchlistEntry,
  reviewAlert,
  markAlertReported,
  exportAlertsCsv,
} from "@/server/services/amlo.service";
import { openShift } from "@/server/services/shift.service";
import { seedRbac } from "@/server/services/rbac-seed";

const AMLO_THRESHOLD_SATANG = 5_000_000n; // 50,000 บาท — ปรับต่ำลงเพื่อทดสอบง่าย

let db: TestDb;
let branchId: string;
let drawerId: string;
let shiftId: string;
let cashierId: string;

beforeAll(async () => {
  db = await startTestDb();
  await seedRbac(db.prisma);

  await db.prisma.setting.upsert({
    where: { key: "amlo.cash_threshold_satang" },
    update: { value: AMLO_THRESHOLD_SATANG.toString() },
    create: {
      key: "amlo.cash_threshold_satang",
      value: AMLO_THRESHOLD_SATANG.toString(),
    },
  });

  const branch = await db.prisma.branch.create({
    data: { code: "AMLO01", name: "สาขาทดสอบ AMLO" },
  });
  branchId = branch.id;

  const drawer = await db.prisma.cashDrawer.create({
    data: { branchId, code: "DRAWER-AMLO", name: "ลิ้นชักทดสอบ AMLO" },
  });
  drawerId = drawer.id;

  const roleCashier = await db.prisma.role.findUniqueOrThrow({
    where: { code: "CASHIER" },
  });
  const cashier = await db.prisma.user.create({
    data: {
      username: "amlo-cashier",
      passwordHash: "$argon2id$dummy",
      displayName: "พนักงานทดสอบ AMLO",
      userBranchRoles: { create: { branchId, roleId: roleCashier.id } },
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

describe("AMLO threshold + KYC enforcement", () => {
  it("1. ขายฝากต่ำกว่าเพดาน AMLO -> ไม่มีแจ้งเตือนเกิดขึ้น", async () => {
    const contract = await openContract(db.prisma, {
      branchId,
      customerName: "ลูกค้าธรรมดา ต่ำกว่าเพดาน",
      description: "แหวนทองเส้นเล็ก",
      weightMg: 5000n,
      goldPurity: 96.5,
      principalSatang: 1_000_000n, // ต่ำกว่าเพดาน 5,000,000
      annualInterestRatePercent: 15,
      termMonths: 1,
      actorId: cashierId,
    });

    const alert = await db.prisma.amloAlert.findFirst({
      where: { refType: "PAWN_CONTRACT", refId: contract.id },
    });
    expect(alert).toBeNull();
    expect(contract.customerId).toBeNull();
  });

  it("2. ขายฝากเกินเพดาน AMLO แต่ไม่มีเลขบัตร ปชช. -> ต้องถูกปฏิเสธ (บังคับ KYC)", async () => {
    await expect(
      openContract(db.prisma, {
        branchId,
        customerName: "ลูกค้าไม่มี KYC",
        description: "สร้อยคอทองเส้นใหญ่",
        weightMg: 30320n,
        goldPurity: 96.5,
        principalSatang: 10_000_000n, // เกินเพดาน
        annualInterestRatePercent: 15,
        termMonths: 1,
        actorId: cashierId,
      }),
    ).rejects.toThrow("ต้องลงทะเบียนข้อมูลลูกค้า");
  });

  it("3. ขายฝากเกินเพดาน AMLO พร้อมเลขบัตร ปชช. -> ลงทะเบียนลูกค้าอัตโนมัติ + สร้างแจ้งเตือน", async () => {
    const contract = await openContract(db.prisma, {
      branchId,
      customerName: "ลูกค้ามี KYC ครบ",
      customerCitizenId: "1111111111111",
      description: "สร้อยคอทองเส้นใหญ่",
      weightMg: 30320n,
      goldPurity: 96.5,
      principalSatang: 10_000_000n,
      annualInterestRatePercent: 15,
      termMonths: 1,
      actorId: cashierId,
    });

    expect(contract.customerId).not.toBeNull();

    const customer = await db.prisma.customer.findUniqueOrThrow({
      where: { id: contract.customerId! },
    });
    expect(customer.name).toBe("ลูกค้ามี KYC ครบ");
    expect(customer.citizenIdHash).toBeTruthy();

    const alert = await db.prisma.amloAlert.findFirstOrThrow({
      where: { refType: "PAWN_CONTRACT", refId: contract.id },
    });
    expect(alert.status).toBe(AmloAlertStatus.PENDING);
    expect(alert.amountSatang).toBe(10_000_000n);
    expect(alert.watchlistMatch).toBe(false);
    expect(alert.customerId).toBe(contract.customerId);
  });

  it("4. ลูกค้าตรงกับทะเบียนเฝ้าระวัง -> แจ้งเตือนต้องตั้งค่า watchlistMatch = true", async () => {
    await addWatchlistEntry(db.prisma, {
      citizenId: "2222222222222",
      name: "บุคคลเฝ้าระวังทดสอบ",
      reason: "ทดสอบระบบ",
      actorId: cashierId,
    });

    const contract = await openContract(db.prisma, {
      branchId,
      customerName: "ลูกค้าตรงทะเบียนเฝ้าระวัง",
      customerCitizenId: "2222222222222",
      description: "กำไลทองเส้นใหญ่",
      weightMg: 30320n,
      goldPurity: 96.5,
      principalSatang: 10_000_000n,
      annualInterestRatePercent: 15,
      termMonths: 1,
      actorId: cashierId,
    });

    const alert = await db.prisma.amloAlert.findFirstOrThrow({
      where: { refType: "PAWN_CONTRACT", refId: contract.id },
    });
    expect(alert.watchlistMatch).toBe(true);
  });

  it("5. รับซื้อทองเกินเพดาน AMLO พร้อม KYC -> สร้างแจ้งเตือนเช่นกัน (ไม่บล็อกบิล)", async () => {
    const order = await createPurchaseOrder(db.prisma, {
      branchId,
      shiftId,
      customerName: "ลูกค้ารับซื้อทองเกินเพดาน",
      customerCitizenId: "3333333333333",
      items: [
        {
          description: "สร้อยคอทองชำรุด",
          weightMg: 30320n,
          goldPurity: 96.5,
          unitPriceSatang: 258_000n,
          totalAmountSatang: 8_000_000n,
        },
      ],
      payments: [{ paymentMethod: "CASH", amountSatang: 8_000_000n }],
      actorId: cashierId,
    });

    const alert = await db.prisma.amloAlert.findFirstOrThrow({
      where: { refType: "PURCHASE_ORDER", refId: order.id },
    });
    expect(alert.amountSatang).toBe(8_000_000n);
  });

  it("6. ตรวจทาน (PENDING -> REVIEWED) แล้วยืนยันส่งรายงาน (REVIEWED -> REPORTED)", async () => {
    const alert = await db.prisma.amloAlert.findFirstOrThrow({
      where: { status: AmloAlertStatus.PENDING },
    });

    const reviewed = await reviewAlert(db.prisma, {
      alertId: alert.id,
      actorId: cashierId,
    });
    expect(reviewed.status).toBe(AmloAlertStatus.REVIEWED);

    const reported = await markAlertReported(db.prisma, {
      alertId: alert.id,
      actorId: cashierId,
    });
    expect(reported.status).toBe(AmloAlertStatus.REPORTED);
    expect(reported.reportedAt).not.toBeNull();
  });

  it("7. ห้ามเพิ่มทะเบียนเฝ้าระวังซ้ำเลขบัตรเดียวกัน", async () => {
    await expect(
      addWatchlistEntry(db.prisma, {
        citizenId: "2222222222222",
        name: "ชื่ออื่น",
        reason: "ทดสอบซ้ำ",
        actorId: cashierId,
      }),
    ).rejects.toThrow("อยู่ในทะเบียนเฝ้าระวังอยู่แล้ว");
  });

  it("8. export CSV รายการแจ้งเตือนต้องมีข้อมูลอย่างน้อย 1 แถว", async () => {
    const csv = await exportAlertsCsv(db.prisma, {
      fromDate: new Date(Date.now() - 86_400_000),
      toDate: new Date(Date.now() + 86_400_000),
    });
    const lines = csv.trim().split("\n");
    expect(lines[0]).toContain("ref_type");
    expect(lines.length).toBeGreaterThan(1);
  });
});
