// Transfer Service — จัดการการโอนย้ายสินค้าระหว่างสาขาแบบ 2-Step
// ขั้นตอน: Draft -> In Transit (ตัดสต๊อกจากสาขาต้นทาง) -> Completed (เข้าสต๊อกสาขาปลายทาง) / Cancelled
import type { Db } from "@/server/db";
import { ItemStatus, TransferStatus } from "@/generated/prisma/client";
import {
  allocateDocumentNumber,
  buildSequenceKey,
  formatDocumentNumber,
} from "./document-number.service";
import { writeAuditLog } from "./audit.service";

export interface CreateTransferParams {
  fromBranchId: string;
  toBranchId: string;
  itemIds: string[];
  note?: string | null;
  actorId: string;
}

/** สร้างใบโอนร่าง (DRAFT) ระหว่างสาขา */
export async function createTransfer(db: Db, params: CreateTransferParams) {
  const { fromBranchId, toBranchId, itemIds, note, actorId } = params;

  if (fromBranchId === toBranchId) {
    throw new Error("สาขาต้นทางและปลายทางห้ามเป็นสาขาเดียวกัน");
  }
  if (itemIds.length === 0) {
    throw new Error("ต้องระบุสินค้าอย่างน้อย 1 ชิ้นเพื่อโอนย้าย");
  }

  // ดึงข้อมูลสาขาต้นทางเพื่อนำ Code มาออกเลขใบส่งของ
  const fromBranch = await db.branch.findUniqueOrThrow({
    where: { id: fromBranchId },
  });

  // ค้นหาและตรวจสอบสถานะของสินค้าทุกชิ้น
  const items = await db.inventoryItem.findMany({
    where: { id: { in: itemIds } },
  });

  if (items.length !== itemIds.length) {
    throw new Error("พบรหัสสินค้าที่ไม่ถูกต้องในระบบ");
  }

  for (const item of items) {
    if (item.branchId !== fromBranchId) {
      throw new Error(
        `สินค้าป้ายเลขที่ ${item.serialNo} ไม่ได้อยู่ในสาขาต้นทาง`,
      );
    }
    if (item.status !== ItemStatus.IN_STOCK) {
      throw new Error(
        `สินค้าป้ายเลขที่ ${item.serialNo} ไม่อยู่ในสถานะพร้อมโอน (สถานะปัจจุบัน: ${item.status})`,
      );
    }
  }

  // ออกหมายเลขเอกสาร Sequence (เช่น TRF-INV01-2569-000001)
  const yearBE = new Date().getFullYear() + 543;
  const seqKey = buildSequenceKey("TRF", fromBranch.code, yearBE);
  const nextNum = await allocateDocumentNumber(db, seqKey);
  const docNo = formatDocumentNumber(seqKey, nextNum);

  const transfer = await db.branchTransfer.create({
    data: {
      docNo,
      fromBranchId,
      toBranchId,
      status: TransferStatus.DRAFT,
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
    action: "transfer.create",
    entityType: "branch_transfer",
    entityId: transfer.id,
    actorId,
    branchId: fromBranchId,
    after: {
      docNo,
      fromBranchId,
      toBranchId,
      itemCount: itemIds.length,
    },
  });

  return transfer;
}

/** ยืนยันการส่งของ (DRAFT -> IN_TRANSIT) */
export async function sendTransfer(
  db: Db,
  params: { transferId: string; actorId: string; requestId?: string | null },
) {
  const { transferId, actorId, requestId } = params;

  const transfer = await db.branchTransfer.findUniqueOrThrow({
    where: { id: transferId },
    include: {
      items: {
        include: {
          item: true,
        },
      },
    },
  });

  if (transfer.status !== TransferStatus.DRAFT) {
    throw new Error(`ไม่สามารถยืนยันการส่งได้จากสถานะ ${transfer.status}`);
  }

  // 1) ตัดสินค้าออกจากสต๊อกของสาขาต้นทาง (TRANSFER_OUT)
  // 2) เปลี่ยนสถานะตัวสินค้าเป็น IN_TRANSIT
  for (const transferItem of transfer.items) {
    const item = transferItem.item;

    if (item.status !== ItemStatus.IN_STOCK) {
      throw new Error(
        `สินค้า ${item.serialNo} ไม่พร้อมส่ง (สถานะปัจจุบัน: ${item.status})`,
      );
    }

    await db.inventoryItem.update({
      where: { id: item.id },
      data: { status: ItemStatus.IN_TRANSIT },
    });

    await db.stockMovement.create({
      data: {
        movementType: "TRANSFER_OUT",
        branchId: transfer.fromBranchId,
        productId: item.productId,
        itemId: item.id,
        quantity: -1,
        weightMg: -item.weightMg,
        costSatang: -item.costSatang,
        refType: "branch_transfer",
        refId: transfer.id,
        actorId,
        requestId,
      },
    });
  }

  const updated = await db.branchTransfer.update({
    where: { id: transferId },
    data: {
      status: TransferStatus.IN_TRANSIT,
      sentBy: actorId,
      sentAt: new Date(),
    },
  });

  await writeAuditLog(db, {
    action: "transfer.send",
    entityType: "branch_transfer",
    entityId: transferId,
    actorId,
    branchId: transfer.fromBranchId,
    requestId,
    before: { status: TransferStatus.DRAFT },
    after: { status: TransferStatus.IN_TRANSIT },
  });

  return updated;
}

/** ยืนยันการรับสินค้าปลายทาง (IN_TRANSIT -> COMPLETED) */
export async function receiveTransfer(
  db: Db,
  params: { transferId: string; actorId: string; requestId?: string | null },
) {
  const { transferId, actorId, requestId } = params;

  const transfer = await db.branchTransfer.findUniqueOrThrow({
    where: { id: transferId },
    include: {
      items: {
        include: {
          item: true,
        },
      },
    },
  });

  if (transfer.status !== TransferStatus.IN_TRANSIT) {
    throw new Error(`ไม่สามารถรับสินค้าได้จากสถานะ ${transfer.status}`);
  }

  // 1) เพิ่มสินค้าเข้าสต๊อกที่สาขาปลายทาง (TRANSFER_IN)
  // 2) ย้าย BranchId ของสินค้าจริงไปยังสาขาปลายทาง และเปลี่ยนสถานะกลับเป็น IN_STOCK
  for (const transferItem of transfer.items) {
    const item = transferItem.item;

    if (item.status !== ItemStatus.IN_TRANSIT) {
      throw new Error(
        `สินค้า ${item.serialNo} ไม่อยู่ระหว่างการขนส่ง (สถานะปัจจุบัน: ${item.status})`,
      );
    }

    await db.inventoryItem.update({
      where: { id: item.id },
      data: {
        status: ItemStatus.IN_STOCK,
        branchId: transfer.toBranchId,
      },
    });

    await db.stockMovement.create({
      data: {
        movementType: "TRANSFER_IN",
        branchId: transfer.toBranchId,
        productId: item.productId,
        itemId: item.id,
        quantity: 1,
        weightMg: item.weightMg,
        costSatang: item.costSatang,
        refType: "branch_transfer",
        refId: transfer.id,
        actorId,
        requestId,
      },
    });
  }

  const updated = await db.branchTransfer.update({
    where: { id: transferId },
    data: {
      status: TransferStatus.COMPLETED,
      receivedBy: actorId,
      receivedAt: new Date(),
    },
  });

  await writeAuditLog(db, {
    action: "transfer.receive",
    entityType: "branch_transfer",
    entityId: transferId,
    actorId,
    branchId: transfer.toBranchId,
    requestId,
    before: { status: TransferStatus.IN_TRANSIT },
    after: { status: TransferStatus.COMPLETED },
  });

  return updated;
}

/** ยกเลิกการโอนย้ายสินค้า (ยกเลิกได้ทั้งช่วง DRAFT และ IN_TRANSIT) */
export async function cancelTransfer(
  db: Db,
  params: { transferId: string; actorId: string; requestId?: string | null },
) {
  const { transferId, actorId, requestId } = params;

  const transfer = await db.branchTransfer.findUniqueOrThrow({
    where: { id: transferId },
    include: {
      items: {
        include: {
          item: true,
        },
      },
    },
  });

  if (
    transfer.status !== TransferStatus.DRAFT &&
    transfer.status !== TransferStatus.IN_TRANSIT
  ) {
    throw new Error(`ไม่สามารถยกเลิกการโอนย้ายได้จากสถานะ ${transfer.status}`);
  }

  // หากสถานะเป็น IN_TRANSIT ต้องคืนของกลับสต๊อกสาขาต้นทาง (เขียน Ledger ขาเข้าต้านกับการโอนออก)
  if (transfer.status === TransferStatus.IN_TRANSIT) {
    for (const transferItem of transfer.items) {
      const item = transferItem.item;

      await db.inventoryItem.update({
        where: { id: item.id },
        data: { status: ItemStatus.IN_STOCK }, // คืนสิทธิ์สต๊อกให้ต้นทาง
      });

      await db.stockMovement.create({
        data: {
          movementType: "TRANSFER_IN",
          branchId: transfer.fromBranchId,
          productId: item.productId,
          itemId: item.id,
          quantity: 1,
          weightMg: item.weightMg,
          costSatang: item.costSatang,
          refType: "branch_transfer",
          refId: transfer.id,
          actorId,
          requestId,
        },
      });
    }
  }

  const updated = await db.branchTransfer.update({
    where: { id: transferId },
    data: {
      status: TransferStatus.CANCELLED,
    },
  });

  await writeAuditLog(db, {
    action: "transfer.cancel",
    entityType: "branch_transfer",
    entityId: transferId,
    actorId,
    branchId: transfer.fromBranchId,
    requestId,
    before: { status: transfer.status },
    after: { status: TransferStatus.CANCELLED },
  });

  return updated;
}
