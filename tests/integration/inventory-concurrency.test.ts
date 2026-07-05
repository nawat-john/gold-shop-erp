// Integration Test: การควบคุมความขัดแย้งในการเข้าถึง (Concurrency Control) ของระบบสต๊อกสินค้า
// ทดสอบความต้องการ: เมื่อพนักงาน 2 คน (หรือเครื่อง POS 2 เครื่อง) กดจองทองชิ้นเดียวกันพร้อมกัน
// ระบบต้องอนุญาตให้มีเพียงฝั่งเดียวที่สามารถทำรายการสำเร็จ (ล็อคสถานะสินค้าเป็น RESERVED)
// รันด้วย: pnpm test:integration tests/integration/inventory-concurrency.test.ts
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";
import { ItemStatus, ProductTracking } from "@/generated/prisma/client";
import { reserveItemForSale } from "@/server/services/inventory.service";

let db: TestDb;
let branchId: string;
let productId: string;
let userId: string;

beforeAll(async () => {
  db = await startTestDb();

  const branch = await db.prisma.branch.create({
    data: { code: "CON01", name: "สาขาทดสอบ Concurrency" },
  });
  branchId = branch.id;

  const category = await db.prisma.productCategory.create({
    data: { code: "TEST_JEWEL", name: "หมวดทดสอบ" },
  });

  const product = await db.prisma.product.create({
    data: {
      sku: "CONC-TEST-001",
      name: "สร้อยทดสอบแรงดึง",
      categoryId: category.id,
      tracking: ProductTracking.SERIALIZED,
      goldPurity: 96.5,
    },
  });
  productId = product.id;

  const user = await db.prisma.user.create({
    data: {
      username: "pos-user",
      passwordHash: "$argon2id$dummy",
      displayName: "พนักงานขาย",
    },
  });
  userId = user.id;
}, 180_000);

afterAll(async () => {
  await stopTestDb(db);
});

describe("Inventory Concurrency Control", () => {
  it("เครื่อง POS 2 เครื่อง สั่งจองทองรูปพรรณชิ้นเดียวกันพร้อมกัน -> สำเร็จเครื่องเดียว อีกเครื่องต้อง fail", async () => {
    // 1) สร้างทองคำขึ้นมา 1 ชิ้นในคลังสินค้า (พร้อมขาย IN_STOCK)
    const item = await db.prisma.inventoryItem.create({
      data: {
        serialNo: "CONC-TAG-0001",
        productId,
        branchId,
        status: ItemStatus.IN_STOCK,
        weightMg: 15160n,
        goldPurity: 96.5,
        costSatang: 3800000n,
      },
    });

    // 2) สั่งยิง Transaction รันจองคู่ขนานกัน 2 ตัวพร้อมกัน
    const results = await Promise.allSettled([
      db.prisma.$transaction(async (tx) => {
        await reserveItemForSale(tx, item.id, userId);
      }),
      db.prisma.$transaction(async (tx) => {
        await reserveItemForSale(tx, item.id, userId);
      }),
    ]);

    // 3) วิเคราะห์ผลลัพธ์
    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    // ตรรกะควบคุม: ต้องสำเร็จเพียง 1 ตัว และล้มเหลวเพียง 1 ตัว
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    // ตรวจสอบข้อความ Error ของฝั่งที่ล้มเหลว
    const errorReason = (rejected[0] as PromiseRejectedResult).reason as Error;
    expect(errorReason.message).toContain("สินค้าไม่อยู่ในสถานะพร้อมขาย");

    // ยอดรวมสต๊อกและสถานะสุดท้ายในฐานข้อมูลต้องเป็น RESERVED
    const finalItem = await db.prisma.inventoryItem.findUnique({
      where: { id: item.id },
    });
    expect(finalItem?.status).toBe(ItemStatus.RESERVED);
  }, 30_000);
});
