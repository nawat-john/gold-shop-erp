// Inventory Service — ตรรกะควบคุมสต๊อกสินค้า
// กติกา: เงิน = BIGINT สตางค์, น้ำหนัก = BIGINT มิลลิกรัม
// Ledger (stock_movements) เป็น append-only และห้ามดัดแปลง
import type { Db } from "@/server/db";
import { ItemStatus, ProductTracking } from "@/generated/prisma/client";
import type { InventoryItem, Product } from "@/generated/prisma/client";
import { MG_PER_BAHT_ORNAMENT, MG_PER_BAHT_BAR } from "@/server/domain/gold";
import { writeAuditLog } from "./audit.service";
import { getCurrentShopPrice } from "./price-snapshot.service";

export interface ReceiveFromSupplierParams {
  productId: string;
  branchId: string;
  supplierId?: string | null;
  locationId?: string | null;
  weightMg: bigint;
  goldPurity: number; // e.g. 96.50
  costSatang: bigint;
  laborCharge?: bigint | null;
  quantity: number;
  serialNo?: string | null;
  actorId: string;
  requestId?: string | null;
}

/**
 * รับสินค้าเข้าสต๊อกจากการซื้อจาก Supplier (โรงงาน)
 * - SERIALIZED (ทองรูปพรรณ): quantity = 1 เสมอ, สร้างแถวสินค้าจริง และเขียนประวัติสต๊อก
 * - COUNTED (ทองแท่ง): quantity >= 1, บันทึกประวัติเคลื่อนไหวอย่างเดียว
 */
