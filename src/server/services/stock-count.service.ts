// Stock Count Service — ตรรกะจัดการการตรวจนับสต๊อกสินค้า
// ขั้นตอน: Open -> Scan -> Review -> Approved (ปรับสต๊อกจริง) / Cancelled
// การปรับปรุงยอดสต๊อก (Approved) ต้องได้รับอนุมัติผ่าน PIN (Maker-Checker)
import type { Db } from "@/server/db";
import { ItemStatus, StockCountStatus } from "@/generated/prisma/client";
import {
  allocateDocumentNumber,
  buildSequenceKey,
  formatDocumentNumber,
} from "./document-number.service";
import { requireApproval } from "./approval.service";
import { writeAuditLog } from "./audit.service";

export interface StartStockCountParams {
  branchId: string;
  note?: string | null;
  actorId: string;
}

/** เปิดรอบตรวจนับสต๊อกประจำวัน (Open) */
export async function startStockCount(db: Db, params: StartStockCountParams) {
  const { branchId, note, actorId } = params;

  const branch = await db.branch.findUniqueOrThrow({
    where: { id: branchId },
  });

  // สร้างรหัสเอกสารตรวจนับ (STC-BKK01-2569-000001)
  const yearBE = new Date().getFullYear() + 543;
  const seqKey = buildSequenceKey("STC", branch.code, yearBE);
  const nextNum = await allocateDocumentNumber(db, seqKey);
  const docNo = formatDocumentNumber(seqKey, nextNum);

  // ดึงรายการของสินค้า SERIALIZED ที่ควรจะอยู่ในสต๊อก (IN_STOCK) ของสาขานี้มาทำ Expected List
  const expectedItems = await db.inventoryItem.findMany({
    where: {
      branchId,
      status: ItemStatus.IN_STOCK,
    },
  });

  const count = await db.stockCount.create({
    data: {
      docNo,
      branchId,
      status: StockCountStatus.OPEN,
      createdBy: actorId,
      note: note ?? null,
      items: {
        create: expectedItems.map((item) => ({
          itemId: item.id,
          expected: true,
          found: null,
        })),
      },
    },
    include: {
      items: {
        include: {
          item: true,
        },
      },
    },
  });

  await writeAuditLog(db, {
    action: "stock_count.start",
    entityType: "stock_count",
    entityId: count.id,
    actorId,
    branchId,
    after: {
      docNo,
      expectedCount: expectedItems.length,
    },
  });

  return count;
}

/** สแกนระบุว่าพบสินค้า (Scan) */
export async function scanCountItem(
  db: Db,
  params: { countId: string; serialNo: string; actorId: string },
) {
  const { countId, serialNo, actorId } = params;

  const count = await db.stockCount.findUniqueOrThrow({
    where: { id: countId },
  });

  if (count.status !== StockCountStatus.OPEN) {
    throw new Error(
      `ไม่สามารถสแกนนับสินค้าในรอบตรวจนับที่มีสถานะเป็น ${count.status} ได้`,
    );
  }

  // ค้นหาสินค้าจากป้าย SerialNo
  const item = await db.inventoryItem.findUnique({
    where: { serialNo },
  });
  if (!item) {
    throw new Error(`ไม่พบสินค้าป้ายเลขที่ ${serialNo} ในระบบ`);
  }

  // ค้นหารายการการนับในรอบปัจจุบัน
  const existingCountItem = await db.stockCountItem.findUnique({
    where: {
      countId_itemId: {
        countId,
        itemId: item.id,
      },
    },
  });

  if (existingCountItem) {
    // กรณีเป็นสินค้าที่คาดหมายไว้อยู่แล้ว (Expected = true)
    await db.stockCountItem.update({
      where: {
        countId_itemId: {
          countId,
          itemId: item.id,
        },
      },
      data: {
        found: true,
        countedBy: actorId,
        countedAt: new Date(),
      },
    });
  } else {
    // กรณีที่สินค้าไม่ได้เป็น Expected (เช่น สต๊อกหายไปแล้ว หรือสลับสาขามา)
    await db.stockCountItem.create({
      data: {
        countId,
        itemId: item.id,
        expected: false,
        found: true,
        countedBy: actorId,
        countedAt: new Date(),
      },
    });
  }

  return { success: true };
}

/** ส่งใบตรวจนับให้ตรวจสอบส่วนต่าง (Open -> Review) */
export async function submitForReview(
  db: Db,
  params: { countId: string; actorId: string },
) {
  const { countId, actorId } = params;

  const count = await db.stockCount.findUniqueOrThrow({
    where: { id: countId },
  });

  if (count.status !== StockCountStatus.OPEN) {
    throw new Error(`ไม่สามารถส่งตรวจทานได้จากสถานะ ${count.status}`);
  }

  const updated = await db.stockCount.update({
    where: { id: countId },
    data: {
      status: StockCountStatus.REVIEW,
    },
  });

  await writeAuditLog(db, {
    action: "stock_count.submit_review",
    entityType: "stock_count",
    entityId: countId,
    actorId,
    branchId: count.branchId,
    before: { status: StockCountStatus.OPEN },
    after: { status: StockCountStatus.REVIEW },
  });

  return updated;
}

