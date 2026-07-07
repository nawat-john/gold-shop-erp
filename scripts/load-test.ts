import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createSalesOrder } from "../src/server/services/pos.service";
import { calculateSalePrice } from "../src/server/services/pricing.service";
import { buildPriceSnapshot } from "../src/server/services/price-snapshot.service";
import { PaymentMethod } from "../src/generated/prisma/client";

const CONCURRENCY = 10;
const DB_URL = process.env.DATABASE_URL!;
console.log(`การเชื่อมต่อฐานข้อมูล: ${DB_URL}`);

const pool = new Pool({ connectionString: DB_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function loadTest() {
  console.log("=== เริ่มต้นกระบวนการทดสอบโหลดหน้าร้าน POS (Load Test) ===");

  try {
    // 1) ตรวจสอบการเชื่อมต่อหาผู้ใช้ระบบเริ่มต้น
    const owner = await prisma.user.findFirst({
      where: { username: "owner" },
    });
    if (!owner) {
      throw new Error(
        "กรุณา Seed ระบบก่อนรัน Load Test (ไม่พบผู้ใช้งาน owner)",
      );
    }

    // 2) ตรวจสอบหรือสร้างสาขา HQ
    let hq = await prisma.branch.findUnique({
      where: { code: "HQ" },
    });
    if (!hq) {
      hq = await prisma.branch.create({
        data: { code: "HQ", name: "สำนักงานใหญ่เยาวราช" },
      });
      console.log("สร้างสาขา HQ เรียบร้อย");
    }

    // 3) ค้นหาหรือสร้างแบบสินค้าแบบนับจำนวน (COUNTED) เพื่อลดข้อขัดแย้งด้านป้าย tag เฉพาะชิ้น
    let category = await prisma.productCategory.findFirst({
      where: { code: "LOAD_TEST_CAT" },
    });
    if (!category) {
      category = await prisma.productCategory.create({
        data: { code: "LOAD_TEST_CAT", name: "หมวดทดสอบโหลด" },
      });
    }

    let product = await prisma.product.findFirst({
      where: { sku: "LOAD-TEST-BAR" },
    });
    if (!product) {
      product = await prisma.product.create({
        data: {
          sku: "LOAD-TEST-BAR",
          name: "ทองคำแท่งทดสอบโหลด 1 บาท",
          categoryId: category.id,
          tracking: "COUNTED",
          goldPurity: 96.5,
          stdWeightMg: 15244n, // 15.244 กรัม
        },
      });
      console.log("สร้างสินค้าทองคำแท่งสำหรับ Load Test เรียบร้อย");
    }

    // 4) ค้นหาหรือสร้าง ลิ้นชักเงินสด และเปิดกะ
    let drawer = await prisma.cashDrawer.findFirst({
      where: { branchId: hq.id, code: "LOAD-DRAWER" },
    });
    if (!drawer) {
      drawer = await prisma.cashDrawer.create({
        data: {
          branchId: hq.id,
          code: "LOAD-DRAWER",
          name: "ลิ้นชักทดสอบโหลด",
        },
      });
    }

    let activeShift = await prisma.shift.findFirst({
      where: { branchId: hq.id, status: "OPEN" },
    });
    if (!activeShift) {
      // เปิดกะใหม่
      activeShift = await prisma.shift.create({
        data: {
          branchId: hq.id,
          drawerId: drawer.id,
          openedById: owner.id,
          startCashSatang: 1000000n, // ทุน 10,000 บาท
          openedAt: new Date(),
          status: "OPEN",
        },
      });
      console.log(`เปิดกะพนักงานขายรหัสกะ: ${activeShift.id}`);
    }

    // 5) ตรวจสอบการประกาศราคาทองคำในระบบ หากยังไม่มีให้สร้างก่อน
    let currentAnn = await prisma.shopPriceAnnouncement.findFirst({
      orderBy: { announcedAt: "desc" },
    });
    if (!currentAnn) {
      currentAnn = await prisma.shopPriceAnnouncement.create({
        data: {
          barBuy: 4000000n,
          barSell: 4010000n,
          ornamentBuy: 3920000n,
          ornamentSell: 4060000n,
          announcedBy: owner.id,
        },
      });
      console.log("สร้างประกาศราคาทองเริ่มต้นเรียบร้อย");
    }

    // 6) คำนวณราคาขายและภาษีของสินค้าทองแท่งตัวนี้
    const now = new Date();
    const priceSnapshot = await buildPriceSnapshot(prisma, now);
    const priceAnn = {
      barBuy: BigInt(priceSnapshot.barBuy),
      barSell: BigInt(priceSnapshot.barSell),
      ornamentBuy: BigInt(priceSnapshot.ornamentBuy),
      ornamentSell: BigInt(priceSnapshot.ornamentSell),
    };

    const laborChargeSatang = 100000n; // ค่ากำเหน็จ 1,000 บาท
    const pricing = calculateSalePrice({
      tracking: product.tracking,
      weightMg: product.stdWeightMg!,
      goldPurity: Number(product.goldPurity),
      laborChargeSatang,
      announcement: priceAnn,
    });

    const totalAmountSatang = pricing.totalAmountSatang;
    console.log(
      `ยอดขายคำนวณได้: ${(Number(totalAmountSatang) / 100).toLocaleString()} บาทต่อชิ้น`,
    );
    console.log(`กำลังยิงธุรกรรมพร้อมกัน ${CONCURRENCY} คำขอแบบขนาน...`);

    const startTime = Date.now();

    // จำลองการยิงคำขอเช็คเอาท์พร้อมๆ กัน
    const promises = Array.from({ length: CONCURRENCY }).map((_, idx) => {
      const idempotencyKey = `loadtest-key-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`;
      return createSalesOrder(prisma, {
        branchId: hq.id,
        shiftId: activeShift!.id,
        items: [
          {
            productId: product.id,
            quantity: 1,
            laborChargeSatang,
          },
        ],
        payments: [
          {
            paymentMethod: PaymentMethod.CASH,
            amountSatang: totalAmountSatang,
          },
        ],
        idempotencyKey,
        actorId: owner.id,
      });
    });

    const results = await Promise.allSettled(promises);
    const endTime = Date.now();
    const durationMs = endTime - startTime;

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    results.forEach((res, idx) => {
      if (res.status === "fulfilled") {
        successCount++;
      } else {
        failedCount++;
        errors.push(`คำขอที่ ${idx + 1}: ${res.reason?.message || res.reason}`);
      }
    });

    console.log("\n=== สรุปผลการทดสอบ Load Test ===");
    console.log(
      `เวลาทั้งหมดที่ใช้: ${durationMs} ms (เฉลี่ย ${(durationMs / CONCURRENCY).toFixed(2)} ms ต่อธุรกรรม)`,
    );
    console.log(`ทำสำเร็จ: ${successCount} / ${CONCURRENCY}`);
    console.log(`ล้มเหลว: ${failedCount} / ${CONCURRENCY}`);

    if (errors.length > 0) {
      console.log("\nข้อผิดพลาดที่พบระหว่างรัน:");
      errors.forEach((err) => console.error(` - ${err}`));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("เกิดข้อผิดพลาดในการโหลดทดสอบ:", errorMessage);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

loadTest();
