// Integration Test: บัญชีออมทอง (Phase 6) — เปิดบัญชี -> ฝาก -> ปิดบัญชีทุกกรณี
// ครอบคลุม: ครบ (รับทอง), ยกเลิก (รับเงินคืน), ผิดนัด (step-up approval), รายงานภาระผูกพัน,
// การกันทำ transition ผิดสถานะ, concurrency ปิดบัญชีซ้ำสำเร็จครั้งเดียว
// รันด้วย: pnpm test:integration tests/integration/savings-flow.test.ts
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";
import {
  SavingsAccountStatus,
  SavingsAccountType,
} from "@/generated/prisma/client";
import {
  openAccount,
  deposit,
  closeForGold,
  closeForCash,
  closeDefaulted,
  getStatement,
  getLiabilityReport,
} from "@/server/services/savings.service";
import {
  convertCashToWeightMg,
  convertWeightToCashSatang,
} from "@/server/domain/savings";
import { setApprovalPin } from "@/server/services/approval.service";
import { seedRbac } from "@/server/services/rbac-seed";

let db: TestDb;
let branchId: string;
let cashierId: string;
let managerId: string;
const managerUsername = "savings-manager";

const ORNAMENT_SELL = 4_060_000n; // 40,600 บาท
const ORNAMENT_BUY = 3_920_000n; // 39,200 บาท

beforeAll(async () => {
  db = await startTestDb();
  await seedRbac(db.prisma);

  const branch = await db.prisma.branch.create({
    data: { code: "SAV01", name: "สาขาทดสอบออมทอง" },
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
      username: "savings-cashier",
      passwordHash: "$argon2id$dummy",
      displayName: "พนักงานออมทอง",
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
    pin: "771234",
    actorId: managerId,
  });

  await db.prisma.shopPriceAnnouncement.create({
    data: {
      barBuy: 4_000_000n,
      barSell: 4_010_000n,
      ornamentBuy: ORNAMENT_BUY,
      ornamentSell: ORNAMENT_SELL,
      announcedBy: managerId,
    },
  });
}, 180_000);

afterAll(async () => {
  await stopTestDb(db);
});

