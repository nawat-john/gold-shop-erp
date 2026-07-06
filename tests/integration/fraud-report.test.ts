// Integration Test: Fraud Dashboard reports (Phase 8)
// ครอบคลุม: void leaderboard จัดอันดับ+ตีตราผิดปกติถูกต้อง, stock-adjust leaderboard รวมมูลค่า+จำนวนครั้ง,
// off-hours activity กรองเฉพาะนอกเวลาทำการ, กรอง branchId แยกสาขาได้ถูกต้อง
// รันด้วย: pnpm test:integration tests/integration/fraud-report.test.ts
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";
import {
  getVoidLeaderboard,
  getStockAdjustLeaderboard,
  getOffHoursActivity,
} from "@/server/services/fraud-report.service";
import { openShift } from "@/server/services/shift.service";

let db: TestDb;
let branchAId: string;
let branchBId: string;
let shiftAId: string;
let normalEmployeeId: string;
let anomalousEmployeeId: string;
let approverLightId: string;
let approverHeavyId: string;

const fromDate = new Date(Date.now() - 30 * 86_400_000);
const toDate = new Date(Date.now() + 86_400_000);

async function createOrder(params: {
  branchId: string;
  shiftId: string;
  createdBy: string;
  voided: boolean;
  n: number;
}) {
  return db.prisma.salesOrder.create({
    data: {
      docNo: `FRD-SO-${params.branchId.slice(0, 4)}-${params.createdBy.slice(0, 4)}-${params.n}`,
      branchId: params.branchId,
      shiftId: params.shiftId,
      priceSnapshot: {},
      totalAmountSatang: 100_000n,
      vatAmountSatang: 0n,
      status: params.voided ? "VOIDED" : "COMPLETED",
      voidedAt: params.voided ? new Date() : null,
      voidedById: params.voided ? params.createdBy : null,
      voidReason: params.voided ? "ทดสอบ fraud report" : null,
      createdBy: params.createdBy,
    },
  });
}

async function createApprovedStockCount(params: {
  branchId: string;
  approvedBy: string;
  n: number;
  magnitudeSatang: bigint;
}) {
  const count = await db.prisma.stockCount.create({
    data: {
      docNo: `FRD-SC-${params.approvedBy.slice(0, 4)}-${params.n}`,
      branchId: params.branchId,
      status: "APPROVED",
      createdBy: params.approvedBy,
      approvedBy: params.approvedBy,
      closedAt: new Date(),
    },
  });
  const category = await db.prisma.productCategory.upsert({
    where: { code: "FRD_CAT" },
    update: {},
    create: { code: "FRD_CAT", name: "ทดสอบ fraud" },
  });
  const product = await db.prisma.product.upsert({
    where: { sku: "FRD-PROD" },
    update: {},
    create: {
      sku: "FRD-PROD",
      name: "สินค้าทดสอบ fraud",
      categoryId: category.id,
      tracking: "COUNTED",
      goldPurity: 96.5,
    },
  });
  await db.prisma.stockMovement.create({
    data: {
      movementType: "COUNT_ADJUST_OUT",
      branchId: params.branchId,
      productId: product.id,
      quantity: -1,
      weightMg: -1000n,
      costSatang: -params.magnitudeSatang,
      refType: "stock_count",
      refId: count.id,
      actorId: params.approvedBy,
    },
  });
  return count;
}

beforeAll(async () => {
  db = await startTestDb();

  const branchA = await db.prisma.branch.create({
    data: { code: "FRDA", name: "สาขาทดสอบ Fraud A" },
  });
  branchAId = branchA.id;
  const branchB = await db.prisma.branch.create({
    data: { code: "FRDB", name: "สาขาทดสอบ Fraud B" },
  });
  branchBId = branchB.id;

  const drawerA = await db.prisma.cashDrawer.create({
    data: { branchId: branchAId, code: "DRAWER-FRD", name: "ลิ้นชัก FRD" },
  });

  const normalEmployee = await db.prisma.user.create({
    data: {
      username: "frd-normal",
      passwordHash: "$argon2id$dummy",
      displayName: "พนักงานปกติ",
    },
  });
  normalEmployeeId = normalEmployee.id;

  const anomalousEmployee = await db.prisma.user.create({
    data: {
      username: "frd-anomalous",
      passwordHash: "$argon2id$dummy",
      displayName: "พนักงานผิดปกติ",
    },
  });
  anomalousEmployeeId = anomalousEmployee.id;

  const approverLight = await db.prisma.user.create({
    data: {
      username: "frd-approver-light",
      passwordHash: "$argon2id$dummy",
      displayName: "ผู้อนุมัติจำนวนน้อย",
    },
  });
  approverLightId = approverLight.id;

  const approverHeavy = await db.prisma.user.create({
    data: {
      username: "frd-approver-heavy",
      passwordHash: "$argon2id$dummy",
      displayName: "ผู้อนุมัติจำนวนมาก",
    },
  });
  approverHeavyId = approverHeavy.id;

  const shiftA = await openShift(db.prisma, {
    branchId: branchAId,
    drawerId: drawerA.id,
    openedById: normalEmployeeId,
    startCashSatang: 100_000n,
  });
  shiftAId = shiftA.id;
}, 180_000);

afterAll(async () => {
  await stopTestDb(db);
});

