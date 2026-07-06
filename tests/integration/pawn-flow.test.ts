// Integration Test: วงจรชีวิตสัญญาขายฝากทอง (Phase 5)
// ครอบคลุม: เปิดสัญญา -> ต่อดอก -> ไถ่ถอน, เปิดสัญญา -> ทองหลุด (โอนเข้าสต๊อกจริง),
// ปรับเงินต้นกลางสัญญา, ยกเลิกสัญญา, การกันทำ transition ผิดสถานะ, concurrency อนุมัติทองหลุดซ้ำ
// รันด้วย: pnpm test:integration tests/integration/pawn-flow.test.ts
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";
import { PawnContractStatus, PawnEventType } from "@/generated/prisma/client";
import {
  openContract,
  renewInterest,
  redeemContract,
  forfeitContract,
  adjustPrincipal,
  cancelContract,
} from "@/server/services/pawn.service";
import { calculateAccruedInterest } from "@/server/domain/pawn-interest";
import { setApprovalPin } from "@/server/services/approval.service";
import { seedRbac } from "@/server/services/rbac-seed";

let db: TestDb;
let branchId: string;
let cashierId: string;
let managerId: string;
const managerUsername = "pawn-manager";

beforeAll(async () => {
  db = await startTestDb();
  await seedRbac(db.prisma);

  const branch = await db.prisma.branch.create({
    data: { code: "PWN01", name: "สาขาทดสอบขายฝาก" },
  });
  branchId = branch.id;

  const roleCashier = await db.prisma.role.findUniqueOrThrow({
    where: { code: "CASHIER" },
  });
  const roleManager = await db.prisma.role.findUniqueOrThrow({
    where: { code: "BRANCH_MANAGER" },
  });

  const cashier = await db.prisma.user.create({
    data: {
      username: "pawn-cashier",
      passwordHash: "$argon2id$dummy",
      displayName: "พนักงานขายฝาก",
      userBranchRoles: { create: { branchId, roleId: roleCashier.id } },
    },
  });
  cashierId = cashier.id;

  const manager = await db.prisma.user.create({
    data: {
      username: managerUsername,
      passwordHash: "$argon2id$dummy",
      displayName: "ผู้จัดการสาขา",
      userBranchRoles: { create: { branchId, roleId: roleManager.id } },
    },
  });
  managerId = manager.id;

  await setApprovalPin(db.prisma, {
    userId: managerId,
    pin: "551234",
    actorId: managerId,
  });
}, 180_000);

afterAll(async () => {
  await stopTestDb(db);
});

/**
 * สร้างสัญญาที่ "เกินกำหนดมานานแล้ว" ตรงๆ ผ่าน Prisma (ข้าม openContract)
 * เพราะ due_date ต้องไม่ก่อน start_date เสมอ (CHECK ระดับ DB) — จะย้อน dueDate ไปในอดีต
 * โดยไม่ย้อน startDate ตามไปด้วยไม่ได้ ต่างจากการแก้ไขแค่ dueDate หลังเปิดสัญญาจริงตามปกติ
 */
async function createOverdueContract(params: {
  docNo: string;
  principalSatang: bigint;
  weightMg: bigint;
  annualInterestRatePercent: number;
  dueDaysAgo: number;
}) {
  const startDate = new Date(
    Date.now() - (params.dueDaysAgo + 30) * 86_400_000,
  );
  const dueDate = new Date(Date.now() - params.dueDaysAgo * 86_400_000);
  return db.prisma.pawnContract.create({
    data: {
      docNo: params.docNo,
      branchId,
      status: PawnContractStatus.ACTIVE,
      customerName: "ทดสอบ เกินกำหนด",
      description: "ทองทดสอบเกินกำหนด",
      weightMg: params.weightMg,
      goldPurity: 96.5,
      principalSatang: params.principalSatang,
      annualInterestRatePercent: params.annualInterestRatePercent,
      termMonths: 1,
      startDate,
      dueDate,
      interestPaidThroughDate: startDate,
      createdBy: cashierId,
    },
  });
}

