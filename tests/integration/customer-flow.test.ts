// Integration Test: โปรไฟล์ลูกค้า CRM (Phase 6)
// ครอบคลุม: กันลงทะเบียนซ้ำด้วยเลขบัตร ปชช., แก้ไขโปรไฟล์, PDPA consent/anonymize (step-up),
// แต้มสะสม/ระดับ, ประวัติธุรกรรมรวมข้ามโมดูล
// รันด้วย: pnpm test:integration tests/integration/customer-flow.test.ts
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";
import {
  createCustomer,
  updateCustomer,
  setConsent,
  anonymizeCustomer,
  awardLoyaltyPoints,
  getCustomerTransactionHistory,
  maskCitizenId,
} from "@/server/services/customer.service";
import { openContract } from "@/server/services/pawn.service";
import { setApprovalPin } from "@/server/services/approval.service";
import { seedRbac } from "@/server/services/rbac-seed";

let db: TestDb;
let branchId: string;
let cashierId: string;
let managerId: string;
const managerUsername = "customer-manager";

beforeAll(async () => {
  db = await startTestDb();
  await seedRbac(db.prisma);

  const branch = await db.prisma.branch.create({
    data: { code: "CUS01", name: "สาขาทดสอบลูกค้า" },
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
      username: "customer-cashier",
      passwordHash: "$argon2id$dummy",
      displayName: "พนักงานลงทะเบียนลูกค้า",
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
    pin: "991234",
    actorId: managerId,
  });

  await db.prisma.setting.upsert({
    where: { key: "loyalty.tier_silver_points" },
    update: { value: 100 },
    create: { key: "loyalty.tier_silver_points", value: 100 },
  });
  await db.prisma.setting.upsert({
    where: { key: "loyalty.tier_gold_points" },
    update: { value: 500 },
    create: { key: "loyalty.tier_gold_points", value: 500 },
  });
  await db.prisma.setting.upsert({
    where: { key: "loyalty.baht_per_point" },
    update: { value: 100 },
    create: { key: "loyalty.baht_per_point", value: 100 },
  });
}, 180_000);

afterAll(async () => {
  await stopTestDb(db);
});

describe("Customer CRM", () => {
  it("1. ลงทะเบียนลูกค้าใหม่ต้องเข้ารหัสเลขบัตร ปชช. และกันลงทะเบียนซ้ำ", async () => {
    const customer = await createCustomer(db.prisma, {
      name: "วิชัย ทองดี",
      phone: "0891234567",
      citizenId: "1234567890123",
      actorId: cashierId,
    });
    expect(customer.code).toMatch(/^CUS-\d{6}$/);
    expect(customer.citizenIdEnc).not.toBe("1234567890123");
    expect(customer.citizenIdHash).toBeTruthy();

    await expect(
      createCustomer(db.prisma, {
        name: "วิชัย ทองดี (สะกดต่าง)",
        citizenId: "1234567890123",
        actorId: cashierId,
      }),
    ).rejects.toThrow("มีอยู่แล้วในระบบ");
  });

  it("2. แก้ไขโปรไฟล์ลูกค้า", async () => {
    const customer = await createCustomer(db.prisma, {
      name: "สมศรี ใจงาม",
      actorId: cashierId,
    });

    const updated = await updateCustomer(db.prisma, {
      customerId: customer.id,
      phone: "0899999999",
      address: "123 ถนนเยาวราช",
      actorId: cashierId,
    });
    expect(updated.phone).toBe("0899999999");
    expect(updated.address).toBe("123 ถนนเยาวราช");
    expect(updated.name).toBe("สมศรี ใจงาม"); // ไม่ได้ระบุ name ใหม่ ต้องคงเดิม
  });

  it("3. PDPA: ให้/ถอนความยินยอม แล้วล้างข้อมูลส่วนตัว (anonymize) ต้องมี PIN อนุมัติ", async () => {
    const customer = await createCustomer(db.prisma, {
      name: "ประยุทธ มั่งมี",
      phone: "0812223333",
      citizenId: "9999999999999",
      actorId: cashierId,
    });

    const consented = await setConsent(db.prisma, {
      customerId: customer.id,
      given: true,
      actorId: cashierId,
    });
    expect(consented.consentGivenAt).not.toBeNull();

    const withdrawn = await setConsent(db.prisma, {
      customerId: customer.id,
      given: false,
      actorId: cashierId,
    });
    expect(withdrawn.consentWithdrawnAt).not.toBeNull();

    const anonymized = await anonymizeCustomer(db.prisma, {
      customerId: customer.id,
      approverUsername: managerUsername,
      pin: "991234",
      actorId: cashierId,
    });
    expect(anonymized.name).not.toBe("ประยุทธ มั่งมี");
    expect(anonymized.phone).toBeNull();
    expect(anonymized.citizenIdEnc).toBeNull();
    expect(anonymized.citizenIdHash).toBeNull();
    expect(anonymized.anonymizedAt).not.toBeNull();
  });

  it("4. แต้มสะสมคำนวณตามยอดใช้จ่าย และปรับระดับ (tier) อัตโนมัติเมื่อถึงเกณฑ์", async () => {
    const customer = await createCustomer(db.prisma, {
      name: "ทดสอบ แต้มสะสม",
      actorId: cashierId,
    });
    expect(customer.tier).toBe("BRONZE");

    // 100 บาท/แต้ม, ใช้จ่าย 15,000 บาท -> 150 แต้ม -> ถึงเกณฑ์ SILVER (100 แต้ม)
    await awardLoyaltyPoints(db.prisma, {
      customerId: customer.id,
      amountSatang: 1_500_000n,
    });
    const afterFirst = await db.prisma.customer.findUniqueOrThrow({
      where: { id: customer.id },
    });
    expect(afterFirst.loyaltyPoints).toBe(150);
    expect(afterFirst.tier).toBe("SILVER");

    // ใช้จ่ายเพิ่มอีก 50,000 บาท -> รวม 650 แต้ม -> ถึงเกณฑ์ GOLD (500 แต้ม)
    await awardLoyaltyPoints(db.prisma, {
      customerId: customer.id,
      amountSatang: 5_000_000n,
    });
    const afterSecond = await db.prisma.customer.findUniqueOrThrow({
      where: { id: customer.id },
    });
    expect(afterSecond.loyaltyPoints).toBe(650);
    expect(afterSecond.tier).toBe("GOLD");
  });

  it("5. ประวัติธุรกรรมรวมข้ามโมดูล (เช่น สัญญาขายฝาก) ต้องดึงมาแสดงได้", async () => {
    const customer = await createCustomer(db.prisma, {
      name: "ทดสอบ ประวัติธุรกรรม",
      actorId: cashierId,
    });

    await openContract(db.prisma, {
      branchId,
      customerId: customer.id,
      customerName: customer.name,
      description: "แหวนทองทดสอบประวัติ",
      weightMg: 5000n,
      goldPurity: 96.5,
      principalSatang: 1_000_000n,
      annualInterestRatePercent: 10,
      termMonths: 1,
      actorId: cashierId,
    });

    const history = await getCustomerTransactionHistory(db.prisma, customer.id);
    expect(history.length).toBeGreaterThanOrEqual(1);
    expect(history[0].type).toBe("PAWN");
  });

  it("6. มาสก์เลขบัตร ปชช. ต้องเห็นเฉพาะ 4 หลักท้าย", () => {
    expect(maskCitizenId("1234567890123")).toBe("xxxxxxxxx0123");
  });
});