export interface ApproveStockCountParams {
  countId: string;
  approverUsername: string;
  pin: string;
  actorId: string;
  requestId?: string | null;
}

/** อนุมัติการปรับยอดสต๊อก (Review -> Approved) — ต้องการ PIN (Maker-Checker) */
export async function approveStockCount(
  db: Db,
  params: ApproveStockCountParams,
) {
  const { countId, approverUsername, pin, actorId, requestId } = params;

  const count = await db.stockCount.findUniqueOrThrow({
    where: { id: countId },
    include: {
      items: {
        include: {
          item: true,
        },
      },
    },
  });

  if (count.status !== StockCountStatus.REVIEW) {
    throw new Error(`ไม่สามารถอนุมัติได้จากสถานะ ${count.status}`);
  }

  // 1) ตรวจสอบรหัส PIN และสิทธิ์การตรวจปรับสต๊อก (stock.adjust) ผ่าน requireApproval
  const approvalResult = await requireApproval(db, {
    approverUsername,
    pin,
    permission: "stock.adjust",
    branchId: count.branchId,
    actorId,
    action: `stock_count.approve:${countId}`,
    requireDifferentApprover: true,
    requestId,
  });

  if (!approvalResult.ok) {
    throw new Error(`การอนุมัติไม่ผ่าน: ${approvalResult.reason}`);
  }

  const approverId = approvalResult.approverId;

  // 2) ไล่ประมวลผลสินค้าแต่ละรายการในรอบนับ
  let lossCount = 0;
  let gainCount = 0;

  for (const countItem of count.items) {
    const item = countItem.item;

    if (
      countItem.expected &&
      (countItem.found === false || countItem.found === null)
    ) {
      // เคสที่ 1: คาดว่ามี แต่ไม่พบตัวจริง (สินค้าหาย)
      // -> ปรับสถานะเป็น MISSING
      // -> บันทึกประวัติสต๊อกขาลบ (COUNT_ADJUST_OUT)
      await db.inventoryItem.update({
        where: { id: item.id },
        data: { status: ItemStatus.MISSING },
      });

      await db.stockMovement.create({
        data: {
          movementType: "COUNT_ADJUST_OUT",
          branchId: count.branchId,
          productId: item.productId,
          itemId: item.id,
          quantity: -1,
          weightMg: -item.weightMg,
          costSatang: -item.costSatang,
          refType: "stock_count",
          refId: countId,
          actorId,
          requestId,
        },
      });

      lossCount++;
    } else if (!countItem.expected && countItem.found) {
      // เคสที่ 2: ไม่คิดว่ามี แต่ดันสแกนพบ (สินค้าเกิน / กลับมาเข้าร้าน)
      // -> ย้ายกลับมาเป็นสาขานี้ และเปลี่ยนสถานะกลับเป็น IN_STOCK
      // -> บันทึกประวัติสต๊อกขาบวก (COUNT_ADJUST_IN)

      // หากของชิ้นนี้เดิมเคยถูกผูกกับสาขาอื่น ต้องปรับยอดออกของสาขาเก่าด้วย
      if (item.branchId !== count.branchId) {
        await db.stockMovement.create({
          data: {
            movementType: "COUNT_ADJUST_OUT",
            branchId: item.branchId,
            productId: item.productId,
            itemId: item.id,
            quantity: -1,
            weightMg: -item.weightMg,
            costSatang: -item.costSatang,
            refType: "stock_count",
            refId: countId,
            actorId,
            requestId,
          },
        });
      }

      await db.inventoryItem.update({
        where: { id: item.id },
        data: {
          status: ItemStatus.IN_STOCK,
          branchId: count.branchId,
        },
      });

      await db.stockMovement.create({
        data: {
          movementType: "COUNT_ADJUST_IN",
          branchId: count.branchId,
          productId: item.productId,
          itemId: item.id,
          quantity: 1,
          weightMg: item.weightMg,
          costSatang: item.costSatang,
          refType: "stock_count",
          refId: countId,
          actorId,
          requestId,
        },
      });

      gainCount++;
    }
  }

  const updated = await db.stockCount.update({
    where: { id: countId },
    data: {
      status: StockCountStatus.APPROVED,
      approvedBy: approverId,
      closedAt: new Date(),
    },
  });

  await writeAuditLog(db, {
    action: "stock_count.approve",
    entityType: "stock_count",
    entityId: countId,
    actorId,
    branchId: count.branchId,
    requestId,
    before: { status: StockCountStatus.REVIEW },
    after: {
      status: StockCountStatus.APPROVED,
      approvedBy: approverId,
      lossCount,
      gainCount,
    },
  });

  return updated;
}