describe("Pawn Contract Lifecycle", () => {
  it("1. เปิดสัญญา -> ต่อดอกกลางงวด -> ไถ่ถอน (happy path)", async () => {
    const contract = await openContract(db.prisma, {
      branchId,
      customerName: "สมชาย ใจดี",
      customerPhone: "0812345678",
      customerCitizenId: "1234567890123",
      description: "สร้อยคอทอง 1 บาท",
      weightMg: 15160n,
      goldPurity: 96.5,
      principalSatang: 10_000_000n, // 100,000 บาท
      annualInterestRatePercent: 12,
      termMonths: 1,
      actorId: cashierId,
    });

    expect(contract.status).toBe(PawnContractStatus.ACTIVE);
    // เลขบัตร ปชช. ต้องเข้ารหัส ไม่เก็บ plaintext
    expect(contract.customerCitizenIdEnc).not.toBe("1234567890123");
    expect(contract.customerCitizenIdHash).toBeTruthy();

    const paymentDate = new Date(
      contract.startDate.getTime() + 20 * 86_400_000,
    );
    const expectedInterest1 = calculateAccruedInterest({
      principalSatang: 10_000_000n,
      annualRatePercent: 12,
      fromDate: contract.startDate,
      toDate: paymentDate,
    });

    const renewResult = await renewInterest(db.prisma, {
      contractId: contract.id,
      actorId: cashierId,
      paymentDate,
    });

    expect(renewResult.interestPaidSatang).toBe(expectedInterest1);
    expect(renewResult.contract.interestPaidThroughDate.getTime()).toBe(
      paymentDate.getTime(),
    );

    const events = await db.prisma.pawnEvent.findMany({
      where: { contractId: contract.id },
      orderBy: { createdAt: "asc" },
    });
    expect(events.map((e) => e.eventType)).toEqual([
      PawnEventType.OPEN,
      PawnEventType.RENEW_INTEREST,
    ]);

    const redeemDate = new Date(paymentDate.getTime() + 10 * 86_400_000);
    const expectedInterest2 = calculateAccruedInterest({
      principalSatang: 10_000_000n,
      annualRatePercent: 12,
      fromDate: paymentDate,
      toDate: redeemDate,
    });

    const redeemResult = await redeemContract(db.prisma, {
      contractId: contract.id,
      actorId: cashierId,
      redeemDate,
    });

    expect(redeemResult.interestPaidSatang).toBe(expectedInterest2);
    expect(redeemResult.totalPayableSatang).toBe(
      10_000_000n + expectedInterest2,
    );
    expect(redeemResult.contract.status).toBe(PawnContractStatus.REDEEMED);

    // ไถ่ถอนแล้วต้องไม่มีการสร้างสต๊อกใดๆ (ทองไม่เคยเป็นของร้าน)
    const invItem = await db.prisma.inventoryItem.findUnique({
      where: { serialNo: contract.docNo },
    });
    expect(invItem).toBeNull();
  });

  it("2. เปิดสัญญาที่เกินระยะผ่อนผัน -> อนุมัติทองหลุด -> โอนเข้าสต๊อกจริง", async () => {
    // จำลองสัญญาที่เกินกำหนดมานานแล้ว (เกินระยะผ่อนผัน default 7 วัน)
    const contract = await createOverdueContract({
      docNo: "PWN-TEST-FORFEIT-001",
      principalSatang: 20_000_000n,
      weightMg: 30320n,
      annualInterestRatePercent: 15,
      dueDaysAgo: 10,
    });

    const result = await forfeitContract(db.prisma, {
      contractId: contract.id,
      approverUsername: managerUsername,
      pin: "551234",
      actorId: cashierId,
    });

    expect(result.contract.status).toBe(PawnContractStatus.FORFEITED);

    const invItem = await db.prisma.inventoryItem.findUnique({
      where: { id: result.inventoryItemId },
    });
    expect(invItem).not.toBeNull();
    expect(invItem?.serialNo).toBe(contract.docNo);
    expect(invItem?.status).toBe("IN_STOCK");
    expect(invItem?.source).toBe("PAWN_FORFEIT");
    expect(invItem?.costSatang).toBe(20_000_000n); // เงินต้น ไม่รวมดอกเบี้ยค้าง
    expect(invItem?.weightMg).toBe(30320n);

    const movement = await db.prisma.stockMovement.findFirst({
      where: { refType: "pawn_contract", refId: contract.id },
    });
    expect(movement).not.toBeNull();
    expect(movement?.movementType).toBe("PAWN_FORFEIT_IN");
    expect(movement?.quantity).toBe(1);
    expect(movement?.weightMg).toBe(30320n);
    expect(movement?.costSatang).toBe(20_000_000n);
  });

  it("3. ห้ามอนุมัติทองหลุดก่อนพ้นระยะผ่อนผัน", async () => {
    const contract = await openContract(db.prisma, {
      branchId,
      customerName: "ทดสอบ ผ่อนผัน",
      description: "กำไลทอง 1 บาท",
      weightMg: 15160n,
      goldPurity: 96.5,
      principalSatang: 5_000_000n,
      annualInterestRatePercent: 10,
      termMonths: 1,
      actorId: cashierId,
    });

    await expect(
      forfeitContract(db.prisma, {
        contractId: contract.id,
        approverUsername: managerUsername,
        pin: "551234",
        actorId: cashierId,
      }),
    ).rejects.toThrow("ยังไม่พ้นระยะผ่อนผัน");
  });

  it("4. ห้าม transition ผิดสถานะ (ไถ่ถอนสัญญาที่หลุดไปแล้ว / ต่อดอกสัญญาที่ไถ่ถอนแล้ว)", async () => {
    const forfeited = await db.prisma.pawnContract.findFirstOrThrow({
      where: { status: PawnContractStatus.FORFEITED },
    });
    await expect(
      redeemContract(db.prisma, {
        contractId: forfeited.id,
        actorId: cashierId,
      }),
    ).rejects.toThrow("ไม่ได้อยู่ในสถานะ ACTIVE");

    const redeemed = await db.prisma.pawnContract.findFirstOrThrow({
      where: { status: PawnContractStatus.REDEEMED },
    });
    await expect(
      renewInterest(db.prisma, { contractId: redeemed.id, actorId: cashierId }),
    ).rejects.toThrow("ไม่ได้อยู่ในสถานะ ACTIVE");
  });

  it("5. ปรับเพิ่มเงินต้นกลางสัญญา ต้องเคลียร์ดอกเบี้ยค้างก่อนเสมอ", async () => {
    const contract = await openContract(db.prisma, {
      branchId,
      customerName: "ทดสอบ ปรับเงินต้น",
      description: "สร้อยข้อมือทอง 1 บาท",
      weightMg: 15160n,
      goldPurity: 96.5,
      principalSatang: 5_000_000n,
      annualInterestRatePercent: 10,
      termMonths: 2,
      actorId: cashierId,
    });

    const adjustDate = new Date(contract.startDate.getTime() + 10 * 86_400_000);
    const expectedInterest = calculateAccruedInterest({
      principalSatang: 5_000_000n,
      annualRatePercent: 10,
      fromDate: contract.startDate,
      toDate: adjustDate,
    });

    const result = await adjustPrincipal(db.prisma, {
      contractId: contract.id,
      deltaSatang: 1_000_000n,
      actorId: cashierId,
      adjustmentDate: adjustDate,
    });

    expect(result.interestSettledSatang).toBe(expectedInterest);
    expect(result.contract.principalSatang).toBe(6_000_000n);
    expect(result.contract.interestPaidThroughDate.getTime()).toBe(
      adjustDate.getTime(),
    );

    const event = await db.prisma.pawnEvent.findFirst({
      where: { contractId: contract.id, eventType: "PRINCIPAL_INCREASE" },
    });
    expect(event?.principalBeforeSatang).toBe(5_000_000n);
    expect(event?.principalAfterSatang).toBe(6_000_000n);
  });

  it("6. ยกเลิกสัญญาทันทีหลังเปิดได้ แต่ยกเลิกสัญญาที่ต่อดอกไปแล้วไม่ได้", async () => {
    const fresh = await openContract(db.prisma, {
      branchId,
      customerName: "ทดสอบ ยกเลิก",
      description: "ต่างหูทอง",
      weightMg: 5000n,
      goldPurity: 96.5,
      principalSatang: 1_000_000n,
      annualInterestRatePercent: 10,
      termMonths: 1,
      actorId: cashierId,
    });

    const cancelled = await cancelContract(db.prisma, {
      contractId: fresh.id,
      reason: "กรอกข้อมูลผิด เปิดซ้ำ",
      approverUsername: managerUsername,
      pin: "551234",
      actorId: cashierId,
    });
    expect(cancelled.status).toBe(PawnContractStatus.CANCELLED);
    expect(cancelled.cancelReason).toBe("กรอกข้อมูลผิด เปิดซ้ำ");

    const renewed = await openContract(db.prisma, {
      branchId,
      customerName: "ทดสอบ ยกเลิกไม่ได้",
      description: "ต่างหูทองคู่ที่สอง",
      weightMg: 5000n,
      goldPurity: 96.5,
      principalSatang: 1_000_000n,
      annualInterestRatePercent: 10,
      termMonths: 1,
      actorId: cashierId,
    });
    await renewInterest(db.prisma, {
      contractId: renewed.id,
      actorId: cashierId,
      paymentDate: new Date(renewed.startDate.getTime() + 5 * 86_400_000),
    });

    await expect(
      cancelContract(db.prisma, {
        contractId: renewed.id,
        reason: "ลองยกเลิกหลังต่อดอก",
        approverUsername: managerUsername,
        pin: "551234",
        actorId: cashierId,
      }),
    ).rejects.toThrow("ไม่สามารถยกเลิกสัญญาที่มีการต่อดอก");
  });

  it("7. เปิดสัญญาด้วยอัตราดอกเบี้ยเกินเพดานตามกฎหมายต้องถูกปฏิเสธ", async () => {
    await expect(
      openContract(db.prisma, {
        branchId,
        customerName: "ทดสอบ ดอกเบี้ยเกินเพดาน",
        description: "แหวนทอง",
        weightMg: 15160n,
        goldPurity: 96.5,
        principalSatang: 1_000_000n,
        annualInterestRatePercent: 20, // เกินเพดาน default 15%
        termMonths: 1,
        actorId: cashierId,
      }),
    ).rejects.toThrow("เกินเพดานตามกฎหมาย");
  });

  it("8. อนุมัติทองหลุดพร้อมกัน 2 คำขอบนสัญญาเดียวกัน -> สำเร็จครั้งเดียว (concurrency)", async () => {
    const contract = await createOverdueContract({
      docNo: "PWN-TEST-CONCURRENCY-001",
      principalSatang: 30_000_000n,
      weightMg: 45480n,
      annualInterestRatePercent: 15,
      dueDaysAgo: 10,
    });

    const results = await Promise.allSettled([
      db.prisma.$transaction(async (tx) =>
        forfeitContract(tx, {
          contractId: contract.id,
          approverUsername: managerUsername,
          pin: "551234",
          actorId: cashierId,
        }),
      ),
      db.prisma.$transaction(async (tx) =>
        forfeitContract(tx, {
          contractId: contract.id,
          approverUsername: managerUsername,
          pin: "551234",
          actorId: cashierId,
        }),
      ),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    const finalContract = await db.prisma.pawnContract.findUniqueOrThrow({
      where: { id: contract.id },
    });
    expect(finalContract.status).toBe(PawnContractStatus.FORFEITED);

    // ต้องมี InventoryItem/StockMovement จากทองหลุดแค่ชุดเดียวเท่านั้น
    const items = await db.prisma.inventoryItem.findMany({
      where: { serialNo: contract.docNo },
    });
    expect(items.length).toBe(1);
  }, 30_000);
});
