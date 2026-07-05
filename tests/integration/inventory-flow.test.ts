// Integration Test: ทะเบียนสต๊อกสินค้าและกระบวนการทำงานหลัก (Phase 3)
// ครอบคลุม: รับเข้า -> โอนย้าย -> ตรวจนับสต๊อก -> ส่งหลอมทองเก่า -> รายงานมูลค่า
// รันด้วย: pnpm test:integration tests/integration/inventory-flow.test.ts
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";
import {
  ItemStatus,
  TransferStatus,
  StockCountStatus,
  MeltLotStatus,
  ProductTracking,
} from "@/generated/prisma/client";
import {
  receiveFromSupplier,
  printLabelLog,
  getValuationReport,
  searchInventory,
} from "@/server/services/inventory.service";
import {
  createTransfer,
  sendTransfer,
  receiveTransfer,
} from "@/server/services/transfer.service";
import {
  startStockCount,
  submitForReview,
  approveStockCount,
} from "@/server/services/stock-count.service";
import {
  createMeltLot,
  sendToMelt,
  closeMeltLot,
} from "@/server/services/melt.service";
import { setApprovalPin } from "@/server/services/approval.service";
import { seedRbac } from "@/server/services/rbac-seed";

let db: TestDb;
let branchAId: string;
let branchBId: string;
let serializedProdId: string;
let countedProdId: string;
let userKeeperId: string;
const userManagerUsername = "manager-bkk01";
let userManagerId: string;

beforeAll(async () => {
  db = await startTestDb();
  await seedRbac(db.prisma);

  // 1) สร้างสาขาสำหรับทดสอบ
  const branchA = await db.prisma.branch.create({
    data: { code: "HQ", name: "สำนักงานใหญ่" },
  });
  branchAId = branchA.id;

  const branchB = await db.prisma.branch.create({
    data: { code: "BKK01", name: "สาขากรุงเทพ 01" },
  });
  branchBId = branchB.id;

  // 2) สร้างข้อมูลประเภทและแบบสินค้า
  const category = await db.prisma.productCategory.create({
    data: {
      code: "GOLD_JEWEL",
      name: "เครื่องประดับทอง",
      defaultLaborCharge: 100_000n,
    },
  });

  const prodSerialized = await db.prisma.product.create({
    data: {
      sku: "RING-1B-965",
      name: "แหวนทอง 1 บาท 96.5%",
      categoryId: category.id,
      tracking: ProductTracking.SERIALIZED,
      goldPurity: 96.5,
    },
  });
  serializedProdId = prodSerialized.id;

  const prodCounted = await db.prisma.product.create({
    data: {
      sku: "BAR-5B-965",
      name: "ทองแท่ง 5 บาท 96.5%",
      categoryId: category.id,
      tracking: ProductTracking.COUNTED,
      goldPurity: 96.5,
      stdWeightMg: 76220n, // 15.244 * 5 * 1000 = 76,220 mg
    },
  });
  countedProdId = prodCounted.id;

  // 3) สร้างบทบาทและสิทธิ์ผู้ใช้
  const roleKeeper = await db.prisma.role.findUniqueOrThrow({
    where: { code: "STOCK_KEEPER" },
  });
  const roleManager = await db.prisma.role.findUniqueOrThrow({
    where: { code: "BRANCH_MANAGER" },
  });

  const keeper = await db.prisma.user.create({
    data: {
      username: "keeper-hq",
      passwordHash: "$argon2id$dummy",
      displayName: "พนักงานสต๊อกสำนักงานใหญ่",
      userBranchRoles: {
        create: { branchId: branchAId, roleId: roleKeeper.id },
      },
    },
  });
  userKeeperId = keeper.id;

  const manager = await db.prisma.user.create({
    data: {
      username: userManagerUsername,
      passwordHash: "$argon2id$dummy",
      displayName: "ผู้จัดการสาขากรุงเทพ 01",
      userBranchRoles: {
        create: { branchId: branchBId, roleId: roleManager.id },
      },
    },
  });
  userManagerId = manager.id;

  // ตั้งค่ารหัสผ่าน PIN สำหรับการอนุมัติปรับสต๊อกของ Manager BKK01
  const pinResult = await setApprovalPin(db.prisma, {
    userId: manager.id,
    pin: "928374",
    actorId: manager.id,
  });
  expect(pinResult.ok).toBe(true);

  // ตั้งค่าราคาประกาศเริ่มต้นของร้าน (สำหรับใช้เทส Valuation Report)
  await db.prisma.shopPriceAnnouncement.create({
    data: {
      barBuy: 40_000_00n, // 40,000 บาท (สตางค์)
      barSell: 40_100_00n,
      ornamentBuy: 39_200_00n,
      ornamentSell: 40_600_00n,
      announcedBy: keeper.id,
    },
  });
}, 180_000);

