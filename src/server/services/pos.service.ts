// POS Service — บริการสำหรับธุรกรรมการขาย ซื้อคืน แลกเปลี่ยน (Trade-In) และยกเลิกบิล
// กติกา: เงิน = BIGINT สตางค์, น้ำหนัก = BIGINT มิลลิกรัม
// Ledger (stock_movements) เป็น append-only และต้องสอดคล้องกับสถานะรายชิ้นเสมอ

import type { Db } from "@/server/db";
import {
  ItemStatus,
  SalesOrderStatus,
  PurchaseOrderStatus,
  PaymentMethod,
  StockMovementType,
  ProductTracking,
  AcquisitionSource,
  AmloRefType,
  type Prisma,
} from "@/generated/prisma/client";
import { calculateSalePrice } from "./pricing.service";
import { buildPriceSnapshot } from "./price-snapshot.service";
import {
  buildSequenceKey,
  allocateDocumentNumber,
  formatDocumentNumber,
} from "./document-number.service";
import { requireApproval } from "./approval.service";
import { writeAuditLog } from "./audit.service";
import { findOrCreateCustomerFromInline } from "./customer.service";
import {
  evaluateAmloTrigger,
  isTransactionAboveAmloThreshold,
} from "./amlo.service";
import { assertPeriodOpen } from "./accounting.service";

interface SalesItemParam {
  productId: string;
  itemId?: string | null;
  quantity: number;
  laborChargeSatang: bigint;
}

interface PaymentParam {
  paymentMethod: PaymentMethod;
  amountSatang: bigint;
  feeSatang?: bigint;
  referenceNo?: string | null;
  slipPath?: string | null;
}

interface CreateSalesOrderParams {
  branchId: string;
  shiftId: string;
  items: SalesItemParam[];
  payments: PaymentParam[];
  idempotencyKey?: string | null;
  actorId: string;
  requestId?: string | null;
}

/**
 * สร้างใบสั่งขาย (Sales Order) และบันทึกการตัดสต๊อก
 */