export async function receiveFromSupplier(
  db: Db,
  params: ReceiveFromSupplierParams,
): Promise<{ success: true; itemId?: string }> {
  const {
    productId,
    branchId,
    supplierId,
    locationId,
    weightMg,
    goldPurity,
    costSatang,
    laborCharge = 0n,
    quantity,
    actorId,
    requestId,
  } = params;

  if (weightMg <= 0n) {
    throw new Error("น้ำหนักต้องมากกว่า 0 มิลลิกรัม");
  }
  if (costSatang < 0n) {
    throw new Error("ต้นทุนห้ามติดลบ");
  }
  if (goldPurity <= 0 || goldPurity > 100) {
    throw new Error("ความบริสุทธิ์ทองต้องอยู่ระหว่าง 0 ถึง 100");
  }

  const product = await db.product.findUnique({
    where: { id: productId },
  });
  if (!product) {
    throw new Error("ไม่พบข้อมูลแบบสินค้าที่ระบุ");
  }

  // แยกประมวลผลตามประเภทสินค้า
  if (product.tracking === ProductTracking.SERIALIZED) {
    if (quantity !== 1) {
      throw new Error(
        "สินค้ารายชิ้น (SERIALIZED) ต้องรับเข้าทีละ 1 ชิ้นเท่านั้น",
      );
    }

    // กำหนดรหัสป้ายสินค้า (SerialNo) หากไม่มีการส่งเข้ามาให้ระบบ auto-generate
    const finalSerialNo =
      params.serialNo && params.serialNo.trim().length > 0
        ? params.serialNo.trim()
        : `TAG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // ตรวจสอบ Serial ซ้ำ
    const existing = await db.inventoryItem.findUnique({
      where: { serialNo: finalSerialNo },
    });
    if (existing) {
      throw new Error(`รหัสป้ายสินค้า ${finalSerialNo} มีอยู่แล้วในระบบ`);
    }

    const item = await db.inventoryItem.create({
      data: {
        serialNo: finalSerialNo,
        productId,
        branchId,
        status: ItemStatus.IN_STOCK,
        weightMg,
        goldPurity: goldPurity.toString(),
        costSatang,
        laborCharge,
        source: "SUPPLIER",
        supplierId: supplierId ?? null,
        locationId: locationId ?? null,
      },
    });

    await db.stockMovement.create({
      data: {
        movementType: "RECEIVE_SUPPLIER",
        branchId,
        productId,
        itemId: item.id,
        quantity: 1,
        weightMg,
        costSatang,
        refType: "supplier",
        refId: supplierId ?? null,
        actorId,
        requestId,
      },
    });

    await writeAuditLog(db, {
      action: "inventory.receive_supplier",
      entityType: "inventory_item",
      entityId: item.id,
      actorId,
      branchId,
      requestId,
      after: {
        serialNo: finalSerialNo,
        productId,
        branchId,
        weightMg: weightMg.toString(),
        costSatang: costSatang.toString(),
      },
    });

    return { success: true, itemId: item.id };
  } else {
    // COUNTED (สินค้าคำนวณยอดรวม)
    if (quantity <= 0) {
      throw new Error("จำนวนการรับเข้าสินค้าต้องมากกว่า 0");
    }

    await db.stockMovement.create({
      data: {
        movementType: "RECEIVE_SUPPLIER",
        branchId,
        productId,
        itemId: null,
        quantity,
        weightMg,
        costSatang,
        refType: "supplier",
        refId: supplierId ?? null,
        actorId,
        requestId,
      },
    });

    await writeAuditLog(db, {
      action: "inventory.receive_supplier",
      entityType: "product",
      entityId: productId,
      actorId,
      branchId,
      requestId,
      after: {
        productId,
        branchId,
        quantity,
        weightMg: weightMg.toString(),
        costSatang: costSatang.toString(),
      },
    });

    return { success: true };
  }
}

/** บันทึกประวัติการพิมพ์ป้ายสินค้า */
export async function printLabelLog(
  db: Db,
  params: { itemId: string; actorId: string; reason?: string | null },
): Promise<void> {
  const { itemId, actorId, reason } = params;
  const item = await db.inventoryItem.findUniqueOrThrow({
    where: { id: itemId },
  });

  await db.productLabel.create({
    data: {
      itemId,
      printedBy: actorId,
      reason: reason ?? null,
    },
  });

  await writeAuditLog(db, {
    action: "inventory.print_label",
    entityType: "inventory_item",
    entityId: itemId,
    actorId,
    branchId: item.branchId,
    after: { reason: reason ?? "พิมพ์ครั้งแรก" },
  });
}

/** ค้นหาสินค้าในสต๊อก (สแกนบาร์โค้ด / สแกน SerialNo / ค้น SKU หรือลาย) */
export async function searchInventory(
  db: Db,
  params: {
    query: string;
    branchId?: string;
    status?: ItemStatus;
  },
): Promise<InventoryItem[]> {
  const { query, branchId, status } = params;
  const normalizedQuery = query.trim();

  if (!normalizedQuery) return [];

  return db.inventoryItem.findMany({
    where: {
      AND: [
        branchId ? { branchId } : {},
        status ? { status } : {},
        {
          OR: [
            { serialNo: { equals: normalizedQuery, mode: "insensitive" } },
            {
              product: {
                OR: [
                  { sku: { equals: normalizedQuery, mode: "insensitive" } },
                  { name: { contains: normalizedQuery, mode: "insensitive" } },
                  {
                    pattern: { contains: normalizedQuery, mode: "insensitive" },
                  },
                  {
                    category: {
                      name: { contains: normalizedQuery, mode: "insensitive" },
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
      location: true,
      supplier: true,
    },
    take: 50,
  });
}

export interface StockValuationRow {
  productId: string;
  sku: string;
  name: string;
  tracking: ProductTracking;
  goldPurity: number;
  totalQuantity: number;
  totalWeightMg: bigint;
  totalCostSatang: bigint;
  marketValueSatang: bigint;
  unrealizedProfitSatang: bigint;
}

export interface StockValuationReport {
  rows: StockValuationRow[];
  totalCostSatang: bigint;
  totalMarketValueSatang: bigint;
  totalWeightMg: bigint;
  totalItems: number;
  priceAnnouncedAt: Date | null;
  feedStale: boolean;
}

/** คำนวณมูลค่าสต๊อกตามราคาท้องตลาดปัจจุบัน (Mark-to-Market Valuation) */
export async function getValuationReport(
  db: Db,
  branchId?: string,
): Promise<StockValuationReport> {
  const priceResult = await getCurrentShopPrice(db);
  const barBuy = priceResult?.announcement.barBuy ?? 0n;
  const ornamentBuy = priceResult?.announcement.ornamentBuy ?? 0n;

  // 1) ดึงข้อมูลสินค้า SERIALIZED ทั้งหมดที่เป็น IN_STOCK
  const serializedItems = await db.inventoryItem.findMany({
    where: {
      status: ItemStatus.IN_STOCK,
      ...(branchId ? { branchId } : {}),
    },
    include: {
      product: true,
    },
  });

  // 2) ดึงยอดคงเหลือของสินค้า COUNTED ทั้งหมดโดยดึงผ่านประวัติสต๊อก (Ledger)
  const movements = await db.stockMovement.groupBy({
    by: ["productId", "branchId"],
    where: {
      product: {
        tracking: ProductTracking.COUNTED,
      },
      ...(branchId ? { branchId } : {}),
    },
    _sum: {
      quantity: true,
      weightMg: true,
      costSatang: true,
    },
  });

  const productsMap = new Map<string, Product>();
  const allProductIds = Array.from(
    new Set([
      ...serializedItems.map((i) => i.productId),
      ...movements.map((m) => m.productId),
    ]),
  );

  const productsList = await db.product.findMany({
    where: { id: { in: allProductIds } },
  });
  for (const prod of productsList) {
    productsMap.set(prod.id, prod);
  }

  // รวบรวมข้อมูลตาม SKU
  const rowsMap = new Map<string, StockValuationRow>();

  // ประมวลผลกลุ่ม Serialized
  for (const item of serializedItems) {
    const prod = productsMap.get(item.productId);
    if (!prod) continue;

    let row = rowsMap.get(prod.id);
    if (!row) {
      row = {
        productId: prod.id,
        sku: prod.sku,
        name: prod.name,
        tracking: ProductTracking.SERIALIZED,
        goldPurity: Number(prod.goldPurity),
        totalQuantity: 0,
        totalWeightMg: 0n,
        totalCostSatang: 0n,
        marketValueSatang: 0n,
        unrealizedProfitSatang: 0n,
      };
      rowsMap.set(prod.id, row);
    }

    row.totalQuantity += 1;
    row.totalWeightMg += item.weightMg;
    row.totalCostSatang += item.costSatang;

    // คำนวณราคาตลาด: ทองรูปพรรณ (Ornament)
    // สูตร: (น้ำหนัก มก. * ราคาซื้อคืนรูปพรรณ * (ความบริสุทธิ์ของชิ้น / 96.5%)) / 15,160 มก.
    const purityPct = Number(item.goldPurity);
    const purityScaled = BigInt(Math.round(purityPct * 100)); // e.g. 96.50 -> 9650
    const marketVal =
      (item.weightMg * ornamentBuy * purityScaled) /
      (MG_PER_BAHT_ORNAMENT * 9650n);

    row.marketValueSatang += marketVal;
  }

  // ประมวลผลกลุ่ม Counted
  for (const move of movements) {
    const prod = productsMap.get(move.productId);
    if (!prod) continue;

    const qty = move._sum.quantity ?? 0;
    const weight = move._sum.weightMg ?? 0n;
    const cost = move._sum.costSatang ?? 0n;

    if (qty <= 0) continue; // ข้ามสต๊อกที่หมดแล้ว

    let row = rowsMap.get(prod.id);
    if (!row) {
      row = {
        productId: prod.id,
        sku: prod.sku,
        name: prod.name,
        tracking: ProductTracking.COUNTED,
        goldPurity: Number(prod.goldPurity),
        totalQuantity: 0,
        totalWeightMg: 0n,
        totalCostSatang: 0n,
        marketValueSatang: 0n,
        unrealizedProfitSatang: 0n,
      };
      rowsMap.set(prod.id, row);
    }

    row.totalQuantity += qty;
    row.totalWeightMg += weight;
    row.totalCostSatang += cost;

    // คำนวณราคาตลาด: ทองแท่ง (Bar)
    // สูตร: (น้ำหนัก มก. * ราคาซื้อคืนทองแท่ง * (ความบริสุทธิ์ / 96.5%)) / 15,244 มก.
    const purityPct = Number(prod.goldPurity);
    const purityScaled = BigInt(Math.round(purityPct * 100));
    const marketVal =
      (weight * barBuy * purityScaled) / (MG_PER_BAHT_BAR * 9650n);

    row.marketValueSatang += marketVal;
  }

  // อัปเดตผลต่างกำไรของแต่ละแถว
  const rows = Array.from(rowsMap.values());
  let totalCostSatang = 0n;
  let totalMarketValueSatang = 0n;
  let totalWeightMg = 0n;
  let totalItems = 0;

  for (const r of rows) {
    r.unrealizedProfitSatang = r.marketValueSatang - r.totalCostSatang;
    totalCostSatang += r.totalCostSatang;
    totalMarketValueSatang += r.marketValueSatang;
    totalWeightMg += r.totalWeightMg;
    totalItems += r.totalQuantity;
  }

  return {
    rows,
    totalCostSatang,
    totalMarketValueSatang,
    totalWeightMg,
    totalItems,
    priceAnnouncedAt: priceResult?.announcement.announcedAt ?? null,
    feedStale: priceResult?.feedStale ?? true,
  };
}

/** ล็อกจองสินค้าเพื่อไปขาย (RESERVED) ป้องกันการแย่งสินค้าชิ้นเดียวกัน */
export async function reserveItemForSale(
  db: Db,
  itemId: string,
  actorId: string,
  requestId?: string | null,
): Promise<void> {
  // ล็อคแถวข้อมูลระดับ Postgres Row Lock (FOR UPDATE)
  const items = await db.$queryRaw<{ id: string; status: string }[]>`
    SELECT id, status::text FROM inventory_items
    WHERE id = ${itemId}
    FOR UPDATE
  `;

  if (items.length === 0) {
    throw new Error("ไม่พบสินค้าที่ต้องการจอง");
  }

  const item = items[0];
  if (item.status !== ItemStatus.IN_STOCK) {
    throw new Error(
      `สินค้าไม่อยู่ในสถานะพร้อมขาย (สถานะปัจจุบัน: ${item.status})`,
    );
  }

  // อัปเดตสถานะเป็น RESERVED เพื่อล็อคคิวบิล
  await db.inventoryItem.update({
    where: { id: itemId },
    data: { status: ItemStatus.RESERVED },
  });

  await writeAuditLog(db, {
    action: "inventory.reserve_pos",
    entityType: "inventory_item",
    entityId: itemId,
    actorId,
    requestId,
  });
}

/** ยกเลิกการจองสินค้า (RESERVED -> IN_STOCK) */
export async function releaseItemReservation(
  db: Db,
  itemId: string,
  actorId: string,
  requestId?: string | null,
): Promise<void> {
  const item = await db.inventoryItem.findUniqueOrThrow({
    where: { id: itemId },
  });

  if (item.status !== ItemStatus.RESERVED) {
    return; // ไม่จำเป็นต้องทำอะไรถ้าไม่ได้จองอยู่
  }

  await db.inventoryItem.update({
    where: { id: itemId },
    data: { status: ItemStatus.IN_STOCK },
  });

  await writeAuditLog(db, {
    action: "inventory.release_pos",
    entityType: "inventory_item",
    entityId: itemId,
    actorId,
    requestId,
  });
}
