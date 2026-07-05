import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";
import {
  ItemStatus,
  ShiftStatus,
  SalesOrderStatus,
  PurchaseOrderStatus,
  PaymentMethod,
} from "@/generated/prisma/client";
import {
  openShift,
  closeShift,
  reconcileShift,
} from "@/server/services/shift.service";
import {
  createSalesOrder,
  createPurchaseOrder,
  voidOrder,
} from "@/server/services/pos.service";
import { setApprovalPin } from "@/server/services/approval.service";
import { seedRbac } from "@/server/services/rbac-seed";

let db: TestDb;
let branchHQId: string;
let drawer01Id: string;
let prodRingId: string;
let keeperId: string;
let managerId: string;
const managerUsername = "manager-pos01";

beforeAll(async () => {
  db = await startTestDb();
  await seedRbac(db.prisma);

  // 1) สร้างสาขาและตู้เงินสดลิ้นชัก
  const branchHQ = await db.prisma.branch.create({
    data: { code: "HQ", name: "สำนักงานใหญ่เยาวราช" },
  });
  branchHQId = branchHQ.id;

  const drawer = await db.prisma.cashDrawer.create({
    data: {
      branchId: branchHQId,
      code: "DRAWER-01",
      name: "ตู้แคชเชียร์ 1",
    },
  });
  drawer01Id = drawer.id;

  // 2) สร้างแบบสินค้า
  const category = await db.prisma.productCategory.create({
    data: { code: "GOLD_965", name: "ทอง 96.5%", defaultLaborCharge: 100000n },
  });

  const ring = await db.prisma.product.create({
    data: {
      sku: "RING-1B",
      name: "แหวนทอง 1 บาท",
      categoryId: category.id,
      tracking: "SERIALIZED",
      goldPurity: 96.5,
    },
  });
  prodRingId = ring.id;

  await db.prisma.product.create({
    data: {
      sku: "BAR-10B",
      name: "ทองแท่ง 10 บาท",
      categoryId: category.id,
      tracking: "COUNTED",
      goldPurity: 96.5,
      stdWeightMg: 152440n,
    },
  });

  // 3) สร้างพนักงานและผู้จัดการ (Maker-Checker)
  const roleKeeper = await db.prisma.role.findUniqueOrThrow({
    where: { code: "STOCK_KEEPER" },
  });
  const roleManager = await db.prisma.role.findUniqueOrThrow({
    where: { code: "BRANCH_MANAGER" },
  });

  const keeper = await db.prisma.user.create({
    data: {
      username: "pos-keeper",
      passwordHash: "$argon2id$dummy",
      displayName: "พนักงานหน้าเคาน์เตอร์",
      userBranchRoles: {
        create: { branchId: branchHQId, roleId: roleKeeper.id },
      },
    },
  });
  keeperId = keeper.id;

  const manager = await db.prisma.user.create({
    data: {
      username: managerUsername,
      passwordHash: "$argon2id$dummy",
      displayName: "ผู้จัดการสาขา",
      userBranchRoles: {
        create: { branchId: branchHQId, roleId: roleManager.id },
      },
    },
  });
  managerId = manager.id;

  // บันทึก PIN ผู้อนุมัติให้กับผู้จัดการ
  await setApprovalPin(db.prisma, {
    userId: managerId,
    pin: "928374",
    actorId: managerId,
  });

  // 4) สร้างราคาประกาศเริ่มต้นของร้าน
  await db.prisma.shopPriceAnnouncement.create({
    data: {
      barBuy: 4000000n,
      barSell: 4010000n,
      ornamentBuy: 3920000n,
      ornamentSell: 4060000n,
      announcedBy: managerId,
    },
  });
}, 180_000);

afterAll(async () => {
  await stopTestDb(db);
});