describe("Fraud Reports", () => {
  it("1. Void leaderboard: ตีตราพนักงานที่ void เกิน threshold (ตัวอย่างเพียงพอ) แต่ไม่ตีตราพนักงานปกติ", async () => {
    // พนักงานปกติ: 10 บิล void แค่ 1 บิล (10%) — ต่ำกว่า default threshold 20%
    for (let i = 0; i < 9; i++) {
      await createOrder({
        branchId: branchAId,
        shiftId: shiftAId,
        createdBy: normalEmployeeId,
        voided: false,
        n: i,
      });
    }
    await createOrder({
      branchId: branchAId,
      shiftId: shiftAId,
      createdBy: normalEmployeeId,
      voided: true,
      n: 9,
    });

    // พนักงานผิดปกติ: 10 บิล void ถึง 6 บิล (60%) — เกิน threshold ชัดเจน
    for (let i = 0; i < 4; i++) {
      await createOrder({
        branchId: branchAId,
        shiftId: shiftAId,
        createdBy: anomalousEmployeeId,
        voided: false,
        n: i,
      });
    }
    for (let i = 4; i < 10; i++) {
      await createOrder({
        branchId: branchAId,
        shiftId: shiftAId,
        createdBy: anomalousEmployeeId,
        voided: true,
        n: i,
      });
    }

    const leaderboard = await getVoidLeaderboard(db.prisma, {
      fromDate,
      toDate,
      branchId: branchAId,
    });

    const normalRow = leaderboard.find((r) => r.actorId === normalEmployeeId);
    const anomalousRow = leaderboard.find(
      (r) => r.actorId === anomalousEmployeeId,
    );

    expect(normalRow?.totalCount).toBe(10);
    expect(normalRow?.voidCount).toBe(1);
    expect(normalRow?.flagged).toBe(false);

    expect(anomalousRow?.totalCount).toBe(10);
    expect(anomalousRow?.voidCount).toBe(6);
    expect(anomalousRow?.voidRatePercent).toBe(60);
    expect(anomalousRow?.flagged).toBe(true);

    // จัดอันดับ: อัตรา void สูงสุดต้องมาก่อน
    expect(leaderboard[0].actorId).toBe(anomalousEmployeeId);
  });

  it("2. Stock-adjust leaderboard: รวมจำนวนครั้ง+มูลค่าต่อผู้อนุมัติ และตีตราเกิน threshold (default 5 ครั้ง)", async () => {
    // ผู้อนุมัติน้อย: 2 ครั้ง — ไม่เกิน threshold
    for (let i = 0; i < 2; i++) {
      await createApprovedStockCount({
        branchId: branchAId,
        approvedBy: approverLightId,
        n: i,
        magnitudeSatang: 10_000n,
      });
    }
    // ผู้อนุมัติมาก: 6 ครั้ง — เกิน threshold (default 5)
    for (let i = 0; i < 6; i++) {
      await createApprovedStockCount({
        branchId: branchAId,
        approvedBy: approverHeavyId,
        n: i,
        magnitudeSatang: 50_000n,
      });
    }

    const leaderboard = await getStockAdjustLeaderboard(db.prisma, {
      fromDate,
      toDate,
      branchId: branchAId,
    });

    const lightRow = leaderboard.find((r) => r.approverId === approverLightId);
    const heavyRow = leaderboard.find((r) => r.approverId === approverHeavyId);

    expect(lightRow?.approvalCount).toBe(2);
    expect(lightRow?.totalMagnitudeSatang).toBe(20_000n);
    expect(lightRow?.flagged).toBe(false);

    expect(heavyRow?.approvalCount).toBe(6);
    expect(heavyRow?.totalMagnitudeSatang).toBe(300_000n);
    expect(heavyRow?.flagged).toBe(true);

    expect(leaderboard[0].approverId).toBe(approverHeavyId);
  });

  it("3. Off-hours activity: กรองเฉพาะ log ที่เกิดนอกเวลาทำการ (ก่อน 08:00 / หลัง 20:00)", async () => {
    const offHoursDate = new Date();
    offHoursDate.setHours(3, 15, 0, 0); // ตี 3 — นอกเวลาทำการแน่นอน
    const businessHoursDate = new Date();
    businessHoursDate.setHours(14, 0, 0, 0); // บ่าย 2 — เวลาทำการปกติ

    await db.prisma.auditLog.create({
      data: {
        action: "pos.void_sales_order",
        entityType: "sales_order",
        entityId: "test-offhours-1",
        actorId: anomalousEmployeeId,
        branchId: branchAId,
        createdAt: offHoursDate,
      },
    });
    await db.prisma.auditLog.create({
      data: {
        action: "pos.void_sales_order",
        entityType: "sales_order",
        entityId: "test-businesshours-1",
        actorId: normalEmployeeId,
        branchId: branchAId,
        createdAt: businessHoursDate,
      },
    });

    const activity = await getOffHoursActivity(db.prisma, {
      fromDate,
      toDate,
      branchId: branchAId,
    });

    expect(activity.some((a) => a.entityId === "test-offhours-1")).toBe(true);
    expect(activity.some((a) => a.entityId === "test-businesshours-1")).toBe(
      false,
    );
  });

  it("4. กรอง branchId แยกสาขาได้ถูกต้อง — สาขา B ไม่เห็นข้อมูลของสาขา A", async () => {
    const leaderboardBranchB = await getVoidLeaderboard(db.prisma, {
      fromDate,
      toDate,
      branchId: branchBId,
    });
    expect(leaderboardBranchB).toHaveLength(0);

    const stockLeaderboardBranchB = await getStockAdjustLeaderboard(db.prisma, {
      fromDate,
      toDate,
      branchId: branchBId,
    });
    expect(stockLeaderboardBranchB).toHaveLength(0);
  });
});