export async function createSalesOrder(
  db: Db,
  {
    branchId,
    shiftId,
    items,
    payments,
    idempotencyKey,
    actorId,
    requestId,
  }: CreateSalesOrderParams,
) {
  return await db.$transaction(async (tx) => {
    // 1) ป้องกันการส่งซ้ำด้วย Idempotency Key
    if (idempotencyKey) {
      const existing = await tx.salesOrder.findUnique({
        where: { idempotencyKey },
        include: {
          items: true,
          payments: true,
        },
      });
      if (existing) return existing;
    }

    // 2) ตรวจสอบว่ากะพนักงานเปิดอยู่จริง
    const shift = await tx.shift.findUnique({ where: { id: shiftId } });
    if (!shift || shift.status !== "OPEN") {
      throw new Error("กะการทำงานไม่ได้เปิดอยู่ ไม่สามารถทำธุรกรรมได้");
    }

    const now = new Date();
    await assertPeriodOpen(tx, now);
    const priceSnapshot = await buildPriceSnapshot(tx, now);

    // 3) ดึงประกาศราคาสมาคมทองคำจาก snapshot เพื่อใช้คิดราคา
    const priceAnn = {
      barBuy: BigInt(priceSnapshot.barBuy),
      barSell: BigInt(priceSnapshot.barSell),
      ornamentBuy: BigInt(priceSnapshot.ornamentBuy),
      ornamentSell: BigInt(priceSnapshot.ornamentSell),
    };

    let totalAmountSatang = 0n;
    let totalVatSatang = 0n;
    const orderItemsData = [];

    // 4) วนลูปประมวลผลสินค้าในตะกร้าทีละชิ้น
    for (const itemParam of items) {
      const product = await tx.product.findUniqueOrThrow({
        where: { id: itemParam.productId },
      });

      let weightMg = 0n;
      let purity = Number(product.goldPurity);

      if (product.tracking === ProductTracking.SERIALIZED) {
        if (!itemParam.itemId) {
          throw new Error(
            `สินค้าแบบ Serialized (${product.sku}) ต้องระบุป้ายสินค้า (itemId)`,
          );
        }

        // ล็อกจองแถวสินค้าชิ้นนั้นในคลังเพื่อป้องกันการแย่งซื้อ (Concurrency Control)
        const lockedRows = await tx.$queryRaw<
          {
            id: string;
            status: string;
            weight_mg: bigint;
            gold_purity: number;
            branch_id: string;
            cost_satang: bigint;
          }[]
        >`
          SELECT id, status, weight_mg, gold_purity, branch_id, cost_satang
          FROM inventory_items
          WHERE id = ${itemParam.itemId} AND status = 'IN_STOCK' AND branch_id = ${branchId}
          FOR UPDATE
        `;
        if (lockedRows.length === 0) {
          throw new Error(
            `สินค้าป้ายนี้ไม่พร้อมขายหรือไม่ได้อยู่ในสาขานี้: ${itemParam.itemId}`,
          );
        }

        const invItem = lockedRows[0];
        weightMg = invItem.weight_mg;
        purity = Number(invItem.gold_purity);

        // เปลี่ยนสถานะเป็นขายออกแล้ว (SOLD)
        await tx.inventoryItem.update({
          where: { id: invItem.id },
          data: { status: ItemStatus.SOLD },
        });

        // บันทึก Ledger ความเคลื่อนไหวสต๊อกขาออก
        await tx.stockMovement.create({
          data: {
            movementType: StockMovementType.SALE_OUT,
            branchId,
            productId: product.id,
            itemId: invItem.id,
            quantity: -1,
            weightMg: -weightMg,
            costSatang: invItem.cost_satang,
            actorId,
            requestId,
          },
        });
      } else {
        // COUNTED (ทองคำแท่งมาตรฐาน)
        if (!product.stdWeightMg) {
          throw new Error(
            `แบบสินค้าทองคำแท่งแบบนับจำนวน (${product.sku}) ต้องระบุน้ำหนักมาตรฐาน`,
          );
        }
        weightMg = product.stdWeightMg * BigInt(itemParam.quantity);

        // บันทึก Ledger สต๊อกขาออกสำหรับสินค้าชนิดนับจำนวน
        await tx.stockMovement.create({
          data: {
            movementType: StockMovementType.SALE_OUT,
            branchId,
            productId: product.id,
            quantity: -itemParam.quantity,
            weightMg: -weightMg,
            actorId,
            requestId,
          },
        });
      }

      // คำนวณราคาขายและสูตรภาษีพิเศษร้านทอง
      const pricing = calculateSalePrice({
        tracking: product.tracking,
        weightMg:
          product.tracking === ProductTracking.SERIALIZED
            ? weightMg
            : product.stdWeightMg!,
        goldPurity: purity,
        laborChargeSatang: itemParam.laborChargeSatang,
        announcement: priceAnn,
      });

      const itemTotal = pricing.totalAmountSatang * BigInt(itemParam.quantity);
      const itemVat = pricing.vatAmountSatang * BigInt(itemParam.quantity);

      totalAmountSatang += itemTotal;
      totalVatSatang += itemVat;

      orderItemsData.push({
        productId: product.id,
        itemId: itemParam.itemId || null,
        quantity: itemParam.quantity,
        weightMg: weightMg,
        goldPurity: purity,
        goldPriceSatang:
          pricing.baseGoldPriceSatang * BigInt(itemParam.quantity),
        laborChargeSatang:
          itemParam.laborChargeSatang * BigInt(itemParam.quantity),
        vatAmountSatang: itemVat,
        totalAmountSatang: itemTotal,
      });
    }

    // 5) ตรวจสอบความถูกต้องของยอดชำระเงิน (Split Payments matching total)
    const totalPaidSatang = payments.reduce(
      (sum, p) => sum + p.amountSatang,
      0n,
    );
    if (totalPaidSatang !== totalAmountSatang) {
      throw new Error(
        `ยอดรับชำระเงิน (${totalPaidSatang}) ไม่ตรงกับยอดรวมบิล (${totalAmountSatang})`,
      );
    }

    // 6) รันเลขที่เอกสารบิลขาย (INV-branchCode-yearBE-sequence)
    const branch = await tx.branch.findUniqueOrThrow({
      where: { id: branchId },
    });
    const yearBE = now.getFullYear() + 543;
    const seqKey = buildSequenceKey("INV", branch.code, yearBE);
    const nextNum = await allocateDocumentNumber(tx, seqKey);
    const docNo = formatDocumentNumber(seqKey, nextNum);

    // 7) เขียนบันทึกใบเสร็จ/บิลลง DB
    const order = await tx.salesOrder.create({
      data: {
        docNo,
        branchId,
        shiftId,
        priceSnapshot: priceSnapshot as unknown as Prisma.InputJsonValue,
        totalAmountSatang,
        vatAmountSatang: totalVatSatang,
        status: SalesOrderStatus.COMPLETED,
        idempotencyKey,
        createdBy: actorId,
        createdAt: now,
      },
    });

    // เขียนรายการย่อยของบิล
    await tx.salesOrderItem.createMany({
      data: orderItemsData.map((item) => ({
        ...item,
        orderId: order.id,
      })),
    });

    // เขียนรายการรับชำระเงิน
    await tx.payment.createMany({
      data: payments.map((p) => ({
        salesOrderId: order.id,
        paymentMethod: p.paymentMethod,
        amountSatang: p.amountSatang,
        feeSatang: p.feeSatang || 0n,
        referenceNo: p.referenceNo || null,
        slipPath: p.slipPath || null,
        createdAt: now,
      })),
    });

    // บันทึกกิจกรรมระบบความมั่นคงปลอดภัย
    await writeAuditLog(tx, {
      action: "pos.sale_create",
      entityType: "sales_order",
      entityId: order.id,
      actorId,
      branchId,
      requestId,
    });

    return order;
  });
}