describe("Gold Savings Account Lifecycle", () => {
  it("1. ออมเงิน (CASH_SAVINGS): เปิดบัญชี -> ฝาก 2 ครั้ง -> ปิดบัญชีรับทอง (ครบ)", async () => {
    const account = await openAccount(db.prisma, {
      branchId,
      accountType: SavingsAccountType.CASH_SAVINGS,
      actorId: cashierId,
    });
    expect(account.status).toBe(SavingsAccountStatus.ACTIVE);

    await deposit(db.prisma, {
      accountId: account.id,
      amountSatang: 500_000n,
      actorId: cashierId,
    });
    const afterSecond = await deposit(db.prisma, {
      accountId: account.id,
      amountSatang: 300_000n,
      actorId: cashierId,
    });
    expect(afterSecond.account.balanceSatang).toBe(800_000n);
    expect(afterSecond.weightAddedMg).toBeNull();

    const result = await closeForGold(db.prisma, {
      accountId: account.id,
      actorId: cashierId,
    });
    const expectedWeight = convertCashToWeightMg(800_000n, ORNAMENT_SELL);
    expect(result.entitledWeightMg).toBe(expectedWeight);
    expect(result.account.status).toBe(SavingsAccountStatus.CLOSED_GOLD);

    const statement = await getStatement(db.prisma, account.id);
    expect(statement.map((s) => s.txType)).toEqual([
      "CLOSE_GOLD",
      "DEPOSIT",
      "DEPOSIT",
      "OPEN",
    ]);
  });

  it("2. ออมน้ำหนัก (WEIGHT_SAVINGS): ฝากแปลงเป็นน้ำหนักทันที -> ปิดบัญชีรับทองไม่ต้องแปลงซ้ำ", async () => {
    const account = await openAccount(db.prisma, {
      branchId,
      accountType: SavingsAccountType.WEIGHT_SAVINGS,
      actorId: cashierId,
    });

    const first = await deposit(db.prisma, {
      accountId: account.id,
      amountSatang: 2_030_000n,
      actorId: cashierId,
    });
    const expectedFirstWeight = convertCashToWeightMg(
      2_030_000n,
      ORNAMENT_SELL,
    );
    expect(first.weightAddedMg).toBe(expectedFirstWeight);

    const second = await deposit(db.prisma, {
      accountId: account.id,
      amountSatang: 1_015_000n,
      actorId: cashierId,
    });
    const expectedSecondWeight = convertCashToWeightMg(
      1_015_000n,
      ORNAMENT_SELL,
    );
    expect(second.account.balanceWeightMg).toBe(
      expectedFirstWeight + expectedSecondWeight,
    );

    const result = await closeForGold(db.prisma, {
      accountId: account.id,
      actorId: cashierId,
    });
    expect(result.entitledWeightMg).toBe(second.account.balanceWeightMg);
  });

  it("3. ยกเลิกบัญชีออมเงินกลางคัน -> คืนเงินเต็มจำนวนไม่มีค่าปรับ", async () => {
    const account = await openAccount(db.prisma, {
      branchId,
      accountType: SavingsAccountType.CASH_SAVINGS,
      actorId: cashierId,
    });
    await deposit(db.prisma, {
      accountId: account.id,
      amountSatang: 400_000n,
      actorId: cashierId,
    });

    const result = await closeForCash(db.prisma, {
      accountId: account.id,
      actorId: cashierId,
    });
    expect(result.refundSatang).toBe(400_000n);
    expect(result.account.status).toBe(SavingsAccountStatus.CLOSED_CASH);
  });

  it("4. ยกเลิกบัญชีออมน้ำหนักกลางคัน -> แปลงน้ำหนักคืนเป็นเงินด้วยราคารับซื้อ", async () => {
    const account = await openAccount(db.prisma, {
      branchId,
      accountType: SavingsAccountType.WEIGHT_SAVINGS,
      actorId: cashierId,
    });
    const depositResult = await deposit(db.prisma, {
      accountId: account.id,
      amountSatang: 2_030_000n,
      actorId: cashierId,
    });

    const result = await closeForCash(db.prisma, {
      accountId: account.id,
      actorId: cashierId,
    });
    const expectedRefund = convertWeightToCashSatang(
      depositResult.account.balanceWeightMg,
      ORNAMENT_BUY,
    );
    expect(result.refundSatang).toBe(expectedRefund);
  });

  it("5. ปิดบัญชีกรณีผิดนัด ต้องมี PIN อนุมัติ และบันทึกเหตุผล", async () => {
    const account = await openAccount(db.prisma, {
      branchId,
      accountType: SavingsAccountType.CASH_SAVINGS,
      actorId: cashierId,
    });
    await deposit(db.prisma, {
      accountId: account.id,
      amountSatang: 200_000n,
      actorId: cashierId,
    });

    await expect(
      closeDefaulted(db.prisma, {
        accountId: account.id,
        approverUsername: managerUsername,
        pin: "wrong-pin",
        reason: "ไม่ฝากตามกำหนดต่อเนื่อง 3 งวด",
        actorId: cashierId,
      }),
    ).rejects.toThrow();

    const result = await closeDefaulted(db.prisma, {
      accountId: account.id,
      approverUsername: managerUsername,
      pin: "771234",
      reason: "ไม่ฝากตามกำหนดต่อเนื่อง 3 งวด",
      actorId: cashierId,
    });
    expect(result.account.status).toBe(SavingsAccountStatus.CLOSED_DEFAULTED);
    expect(result.refundSatang).toBe(200_000n);
  });

  it("6. ห้ามฝาก/ปิดบัญชีที่ปิดไปแล้ว", async () => {
    const account = await openAccount(db.prisma, {
      branchId,
      accountType: SavingsAccountType.CASH_SAVINGS,
      actorId: cashierId,
    });
    await closeForCash(db.prisma, {
      accountId: account.id,
      actorId: cashierId,
    });

    await expect(
      deposit(db.prisma, {
        accountId: account.id,
        amountSatang: 100_000n,
        actorId: cashierId,
      }),
    ).rejects.toThrow("ไม่ได้อยู่ในสถานะ ACTIVE");

    await expect(
      closeForGold(db.prisma, { accountId: account.id, actorId: cashierId }),
    ).rejects.toThrow("ไม่ได้อยู่ในสถานะ ACTIVE");
  });

  it("7. รายงานภาระผูกพันรวมยอดบัญชี ACTIVE ทั้งสองประเภทถูกต้อง", async () => {
    const cashAcc = await openAccount(db.prisma, {
      branchId,
      accountType: SavingsAccountType.CASH_SAVINGS,
      actorId: cashierId,
    });
    await deposit(db.prisma, {
      accountId: cashAcc.id,
      amountSatang: 1_000_000n,
      actorId: cashierId,
    });

    const weightAcc = await openAccount(db.prisma, {
      branchId,
      accountType: SavingsAccountType.WEIGHT_SAVINGS,
      actorId: cashierId,
    });
    await deposit(db.prisma, {
      accountId: weightAcc.id,
      amountSatang: 4_060_000n, // = 15,160 มก. พอดี ที่ราคาขายออก 40,600 บาท
      actorId: cashierId,
    });

    const report = await getLiabilityReport(db.prisma, branchId);
    expect(report.cashSavingsTotalSatang).toBeGreaterThanOrEqual(1_000_000n);
    expect(report.weightSavingsTotalWeightMg).toBeGreaterThanOrEqual(15_160n);
    expect(report.totalEstimatedLiabilitySatang).toBe(
      report.cashSavingsTotalSatang +
        report.weightSavingsEstimatedLiabilitySatang,
    );
  });

  it("8. ปิดบัญชีพร้อมกัน 2 คำขอบนบัญชีเดียวกัน -> สำเร็จครั้งเดียว (concurrency)", async () => {
    const account = await openAccount(db.prisma, {
      branchId,
      accountType: SavingsAccountType.CASH_SAVINGS,
      actorId: cashierId,
    });
    await deposit(db.prisma, {
      accountId: account.id,
      amountSatang: 100_000n,
      actorId: cashierId,
    });

    const results = await Promise.allSettled([
      db.prisma.$transaction(async (tx) =>
        closeForCash(tx, { accountId: account.id, actorId: cashierId }),
      ),
      db.prisma.$transaction(async (tx) =>
        closeForCash(tx, { accountId: account.id, actorId: cashierId }),
      ),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    const finalAccount = await db.prisma.savingsAccount.findUniqueOrThrow({
      where: { id: account.id },
    });
    expect(finalAccount.status).toBe(SavingsAccountStatus.CLOSED_CASH);
  }, 30_000);
});
