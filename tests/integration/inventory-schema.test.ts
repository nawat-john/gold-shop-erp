// Integration: Phase 3 schema-level invariants — บังคับที่ DB ไม่ใช่แค่วินัยในโค้ด
// (service layer ของ Inventory มาใน session ถัดไป — test นี้ครอบเฉพาะ schema)
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestDb, stopTestDb, type TestDb } from "./helpers/test-db";

let db: TestDb;
let branchId: string;
let productId: string;
let userId: string;

beforeAll(async () => {
  db = await startTestDb();
  const branch = await db.prisma.branch.create({
    data: { code: "INV01", name: "สาขาทดสอบสต๊อก" },
  });
  branchId = branch.id;

  const user = await db.prisma.user.create({
    data: {
      username: "inv-tester",
      passwordHash: "$argon2id$dummy",
      displayName: "ทดสอบสต๊อก",
    },
  });
  userId = user.id;

  const category = await db.prisma.productCategory.create({
    data: { code: "NECKLACE", name: "สร้อยคอ", defaultLaborCharge: 50_000n },
  });
  const product = await db.prisma.product.create({
    data: {
      sku: "NL-2B-PHAWAI",
      name: "สร้อยคอ 2 บาท ลายผ่าหวาย",
      categoryId: category.id,
      tracking: "SERIALIZED",
      goldPurity: 96.5,
    },
  });
  productId = product.id;
}, 180_000);

afterAll(async () => {
  await stopTestDb(db);
});

function validItem(serialNo: string) {
  return {
    serialNo,
    productId,
    branchId,
    weightMg: 30_320n, // 2 บาททองรูปพรรณ
    goldPurity: 96.5,
    costSatang: 9_800_000n,
  };
}

describe("inventory_items constraints", () => {
  it("สร้างชิ้นปกติได้ + serialNo ซ้ำถูกปฏิเสธ", async () => {
    await db.prisma.inventoryItem.create({ data: validItem("TAG-0001") });
    await expect(
      db.prisma.inventoryItem.create({ data: validItem("TAG-0001") }),
    ).rejects.toThrow();
  });

  it("น้ำหนัก ≤ 0 ถูกปฏิเสธที่ระดับ DB", async () => {
    await expect(
      db.prisma.inventoryItem.create({
        data: { ...validItem("TAG-BAD-W"), weightMg: 0n },
      }),
    ).rejects.toThrow();
  });

  it("ต้นทุนติดลบถูกปฏิเสธ", async () => {
    await expect(
      db.prisma.inventoryItem.create({
        data: { ...validItem("TAG-BAD-C"), costSatang: -1n },
      }),
    ).rejects.toThrow();
  });

  it("% ทองเกิน 100 ถูกปฏิเสธ", async () => {
    await expect(
      db.prisma.inventoryItem.create({
        data: { ...validItem("TAG-BAD-P"), goldPurity: 101 },
      }),
    ).rejects.toThrow();
  });

  it("สถานะเริ่มต้น = IN_STOCK", async () => {
    const item = await db.prisma.inventoryItem.create({
      data: validItem("TAG-0002"),
    });
    expect(item.status).toBe("IN_STOCK");
  });
});

describe("stock_movements ledger", () => {
  it("บันทึกการเคลื่อนไหวได้ แต่ UPDATE/DELETE ถูกปฏิเสธ (append-only trigger)", async () => {
    const movement = await db.prisma.stockMovement.create({
      data: {
        movementType: "RECEIVE_SUPPLIER",
        branchId,
        productId,
        quantity: 1,
        weightMg: 30_320n,
        costSatang: 9_800_000n,
        actorId: userId,
      },
    });

    await expect(
      db.prisma.stockMovement.update({
        where: { id: movement.id },
        data: { quantity: 999 },
      }),
    ).rejects.toThrow(/append-only/);

    await expect(
      db.prisma.stockMovement.delete({ where: { id: movement.id } }),
    ).rejects.toThrow(/append-only/);
  });

  it("quantity = 0 ถูกปฏิเสธ", async () => {
    await expect(
      db.prisma.stockMovement.create({
        data: {
          movementType: "MANUAL_ADJUST_IN",
          branchId,
          productId,
          quantity: 0,
          weightMg: 0n,
          actorId: userId,
        },
      }),
    ).rejects.toThrow();
  });

  it("เครื่องหมายน้ำหนักต้องตรงกับ quantity (ตัดออกแต่น้ำหนักบวก = ปฏิเสธ)", async () => {
    await expect(
      db.prisma.stockMovement.create({
        data: {
          movementType: "SALE_OUT",
          branchId,
          productId,
          quantity: -1,
          weightMg: 30_320n, // ควรเป็นลบ
          actorId: userId,
        },
      }),
    ).rejects.toThrow();
  });

  it("ยอดคงเหลือ replay จาก ledger ได้ (SUM quantity/weight)", async () => {
    // เพิ่มขา -1 ให้คู่กับ movement รับเข้าจาก test ก่อนหน้า
    await db.prisma.stockMovement.create({
      data: {
        movementType: "SALE_OUT",
        branchId,
        productId,
        quantity: -1,
        weightMg: -30_320n,
        actorId: userId,
      },
    });
    const balance = await db.prisma.stockMovement.aggregate({
      where: { branchId, productId },
      _sum: { quantity: true, weightMg: true },
    });
    expect(balance._sum.quantity).toBe(0);
    expect(balance._sum.weightMg).toBe(0n);
  });
});

describe("branch_transfers constraints", () => {
  it("โอนเข้าสาขาตัวเองถูกปฏิเสธ", async () => {
    await expect(
      db.prisma.branchTransfer.create({
        data: {
          docNo: "TRF-SELF-1",
          fromBranchId: branchId,
          toBranchId: branchId,
          createdBy: userId,
        },
      }),
    ).rejects.toThrow();
  });
});