afterAll(async () => {
  await stopTestDb(db);
});

describe("Inventory Flow End-to-End", () => {
  const itemSerialNo = "TAG-TEST-123";
  let itemId: string;

  it("1. รับเข้าสินค้า (Supplier Receipt)", async () => {
    // รับเข้าแบบ SERIALIZED
    const resSerialized = await receiveFromSupplier(db.prisma, {
      productId: serializedProdId,
      branchId: branchAId,
      weightMg: 15160n, // 1 บาททองรูปพรรณ
      goldPurity: 96.5,
      costSatang: 38_000_00n, // 38,000 บาท
      laborCharge: 800_00n,
      quantity: 1,
      serialNo: itemSerialNo,
      actorId: userKeeperId,
    });

    expect(resSerialized.success).toBe(true);
    expect(resSerialized.itemId).toBeDefined();
    itemId = resSerialized.itemId!;

    const item = await db.prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });
    expect(item?.status).toBe(ItemStatus.IN_STOCK);
    expect(item?.serialNo).toBe(itemSerialNo);

    // รับเข้าแบบ COUNTED (ทองแท่ง 5 บาท จำนวน 10 แท่ง)
    const resCounted = await receiveFromSupplier(db.prisma, {
      productId: countedProdId,
      branchId: branchAId,
      weightMg: 76220n * 10n,
      goldPurity: 96.5,
      costSatang: 2_000_000_00n, // 200,000 บาท
      quantity: 10,
      actorId: userKeeperId,
    });
    expect(resCounted.success).toBe(true);

    // ตรวจสอบยอดสต๊อกสะสมของ COUNTED จาก Ledger
    const balance = await db.prisma.stockMovement.aggregate({
      where: { productId: countedProdId },
      _sum: { quantity: true, weightMg: true },
    });
    expect(balance._sum.quantity).toBe(10);
    expect(balance._sum.weightMg).toBe(76220n * 10n);
  });

  it("2. พิมพ์ป้ายสินค้า (Print Label Log)", async () => {
    await printLabelLog(db.prisma, {
      itemId,
      actorId: userKeeperId,
      reason: "พิมพ์เพื่อทำใบรับประกัน",
    });

    const labels = await db.prisma.productLabel.findMany({
      where: { itemId },
    });
    expect(labels.length).toBe(1);
    expect(labels[0].reason).toBe("พิมพ์เพื่อทำใบรับประกัน");
  });

  it("3. สแกนค้นหาสินค้า (Search/Scan)", async () => {
    const items = await searchInventory(db.prisma, {
      query: "TAG-TEST-123",
      branchId: branchAId,
    });
    expect(items.length).toBe(1);
    expect(items[0].id).toBe(itemId);
  });

  it("4. โอนย้ายสินค้าข้ามสาขาแบบ 2-Step (Branch Transfer)", async () => {
    // สร้างใบโอนร่าง (DRAFT) สาขา A (HQ) -> B (BKK01)
    const transferDraft = await db.prisma.$transaction(async (tx) => {
      return createTransfer(tx, {
        fromBranchId: branchAId,
        toBranchId: branchBId,
        itemIds: [itemId],
        note: "ส่งแหวนทองไปเปิดสาขาใหม่",
        actorId: userKeeperId,
      });
    });

    expect(transferDraft.status).toBe(TransferStatus.DRAFT);
    expect(transferDraft.items.length).toBe(1);

    // ส่งสินค้า (DRAFT -> IN_TRANSIT)
    await db.prisma.$transaction(async (tx) => {
      await sendTransfer(tx, {
        transferId: transferDraft.id,
        actorId: userKeeperId,
      });
    });

    // เช็คว่าสินค้าในร้าน A ถูกตัดออกไปแล้ว และสถานะเป็น IN_TRANSIT
    const itemInTransit = await db.prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });
    expect(itemInTransit?.status).toBe(ItemStatus.IN_TRANSIT);

    // เช็คยอด Ledger สาขา A (ควรติดลบจากส่งออก)
    const movOut = await db.prisma.stockMovement.findFirst({
      where: {
        branchId: branchAId,
        productId: serializedProdId,
        movementType: "TRANSFER_OUT",
      },
    });
    expect(movOut?.quantity).toBe(-1);

    // รับของเข้าที่สาขาปลายทาง B (IN_TRANSIT -> COMPLETED)
    await db.prisma.$transaction(async (tx) => {
      await receiveTransfer(tx, {
        transferId: transferDraft.id,
        actorId: userManagerId, // ดำเนินการโดยผู้จัดการปลายทาง
      });
    });

    // เช็คสินค้าถูกเปลี่ยนเป็นสาขา B และสถานะกลับมาเป็น IN_STOCK
    const itemReceived = await db.prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });
    expect(itemReceived?.status).toBe(ItemStatus.IN_STOCK);
    expect(itemReceived?.branchId).toBe(branchBId);

    // เช็คยอด Ledger สาขา B (ได้รับเข้าบวก)
    const movIn = await db.prisma.stockMovement.findFirst({
      where: {
        branchId: branchBId,
        productId: serializedProdId,
        movementType: "TRANSFER_IN",
      },
    });
    expect(movIn?.quantity).toBe(1);
  });

  it("5. ตรวจนับสต๊อกสินค้าสูญหาย (Stock Count Adjustment)", async () => {
    // เปิดรอบตรวจนับที่สาขา B
    const countSession = await db.prisma.$transaction(async (tx) => {
      return startStockCount(tx, {
        branchId: branchBId,
        note: "เช็คสต๊อกวันหยุด",
        actorId: userManagerId,
      });
    });

    expect(countSession.status).toBe(StockCountStatus.OPEN);
    expect(countSession.items.length).toBe(1); // มีสินค้ารอตรวจ 1 ชิ้น (itemId)

    // สแกนยืนยันสินค้า แต่เราจะจำลองเหตุการณ์ว่าสินค้าหาย (ไม่ได้สแกน)
    // ส่งตรวจทาน (OPEN -> REVIEW)
    await db.prisma.$transaction(async (tx) => {
      await submitForReview(tx, {
        countId: countSession.id,
        actorId: userManagerId,
      });
    });

    // อนุมัติการปรับยอดสต๊อก (REVIEW -> APPROVED)
    // เนื่องจากไม่ได้กดสแกนยืนยัน (found = null) -> สินค้าชิ้นนั้นต้องเปลี่ยนเป็น MISSING
    await db.prisma.$transaction(async (tx) => {
      await approveStockCount(tx, {
        countId: countSession.id,
        approverUsername: userManagerUsername,
        pin: "928374", // PIN ของ Manager BKK01
        actorId: userKeeperId, // ทำรายการตรวจโดย Keeper (Maker) แต่ Manager (Checker) เป็นคนใส่ PIN อนุมัติ
      });
    });

    // ตรวจสอบสถานะตัวสินค้า (ควรเป็น MISSING)
    const itemMissing = await db.prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });
    expect(itemMissing?.status).toBe(ItemStatus.MISSING);

    // ตรวจสอบประวัติสต๊อกของสาขา B (ควรติดลบจากสินค้าปรับยอดหาย)
    const movAdjust = await db.prisma.stockMovement.findFirst({
      where: {
        branchId: branchBId,
        productId: serializedProdId,
        movementType: "COUNT_ADJUST_OUT",
      },
    });
    expect(movAdjust?.quantity).toBe(-1);
  });

  it("6. การส่งหลอมทองรูปพรรณชำรุด (Melt Lot Process)", async () => {
    // สร้างสินค้าตัวใหม่ขึ้นมาเพื่อส่งหลอมที่สาขา B
    const scrapSerialNo = "TAG-SCRAP-999";
    const scrapRes = await receiveFromSupplier(db.prisma, {
      productId: serializedProdId,
      branchId: branchBId,
      weightMg: 15160n, // 1 บาท
      goldPurity: 96.5,
      costSatang: 37_500_00n,
      laborCharge: 0n,
      quantity: 1,
      serialNo: scrapSerialNo,
      actorId: userManagerId,
    });
    const scrapItemId = scrapRes.itemId!;

    // สร้างรอบส่งหลอม (OPEN)
    const lot = await db.prisma.$transaction(async (tx) => {
      return createMeltLot(tx, {
        branchId: branchBId,
        itemIds: [scrapItemId],
        note: "หลอมทองเก่าลูกค้าแลกซื้อ",
        actorId: userManagerId,
      });
    });
    expect(lot.status).toBe(MeltLotStatus.OPEN);

    // ยืนยันการส่งทองออกจากร้านไปหลอม (OPEN -> SENT)
    await db.prisma.$transaction(async (tx) => {
      await sendToMelt(tx, {
        lotId: lot.id,
        sentWeightMg: 15160n,
        actorId: userManagerId,
      });
    });

    // ตรวจสอบสินค้าถูกเปลี่ยนสถานะเป็น MELTED
    const scrapItem = await db.prisma.inventoryItem.findUnique({
      where: { id: scrapItemId },
    });
    expect(scrapItem?.status).toBe(ItemStatus.MELTED);

    // ตรวจสอบสต๊อก Ledger ถูกตัดออกขาลบ
    const movMelt = await db.prisma.stockMovement.findFirst({
      where: {
        branchId: branchBId,
        productId: serializedProdId,
        movementType: "MELT_OUT",
      },
    });
    expect(movMelt?.quantity).toBe(-1);

    // ปิดยอดรับเนื้อทองที่หลอมสำเร็จ (SENT -> CLOSED)
    await db.prisma.$transaction(async (tx) => {
      await closeMeltLot(tx, {
        lotId: lot.id,
        returnedWeightMg: 14850n, // สูญเสียเศษทองไประหว่างหลอม (น้ำหนักเหลือลดลง)
        returnedSatang: 37_000_00n, // ตีมูลค่าเนื้อทองที่หลอมได้
        actorId: userManagerId,
      });
    });

    const lotClosed = await db.prisma.meltLot.findUnique({
      where: { id: lot.id },
    });
    expect(lotClosed?.status).toBe(MeltLotStatus.CLOSED);
    expect(lotClosed?.returnedWeightMg).toBe(14850n);
  });

  it("7. รายงานประเมินมูลค่าสต๊อก (Valuation Report)", async () => {
    // ดึงรายงานภาพรวมสต๊อกทั้งระบบ
    const report = await getValuationReport(db.prisma);

    // เช็คราคาสต๊อกตามราคาตลาดที่ประกาศ (ทองรูปพรรณซื้อคืน 39,200 สตางค์/บาท)
    // ทองแท่งซื้อคืน 40,000 สตางค์/บาท
    expect(report.totalItems).toBeGreaterThan(0);
    expect(report.totalCostSatang).toBeGreaterThan(0n);
    expect(report.totalMarketValueSatang).toBeGreaterThan(0n);
  });
});