interface PurchaseItemParam {
  productId?: string | null;
  description: string;
  weightMg: bigint;
  goldPurity: number;
  unitPriceSatang: bigint; // ราคารับซื้อต่อหน่วยมิลลิกรัม
  totalAmountSatang: bigint; // ราคารวมที่ตกลงรับซื้อคืนชิ้นนี้
}

interface CreatePurchaseOrderParams {
  branchId: string;
  shiftId: string;
  /** ลูกค้าที่ลงทะเบียน CRM ไว้ล่วงหน้า — ถ้าไม่ระบุแต่มี customerCitizenId และเข้าเกณฑ์ AMLO จะลงทะเบียนอัตโนมัติ */
  customerId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerCitizenId?: string | null;
  items: PurchaseItemParam[];
  payments: PaymentParam[];
  idempotencyKey?: string | null;
  actorId: string;
  requestId?: string | null;
}

/**
 * สร้างบิลรับซื้อทองคืนจากลูกค้า (Purchase Order)
 * เพิ่มเนื้อทองเข้าคลังเป็นสินค้าชิ้นใหม่ทันที (AcquisitionSource = BUYBACK)
 */
export async function createPurchaseOrder(
  db: Db,
  {
    branchId,
    shiftId,
    customerId: customerIdParam,
    customerName,
    customerPhone,
    customerCitizenId,
    items,
    payments,
    idempotencyKey,
    actorId,
    requestId,
  }: CreatePurchaseOrderParams,
) {
  return await db.$transaction(async (tx) => {
    let customerId = customerIdParam;
    if (idempotencyKey) {
      const existing = await tx.purchaseOrder.findUnique({
        where: { idempotencyKey },
        include: {
          items: true,
          payments: true,
        },
      });
      if (existing) return existing;
    }

    const shift = await tx.shift.findUnique({ where: { id: shiftId } });
    if (!shift || shift.status !== "OPEN") {
      throw new Error("กะการทำงานไม่ได้เปิดอยู่ ไม่สามารถทำธุรกรรมได้");
    }

    const now = new Date();
    await assertPeriodOpen(tx, now);
    const priceSnapshot = await buildPriceSnapshot(tx, now);

    let totalAmountSatang = 0n;
    const orderItemsData = [];

    // วนลูปรับซื้อทองคำรายชิ้น
    for (const itemParam of items) {
      // 1) รันรหัส Barcode/SerialNo เพื่อตีตราให้กับทองเก่าที่สแกนรับเข้า
      const tagSeqKey = `TAG-${branchId.slice(0, 4).toUpperCase()}`;
      const nextTagNum = await allocateDocumentNumber(tx, tagSeqKey);
      const serialNo = `TAG-${branchId.slice(0, 4).toUpperCase()}-${nextTagNum.toString().padStart(5, "0")}`;

      // 2) สร้างชิ้นสินค้าในคลังสินค้าอัตโนมัติ (สถานะพร้อมขายหรือรอหลอมคืน)
      // กรณีรับซื้อคืน จะตั้งต้นทุน (costSatang) เท่ากับจำนวนเงินที่ชำระให้ลูกค้าจริง
      const invItem = await tx.inventoryItem.create({
        data: {
          serialNo,
          productId: itemParam.productId || (await getOrCreateScrapProduct(tx)),
          branchId,
          status: ItemStatus.IN_STOCK,
          weightMg: itemParam.weightMg,
          goldPurity: itemParam.goldPurity,
          costSatang: itemParam.totalAmountSatang,
          source: AcquisitionSource.BUYBACK,
          receivedAt: now,
        },
      });

      // 3) บันทึก Ledger สต๊อกขารับเข้าจากการซื้อคืน
      await tx.stockMovement.create({
        data: {
          movementType: StockMovementType.BUYBACK_IN,
          branchId,
          productId: invItem.productId,
          itemId: invItem.id,
          quantity: 1,
          weightMg: itemParam.weightMg,
          costSatang: itemParam.totalAmountSatang,
          actorId,
          requestId,
        },
      });

      totalAmountSatang += itemParam.totalAmountSatang;

      orderItemsData.push({
        productId: invItem.productId,
        itemId: invItem.id,
        description: itemParam.description,
        weightMg: itemParam.weightMg,
        goldPurity: itemParam.goldPurity,
        unitPriceSatang: itemParam.unitPriceSatang,
        totalAmountSatang: itemParam.totalAmountSatang,
      });
    }

    // ตรวจสอบยอดชำระเงินที่จ่ายออกไปให้ลูกค้า
    const totalPaidSatang = payments.reduce(
      (sum, p) => sum + p.amountSatang,
      0n,
    );
    if (totalPaidSatang !== totalAmountSatang) {
      throw new Error(
        `ยอดชำระเงินคืน (${totalPaidSatang}) ไม่ตรงกับยอดรวมบิลรับซื้อ (${totalAmountSatang})`,
      );
    }

    // เกินเพดาน AMLO และยังไม่มีลูกค้าลงทะเบียน CRM ล่วงหน้า -> ลงทะเบียนอัตโนมัติจากข้อมูล inline (บังคับ KYC)
    if (
      !customerId &&
      customerCitizenId &&
      customerName &&
      (await isTransactionAboveAmloThreshold(tx, totalAmountSatang))
    ) {
      const customer = await findOrCreateCustomerFromInline(tx, {
        name: customerName,
        phone: customerPhone,
        citizenId: customerCitizenId,
        actorId,
      });
      customerId = customer.id;
    }

    // รันเลขที่เอกสารบิลรับซื้อ (BUY-branchCode-yearBE-sequence)
    const branch = await tx.branch.findUniqueOrThrow({
      where: { id: branchId },
    });
    const yearBE = now.getFullYear() + 543;
    const seqKey = buildSequenceKey("BUY", branch.code, yearBE);
    const nextNum = await allocateDocumentNumber(tx, seqKey);
    const docNo = formatDocumentNumber(seqKey, nextNum);

    const order = await tx.purchaseOrder.create({
      data: {
        docNo,
        branchId,
        shiftId,
        customerId: customerId ?? null,
        priceSnapshot: priceSnapshot as unknown as Prisma.InputJsonValue,
        totalAmountSatang,
        customerName,
        customerPhone,
        customerCitizenId, // ปัจจุบันเป็น String เปล่าหรือเข้ารหัส — ดู customerId ด้านบนสำหรับ KYC ที่เข้ารหัสจริง
        status: PurchaseOrderStatus.COMPLETED,
        idempotencyKey,
        createdBy: actorId,
        createdAt: now,
      },
    });

    await evaluateAmloTrigger(tx, {
      customerId,
      amountSatang: totalAmountSatang,
      refType: AmloRefType.PURCHASE_ORDER,
      refId: order.id,
      actorId,
      requestId,
    });

    await tx.purchaseOrderItem.createMany({
      data: orderItemsData.map((item) => ({
        ...item,
        orderId: order.id,
      })),
    });

    // เขียนประวัติการรับ/จ่ายชำระเงิน
    await tx.payment.createMany({
      data: payments.map((p) => ({
        purchaseOrderId: order.id,
        paymentMethod: p.paymentMethod,
        amountSatang: p.amountSatang,
        feeSatang: p.feeSatang || 0n,
        referenceNo: p.referenceNo || null,
        slipPath: p.slipPath || null,
        createdAt: now,
      })),
    });

    await writeAuditLog(tx, {
      action: "pos.purchase_create",
      entityType: "purchase_order",
      entityId: order.id,
      actorId,
      branchId,
      requestId,
    });

    return order;
  });
}

