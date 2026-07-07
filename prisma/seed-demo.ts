import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  ItemStatus,
  ShiftStatus,
  PawnContractStatus,
  PawnEventType,
  WorkOrderStatus,
} from "../src/generated/prisma/client";
import { Pool } from "pg";
import { hashPassword } from "../src/server/security/password";
import { encryptString, hmacHash } from "../src/server/security/crypto";
import { seedRbac } from "../src/server/services/rbac-seed";
import { seedChartOfAccounts } from "../src/server/services/accounting-seed";
import { backfillJournalEntries } from "../src/server/services/accounting-backfill.service";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(
    "=== เริ่มต้นกระบวนการ Seed ข้อมูลสาธิตแบบสมจริง (Demo Seed) ===",
  );

  // 1) รัน Seed พื้นฐานก่อนเพื่อเติมสิทธิ์ บทบาท และผังบัญชี
  await seedRbac(prisma);
  await seedChartOfAccounts(prisma);
  console.log("seed-demo: อัปเดตสิทธิ์ และผังบัญชีพื้นฐานเรียบร้อย");

  // 2) สร้าง/อัปเดตสาขา
  const hq = await prisma.branch.upsert({
    where: { code: "HQ" },
    update: {},
    create: {
      code: "HQ",
      name: "สำนักงานใหญ่เยาวราช",
      address: "123 ถ.เยาวราช สัมพันธวงศ์ กรุงเทพฯ",
    },
  });

  const bkk01 = await prisma.branch.upsert({
    where: { code: "BKK01" },
    update: {},
    create: {
      code: "BKK01",
      name: "สาขาลาดพร้าว",
      address: "456 ถ.ลาดพร้าว ห้วยขวาง กรุงเทพฯ",
    },
  });

  await prisma.branch.upsert({
    where: { code: "BKK02" },
    update: {},
    create: {
      code: "BKK02",
      name: "สาขาปิ่นเกล้า",
      address: "789 ถ.บรมราชชนนี บางพลัด กรุงเทพฯ",
    },
  });
  console.log("seed-demo: โหลดข้อมูลสาขาเรียบร้อย");

  // 3) สร้างบทบาทระบบเพิ่มเติมของผู้ใช้งานและบัญชีผู้ใช้
  const ownerRole = await prisma.role.findUniqueOrThrow({
    where: { code: "OWNER" },
  });
  const managerRole = await prisma.role.findUniqueOrThrow({
    where: { code: "BRANCH_MANAGER" },
  });
  const cashierRole = await prisma.role.findUniqueOrThrow({
    where: { code: "CASHIER" },
  });
  const keeperRole = await prisma.role.findUniqueOrThrow({
    where: { code: "STOCK_KEEPER" },
  });
  const accountantRole = await prisma.role.findUniqueOrThrow({
    where: { code: "ACCOUNTANT" },
  });
  await prisma.role.findUniqueOrThrow({ where: { code: "ADMIN" } });

  const hashedDefaultPassword = await hashPassword("ChangeMe-1234");
  const hashedPin = await hashPassword("999999"); // default step-up pin

  // บัญชี Owner
  const ownerUser = await prisma.user.upsert({
    where: { username: "owner" },
    update: {},
    create: {
      username: "owner",
      displayName: "คุณสมชาย เจริญทอง (เจ้าของร้าน)",
      passwordHash: hashedDefaultPassword,
      approvalPinHash: hashedPin,
      userBranchRoles: { create: { branchId: hq.id, roleId: ownerRole.id } },
    },
  });

  // บัญชีผู้จัดการสาขาลาดพร้าว
  const managerUser = await prisma.user.upsert({
    where: { username: "manager_bkk" },
    update: {},
    create: {
      username: "manager_bkk",
      displayName: "คุณสมยศ ยอดนักสู้ (ผู้จัดการสาขา)",
      passwordHash: hashedDefaultPassword,
      approvalPinHash: hashedPin,
      userBranchRoles: {
        create: { branchId: bkk01.id, roleId: managerRole.id },
      },
    },
  });

  // บัญชีพนักงานขาย ลาดพร้าว
  const cashierUser = await prisma.user.upsert({
    where: { username: "cashier_bkk" },
    update: {},
    create: {
      username: "cashier_bkk",
      displayName: "นางสาวศิริพร ใจงาม (พนักงานขาย)",
      passwordHash: hashedDefaultPassword,
      userBranchRoles: {
        create: { branchId: bkk01.id, roleId: cashierRole.id },
      },
    },
  });

  // บัญชีพนักงานคลัง ลาดพร้าว
  await prisma.user.upsert({
    where: { username: "keeper_bkk" },
    update: {},
    create: {
      username: "keeper_bkk",
      displayName: "นายขยัน ซื่อตรง (พนักงานสต๊อก)",
      passwordHash: hashedDefaultPassword,
      userBranchRoles: {
        create: { branchId: bkk01.id, roleId: keeperRole.id },
      },
    },
  });

  // ฝ่ายบัญชี
  await prisma.user.upsert({
    where: { username: "accountant" },
    update: {},
    create: {
      username: "accountant",
      displayName: "นางสาวกานดา รักตัวเลข (นักบัญชี)",
      passwordHash: hashedDefaultPassword,
      userBranchRoles: {
        create: { branchId: hq.id, roleId: accountantRole.id },
      },
    },
  });
  console.log(
    "seed-demo: โหลดข้อมูลบัญชีผู้ใช้งานระบบเรียบร้อย (รหัสผ่านเริ่มต้น: ChangeMe-1234, PIN: 999999)",
  );

  // 4) สร้างหมวดหมู่สินค้าและแบบสินค้า
  const catOrnament = await prisma.productCategory.upsert({
    where: { code: "ORNAMENT_965" },
    update: {},
    create: {
      code: "ORNAMENT_965",
      name: "ทองรูปพรรณ 96.5%",
      defaultLaborCharge: 150000n,
    },
  });

  const catBar = await prisma.productCategory.upsert({
    where: { code: "BAR_965" },
    update: {},
    create: {
      code: "BAR_965",
      name: "ทองคำแท่ง 96.5%",
      defaultLaborCharge: 0n,
    },
  });

  // สร้าง Product
  const prodNecklace1B = await prisma.product.upsert({
    where: { sku: "NECK-965-1B" },
    update: {},
    create: {
      sku: "NECK-965-1B",
      name: "สร้อยคอเบนซ์ 1 บาท",
      categoryId: catOrnament.id,
      tracking: "SERIALIZED",
      goldPurity: 96.5,
    },
  });

  const prodRing2S = await prisma.product.upsert({
    where: { sku: "RING-965-2S" },
    update: {},
    create: {
      sku: "RING-965-2S",
      name: "แหวนหัวใจ 2 สลึง",
      categoryId: catOrnament.id,
      tracking: "SERIALIZED",
      goldPurity: 96.5,
    },
  });

  await prisma.product.upsert({
    where: { sku: "BAR-965-10B" },
    update: {},
    create: {
      sku: "BAR-965-10B",
      name: "ทองแท่งมาตรฐานสมาคม 10 บาท",
      categoryId: catBar.id,
      tracking: "COUNTED",
      goldPurity: 96.5,
      stdWeightMg: 152440n, // 15.244 กรัม * 10
    },
  });

  await prisma.product.upsert({
    where: { sku: "BAR-965-5B" },
    update: {},
    create: {
      sku: "BAR-965-5B",
      name: "ทองแท่งมาตรฐานสมาคม 5 บาท",
      categoryId: catBar.id,
      tracking: "COUNTED",
      goldPurity: 96.5,
      stdWeightMg: 76220n, // 15.244 กรัม * 5
    },
  });
  console.log("seed-demo: โหลดข้อมูลแบบสินค้า (Product Master) เรียบร้อย");

  // 5) สร้างสินค้าในคลังสินค้า (Inventory Items) ในสถานะพร้อมขาย
  await prisma.inventoryItem.deleteMany({
    where: {
      serialNo: {
        in: [
          "TAG-BKK01-0001",
          "TAG-BKK01-0002",
          "TAG-BKK01-0003",
          "TAG-BKK01-0004",
        ],
      },
    },
  });

  await prisma.inventoryItem.create({
    data: {
      serialNo: "TAG-BKK01-0001",
      productId: prodNecklace1B.id,
      branchId: bkk01.id,
      status: ItemStatus.IN_STOCK,
      weightMg: 15160n, // 15.16 กรัม
      goldPurity: 96.5,
      costSatang: 3850000n, // ทุน 38,500 บาท
      laborCharge: 120000n, // ค่ากำเหน็จหน้าร้านชิ้นนี้ 1,200 บาท
    },
  });

  await prisma.inventoryItem.create({
    data: {
      serialNo: "TAG-BKK01-0002",
      productId: prodNecklace1B.id,
      branchId: bkk01.id,
      status: ItemStatus.IN_STOCK,
      weightMg: 15190n, // 15.19 กรัม (มี tolerance)
      goldPurity: 96.5,
      costSatang: 3860000n,
      laborCharge: 150000n,
    },
  });

  await prisma.inventoryItem.create({
    data: {
      serialNo: "TAG-BKK01-0003",
      productId: prodRing2S.id,
      branchId: bkk01.id,
      status: ItemStatus.IN_STOCK,
      weightMg: 7580n, // 7.58 กรัม (2 สลึง)
      goldPurity: 96.5,
      costSatang: 1920000n,
      laborCharge: 80000n,
    },
  });

  await prisma.inventoryItem.create({
    data: {
      serialNo: "TAG-BKK01-0004",
      productId: prodRing2S.id,
      branchId: bkk01.id,
      status: ItemStatus.RESERVED, // ถูกจองรอส่งมอบ
      weightMg: 7580n,
      goldPurity: 96.5,
      costSatang: 1920000n,
      laborCharge: 80000n,
    },
  });
  console.log(
    "seed-demo: โหลดข้อมูลสต๊อกสินค้าหน้าร้าน (Inventory Items) เรียบร้อย",
  );

  // 6) ข้อมูลลูกค้า (Customer / KYC)
  await prisma.customer.deleteMany({
    where: {
      citizenIdHash: {
        in: [hmacHash("1100220033445"), hmacHash("3100550066778")],
      },
    },
  });

  const customer1 = await prisma.customer.create({
    data: {
      code: "CUS-2569-0001",
      name: "นายสมชาย ยินดีทอง",
      phone: "0812345678",
      address: "12/3 ซ.โชคชัย 4 ถ.ลาดพร้าว กรุงเทพฯ",
      citizenIdEnc: encryptString("1100220033445"),
      citizenIdHash: hmacHash("1100220033445"),
      tier: "GOLD",
      createdBy: ownerUser.id,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      code: "CUS-2569-0002",
      name: "นางสาวสมร รักออม",
      phone: "0898765432",
      address: "99 ถ.รัชดาภิเษก ห้วยขวาง กรุงเทพฯ",
      citizenIdEnc: encryptString("3100550066778"),
      citizenIdHash: hmacHash("3100550066778"),
      tier: "SILVER",
      createdBy: ownerUser.id,
    },
  });
  console.log("seed-demo: โหลดข้อมูลประวัติลูกค้า CRM & KYC เรียบร้อย");

  // 7) สร้างกะลิ้นชักและธุรกรรมในอดีต (ประวัติตอนเปิดร้าน/ขายจริง)
  // สร้างตู้เงินสดลิ้นชัก
  const drawerBkk = await prisma.cashDrawer.upsert({
    where: { id: "drawer-bkk01" },
    update: {},
    create: {
      id: "drawer-bkk01",
      branchId: bkk01.id,
      code: "DRAWER-BKK-01",
      name: "เครื่องขายหน้า 1",
    },
  });

  // ใช้ unique suffix เพื่อรับสิทธิ์ให้รันสคริปต์ซ้ำได้ (Idempotency) โดยไม่ชน Unique Constraint
  // และเคารพกฎ append-only ledger (ห้าม DELETE แถวธุรกรรม/Event ในระบบจริง)
  const seedSuffix = Date.now().toString().substring(6);

  // สร้างประกาศราคา
  await prisma.shopPriceAnnouncement.create({
    data: {
      barBuy: 4000000n,
      barSell: 4010000n,
      ornamentBuy: 3920000n,
      ornamentSell: 4060000n,
      announcedBy: ownerUser.id,
      announcedAt: new Date("2026-07-06T09:00:00Z"),
    },
  });

  await prisma.shift.create({
    data: {
      branchId: bkk01.id,
      drawerId: drawerBkk.id,
      openedById: cashierUser.id,
      openedAt: new Date("2026-07-06T08:30:00Z"),
      startCashSatang: 500000n, // ทุน 5,000 บาท
      closedById: cashierUser.id,
      closedAt: new Date("2026-07-06T17:30:00Z"),
      endCashSatang: 4610000n, // ปิดยอดสดจริง
      expectedCashSatang: 4610000n,
      status: ShiftStatus.RECONCILED,
      reconciledAt: new Date("2026-07-06T17:45:00Z"),
      reconciledById: managerUser.id,
    },
  });

  // 8) สัญญาขายฝากทองคำ (Pawn Contract)
  const pawnStartDate = new Date("2026-07-06T10:00:00Z");
  const pawnContract1 = await prisma.pawnContract.create({
    data: {
      docNo: `PAWN-BKK01-2569-${seedSuffix}`,
      branchId: bkk01.id,
      customerId: customer1.id,
      customerName: customer1.name,
      customerPhone: customer1.phone,
      customerCitizenIdEnc: customer1.citizenIdEnc,
      customerCitizenIdHash: customer1.citizenIdHash,
      status: PawnContractStatus.ACTIVE,
      description: "สร้อยคอเบนซ์ 1 บาท",
      weightMg: 15160n, // ทอง 1 บาท
      goldPurity: 96.5,
      principalSatang: 3000000n, // วงเงินกู้ 30,000 บาท
      annualInterestRatePercent: 15.0, // ดอกเบี้ย 1.25% ต่อเดือน * 12 = 15% ต่อปี
      termMonths: 4,
      startDate: pawnStartDate,
      dueDate: new Date("2026-11-06T17:00:00Z"),
      interestPaidThroughDate: pawnStartDate,
      createdBy: cashierUser.id,
      createdAt: pawnStartDate,
    },
  });

  await prisma.pawnEvent.create({
    data: {
      contractId: pawnContract1.id,
      eventType: PawnEventType.OPEN,
      principalBeforeSatang: 0n,
      principalAfterSatang: 3000000n, // เงินต้นสัญญา 30,000 บาท
      actorId: cashierUser.id,
      createdAt: pawnStartDate,
    },
  });

  // 9) บัญชีออมทอง (Gold Savings Account)
  const savingsAccount = await prisma.savingsAccount.create({
    data: {
      docNo: `SAVE-BKK01-${seedSuffix}`,
      branchId: bkk01.id,
      customerId: customer2.id,
      accountType: "WEIGHT_SAVINGS",
      balanceWeightMg: 3790n, // มีทองสะสมแล้ว 1 สลึง (3.79 กรัม)
      balanceSatang: 0n,
      status: "ACTIVE",
      createdBy: cashierUser.id,
      createdAt: new Date("2026-07-06T11:00:00Z"),
    },
  });

  // snapshot ราคาตอนทำรายการสะสม
  const priceAnnSnapshot = {
    barBuy: "4000000",
    barSell: "4010000",
    ornamentBuy: "3920000",
    ornamentSell: "4060000",
  };

  await prisma.savingsTransaction.create({
    data: {
      accountId: savingsAccount.id,
      txType: "DEPOSIT",
      amountSatang: 1000000n, // ฝากเป็นเงิน 10,000 บาท
      weightMg: 3790n,
      priceSnapshot: priceAnnSnapshot,
      actorId: cashierUser.id,
      createdAt: new Date("2026-07-06T11:00:00Z"),
    },
  });

  // 10) ใบสั่งงานช่าง/ซ่อมทอง (Work Order)
  const workOrder = await prisma.workOrder.create({
    data: {
      docNo: `JOB-BKK01-2569-${seedSuffix}`,
      branchId: bkk01.id,
      customerId: customer1.id,
      type: "REPAIR",
      description: "งานซ่อมขยายห่วงและชุบทองสร้อยคอเบนซ์ 1 บาท",
      status: WorkOrderStatus.IN_PROGRESS,
      serviceFeeSatang: 80000n, // ค่าบริการ 800 บาท
      depositSatang: 30000n, // มัดจำ 300 บาท
      promisedAt: new Date("2026-07-15T12:00:00Z"),
      createdBy: cashierUser.id,
      createdAt: new Date("2026-07-06T14:00:00Z"),
    },
  });

  await prisma.workOrderEvent.create({
    data: {
      workOrderId: workOrder.id,
      eventType: "RECEIVE",
      actorId: cashierUser.id,
      createdAt: new Date("2026-07-06T14:00:00Z"),
    },
  });

  // 11) รายการค่าใช้จ่ายทั่วไป (General Expenses)
  const expAccount = await prisma.account.findUniqueOrThrow({
    where: { code: "5100" },
  });

  await prisma.expense.create({
    data: {
      branchId: bkk01.id,
      accountId: expAccount.id,
      docNo: `EXP-BKK01-2569-${seedSuffix}`,
      expenseDate: new Date("2026-07-06T15:00:00Z"),
      amountSatang: 450000n, // 4,500 บาท
      description: "บิลค่าไฟฟ้าสาขาลาดพร้าว ประจำเดือน มิถุนายน",
      createdBy: managerUser.id,
    },
  });

  console.log(
    "seed-demo: โหลดข้อมูลอดีต (Pawn, Savings, WorkOrders, Expenses) เรียบร้อย",
  );

  // 12) รันโพสต์รายการทางบัญชีย้อนหลังอัตโนมัติ (Accounting Backfill)
  console.log(
    "seed-demo: กำลังทำการกระทบยอดและรันระบบบัญชีแยกประเภทคู่ (Double-entry Posting)...",
  );
  const backfillResult = await backfillJournalEntries(prisma, ownerUser.id);
  console.log(
    `seed-demo: โพสต์บัญชีสำเร็จจำนวน: ${backfillResult.postedCount} รายการ`,
  );
  if (backfillResult.failures.length > 0) {
    console.warn(
      `seed-demo: มีจุดล้มเหลวบัญชี ${backfillResult.failures.length} จุด:`,
      backfillResult.failures,
    );
  }

  console.log(
    "=== สิ้นสุดกระบวนการ Seed ข้อมูลสาธิตเรียบร้อย สมบูรณ์ 100% ===",
  );
}

main()
  .catch((e) => {
    console.error("เกิดข้อผิดพลาดในการรัน Demo Seed:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