describe("POS System End-to-End Workflow", () => {
  let activeShiftId: string;
  let serializedItemId: string;

  it("1. เปิดกะพนักงานขาย (Open Shift)", async () => {
    const shift = await openShift(db.prisma, {
      branchId: branchHQId,
      drawerId: drawer01Id,
      openedById: keeperId,
      startCashSatang: 1000000n, // ทุนตั้งต้น 10,000 บาท
    });

    expect(shift.status).toBe(ShiftStatus.OPEN);
    expect(shift.startCashSatang).toBe(1000000n);
    activeShiftId = shift.id;
  });

  it("2. สร้างบิลขายสินค้าหน้าร้าน (Sales Order)", async () => {
    // 2.1 รับสินค้าเข้าจาก supplier ก่อนขาย
    const item = await db.prisma.inventoryItem.create({
      data: {
        serialNo: "TAG-RING-001",
        productId: prodRingId,
        branchId: branchHQId,
        status: ItemStatus.IN_STOCK,
        weightMg: 15160n, // 1 บาททองพอดี
        goldPurity: 96.5,
        costSatang: 3800000n,
      },
    });
    serializedItemId = item.id;

    // 2.2 ทำใบสั่งขายผ่าน POS
    const order = await createSalesOrder(db.prisma, {
      branchId: branchHQId,
      shiftId: activeShiftId,
      items: [
        {
          productId: prodRingId,
          itemId: serializedItemId,
          quantity: 1,
          laborChargeSatang: 100000n, // กำเหน็จ 1,000 บาท
        },
      ],
      payments: [
        {
          paymentMethod: PaymentMethod.CASH,
          amountSatang: 4160000n, // ราคาเนื้อทอง 40,600 + ค่ากำเหน็จ 1,000 = 41,600 บาท
        },
      ],
      actorId: keeperId,
      idempotencyKey: "sale-idem-001",
    });

    expect(order.status).toBe(SalesOrderStatus.COMPLETED);
    expect(order.totalAmountSatang).toBe(4160000n);

    // 2.3 ตรวจสอบสถานะสต๊อกของแหวนชิ้นนั้นว่าเปลี่ยนเป็น SOLD
    const soldItem = await db.prisma.inventoryItem.findUniqueOrThrow({
      where: { id: serializedItemId },
    });
    expect(soldItem.status).toBe(ItemStatus.SOLD);

    // ตรวจสอบว่ามีประวัติ Ledger StockMovement ขาออก
    const move = await db.prisma.stockMovement.findFirst({
      where: { itemId: serializedItemId, movementType: "SALE_OUT" },
    });
    expect(move).not.toBeNull();
    expect(move!.quantity).toBe(-1);
  });

  it("3. ทำการรับซื้อคืนทองเก่า (Purchase Order)", async () => {
    const buyOrder = await createPurchaseOrder(db.prisma, {
      branchId: branchHQId,
      shiftId: activeShiftId,
      customerName: "สมชาย แสนดี",
      customerPhone: "0812345678",
      items: [
        {
          description: "สร้อยคอเก่าชำรุด",
          weightMg: 15160n, // 1 บาททอง
          goldPurity: 96.5,
          unitPriceSatang: 3920000n, // ตามราคารับซื้อสมาคมต่อ 1 บาททอง
          totalAmountSatang: 3920000n, // ราคาตกลงรับซื้อ
        },
      ],
      payments: [
        {
          paymentMethod: PaymentMethod.CASH,
          amountSatang: 3920000n, // จ่ายออกเงินสดจากลิ้นชัก
        },
      ],
      actorId: keeperId,
      idempotencyKey: "buy-idem-001",
    });

    expect(buyOrder.status).toBe(PurchaseOrderStatus.COMPLETED);
    expect(buyOrder.totalAmountSatang).toBe(3920000n);

    // ตรวจสอบว่าทองเก่าถูกสร้างเข้าระบบในสถานะ IN_STOCK จากการรับซื้อ (AcquisitionSource: BUYBACK)
    const boughtItem = await db.prisma.inventoryItem.findFirst({
      where: { source: "BUYBACK", branchId: branchHQId },
    });
    expect(boughtItem).not.toBeNull();
    expect(boughtItem!.status).toBe(ItemStatus.IN_STOCK);
    expect(boughtItem!.costSatang).toBe(3920000n);
  });

  it("4. ปิดกะการทำงานพนักงาน และตรวจสอบการกระทบยอดลิ้นชักเงินสด (Close Shift)", async () => {
    // คำนวณเงินสดปิดกะ:
    // เงินต้นกะ: 10,000 บาท (1,000,000 สตางค์)
    // + เงินสดขายทองบิลที่ 1: 41,600 บาท (4,160,000 สตางค์)
    // - เงินสดรับซื้อทองเก่าบิลที่ 2: 39,200 บาท (3,920,000 สตางค์)
    // สุทธิคาดหมาย: 10,000 + 41,600 - 39,200 = 12,400 บาท (1,240,000 สตางค์)

    const closedShift = await closeShift(db.prisma, {
      shiftId: activeShiftId,
      closedById: keeperId,
      endCashSatang: 1240000n, // นับจริงได้ 12,400 บาทพอดี
    });

    expect(closedShift.status).toBe(ShiftStatus.CLOSED);
    expect(closedShift.expectedCashSatang).toBe(1240000n);
    expect(closedShift.endCashSatang).toBe(1240000n);

    // ทำการอนุมัติกระทบยอดโดยผู้จัดการ
    const recon = await reconcileShift(db.prisma, {
      shiftId: activeShiftId,
      reconciledById: managerId,
    });
    expect(recon.status).toBe(ShiftStatus.RECONCILED);
  });

  it("5. ยกเลิกบิลการทำธุรกรรมย้อนหลัง (Void Sales Order with Approval PIN)", async () => {
    // ค้นหาบิลขายที่จะทำการยกเลิก
    const order = await db.prisma.salesOrder.findFirstOrThrow({
      where: { idempotencyKey: "sale-idem-001" },
    });

    // เรียกใช้ฟังก์ชัน Void ยอด โดยใช้รหัส PIN ที่ถูกต้อง
    await voidOrder(db.prisma, {
      orderType: "SALES",
      orderId: order.id,
      voidedById: keeperId,
      voidReason: "ลูกค้าเปลี่ยนใจไม่ซื้อแล้ว",
      approverUsername: managerUsername,
      pin: "928374", // PIN ที่ตั้งไว้ช่วงเริ่มต้น
    });

    // บิลขายเปลี่ยนสถานะเป็น VOIDED
    const voidedOrder = await db.prisma.salesOrder.findUniqueOrThrow({
      where: { id: order.id },
    });
    expect(voidedOrder.status).toBe(SalesOrderStatus.VOIDED);

    // สินค้าแหวนทองส่งคืนคลังในสถานะพร้อมขาย (IN_STOCK) ทันที
    const returnedItem = await db.prisma.inventoryItem.findUniqueOrThrow({
      where: { id: serializedItemId },
    });
    expect(returnedItem.status).toBe(ItemStatus.IN_STOCK);

    // ตรวจสอบว่ามีประวัติ Ledger StockMovement คืนกลับเข้ามา (+1)
    const refundMove = await db.prisma.stockMovement.findFirst({
      where: { itemId: serializedItemId, movementType: "MANUAL_ADJUST_IN" },
    });
    expect(refundMove).not.toBeNull();
    expect(refundMove!.quantity).toBe(1);
  });
});