interface CreateTradeInParams {
  branchId: string;
  shiftId: string;
  customerName?: string | null;
  customerPhone?: string | null;
  salesItems: SalesItemParam[];
  purchaseItems: PurchaseItemParam[];
  payments: PaymentParam[];
  idempotencyKey?: string | null;
  actorId: string;
  requestId?: string | null;
}

/**
 * สร้างบิลเปลี่ยนทองคำ (Trade-In / แลกเปลี่ยน)
 * ทำธุรกรรมควบคู่กันทั้งบิลขายและบิลซื้อใน transaction เดียว
 */
export async function createTradeIn(
  db: Db,
  {
    branchId,
    shiftId,
    customerName,
    customerPhone,
    salesItems,
    purchaseItems,
    payments,
    idempotencyKey,
    actorId,
    requestId,
  }: CreateTradeInParams,
) {
  return await db.$transaction(async (tx) => {
    // 1) สร้างบิลขายทองใหม่
    // ตั้งค่าชำระเงินชั่วคราวให้ตรงกับยอดขายทั้งหมดเพื่อผ่านเช็กยอดจ่ายภายในฟังก์ชัน
    const salesAnn = await buildPriceSnapshot(tx);
    let salesTotal = 0n;
    for (const s of salesItems) {
      const product = await tx.product.findUniqueOrThrow({
        where: { id: s.productId },
      });
      let itemWeight = product.stdWeightMg || 0n;
      let itemPurity = Number(product.goldPurity);
      if (s.itemId) {
        const item = await tx.inventoryItem.findUniqueOrThrow({
          where: { id: s.itemId },
        });
        itemWeight = item.weightMg;
        itemPurity = Number(item.goldPurity);
      }
      const pricing = calculateSalePrice({
        tracking: product.tracking,
        weightMg: itemWeight,
        goldPurity: itemPurity,
        laborChargeSatang: s.laborChargeSatang,
        announcement: {
          barBuy: BigInt(salesAnn.barBuy),
          barSell: BigInt(salesAnn.barSell),
          ornamentBuy: BigInt(salesAnn.ornamentBuy),
          ornamentSell: BigInt(salesAnn.ornamentSell),
        },
      });
      salesTotal += pricing.totalAmountSatang * BigInt(s.quantity);
    }

    const salesOrder = await createSalesOrder(tx, {
      branchId,
      shiftId,
      items: salesItems,
      payments: [
        { paymentMethod: PaymentMethod.CASH, amountSatang: salesTotal },
      ], // จ่ายเสมือนเพื่อปิดบิล
      idempotencyKey: idempotencyKey ? `${idempotencyKey}-sales` : null,
      actorId,
      requestId,
    });

    // 2) สร้างบิลรับคืนทองเก่า
    const purchaseTotal = purchaseItems.reduce(
      (sum, p) => sum + p.totalAmountSatang,
      0n,
    );
    const purchaseOrder = await createPurchaseOrder(tx, {
      branchId,
      shiftId,
      customerName,
      customerPhone,
      items: purchaseItems,
      payments: [
        { paymentMethod: PaymentMethod.CASH, amountSatang: purchaseTotal },
      ], // จ่ายเสมือนเพื่อปิดบิล
      idempotencyKey: idempotencyKey ? `${idempotencyKey}-purchase` : null,
      actorId,
      requestId,
    });

    // ปรับลบยอดจ่ายจำลองของบิลย่อยออก เพื่อหลีกเลี่ยงความเข้าใจผิดด้านบัญชีเงินสด
    await tx.payment.deleteMany({
      where: {
        OR: [
          { salesOrderId: salesOrder.id },
          { purchaseOrderId: purchaseOrder.id },
        ],
      },
    });

    // 3) คำนวณยอดเงินส่วนต่างสุทธิของ Trade-In
    const netAmountSatang =
      salesOrder.totalAmountSatang - purchaseOrder.totalAmountSatang;

    // ตรวจสอบความถูกต้องของส่วนต่างที่ลูกค้าจ่ายจริงเทียบกับการคำนวณบิล
    const totalPaidSatang = payments.reduce(
      (sum, p) => sum + p.amountSatang,
      0n,
    );
    if (totalPaidSatang !== netAmountSatang) {
      throw new Error(
        `ยอดรับชำระส่วนต่างจริง (${totalPaidSatang}) ไม่สอดคล้องกับผลต่างบิลแลกเปลี่ยน (${netAmountSatang})`,
      );
    }

    // 4) รันหมายเลขเอกสารบิลแลกเปลี่ยน (TRD-branchCode-yearBE-sequence)
    const branch = await tx.branch.findUniqueOrThrow({
      where: { id: branchId },
    });
    const yearBE = new Date().getFullYear() + 543;
    const seqKey = buildSequenceKey("TRD", branch.code, yearBE);
    const nextNum = await allocateDocumentNumber(tx, seqKey);
    const docNo = formatDocumentNumber(seqKey, nextNum);

    const tradeIn = await tx.tradeIn.create({
      data: {
        docNo,
        salesOrderId: salesOrder.id,
        purchaseOrderId: purchaseOrder.id,
        netAmountSatang,
        createdAt: new Date(),
      },
    });

    // เขียนรายการจ่ายชำระเงินส่วนต่างที่เกิดจริง ผูกโยงบิล Trade-In
    await tx.payment.createMany({
      data: payments.map((p) => ({
        tradeInId: tradeIn.id,
        paymentMethod: p.paymentMethod,
        amountSatang: p.amountSatang,
        feeSatang: p.feeSatang || 0n,
        referenceNo: p.referenceNo || null,
        slipPath: p.slipPath || null,
        createdAt: new Date(),
      })),
    });

    await writeAuditLog(tx, {
      action: "pos.tradein_create",
      entityType: "trade_in",
      entityId: tradeIn.id,
      actorId,
      branchId,
      requestId,
    });

    return tradeIn;
  });
}

