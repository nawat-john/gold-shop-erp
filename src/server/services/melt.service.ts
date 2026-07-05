// Melt Service — ตรรกะควบคุมรอบการส่งหลอมทองเก่า/ทองคำชำรุดคืนโรงงาน
// ขั้นตอน: Open -> Sent (ตัดสต๊อกของออกเป็น MELTED) -> Closed (บันทึกขารับเพื่อเปรียบเทียบผลต่าง) / Cancelled
import type { Db } from "@/server/db";
import { ItemStatus, MeltLotStatus } from "@/generated/prisma/client";
import {
  allocateDocumentNumber,
  buildSequenceKey,
  formatDocumentNumber,
} from "./document-number.service";
import { writeAuditLog } from "./audit.service";

export interface CreateMeltLotParams {
  branchId: string;
  itemIds: string[];
  note?: string | null;
  actorId: string;
}

/** เปิดรอบส่งหลอมทองใหม่ (Draft/Open) */
export async function createMeltLot(db: Db, params: CreateMeltLotParams) {
  const { branchId, itemIds, note, actorId } = params;

  if (itemIds.length === 0) {
    throw new Error("ต้องระบุทองเก่าอย่างน้อย 1 ชิ้นเพื่อส่งหลอม");
  }

  const branch = await db.branch.findUniqueOrThrow({
    where: { id: branchId },
  });

  // ค้นหาและตรวจสอบสถานะของสินค้าทุกชิ้น
  const items = await db.inventoryItem.findMany({
    where: { id: { in: itemIds } },
  });

  if (items.length !== itemIds.length) {
    throw new Error("พบรหัสสินค้าที่ไม่ถูกต้องในระบบ");
  }

  for (const item of items) {
    if (item.branchId !== branchId) {
      throw new Error(
        `สินค้าป้ายเลขที่ ${item.serialNo} ไม่ได้อยู่ในสาขาปัจจุบัน`,
      );
    }
    if (item.status !== ItemStatus.IN_STOCK) {
      throw new Error(
        `สินค้าป้ายเลขที่ ${item.serialNo} ไม่อยู่ในสถานะพร้อมส่งหลอม (สถานะปัจจุบัน: ${item.status})`,
      );
    }
  }

  // ออกหมายเลขเอกสาร Sequence (เช่น MLT-HQ-2569-000001)
  const yearBE = new Date().getFullYear() + 543;
  const seqKey = buildSequenceKey("MLT", branch.code, yearBE);
  const nextNum = await allocateDocumentNumber(db, seqKey);
  const docNo = formatDocumentNumber(seqKey, nextNum);

  const lot = await db.meltLot.create({
    data: {
      docNo,
      branchId,
      status: MeltLotStatus.OPEN,
      createdBy: actorId,
      note: note ?? null,
      items: {
        create: itemIds.map((itemId) => ({ itemId })),
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
    action: "melt.create",
    entityType: "melt_lot",
    entityId: lot.id,
    actorId,
    branchId,
    after: {
      docNo,
      itemCount: itemIds.length,
    },
  });

  return lot;
}

/** ยืนยันการส่งทองออกจากร้านไปหลอม (Open -> Sent) */
export async function sendToMelt(
  db: Db,
  params: {
    lotId: string;
    sentWeightMg: bigint;
    actorId: string;
    requestId?: string | null;
  },
) {
  const { lotId, sentWeightMg, actorId, requestId } = params;

  if (sentWeightMg <= 0n) {
    throw new Error("น้ำหนักส่งหลอมต้องมากกว่า 0 มิลลิกรัม");
  }

  const lot = await db.meltLot.findUniqueOrThrow({
    where: { id: lotId },
    include: {
      items: {
        include: {
          item: true,
        },
      },
    },
  });

  if (lot.status !== MeltLotStatus.OPEN) {
    throw new Error(`ไม่สามารถส่งหลอมได้จากสถานะ ${lot.status}`);
  }

  // 1) ตัดสินค้าออกจากสต๊อกของสาขา (MELT_OUT)
  // 2) เปลี่ยนสถานะตัวสินค้าเป็น MELTED
  for (const lotItem of lot.items) {
    const item = lotItem.item;

    if (item.status !== ItemStatus.IN_STOCK) {
      throw new Error(
        `สินค้า ${item.serialNo} ไม่พร้อมส่งหลอม (สถานะปัจจุบัน: ${item.status})`,
      );
    }

    await db.inventoryItem.update({
      where: { id: item.id },
      data: { status: ItemStatus.MELTED },
    });

    await db.stockMovement.create({
      data: {
        movementType: "MELT_OUT",
        branchId: lot.branchId,
        productId: item.productId,
        itemId: item.id,
        quantity: -1,
        weightMg: -item.weightMg,
        costSatang: -item.costSatang,
        refType: "melt_lot",
        refId: lot.id,
        actorId,
        requestId,
      },
    });
  }

  const updated = await db.meltLot.update({
    where: { id: lotId },
    data: {
      status: MeltLotStatus.SENT,
      sentWeightMg,
      sentAt: new Date(),
    },
  });

  await writeAuditLog(db, {
    action: "melt.send",
    entityType: "melt_lot",
    entityId: lotId,
    actorId,
    branchId: lot.branchId,
    requestId,
    before: { status: MeltLotStatus.OPEN },
    after: {
      status: MeltLotStatus.SENT,
      sentWeightMg: sentWeightMg.toString(),
    },
  });

  return updated;
}

/** ปิดยอดรับเนื้อทองที่หลอมเสร็จแล้วกลับมา (Sent -> Closed) */
export async function closeMeltLot(
  db: Db,
  params: {
    lotId: string;
    returnedWeightMg: bigint;
    returnedSatang: bigint;
    actorId: string;
    requestId?: string | null;
  },
) {
  const { lotId, returnedWeightMg, returnedSatang, actorId, requestId } =
    params;

  if (returnedWeightMg <= 0n) {
    throw new Error("น้ำหนักที่ได้รับคืนต้องมากกว่า 0 มิลลิกรัม");
  }
  if (returnedSatang <= 0n) {
    throw new Error("มูลค่าที่ได้รับคืนต้องมากกว่า 0 สตางค์");
  }

  const lot = await db.meltLot.findUniqueOrThrow({
    where: { id: lotId },
  });

  if (lot.status !== MeltLotStatus.SENT) {
    throw new Error(`ไม่สามารถปิดรอบส่งหลอมได้จากสถานะ ${lot.status}`);
  }

  const updated = await db.meltLot.update({
    where: { id: lotId },
    data: {
      status: MeltLotStatus.CLOSED,
      returnedWeightMg,
      returnedSatang,
      closedAt: new Date(),
    },
  });

  await writeAuditLog(db, {
    action: "melt.close",
    entityType: "melt_lot",
    entityId: lotId,
    actorId,
    branchId: lot.branchId,
    requestId,
    before: { status: MeltLotStatus.SENT },
    after: {
      status: MeltLotStatus.CLOSED,
      returnedWeightMg: returnedWeightMg.toString(),
      returnedSatang: returnedSatang.toString(),
    },
  });

  return updated;
}

/** ยกเลิกกระบวนการส่งหลอม (เฉพาะสถานะ OPEN เท่านั้น) */
export async function cancelMeltLot(
  db: Db,
  params: { lotId: string; actorId: string; requestId?: string | null },
) {
  const { lotId, actorId, requestId } = params;

  const lot = await db.meltLot.findUniqueOrThrow({
    where: { id: lotId },
  });

  if (lot.status !== MeltLotStatus.OPEN) {
    throw new Error(`ไม่สามารถยกเลิกได้จากสถานะ ${lot.status}`);
  }

  const updated = await db.meltLot.update({
    where: { id: lotId },
    data: {
      status: MeltLotStatus.CANCELLED,
    },
  });

  await writeAuditLog(db, {
    action: "melt.cancel",
    entityType: "melt_lot",
    entityId: lotId,
    actorId,
    branchId: lot.branchId,
    requestId,
    before: { status: MeltLotStatus.OPEN },
    after: { status: MeltLotStatus.CANCELLED },
  });

  return updated;
}