interface VoidOrderParams {
  orderType: "SALES" | "PURCHASE" | "TRADE_IN";
  orderId: string;
  voidedById: string;
  voidReason: string;
  approverUsername: string;
  pin: string;
  requestId?: string | null;
}

/**
 * ยกเลิกบิลธุรกรรมการซื้อขายย้อนหลัง
 * บังคับตรวจสอบ PIN ของผู้อนุมัติ (Maker-Checker) และทำการคืนสต๊อก / ประวัติ Ledger ตีกลับ
 */
export async function voidOrder(
  db: Db,
  {
    orderType,
    orderId,
    voidedById,
    voidReason,
    approverUsername,
    pin,
    requestId,
  }: VoidOrderParams,
) {
  return await db.$transaction(async (tx) => {
    // 1) ตรวจสอบสิทธิ์ผู้อนุมัติและรหัส PIN
    const approval = await requireApproval(tx, {
      approverUsername,
      pin,
      permission: "stock.adjust",
      actorId: voidedById,
      action: `pos.void_${orderType.toLowerCase()}`,
      requireDifferentApprover: true,
      requestId,
    });
    if (!approval.ok) {
      throw new Error(`อนุมัติด้วย PIN ล้มเหลว: ${approval.reason}`);
    }

    const now = new Date();
    await assertPeriodOpen(tx, now);

    if (orderType === "SALES") {
      const order = await tx.salesOrder.findUniqueOrThrow({
        where: { id: orderId },
        include: { items: true },
      });
      if (order.status === SalesOrderStatus.VOIDED) {
        throw new Error("บิลนี้ถูก Void ไปก่อนหน้านี้แล้ว");
      }

      // คืนสถานะสินค้าคลังสินค้า และสร้าง Ledger ตัดยอดกลับด้าน
      for (const item of order.items) {
        if (item.itemId) {
          // Serialized: คืนสถานะพร้อมขาย (IN_STOCK)
          await tx.inventoryItem.update({
            where: { id: item.itemId },
            data: { status: ItemStatus.IN_STOCK },
          });

          // Ledger คืนสินค้ากลับคลัง (+1)
          await tx.stockMovement.create({
            data: {
              movementType: StockMovementType.MANUAL_ADJUST_IN,
              branchId: order.branchId,
              productId: item.productId,
              itemId: item.itemId,
              quantity: 1,
              weightMg: item.weightMg,
              actorId: voidedById,
              requestId,
              note: `Void บิล ${order.docNo}: คืนสต๊อกรูปพรรณ`,
            },
          });
        } else {
          // Counted: Ledger คืนทองคำแท่งกลับคลัง (+qty)
          await tx.stockMovement.create({
            data: {
              movementType: StockMovementType.MANUAL_ADJUST_IN,
              branchId: order.branchId,
              productId: item.productId,
              quantity: item.quantity,
              weightMg: item.weightMg,
              actorId: voidedById,
              requestId,
              note: `Void บิล ${order.docNo}: คืนสต๊อกทองแท่ง`,
            },
          });
        }
      }

      await tx.salesOrder.update({
        where: { id: orderId },
        data: {
          status: SalesOrderStatus.VOIDED,
          voidedAt: now,
          voidedById,
          voidReason,
        },
      });
    } else if (orderType === "PURCHASE") {
      const order = await tx.purchaseOrder.findUniqueOrThrow({
        where: { id: orderId },
        include: { items: true },
      });
      if (order.status === PurchaseOrderStatus.VOIDED) {
        throw new Error("บิลนี้ถูก Void ไปก่อนหน้านี้แล้ว");
      }

      // นำสินค้าที่เคยซื้อคืนออกจากระบบ โดยเปลี่ยนสถานะสต๊อกเป็นสูญหาย/ลบออก
      for (const item of order.items) {
        if (item.itemId) {
          await tx.inventoryItem.update({
            where: { id: item.itemId },
            data: { status: ItemStatus.MISSING }, // ปรับเป็นสูญหายจากการยกเลิกรับซื้อ
          });

          // Ledger หักล้างยอดบิลรับคืน (-1)
          await tx.stockMovement.create({
            data: {
              movementType: StockMovementType.MANUAL_ADJUST_OUT,
              branchId: order.branchId,
              productId: item.productId!,
              itemId: item.itemId,
              quantity: -1,
              weightMg: -item.weightMg,
              actorId: voidedById,
              requestId,
              note: `Void บิลรับซื้อ ${order.docNo}: หักล้างสต๊อกคืน`,
            },
          });
        }
      }

      await tx.purchaseOrder.update({
        where: { id: orderId },
        data: {
          status: PurchaseOrderStatus.VOIDED,
          voidedAt: now,
          voidedById,
          voidReason,
        },
      });
    } else if (orderType === "TRADE_IN") {
      const trade = await tx.tradeIn.findUniqueOrThrow({
        where: { id: orderId },
      });

      // ดำเนินการย้อนกลับบิลย่อยทั้งใบขายและใบซื้อ
      await voidOrder(tx, {
        orderType: "SALES",
        orderId: trade.salesOrderId,
        voidedById,
        voidReason: `Void บิลแลกเปลี่ยน ${trade.docNo}: ${voidReason}`,
        approverUsername,
        pin,
        requestId,
      });

      await voidOrder(tx, {
        orderType: "PURCHASE",
        orderId: trade.purchaseOrderId,
        voidedById,
        voidReason: `Void บิลแลกเปลี่ยน ${trade.docNo}: ${voidReason}`,
        approverUsername,
        pin,
        requestId,
      });
    }

    await writeAuditLog(tx, {
      action: `pos.void_${orderType.toLowerCase()}_success`,
      entityType: orderType.toLowerCase(),
      entityId: orderId,
      actorId: voidedById,
      requestId,
    });

    return { success: true };
  });
}

/**
 * ดึงรหัสสินค้าประเภท "เศษทองเก่า/ทองชำรุด" สำหรับใส่เป็นสินค้าเริ่มต้นตอนรับซื้อ
 */
async function getOrCreateScrapProduct(
  tx: Prisma.TransactionClient,
): Promise<string> {
  const code = "GOLD_SCRAP";
  let prod = await tx.product.findUnique({ where: { sku: code } });
  if (!prod) {
    let cat = await tx.productCategory.findFirst();
    if (!cat) {
      cat = await tx.productCategory.create({
        data: { code: "OTHER", name: "อื่นๆ", defaultLaborCharge: 0n },
      });
    }
    prod = await tx.product.create({
      data: {
        sku: code,
        name: "เศษทองคำชำรุดรับซื้อคืน",
        categoryId: cat.id,
        tracking: ProductTracking.SERIALIZED,
        goldPurity: 96.5,
      },
    });
  }
  return prod.id;
}
